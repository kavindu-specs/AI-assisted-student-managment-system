
import React from 'react';
import { ShieldCheckIcon } from 'lucide-react';

type ProfileCompletionProps = {
  currentStep?: number;
};

const STEPS = ['Personal Details', 'Family Information', 'Emergency Contact', 'Upload Documents', 'Review & Submit'] as const;

export function ProfileCompletion({ currentStep = 1 }: ProfileCompletionProps) {
  const percentage = currentStep * 20;
  const arc = percentage * 3.6;

  return (
    <aside className="hidden w-[286px] shrink-0 space-y-4 2xl:block">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800">Profile Completion</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `conic-gradient(#F2C94C 0deg ${arc}deg, #eef0f3 ${arc}deg 360deg)` }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600">{percentage}%</div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">Please complete all required sections to proceed with your registration.</p>
        </div>
        <ol className="mt-4 -mx-5 border-t border-slate-100">
          {STEPS.map((label, index) => {
            const step = index + 1;
            const active = step === currentStep;
            const complete = step < currentStep;
            return (
              <li key={label} className={`flex items-center gap-3 px-5 py-2.5 ${active ? 'bg-gold/10' : ''}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${active ? 'bg-gold text-maroon-deep' : complete ? 'bg-maroon text-white' : 'bg-slate-100 text-slate-500'}`}>{complete ? '✓' : step}</span>
                <span>
                  <span className="block text-xs font-bold text-slate-700">{label}</span>
                  <span className="block text-[11px] text-slate-500">{complete ? 'Completed' : active ? 'In progress' : 'Pending'}</span>
                </span>
              </li>);

          })}
        </ol>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex gap-3">
          <ShieldCheckIcon className="h-5 w-5 shrink-0 text-maroon" strokeWidth={1.75} />
          <div>
            <h2 className="text-sm font-bold text-slate-800">Important Note</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">The information you provide will be used for university records. Please ensure all details are accurate and up to date.</p>
          </div>
        </div>
      </section>
    </aside>);

}