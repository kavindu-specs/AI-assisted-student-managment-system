

import React from 'react';
import {
  BellRingIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleAlertIcon,
  Clock3Icon,
  FileTextIcon,
  GraduationCapIcon,
  InfoIcon,
  LandmarkIcon,
  ShieldCheckIcon,
  UserRoundIcon } from
'lucide-react';

type JourneyStage = {
  label: string;
  status: string;
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  state: 'complete' | 'current' | 'pending';
};

const JOURNEY: JourneyStage[] = [
{ label: 'Profile Completed', status: 'Completed', icon: UserRoundIcon, state: 'complete' },
{ label: 'Documents Uploaded', status: 'Completed', icon: FileTextIcon, state: 'complete' },
{ label: 'Verification', status: 'In Progress', icon: Clock3Icon, state: 'current' },
{ label: 'Registration Approved', status: 'Pending', icon: ShieldCheckIcon, state: 'pending' },
{ label: 'Course Registration', status: 'Pending', icon: BookOpenIcon, state: 'pending' }];


const DETAILS = [
['Registration Number', 'RUSL/AG/2026/0081', FileTextIcon],
['Programme', 'BSc Hons (Agriculture)', GraduationCapIcon],
['Faculty', 'Faculty of Agriculture', LandmarkIcon],
['Academic Year', '2026/2027', CalendarDaysIcon],
['Semester', 'Semester 1', CalendarDaysIcon]] as
const;

const NOTIFICATIONS = [
{ text: 'Your profile has been verified', time: '2 hours ago', icon: CheckCircle2Icon, className: 'bg-emerald-100 text-emerald-600' },
{ text: 'Please upload your Birth Certificate', time: '5 hours ago', icon: FileTextIcon, className: 'bg-gold/20 text-maroon' },
{ text: 'Course registration will open on 15 May 2026', time: '1 day ago', icon: BellRingIcon, className: 'bg-maroon/10 text-maroon' },
{ text: 'Orientation program on 20 May 2026', time: '2 days ago', icon: InfoIcon, className: 'bg-sky-100 text-sky-600' }] as
const;

export function StudentDashboard() {
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

        <section aria-label="Academic information" className="mt-4 grid shrink-0 grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-6">
          {DETAILS.map(([label, value, Icon]) =>
          <div key={label} className="flex min-h-[78px] items-center gap-3 border-b border-r border-slate-100 px-4 last:border-r-0 lg:border-b-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-maroon/8 text-maroon"><Icon className="h-4 w-4" strokeWidth={1.7} /></span>
              <div className="min-w-0"><p className="text-[10px] font-medium text-slate-500">{label}</p><p className="mt-1 text-[11px] font-bold leading-tight text-slate-700">{value}</p></div>
            </div>
          )}
          <div className="flex min-h-[78px] items-center gap-3 px-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/25 text-maroon"><ShieldCheckIcon className="h-4 w-4" strokeWidth={1.7} /></span>
            <div><p className="text-[10px] font-medium text-slate-500">Registration Status</p><p className="mt-1 text-[10px] font-bold text-maroon">• Verification in Progress</p></div>
          </div>
        </section>

        <section className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[0.78fr_1fr]">
          <article className="rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-bold text-slate-800">My Registration Progress</h2>
            <div className="mt-5 flex items-center gap-8">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#7A1F2B 0deg 144deg, #F2C94C 144deg 216deg, #e5e7eb 216deg 360deg)' }}>
                <div className="flex h-[104px] w-[104px] flex-col items-center justify-center rounded-full bg-white"><span className="text-2xl font-extrabold text-maroon">60%</span><span className="mt-1 text-[10px] font-medium text-slate-500">Overall Progress</span></div>
              </div>
              <dl className="space-y-4 text-xs">
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-maroon" /><dt className="text-slate-600">Completed</dt><dd className="ml-auto font-bold text-slate-700">3/6</dd></div>
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-gold" /><dt className="text-slate-600">In Progress</dt><dd className="ml-auto font-bold text-slate-700">1/6</dd></div>
                <div className="flex items-center gap-3"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /><dt className="text-slate-600">Pending</dt><dd className="ml-auto font-bold text-slate-700">2/6</dd></div>
              </dl>
            </div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Recent Notifications</h2><button type="button" className="text-xs font-bold text-maroon hover:text-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/20">View All</button></div>
            <ul className="divide-y divide-slate-100">
              {NOTIFICATIONS.map(({ text, time, icon: Icon, className }) => <li key={text} className="flex items-center gap-3 px-5 py-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="h-3.5 w-3.5" /></span><span className="min-w-0 flex-1 text-xs font-semibold text-slate-700">{text}</span><time className="shrink-0 text-[10px] text-slate-400">{time}</time></li>)}
            </ul>
          </article>
        </section>
      </div>
    </main>);

}
