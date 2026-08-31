import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { api, ApiError, getToken } from './lib/apiClient';

export type WorkflowStage = 'first-login' | 'profile' | 'verification' | 'approved' | 'course-review' | 'complete';

// Shape of GET /students/me/profile - see server/docs/API.md.
export type ProfileSnapshot = {
  student: {
    student_id: number;
    reg_number: string;
    full_name: string;
    nic: string;
    account_status: 'Active' | 'Inactive' | 'Suspended';
    current_status: 'Prospective' | 'Registered' | 'Graduated' | 'Released';
    Programme?: {
      programme_id?: number;
      programme_code?: string;
      programme_name?: string;
      Faculty?: { faculty_id?: number; faculty_name?: string } | null;
    } | null;
    Intake?: {
      intake_id?: number;
      intake_code?: string;
      intake_year?: number;
      description?: string | null;
    } | null;
  };
  profile: {
    profile_id: number;
    address?: string | null;
    contact_no?: string | null;
    email?: string | null;
    date_of_birth?: string | null;
    gender?: 'Male' | 'Female' | 'Other' | null;
    family_info?: string | null;
    emergency_contact?: string | null;
    other_details?: string | null;
    profile_completion_pct: number;
  };
  photo: { photo_id: number; file_path: string; is_active: boolean } | null;
  signature: { signature_id: number; file_path: string; is_active: boolean } | null;
  documents: Array<{
    document_id: number;
    doc_type: string;
    is_verified: boolean;
    verified_at: string | null;
    uploaded_at?: string;
  }>;
};

// A course as selected during course registration - richer than the plain
// course-code strings the original prototype used, since the real API needs
// numeric course_id values to submit a registration.
export type SelectedCourse = {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  is_elective: boolean;
};

// Shape returned by POST /students/me/courses/register - a CourseRegistration
// row with its CourseRegistrationItems (each including its Course), per
// server/docs/API.md and server/src/services/courseRegistrationService.js.
export type CourseRegistrationResult = {
  registration_id: number;
  student_id: number;
  semester_id: number;
  registration_date: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  CourseRegistrationItems: Array<{
    item_id: number;
    registration_id: number;
    course_id: number;
    is_compulsory: boolean;
    is_elective: boolean;
    Course: { course_id: number; course_code: string; course_name: string; credits: number; is_elective: boolean };
  }>;
};

// sessionStorage key the course-registration confirm step stashes its
// POST /students/me/courses/register response under, mirroring the
// rms-student-preauth-token pattern used between login and first-login.
// There is no GET-by-id endpoint for a student's own past registration, so
// this stash is also the only signal we have (within this browser session)
// that the student has already completed course registration - see
// deriveStage() below.
export const COURSE_REGISTRATION_STASH_KEY = 'rms-student-course-registration';

// TODO(api-integration): the schema's status vocabulary doesn't map 1:1 onto
// this UI's 6-stage wizard, so this is a best-effort approximation:
//  - profile_completion_pct < 100          -> 'profile' (still filling the wizard)
//  - current_status === 'Prospective'      -> 'verification' (awaiting admin decision)
//  - current_status is Registered/Graduated/Released -> ready for (or past) course
//    registration. There's no student-facing endpoint to fetch an existing
//    CourseRegistration, so we treat a registration stashed in sessionStorage
//    (written right after a successful register call, see CourseReview.tsx)
//    as evidence this browser session already finished it, and land on
//    'complete'; otherwise 'approved'.
//  - 'course-review' is never derived here - it's a purely local/optimistic
//    stage entered via startCourseReview() while the student is reviewing
//    their selection before submitting it.
function deriveStage(snapshot: ProfileSnapshot): WorkflowStage {
  const pct = Number(snapshot.profile.profile_completion_pct ?? 0);
  if (pct < 100) return 'profile';
  if (snapshot.student.current_status === 'Prospective') return 'verification';
  const hasStashedRegistration = Boolean(sessionStorage.getItem(COURSE_REGISTRATION_STASH_KEY));
  return hasStashedRegistration ? 'complete' : 'approved';
}

type StudentWorkflowValue = {
  stage: WorkflowStage;
  /** true while the initial (or a manually triggered) profile fetch is in flight. */
  loading: boolean;
  /** message from the last failed profile fetch, if any. */
  error: string | null;
  /** Most recent GET /students/me/profile snapshot, or null before the first successful fetch. */
  profileSnapshot: ProfileSnapshot | null;
  /**
   * Re-fetches the profile snapshot and re-derives `stage` from it (unless
   * currently in the local 'course-review' stage). Returns the freshly
   * fetched snapshot (or null on failure / no token) for callers - like
   * ReviewSubmitForm's submit action - that need the just-fetched value
   * synchronously rather than waiting for the next render.
   */
  refresh: () => Promise<ProfileSnapshot | null>;
  completeFirstLogin: () => void;
  submitProfile: () => void;
  startCourseReview: (courses: SelectedCourse[], semesterId: number) => void;
  confirmRegistration: () => void;
  selectedCourses: SelectedCourse[];
  selectedSemesterId: number | null;
};

const StudentWorkflowContext = createContext<StudentWorkflowValue | undefined>(undefined);

export function StudentWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<WorkflowStage>(() => (getToken() ? 'profile' : 'first-login'));
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<number | null>(null);
  const [profileSnapshot, setProfileSnapshot] = useState<ProfileSnapshot | null>(null);
  const [loading, setLoading] = useState<boolean>(() => Boolean(getToken()));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!getToken()) return null;
    setLoading(true);
    setError(null);
    try {
      const snapshot = await api.get<ProfileSnapshot>('/students/me/profile');
      setProfileSnapshot(snapshot);
      // Never clobber the local 'course-review' stage with a background refresh -
      // the student is mid-review of a selection that hasn't been submitted yet.
      setStage((current) => (current === 'course-review' ? current : deriveStage(snapshot)));
      return snapshot;
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load your profile.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount if a token is already present (e.g. a returning user
  // who reloads the app past the login screen).
  useEffect(() => {
    if (getToken()) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<StudentWorkflowValue>(() => ({
    stage,
    loading,
    error,
    profileSnapshot,
    refresh,
    selectedCourses,
    selectedSemesterId,
    completeFirstLogin: () => {
      setStage('profile');
      // A token now exists (FirstLoginSetup just stored it) - fetch the real profile.
      refresh();
    },
    submitProfile: () => setStage('verification'),
    startCourseReview: (courses: SelectedCourse[], semesterId: number) => {
      setSelectedCourses(courses);
      setSelectedSemesterId(semesterId);
      setStage('course-review');
    },
    confirmRegistration: () => setStage('complete'),
  }), [stage, loading, error, profileSnapshot, refresh, selectedCourses, selectedSemesterId]);

  return <StudentWorkflowContext.Provider value={value}>{children}</StudentWorkflowContext.Provider>;
}

export function useStudentWorkflow() {
  const context = useContext(StudentWorkflowContext);
  if (!context) throw new Error('useStudentWorkflow must be used inside StudentWorkflowProvider');
  return context;
}
