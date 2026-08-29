import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow } from '../StudentWorkflow';
import {
  BadgeCheckIcon,
  BookOpenIcon,
  ClipboardListIcon,
  FileTextIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  UserRoundIcon } from
'lucide-react';

type NavigationItem = {
  label: string;
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  to?: string;
};

type PortalSidebarProps = {
  activeLabel?: string;
  variant?: 'desktop' | 'drawer';
  onNavigate?: () => void;
};

const NAVIGATION: NavigationItem[] = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'My Profile', icon: UserRoundIcon, to: '/profile' },
{ label: 'Upload Documents', icon: FileTextIcon, to: '/profile/upload-documents' },
{ label: 'Registration Status', icon: ClipboardListIcon, to: '/registration-status' },
{ label: 'Course Registration', icon: BookOpenIcon, to: '/course-registration' },
{ label: 'Registration Confirmation', icon: BadgeCheckIcon, to: '/registration-confirmation' },
{ label: 'Help & Support', icon: HelpCircleIcon }];


export function PortalSidebar({ activeLabel = 'My Profile', variant = 'desktop', onNavigate }: PortalSidebarProps) {
  const navigate = useNavigate();
  const { stage } = useStudentWorkflow();
  const isDrawer = variant === 'drawer';

  function handleNavigation(to?: string) {
    if (to) navigate(to);
    onNavigate?.();
  }

  function handleLogout() {
    navigate('/', { replace: true });
    onNavigate?.();
  }

  return (
    <aside className={`ru-grid relative h-full shrink-0 overflow-y-auto bg-maroon-deep text-white ${isDrawer ? 'flex w-full flex-col' : 'hidden w-[288px] xl:flex xl:flex-col'}`}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_42%)]" aria-hidden="true" />

      <div className="relative flex items-center gap-4 px-7 pt-9">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-gold">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40">
            <span className="text-2xl font-bold tracking-tight">R<span className="text-gold">U</span></span>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white">Rajarata</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white">University</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">of Sri Lanka</p>
          <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.14em] text-gold">Faculty of Agriculture</p>
        </div>
      </div>

      <div className="relative mx-7 mt-7 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/15" />
        <span className="text-[10px] font-semibold tracking-[0.25em] text-white/60">EST. 1995</span>
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <nav aria-label="Student portal" className="relative mt-12 px-3">
        <p className="mb-5 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/55">Agriculture Student Portal</p>
        <ul className="space-y-1.5">
          {NAVIGATION.map(({ label, icon: Icon, to }) => {
            const active = label === activeLabel;
            const locked = (label === 'Course Registration' && stage !== 'approved' && stage !== 'course-review') || (label === 'Registration Confirmation' && stage !== 'complete');
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => !locked && handleNavigation(to)}
                  disabled={locked}
                  title={locked ? 'Complete the preceding registration steps first' : undefined}
                  aria-current={active ? 'page' : undefined}
                  className={`relative flex w-full items-center gap-4 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gold/70 ${
                  active ? 'bg-white/12 text-white shadow-inner shadow-black/10' : locked ? 'cursor-not-allowed text-white/30' : 'text-white/70 hover:bg-white/8 hover:text-white'}`
                  }>
                  
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={1.7} />
                  {label}
                  {active && <span className="absolute bottom-3 right-3 top-3 w-0.5 rounded-full bg-gold" />}
                </button>
              </li>);

          })}
        </ul>
      </nav>

      <div className="relative mx-5 mt-auto mb-5 rounded-lg border border-white/15 bg-black/10 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-sm font-bold text-maroon-deep">NP</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">Nimesh Perera</p>
            <p className="mt-0.5 text-xs text-white/60">RUSL/AG/2026/0081</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 text-sm font-semibold text-gold transition-colors hover:text-gold-soft focus:outline-none focus:ring-2 focus:ring-gold/70">
          
          <LogOutIcon className="h-4 w-4" />
          Log Out
        </button>
      </div>
    </aside>);

}
