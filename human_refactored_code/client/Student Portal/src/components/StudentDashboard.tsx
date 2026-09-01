

import React, { useEffect } from 'react';
import {
  BellRingIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  Clock3Icon,
  FileTextIcon,
  GraduationCapIcon,
  InfoIcon,
  LandmarkIcon,
  ShieldCheckIcon,
  UserRoundIcon } from
'lucide-react';
import { useStudentWorkflow } from '../StudentWorkflow';

type JourneyState = 'complete' | 'current' | 'pending';

type JourneyStage = {
  label: string;
  status: string;
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  state: JourneyState;
};

export function StudentDashboard() {
  const { profileSnapshot, refresh } = useStudentWorkflow();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const student = profileSnapshot?.student;
  const profile = profileSnapshot?.profile;
  const documents = profileSnapshot?.documents ?? [];
  const pct = Number(profile?.profile_completion_pct ?? 0);
  const currentStatus = student?.current_status;
  const registered = currentStatus === 'Registered' || currentStatus === 'Graduated' || currentStatus === 'Released';

  // Same coarse mapping as RegistrationStatus.tsx, condensed to the 5 stages
  // this summary strip shows.
  const JOURNEY: JourneyStage[] = [
    { label: 'Profile Completed', status: pct >= 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Pending', icon: UserRoundIcon, state: pct >= 100 ? 'complete' : pct > 0 ? 'current' : 'pending' },
    { label: 'Documents Uploaded', status: documents.length > 0 ? 'Completed' : 'Pending', icon: FileTextIcon, state: documents.length > 0 ? 'complete' : pct >= 100 ? 'current' : 'pending' },
    { label: 'Verification', status: currentStatus === 'Prospective' ? 'In Progress' : registered ? 'Completed' : 'Pending', icon: Clock3Icon, state: pct < 100 ? 'pending' : currentStatus === 'Prospective' ? 'current' : 'complete' },
    { label: 'Registration Approved', status: registered ? 'Completed' : 'Pending', icon: ShieldCheckIcon, state: registered ? 'complete' : 'pending' },
    { label: 'Course Registration', status: registered ? 'Available' : 'Pending', icon: BookOpenIcon, state: registered ? 'complete' : 'pending' },
  ];

  // The API has no student-facing notifications endpoint, so this feed is
  // derived from real profile/document state rather than a fabricated list.
  const activity: Array<{ text: string; icon: React.ComponentType<{className?: string;strokeWidth?: number;}>; className: string }> = [];
  if (currentStatus === 'Prospective' && pct >= 100) {
    activity.push({ text: 'Your profile is complete and awaiting verification', icon: Clock3Icon, className: 'bg-gold/20 text-maroon' });
  } else if (currentStatus === 'Prospective') {
    activity.push({ text: `Your profile is ${Math.round(pct)}% complete - finish it to submit for verification`, icon: InfoIcon, className: 'bg-sky-100 text-sky-600' });
  }
  if (registered) {
    activity.push({ text: 'Your registration has been approved - you can register for courses', icon: CheckCircle2Icon, className: 'bg-emerald-100 text-emerald-600' });
  }
  const verifiedCount = documents.filter((doc) => doc.is_verified).length;
  const pendingCount = documents.length - verifiedCount;
  if (verifiedCount > 0) {
    activity.push({ text: `${verifiedCount} document${verifiedCount === 1 ? '' : 's'} verified by the university`, icon: CheckCircle2Icon, className: 'bg-emerald-100 text-emerald-600' });
  }
  if (pendingCount > 0) {
    activity.push({ text: `${pendingCount} document${pendingCount === 1 ? '' : 's'} awaiting verification`, icon: BellRingIcon, className: 'bg-maroon/10 text-maroon' });
  }
  if (activity.length === 0) {
    activity.push({ text: 'No recent activity yet - start by completing your profile', icon: InfoIcon, className: 'bg-sky-100 text-sky-600' });
  }

  const completedCount = JOURNEY.filter((stage) => stage.state === 'complete').length;
  const currentCount = JOURNEY.filter((stage) => stage.state === 'current').length;
  const pendingStageCount = JOURNEY.length - completedCount - currentCount;
  const overallPct = Math.round(completedCount / JOURNEY.length * 100);

  const DETAILS: Array<[string, string, React.ComponentType<{className?: string;strokeWidth?: number;}>]> = [
    ['Registration Number', student?.reg_number ?? '—', FileTextIcon],
    ['Programme', student?.Programme?.programme_name ?? '—', GraduationCapIcon],
    ['Faculty', student?.Programme?.Faculty?.faculty_name ?? '—', LandmarkIcon],
    ['Intake', student?.Intake?.intake_year ? String(student.Intake.intake_year) : '—', CalendarDaysIcon],
  ];

  return (
    <main className="min-h-0 flex-1 overflow-hidden px-5 py-5 sm:px-8 lg:px-9 lg:py-6">
      <div className="mx-auto flex h-full max-w-[1440px] flex-col">
        <section className="shrink-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Student Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Welcome back! Here's an overview of your registration journey.</p>
        </section>

        <section aria-label="Registration journey" className="mt-5 shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-5 sm:px-7">
          <div className="relative flex items-start justify-between">
            <span className="absolute left-[8%] right-[8%] top-5 h-px bg-slate-200" />
            {JOURNEY.map(({ label, status, icon: Icon, state }) =>
            <div key={label} className="relative z-10 flex w-1/5 flex-col items-center text-center">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${state === 'complete' ? 'border-maroon bg-maroon text-white' : state === 'current' ? 'border-gold bg-gold/15 text-maroon' : 'border-slate-300 bg-white text-slate-500'}`}>
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </span>
                <span className="mt-2 max-w-[116px] text-[11px] font-bold leading-tight text-slate-700">{label}</span>
                <span className={`mt-1 text-[10px] font-semibold ${state === 'current' ? 'text-maroon' : state === 'complete' ? 'text-emerald-600' : 'text-slate-500'}`}>{status}</span>
              </div>
            )}
          </div>
        </section>

        <section aria-label="Academic information" className="mt-4 grid shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-5">
          {DETAILS.map(([label, value, Icon]) =>
          <div key={label} className="flex min-h-[78px] items-center gap-3 border-b border-r border-slate-100 px-4 last:border-r-0 lg:border-b-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon/8 text-maroon"><Icon className="h-4 w-4" strokeWidth={1.7} /></span>
              <div className="min-w-0"><p className="text-[10px] font-medium text-slate-500">{label}</p><p className="mt-1 text-[11px] font-bold leading-tight text-slate-700">{value}</p></div>
            </div>
          )}
          <div className="flex min-h-[78px] items-center gap-3 px-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/25 text-maroon"><ShieldCheckIcon className="h-4 w-4" strokeWidth={1.7} /></span>
            <div><p className="text-[10px] font-medium text-slate-500">Registration Status</p><p className="mt-1 text-[10px] font-bold text-maroon">• {currentStatus ?? 'Loading…'}</p></div>
          </div>
        </section>

        <section className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[0.78fr_1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-800">My Registration Progress</h2>
            <div className="mt-5 flex items-center gap-8">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#7A1F2B 0deg ${overallPct * 3.6}deg, #F2C94C ${overallPct * 3.6}deg ${(overallPct + currentCount / JOURNEY.length * 100) * 3.6}deg, #e5e7eb ${(overallPct + currentCount / JOURNEY.length * 100) * 3.6}deg 360deg)` }}>
                <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-extrabold text-maroon">{overallPct}%</span><span className="mt-1 text-[10px] font-medium text-slate-500">Overall Progress</span></div>
              </div>
              <dl className="space-y-4 text-xs">
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-maroon" /><dt className="text-slate-600">Completed</dt><dd className="ml-auto font-bold text-slate-700">{completedCount}/{JOURNEY.length}</dd></div>
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-gold" /><dt className="text-slate-600">In Progress</dt><dd className="ml-auto font-bold text-slate-700">{currentCount}/{JOURNEY.length}</dd></div>
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><dt className="text-slate-600">Pending</dt><dd className="ml-auto font-bold text-slate-700">{pendingStageCount}/{JOURNEY.length}</dd></div>
              </dl>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Recent Activity</h2></div>
            <ul className="divide-y divide-slate-100">
              {activity.map(({ text, icon: Icon, className }) => <li key={text} className="flex items-center gap-3 px-5 py-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1 text-xs font-semibold text-slate-700">{text}</span></li>)}
            </ul>
          </article>
        </section>
      </div>
    </main>);

}
