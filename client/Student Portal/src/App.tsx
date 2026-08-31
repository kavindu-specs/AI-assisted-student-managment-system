

import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BrandPanel } from './components/BrandPanel';
import { CourseRegistration } from './components/CourseRegistration';
import { RegistrationConfirmation } from './components/RegistrationConfirmation';
import { StudentDashboard } from './components/StudentDashboard';
import { EmergencyContactForm } from './components/EmergencyContactForm';
import { FamilyInformationForm } from './components/FamilyInformationForm';
import { LoginForm } from './components/LoginForm';
import { PersonalDetailsForm } from './components/PersonalDetailsForm';
import { PortalSidebar } from './components/PortalSidebar';
import { ProfileCompletion } from './components/ProfileCompletion';
import { ProfileHeader } from './components/ProfileHeader';
import { ProfileProgress } from './components/ProfileProgress';
import { RegistrationStatus } from './components/RegistrationStatus';
import { ReviewSubmitForm } from './components/ReviewSubmitForm';
import { DocumentGuidelines, UploadDocumentsForm } from './components/UploadDocumentsForm';
import { FirstLoginSetup } from './components/FirstLoginSetup';
import { CourseReview } from './components/CourseReview';
import { StudentWorkflowProvider, useStudentWorkflow, WorkflowStage } from './StudentWorkflow';

type ProfileScreenProps = {
  currentStep: number;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
};

function LoginScreen() {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-white text-slate-900">
      <BrandPanel />
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center px-6 py-4 sm:px-12">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Secure Connection</span>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-6 py-4 sm:px-12">
          <LoginForm />
        </div>
        <footer className="hidden shrink-0 items-center justify-between border-t border-slate-100 px-12 py-4 text-sm text-slate-400 lg:flex">
          <span>© 2026 Rajarata University of Sri Lanka</span>
          <span>Faculty of Agriculture - Student Portal</span>
        </footer>
      </main>
    </div>);

}

function ProfileScreen({ currentStep, children, sidebar }: ProfileScreenProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-[100dvh] w-[288px] xl:block">
        <PortalSidebar activeLabel="My Profile" />
      </aside>
      <div className="min-w-0 xl:ml-[288px]">
        <div className="sticky top-0 z-20">
          <ProfileHeader activeLabel="My Profile" />
        </div>
        <main className="px-5 py-6 sm:px-8 lg:px-9">
          <div className="mx-auto max-w-[1440px]">
            <section>
              <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Complete Your Profile</h1>
              <p className="mt-1 text-sm text-slate-500">Please provide accurate information to complete your student profile.</p>
              <ProfileProgress currentStep={currentStep} />
            </section>
            <div className="mt-6 flex flex-col gap-6 2xl:flex-row">
              {children}
              {sidebar ?? <ProfileCompletion currentStep={currentStep} />}
            </div>
          </div>
        </main>
        <footer className="hidden h-14 items-center justify-between border-t border-slate-200 bg-white px-9 text-xs text-slate-500 lg:flex">
          <span>© 2026 Rajarata University of Sri Lanka</span>
          <span>Faculty of Agriculture - Student Portal</span>
        </footer>
      </div>
    </div>);

}

function DashboardScreen() {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-slate-50 text-slate-900">
      <PortalSidebar activeLabel="Dashboard" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ProfileHeader activeLabel="Dashboard" />
        <StudentDashboard />
        <footer className="hidden h-14 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-9 text-xs text-slate-500 lg:flex">
          <span>© 2026 Rajarata University of Sri Lanka</span>
          <span>Faculty of Agriculture - Student Portal</span>
        </footer>
      </div>
    </div>);

}

function RegistrationStatusScreen() {
  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-[100dvh] w-[288px] xl:block">
        <PortalSidebar activeLabel="Registration Status" />
      </aside>
      <div className="min-w-0 xl:ml-[288px]">
        <div className="sticky top-0 z-20">
          <ProfileHeader activeLabel="Registration Status" />
        </div>
        <RegistrationStatus />
        <footer className="hidden h-14 items-center justify-between border-t border-slate-200 bg-white px-9 text-xs text-slate-500 lg:flex">
          <span>© 2026 Rajarata University of Sri Lanka</span>
          <span>Faculty of Agriculture - Student Portal</span>
        </footer>
      </div>
    </div>);

}

function CourseRegistrationScreen() {
  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-[100dvh] w-[288px] xl:block">
        <PortalSidebar activeLabel="Course Registration" />
      </aside>
      <div className="min-w-0 xl:ml-[288px]">
        <div className="sticky top-0 z-20">
          <ProfileHeader activeLabel="Course Registration" />
        </div>
        <CourseRegistration />
        <footer className="hidden h-14 items-center justify-between border-t border-slate-200 bg-white px-9 text-xs text-slate-500 lg:flex">
          <span>© 2026 Rajarata University of Sri Lanka</span>
          <span>Faculty of Agriculture - Student Portal</span>
        </footer>
      </div>
    </div>);

}

function RegistrationConfirmationScreen() {
  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-[100dvh] w-[288px] xl:block">
        <PortalSidebar activeLabel="Registration Confirmation" />
      </aside>
      <div className="min-w-0 xl:ml-[288px]">
        <div className="sticky top-0 z-20">
          <ProfileHeader activeLabel="Registration Confirmation" />
        </div>
        <RegistrationConfirmation />
        <footer className="hidden h-14 items-center justify-between border-t border-slate-200 bg-white px-9 text-xs text-slate-500 lg:flex">
          <span>© 2026 Rajarata University of Sri Lanka</span>
          <span>Faculty of Agriculture - Student Portal</span>
        </footer>
      </div>
    </div>);

}

function RequireStage({ allowed, children }: { allowed: WorkflowStage[]; children: React.ReactNode }) {
  const { stage, loading } = useStudentWorkflow();
  // While the initial GET /students/me/profile is in flight, `stage` still
  // holds its optimistic pre-fetch guess - avoid bouncing the user through a
  // wrong route (or flashing one) before the real stage is known.
  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-slate-50">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-maroon/30 border-t-maroon" />
      </div>
    );
  }
  if (allowed.includes(stage)) return <>{children}</>;
  if (stage === 'first-login') return <Navigate to="/first-login" replace />;
  if (stage === 'profile') return <Navigate to="/profile" replace />;
  return <Navigate to="/registration-status" replace />;
}

export function App() {
  return (
    <StudentWorkflowProvider><BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/first-login" element={<FirstLoginSetup />} />
        <Route path="/dashboard" element={<RequireStage allowed={['profile', 'verification', 'approved', 'course-review', 'complete']}><DashboardScreen /></RequireStage>} />
        <Route path="/profile" element={<RequireStage allowed={['profile']}><ProfileScreen currentStep={1}><PersonalDetailsForm /></ProfileScreen></RequireStage>} />
        <Route path="/profile/family" element={<RequireStage allowed={['profile']}><ProfileScreen currentStep={2}><FamilyInformationForm /></ProfileScreen></RequireStage>} />
        <Route path="/profile/emergency-contact" element={<RequireStage allowed={['profile']}><ProfileScreen currentStep={3}><EmergencyContactForm /></ProfileScreen></RequireStage>} />
        <Route path="/profile/upload-documents" element={<RequireStage allowed={['profile']}><ProfileScreen currentStep={4} sidebar={<DocumentGuidelines />}><UploadDocumentsForm /></ProfileScreen></RequireStage>} />
        <Route path="/profile/review" element={<RequireStage allowed={['profile']}><ProfileScreen currentStep={5}><ReviewSubmitForm /></ProfileScreen></RequireStage>} />
        <Route path="/registration-status" element={<RequireStage allowed={['verification', 'approved', 'course-review', 'complete']}><RegistrationStatusScreen /></RequireStage>} />
        <Route path="/course-registration" element={<RequireStage allowed={['approved', 'course-review']}><CourseRegistrationScreen /></RequireStage>} />
        <Route path="/course-review" element={<RequireStage allowed={['course-review']}><CourseReview /></RequireStage>} />
        <Route path="/registration-confirmation" element={<RequireStage allowed={['complete']}><RegistrationConfirmationScreen /></RequireStage>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter></StudentWorkflowProvider>);

}
