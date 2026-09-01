import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, Edit3Icon } from 'lucide-react';
import { useStudentWorkflow, COURSE_REGISTRATION_STASH_KEY, CourseRegistrationResult } from '../StudentWorkflow';
import { api, ApiError } from '../lib/apiClient';

export function CourseReview() {
  const { selectedCourses, selectedSemesterId, confirmRegistration } = useStudentWorkflow();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const totalCredits = selectedCourses.reduce((sum, course) => sum + course.credits, 0);

  async function confirm() {
    if (!selectedSemesterId) {
      setError('Missing semester selection - please go back and choose your courses again.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const registration = await api.post<CourseRegistrationResult>('/students/me/courses/register', {
        semesterId: selectedSemesterId,
        courseIds: selectedCourses.map((course) => course.course_id),
      });
      // Stash the response for RegistrationConfirmation.tsx to display - there's
      // no GET-by-id endpoint for a student's own past registration, so this
      // mirrors the rms-student-preauth-token sessionStorage handoff pattern
      // used between login and first-login.
      sessionStorage.setItem(COURSE_REGISTRATION_STASH_KEY, JSON.stringify(registration));
      confirmRegistration();
      navigate('/registration-confirmation');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your course registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-9">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-maroon"><CheckCircle2Icon className="h-6 w-6" /></span>
        <h1 className="mt-4 text-2xl font-extrabold text-maroon">Review & Confirm Registration</h1>
        <p className="mt-2 text-sm text-slate-600">Confirm your selected courses before the registration is completed. Final validation (credit range, duplicates) happens on the server.</p>
        <div className="mt-6 rounded-lg border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">
            <span>Selected courses ({selectedCourses.length})</span>
            <span className="text-xs font-semibold text-slate-500">{totalCredits} credits</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {selectedCourses.map((course) => (
              <li key={course.course_id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">{course.course_code} - {course.course_name}</p>
                  <p className="text-xs text-slate-500">{course.is_elective ? 'Elective' : 'Compulsory'}</p>
                </div>
                <span className="shrink-0 text-xs font-bold text-slate-600">{course.credits} cr</span>
              </li>
            ))}
            {selectedCourses.length === 0 && (
              <li className="px-4 py-6 text-center text-xs text-slate-500">No courses selected.</li>
            )}
          </ul>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => navigate('/course-registration')} disabled={submitting} className="inline-flex items-center gap-2 rounded-md border border-maroon/50 px-4 py-2.5 text-xs font-bold text-maroon disabled:opacity-60"><Edit3Icon className="h-4 w-4" />Edit selection</button>
          <button type="button" onClick={confirm} disabled={submitting || selectedCourses.length === 0} className="rounded-md bg-maroon px-5 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{submitting ? 'Submitting…' : 'Confirm registration'}</button>
        </div>
      </section>
    </main>);

}
