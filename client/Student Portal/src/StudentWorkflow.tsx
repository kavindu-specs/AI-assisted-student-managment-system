import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type WorkflowStage = 'first-login' | 'profile' | 'verification' | 'approved' | 'course-review' | 'complete';

type StudentWorkflowValue = {
  stage: WorkflowStage;
  completeFirstLogin: () => void;
  submitProfile: () => void;
  startCourseReview: (courses: string[]) => void;
  confirmRegistration: () => void;
  selectedCourses: string[];
};

const StudentWorkflowContext = createContext<StudentWorkflowValue | undefined>(undefined);

export function StudentWorkflowProvider({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<WorkflowStage>('first-login');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // This front-end prototype has no administrator service. Simulate the approval
  // that the activity diagram assigns to the university after profile submission.
  useEffect(() => {
    if (stage !== 'verification') return undefined;
    const approvalTimer = window.setTimeout(() => setStage('approved'), 1800);
    return () => window.clearTimeout(approvalTimer);
  }, [stage]);

  const value = useMemo(() => ({
    stage,
    selectedCourses,
    completeFirstLogin: () => setStage('profile' as WorkflowStage),
    submitProfile: () => setStage('verification' as WorkflowStage),
    startCourseReview: (courses: string[]) => {
      setSelectedCourses(courses);
      setStage('course-review');
    },
    confirmRegistration: () => setStage('complete'),
  }), [stage, selectedCourses]);

  return <StudentWorkflowContext.Provider value={value}>{children}</StudentWorkflowContext.Provider>;
}

export function useStudentWorkflow() {
  const context = useContext(StudentWorkflowContext);
  if (!context) throw new Error('useStudentWorkflow must be used inside StudentWorkflowProvider');
  return context;
}
