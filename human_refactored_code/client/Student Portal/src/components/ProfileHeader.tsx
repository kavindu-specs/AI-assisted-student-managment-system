import React, { useState } from 'react';
import { BellIcon, MenuIcon } from 'lucide-react';
import { MobilePortalNavigation } from './MobilePortalNavigation';

type ProfileHeaderProps = {
  activeLabel: string;
};

export function ProfileHeader({ activeLabel }: ProfileHeaderProps) {
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsNavigationOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isNavigationOpen}
            className="mr-1 text-maroon xl:hidden">
            
            <MenuIcon className="h-5 w-5" />
          </button>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-700">Secure Connection</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button type="button" aria-label="Notifications" className="text-slate-600 transition-colors hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/30">
          <BellIcon className="h-5 w-5" strokeWidth={1.7} />
        </button>
        </div>
      </header>
      <MobilePortalNavigation activeLabel={activeLabel} isOpen={isNavigationOpen} onClose={() => setIsNavigationOpen(false)} />
    </>);

}
