import React, { useEffect } from 'react';
import { XIcon } from 'lucide-react';
import { PortalSidebar } from './PortalSidebar';

type MobilePortalNavigationProps = {
  activeLabel: string;
  isOpen: boolean;
  onClose: () => void;
};

export function MobilePortalNavigation({ activeLabel, isOpen, onClose }: MobilePortalNavigationProps) {
  useEffect(() => {
    if (!isOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Student portal navigation">
      <button
        type="button"
        aria-label="Close navigation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px]" />
      
      <div className="relative h-full w-[min(86vw,320px)] shadow-2xl">
        <PortalSidebar activeLabel={activeLabel} variant="drawer" onNavigate={onClose} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gold">
          
          <XIcon className="h-5 w-5" />
        </button>
      </div>
    </div>);

}