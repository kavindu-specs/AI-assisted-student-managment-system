
import React, { useEffect, useState } from 'react';
import {
  BadgeCheckIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  DownloadIcon,
  GraduationCapIcon,
  InfoIcon,
  LandmarkIcon,
  MailIcon,
  PrinterIcon,
  ShieldCheckIcon,
  UserRoundIcon } from
'lucide-react';
import { useStudentWorkflow, COURSE_REGISTRATION_STASH_KEY, CourseRegistrationResult } from '../StudentWorkflow';

function SummaryCard({ icon: Icon, label, children, tone = 'emerald' }: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;children: React.ReactNode;tone?: 'emerald' | 'violet' | 'gold';}) {
  const tones = { emerald: 'bg-emerald-50 text-emerald-700', violet: 'bg-violet-50 text-violet-700', gold: 'bg-gold/15 text-maroon' };
  return (
    <article className="flex min-h-[104px] items-center gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}><Icon className="h-6 w-6" strokeWidth={1.7} /></span>
      <div className="min-w-0"><p className="text-[11px] font-semibold text-slate-500">{label}</p><div className="mt-2 text-sm font-extrabold leading-tight text-slate-800">{children}</div></div>
    </article>);

}

export function RegistrationConfirmation() {
  const [downloaded, setDownloaded] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [registration, setRegistration] = useState<CourseRegistrationResult | null>(null);
  const { profileSnapshot } = useStudentWorkflow();

  useEffect(() => {
    // There is no GET-by-id endpoint for a student's own past course
    // registration, so the confirm step (CourseReview.tsx) stashes its POST
    // response in sessionStorage - mirror of the rms-student-preauth-token
    // pattern used between login and first-login.
    const raw = sessionStorage.getItem(COURSE_REGISTRATION_STASH_KEY);
    if (raw) {
      try {
        setRegistration(JSON.parse(raw) as CourseRegistrationResult);
      } catch {
        setRegistration(null);
      }
    }
  }, []);

  function notify(action: 'download' | 'print' | 'email') {
    if (action === 'download') {setDownloaded(true);window.setTimeout(() => setDownloaded(false), 1600);}
    if (action === 'print') {setPrinted(true);window.setTimeout(() => setPrinted(false), 1600);}
    if (action === 'email') {setEmailed(true);window.setTimeout(() => setEmailed(false), 1600);}
  }

  const student = profileSnapshot?.student;
  const items = registration?.CourseRegistrationItems ?? [];
  const totalCredits = items.reduce((sum, item) => sum + item.Course.credits, 0);

  if (!registration) {
    return (
      <main className="px-5 py-6 sm:px-8 lg:px-9">
        <div className="mx-auto max-w-[1440px]">
          <section className="rounded-lg border border-slate-200 bg-white p-8 text-center">
            <h1 className="text-xl font-extrabold text-maroon">No registration details found</h1>
            <p className="mt-3 text-sm text-slate-600">We couldn't find a course registration for this browser session. Visit Course Registration to submit or check your status.</p>
          </section>
        </div>
      </main>);

  }

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <section>
          <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Registration Confirmation</h1>
          <p className="mt-1 text-sm text-slate-500">Your course registration has been submitted for admin approval.</p>
        </section>

        <section className="mt-5 flex items-center justify-between gap-5 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-emerald-600"><CheckCircle2Icon className="h-7 w-7" strokeWidth={2} /></span><div><h2 className="text-sm font-extrabold text-emerald-800">Registration Submitted!</h2><p className="mt-1 text-xs text-slate-600">Status: <strong>{registration.status}</strong> - an administrator will review and approve it.</p></div></div>
          <BadgeCheckIcon className="hidden h-12 w-12 text-gold sm:block" strokeWidth={1.5} />
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={BadgeCheckIcon} label="Registration Number"><span className="text-emerald-700">{student?.reg_number ?? '—'}</span></SummaryCard>
          <SummaryCard icon={GraduationCapIcon} label="Programme" tone="violet">{student?.Programme?.programme_name ?? '—'}</SummaryCard>
          <SummaryCard icon={LandmarkIcon} label="Faculty" tone="gold">{student?.Programme?.Faculty?.faculty_name ?? '—'}</SummaryCard>
          <SummaryCard icon={ShieldCheckIcon} label="Registration Status"><span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700">{registration.status}</span></SummaryCard>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(330px,1fr)]">
          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Registered Courses ({items.length})</h2></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Course Title</th><th className="px-3 py-3 font-bold">Type</th><th className="px-5 py-3 text-right font-bold">Credits</th></tr></thead><tbody className="divide-y divide-slate-100">{items.map((item) => <tr key={item.item_id}><td className="px-5 py-3 font-bold text-slate-700">{item.Course.course_code}</td><td className="px-3 py-3 font-medium text-slate-700">{item.Course.course_name}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${item.is_compulsory ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{item.is_compulsory ? 'Compulsory' : 'Elective'}</span></td><td className="px-5 py-3 text-right font-bold text-slate-700">{item.Course.credits}</td></tr>)}</tbody></table></div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs font-extrabold text-emerald-700"><span>Total Credits Registered</span><span>{totalCredits}</span></div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Registration Details</h2><dl className="mt-5 space-y-4"><Detail icon={CalendarDaysIcon} label="Date of Registration" value={new Date(registration.registration_date).toLocaleString()} /><Detail icon={UserRoundIcon} label="Registered By" value={student?.full_name ?? '—'} /><Detail icon={GraduationCapIcon} label="Faculty" value={student?.Programme?.Faculty?.faculty_name ?? '—'} /><Detail icon={BadgeCheckIcon} label="Programme" value={student?.Programme?.programme_name ?? '—'} /><Detail icon={CalendarDaysIcon} label="Semester ID" value={String(registration.semester_id)} /></dl></article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"><article className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3"><ActionButton icon={DownloadIcon} label={downloaded ? 'Download ready' : 'Download PDF'} description="Download registration slip" onClick={() => notify('download')} /><ActionButton icon={PrinterIcon} label={printed ? 'Print sent' : 'Print'} description="Print registration slip" onClick={() => notify('print')} /><ActionButton icon={MailIcon} label={emailed ? 'Email sent' : 'Email Confirmation'} description="Send to your email" onClick={() => notify('email')} /></article><article className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-emerald-600"><CheckCircle2Icon className="h-6 w-6" /></span><div><h2 className="text-sm font-extrabold text-emerald-800">Almost Done!</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Your course selection has been submitted and is now awaiting administrator approval.</p></div></article></section>

        <section className="mt-5 flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700"><InfoIcon className="h-4 w-4 shrink-0" />This is a computer generated confirmation and does not require a signature.</section>
      </div>
    </main>);

}

function Detail({ icon: Icon, label, value }: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;value: string;}) {
  return <div className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" strokeWidth={1.7} /></span><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="ml-auto text-right text-xs font-bold text-slate-700">{value}</dd></div>;
}

function ActionButton({ icon: Icon, label, description, onClick }: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;description: string;onClick: () => void;}) {
  return <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-md border border-maroon/50 bg-white px-4 py-3 text-left transition hover:bg-maroon hover:text-white focus:outline-none focus:ring-2 focus:ring-maroon/25"><Icon className="h-5 w-5 shrink-0 text-maroon group-hover:text-white" strokeWidth={1.7} /><span><span className="block text-xs font-bold">{label}</span><span className="mt-1 block text-[10px] text-slate-500">{description}</span></span></button>;
}
