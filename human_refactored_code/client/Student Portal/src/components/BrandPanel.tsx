import React from 'react';
import { FileCheckIcon, ShieldCheckIcon } from 'lucide-react';

const FEATURES = [
{ icon: ShieldCheckIcon, label: 'Secure first-time login' },
{ icon: FileCheckIcon, label: 'Profile & document submission' }] as
const;

export function BrandPanel() {
  return (
    <aside className="relative hidden w-full max-w-[520px] shrink-0 overflow-hidden bg-maroon lg:flex lg:flex-col">
      {/* top gold accent bar */}
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gold" />
      {/* subtle grid + depth */}
      <div className="ru-grid absolute inset-0 opacity-60" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-maroon-dark/70"
        aria-hidden="true" />
      

      <div className="relative flex min-h-0 flex-1 flex-col px-8 py-6 xl:px-10 xl:py-7">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40">
              <span className="text-2xl font-extrabold tracking-tight text-white">
                R<span className="text-gold">U</span>
              </span>
            </div>
          </div>
          <h1 className="mt-3 text-sm font-bold uppercase tracking-[0.25em] text-gold">
            Rajarata University
          </h1>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.3em] text-white/70">
            of Sri Lanka
          </p>
          <p className="mt-2.5 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Faculty of Agriculture
          </p>
        </div>

        {/* Divider / est */}
        <div className="mt-5 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/15" />
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            Est. 1995
          </span>
          <span className="h-px flex-1 bg-white/15" />
        </div>

        {/* Headline */}
        <div className="mt-5">
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Student
            <br />
            <span className="text-gold">Registration</span>
            <br />
            Portal
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
            Access your agriculture academic profile, register for faculty courses,
            view results and manage your student journey.
          </p>
        </div>

        {/* Features */}
        <ul className="mt-5 space-y-3">
          {FEATURES.map(({ icon: Icon, label }) =>
          <li key={label} className="flex items-center gap-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-white/5 text-gold">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <span className="text-sm font-medium text-white/90">{label}</span>
            </li>
          )}
        </ul>
      </div>
    </aside>);

}
