
import React from 'react';
import { CheckIcon, FileUpIcon, PhoneIcon, UserRoundIcon, UsersRoundIcon } from 'lucide-react';

type ProfileProgressProps = {
  currentStep?: number;
};

type Step = {
  label: string;
  percent: string;
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
};

const STEPS: Step[] = [
{ label: 'Personal Details', percent: '20%', icon: UserRoundIcon },
{ label: 'Family Information', percent: '40%', icon: UsersRoundIcon },
{ label: 'Emergency Contact', percent: '60%', icon: PhoneIcon },
{ label: 'Upload Documents', percent: '80%', icon: FileUpIcon },
{ label: 'Review & Submit', percent: '100%', icon: CheckIcon }];


export function ProfileProgress({ currentStep = 1 }: ProfileProgressProps) {
  const progressWidth = `${(currentStep - 1) / (STEPS.length - 1) * 100}%`;

  return (
    <section aria-label="Profile completion steps" className="mt-7 hidden lg:block">
      <div className="relative flex items-start justify-between">
        <span className="absolute left-0 right-0 top-5 h-0.5 bg-slate-200" />
        <span className="absolute left-0 top-5 h-0.5 bg-gold transition-all duration-300" style={{ width: progressWidth }} />
        {STEPS.map(({ label, percent, icon: Icon }, index) => {
          const step = index + 1;
          const active = step === currentStep;
          const complete = step < currentStep;
          return (
            <div key={label} className="relative z-10 flex w-1/5 flex-col items-center text-center">
              <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${active ? 'border-gold bg-gold text-maroon shadow-md shadow-gold/25' : complete ? 'border-maroon bg-maroon text-white' : 'border-slate-200 bg-white text-slate-500'}`}>
                {complete ? <CheckIcon className="h-5 w-5" strokeWidth={2.1} /> : <Icon className="h-5 w-5" strokeWidth={1.8} />}
              </span>
              <span className={`mt-2 text-xs font-bold ${active ? 'text-maroon' : 'text-slate-600'}`}>{percent}</span>
              <span className={`mt-1 max-w-[130px] text-[11px] font-medium leading-tight ${active ? 'text-maroon' : 'text-slate-500'}`}>{label}</span>
            </div>);

        })}
      </div>
    </section>);

}