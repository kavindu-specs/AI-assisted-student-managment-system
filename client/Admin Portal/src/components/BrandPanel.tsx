import React from 'react';
import { CheckCircleIcon, ClockIcon, ShieldIcon } from 'lucide-react';

const features = [
{ icon: ShieldIcon, label: 'Multi-factor authentication' },
{ icon: ClockIcon, label: 'Session activity logging' },
{ icon: CheckCircleIcon, label: 'Role-based access control' }];


export function BrandPanel() {
  return (
    <div className="relative flex h-full overflow-hidden bg-maroon px-10 py-6 text-white xl:px-14 xl:py-8">
      <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
          'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '44px 44px'
        }} />
      

      <div className="relative z-10 flex min-h-0 w-full flex-col">
        <div className="flex flex-col items-center pt-2 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/70 xl:h-24 xl:w-24">
            <div className="absolute inset-2 rounded-full border border-white/20" />
            <span className="text-2xl font-bold tracking-tight text-white xl:text-3xl">RU</span>
          </div>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-gold xl:text-sm">Rajarata University</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/60">Faculty of Agriculture · Sri Lanka</p>
        </div>

        <div className="mt-6 flex items-center gap-4 xl:mt-8">
          <div className="h-px flex-1 bg-white/15" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Est. 1995</span>
          <div className="h-px flex-1 bg-white/15" />
        </div>

        <div className="mt-7 xl:mt-9">
          <h2 className="text-3xl font-bold leading-tight xl:text-4xl">
            Registration<br />
            <span className="text-gold">Management</span><br />
            System
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70 xl:mt-5">
            Secure administrative portal for Faculty of Agriculture student enrolments, academic records, programmes, and specializations.
          </p>
        </div>

        <ul className="mt-7 space-y-2 xl:mt-9 xl:space-y-3">
          {features.map(({ icon: Icon, label }) =>
          <li key={label} className="flex items-center gap-3 border-t border-white/10 pt-2 xl:pt-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-gold/40 bg-white/5">
                <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
              </span>
              <span className="text-sm text-white/85">{label}</span>
            </li>
          )}
        </ul>

        <div className="mt-auto pt-5">
          <div className="mb-3 h-px w-full bg-white/10" />
          <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">RURU-ADMIN / V3.1.0 / PROD</p>
        </div>
      </div>
    </div>);

}
