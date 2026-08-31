import React, { useEffect, useState } from 'react';
import { useStudentWorkflow } from '../StudentWorkflow';
import {
  BellIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  DownloadIcon,
  FileTextIcon,
  GraduationCapIcon,
  HeadphonesIcon,
  HourglassIcon,
  InfoIcon,
  LandmarkIcon,
  LoaderCircleIcon,
  UserRoundIcon } from
'lucide-react';

type TimelineState = 'complete' | 'current' | 'pending';

type TimelineStep = {
  title: string;
  description: string;
  detail: string;
  state: TimelineState;
};

function TimelineIcon({ state }: {state: TimelineState;}) {
  if (state === 'complete') return <CheckCircle2Icon className="h-5 w-5" strokeWidth={2.2} />;
  if (state === 'current') return <LoaderCircleIcon className="h-5 w-5" strokeWidth={2} />;
  return <HourglassIcon className="h-4 w-4" strokeWidth={1.8} />;
}

const STATE_LABEL: Record<TimelineState, string> = { complete: 'Completed', current: 'In Progress', pending: 'Pending' };

export function RegistrationStatus() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
  const { profileSnapshot, refresh, loading } = useStudentWorkflow();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function downloadSlip() {
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 1800);
  }

  const student = profileSnapshot?.student;
  const profile = profileSnapshot?.profile;
  const documents = profileSnapshot?.documents ?? [];
  const pct = Number(profile?.profile_completion_pct ?? 0);
  const currentStatus = student?.current_status;
  const approved = currentStatus === 'Registered' || currentStatus === 'Graduated' || currentStatus === 'Released';

  // Map the coarse backend signals (profile_completion_pct, current_status,
  // documents[]) onto the mockup's 6-step admission timeline. There's no
  // dedicated "imported" flag or per-step timestamp in this schema - see
  // server/docs/API.md "Known simplifications" - so a student's mere
  // existence satisfies "Admission Imported", and completed steps show a
  // status label instead of a fabricated date.
  const TIMELINE: TimelineStep[] = [
    {
      title: 'Admission Imported',
      description: 'Your admission record has been imported by the university.',
      detail: 'Reg. no. ' + (student?.reg_number ?? '—'),
      state: 'complete',
    },
    {
      title: 'Profile Completed',
      description: 'Complete all required personal and academic information.',
      detail: `${Math.round(pct)}% complete`,
      state: pct >= 100 ? 'complete' : pct > 0 ? 'current' : 'pending',
    },
    {
      title: 'Documents Uploaded',
      description: 'Upload all required supporting documents.',
      detail: documents.length > 0 ? `${documents.length} document${documents.length === 1 ? '' : 's'} on file` : 'No documents uploaded yet',
      state: documents.length > 0 ? 'complete' : pct >= 100 ? 'current' : 'pending',
    },
    {
      title: 'Verification',
      description: 'Your documents and information are being verified by the university.',
      detail: currentStatus === 'Prospective' ? 'Awaiting admin decision' : approved ? 'Verified' : 'Pending',
      state: pct < 100 ? 'pending' : currentStatus === 'Prospective' ? 'current' : 'complete',
    },
    {
      title: 'Registration Approved',
      description: 'Your registration is approved once verification is complete.',
      detail: approved ? `Status: ${currentStatus}` : 'Pending',
      state: approved ? 'complete' : 'pending',
    },
    {
      title: 'Eligible for Course Registration',
      description: 'Register for courses once your registration is approved.',
      detail: approved ? 'You can register for courses now' : 'Pending',
      state: approved ? 'complete' : 'pending',
    },
  ];

  const SUMMARY = [
    { label: 'Registration No.', value: student?.reg_number ?? '—', icon: FileTextIcon },
    { label: 'Student Name', value: student?.full_name ?? '—', icon: UserRoundIcon },
    { label: 'Faculty', value: student?.Programme?.Faculty?.faculty_name ?? '—', icon: LandmarkIcon },
    { label: 'Programme', value: student?.Programme?.programme_name ?? '—', icon: GraduationCapIcon },
    { label: 'Intake', value: student?.Intake?.intake_code ?? '—', icon: ClipboardCheckIcon },
  ];

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <section>
          <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Registration Status</h1>
          <p className="mt-1 text-sm text-slate-500">Track your registration progress and stay updated with each step.</p>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <article className="flex items-center justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-emerald-600"><CheckCircle2Icon className="h-6 w-6" /></span>
                <div>
                  <h2 className="text-sm font-extrabold text-emerald-800">{loading ? 'Loading your registration status…' : approved ? 'Your registration has been approved' : 'Your registration is in verification'}</h2>
                  <p className="mt-1 text-xs text-slate-600">{approved ? 'You are now eligible for course registration.' : 'The university is reviewing your profile and documents.'}</p>
                </div>
              </div>
              <ClipboardCheckIcon className="hidden h-12 w-12 shrink-0 text-gold sm:block" strokeWidth={1.5} />
            </article>

            <section aria-labelledby="timeline-heading" className="mt-4 rounded-lg border border-slate-200 bg-white p-5 sm:p-6">
              <h2 id="timeline-heading" className="text-sm font-bold text-slate-800">Registration Timeline</h2>
              <ol className="mt-5">
                {TIMELINE.map((step, index) =>
                <li key={step.title} className="relative grid grid-cols-[34px_minmax(0,1fr)] gap-4 pb-6 last:pb-0">
                    {index < TIMELINE.length - 1 && <span className={`absolute left-[16px] top-9 h-[calc(100%-20px)] w-px ${step.state === 'complete' ? 'bg-emerald-300' : 'bg-slate-200'}`} aria-hidden="true" />}
                    <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${step.state === 'complete' ? 'border-emerald-500 bg-emerald-500 text-white' : step.state === 'current' ? 'border-gold bg-gold/15 text-maroon' : 'border-slate-200 bg-slate-100 text-slate-500'}`}>
                      <TimelineIcon state={step.state} />
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-slate-800">{index + 1}. {step.title}</h3>
                        <span className={`rounded px-2.5 py-1 text-[10px] font-bold ${step.state === 'complete' ? 'bg-emerald-100 text-emerald-700' : step.state === 'current' ? 'bg-gold/20 text-maroon' : 'bg-slate-100 text-slate-500'}`}>{STATE_LABEL[step.state]}</span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{step.description}</p>
                      <p className="mt-1.5 text-[11px] font-medium text-slate-500">{step.detail}</p>
                    </div>
                  </li>
                )}
              </ol>
              <div className="mt-6 flex items-start gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-slate-600">
                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                You will receive a notification for each update in your registration process.
              </div>
            </section>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-800">Registration Summary</h2>
              <dl className="mt-4 space-y-4">
                {SUMMARY.map(({ label, value, icon: Icon }) =>
                <div key={label} className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" strokeWidth={1.7} /></span>
                    <dt className="text-[11px] font-semibold text-slate-500">{label}</dt>
                    <dd className="ml-auto max-w-[180px] text-right text-[11px] font-bold leading-tight text-slate-700">{value}</dd>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-maroon"><LoaderCircleIcon className="h-4 w-4" strokeWidth={1.7} /></span>
                  <dt className="text-[11px] font-semibold text-slate-500">Registration Status</dt>
                  <dd className="ml-auto rounded bg-gold/20 px-2 py-1 text-[10px] font-bold text-maroon">{currentStatus ?? '—'}</dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-800">Actions</h2>
              <div className="mt-4 space-y-2.5">
                <button type="button" onClick={() => setDetailsOpen((open) => !open)} aria-expanded={detailsOpen} className="flex w-full items-center justify-center gap-2 rounded-md border border-maroon/50 bg-white py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white focus:outline-none focus:ring-2 focus:ring-maroon/25"><FileTextIcon className="h-4 w-4" />{detailsOpen ? 'Hide Details' : 'View Details'}</button>
                <button type="button" onClick={downloadSlip} className="flex w-full items-center justify-center gap-2 rounded-md border border-maroon/50 bg-white py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white focus:outline-none focus:ring-2 focus:ring-maroon/25"><DownloadIcon className="h-4 w-4" />{downloaded ? 'Slip Ready' : 'Download Registration Slip'}</button>
                <button type="button" onClick={() => setNotificationsEnabled((enabled) => !enabled)} className="flex w-full items-center justify-center gap-2 rounded-md border border-maroon/50 bg-white py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white focus:outline-none focus:ring-2 focus:ring-maroon/25"><BellIcon className="h-4 w-4" />{notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}</button>
              </div>
              {detailsOpen && <div className="mt-4 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">Verification normally takes 2–3 working days after all required information is submitted. The registrar will contact you if changes are needed.</div>}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="text-sm font-bold text-slate-800">Need Help?</h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">If you have questions regarding your registration, please contact the registrar office.</p>
              <a href="mailto:ar@agri.rjt.ac.lk" className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-maroon/50 bg-white py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white focus:outline-none focus:ring-2 focus:ring-maroon/25"><HeadphonesIcon className="h-4 w-4" />Contact Agriculture Faculty</a>
            </section>
          </aside>
        </div>
      </div>
    </main>);

}
