
import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ClockIcon } from 'lucide-react';
import { BrandPanel } from './components/BrandPanel';
import { LoginForm } from './components/LoginForm';
import { DashboardPage } from './pages/DashboardPage';
import { ImportStudentDataPage } from './pages/ImportStudentDataPage';
import { ValidationResultsPage } from './pages/ValidationResultsPage';
import { ApprovalPage } from './pages/ApprovalPage';
import { AccountCreationPage } from './pages/AccountCreationPage';
import { SettingsPage } from './pages/SettingsPage';
import { StudentsPage } from './pages/StudentsPage';
import { ProgrammesPage } from './pages/ProgrammesPage';
import { ReportsPage } from './pages/ReportsPage';
import { DocumentUploadPage } from './pages/DocumentUploadPage';
import { SemesterRegistrationPage } from './pages/SemesterRegistrationPage';

function LoginPage() {
  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-white">
      <aside className="hidden h-full w-[35%] min-w-[410px] max-w-[520px] lg:block"><BrandPanel /></aside>
      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-100 px-5 sm:px-8"><div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[10px] font-medium uppercase tracking-[0.22em] text-gray-500 sm:text-xs">Secure Connection</span></div><button type="button" className="flex items-center gap-2 text-xs text-gray-500 transition hover:text-maroon"><ClockIcon className="h-4 w-4" aria-hidden="true" /><span className="hidden sm:inline">Login Activity</span></button></header>
        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-4 sm:px-8"><LoginForm /></div>
        <footer className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-[10px] text-gray-500 sm:px-8 sm:text-xs"><p>© 2026 Rajarata University of Sri Lanka</p><p className="hidden sm:block">IT Division · Support: itsupport@rjt.ac.lk</p></footer>
      </main>
    </div>);

}

export function App() {
  return <BrowserRouter><Routes><Route path="/" element={<LoginPage />} /><Route path="/dashboard" element={<DashboardPage />} /><Route path="/students" element={<StudentsPage />} /><Route path="/programmes" element={<ProgrammesPage />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/import-students" element={<ImportStudentDataPage />} /><Route path="/validation-results" element={<ValidationResultsPage />} /><Route path="/approval" element={<ApprovalPage />} /><Route path="/account-creation" element={<AccountCreationPage />} /><Route path="/documents" element={<DocumentUploadPage />} /><Route path="/semester-registration" element={<SemesterRegistrationPage />} /><Route path="/settings" element={<SettingsPage />} /></Routes></BrowserRouter>;
}
