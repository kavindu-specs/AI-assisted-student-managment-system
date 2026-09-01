import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  DownloadIcon,
  FilterIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';
import { QuickActionsPanel } from '../components/QuickActionsPanel';

type RegistrationStatus = 'Completed' | 'Pending' | 'Error';
type FilterOption = 'All' | RegistrationStatus;

type Registration = {
  id: string;
  name: string;
  faculty: string;
  programme: string;
  date: string;
  documents: 'Complete' | 'Missing';
  status: RegistrationStatus;
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


const facultyData = [
{ label: 'Agri. Eng. & Soil', value: 42 },
{ label: 'Agricultural Systems', value: 39 },
{ label: 'Animal & Food', value: 41 },
{ label: 'Plant Sciences', value: 43 }];


const registrations: Registration[] = [
{ id: 'RUSL/AG/2026/0001', name: 'Kavindi Perera', faculty: 'Agricultural Engineering & Soil Science', programme: 'BSc Hons (Agriculture)', date: '18 Jul 2026', documents: 'Complete', status: 'Completed' },
{ id: 'RUSL/AG/2026/0002', name: 'Nuwan Bandara', faculty: 'Agricultural Systems', programme: 'BSc Hons (Agriculture)', date: '18 Jul 2026', documents: 'Missing', status: 'Pending' },
{ id: 'RUSL/AG/2026/0003', name: 'Sachini Jayawardena', faculty: 'Animal & Food Sciences', programme: 'BSc Hons (Agriculture)', date: '17 Jul 2026', documents: 'Complete', status: 'Completed' },
{ id: 'RUSL/AG/2026/0004', name: 'Dilshan Fernando', faculty: 'Plant Sciences', programme: 'BSc Hons (Agriculture)', date: '17 Jul 2026', documents: 'Missing', status: 'Error' },
{ id: 'RUSL/AG/2026/0005', name: 'Thisara Rathnayake', faculty: 'Agricultural Systems', programme: 'BSc Hons (Agriculture)', date: '17 Jul 2026', documents: 'Complete', status: 'Pending' },
{ id: 'RUSL/AG/2026/0006', name: 'Amaya Dissanayake', faculty: 'Plant Sciences', programme: 'BSc Hons (Agriculture)', date: '16 Jul 2026', documents: 'Complete', status: 'Completed' },
{ id: 'RUSL/AG/2026/0007', name: 'Roshan Wickramasinghe', faculty: 'Animal & Food Sciences', programme: 'BSc Hons (Agriculture)', date: '16 Jul 2026', documents: 'Missing', status: 'Pending' }];


export function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('All');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');
  const navigate = useNavigate();

  const visibleRegistrations = useMemo(() => {
    const query = search.trim().toLowerCase();
    return registrations.filter((registration) => {
      const matchesFilter = activeFilter === 'All' || registration.status === activeFilter;
      const matchesSearch = !query || [registration.id, registration.name, registration.faculty, registration.programme].
      some((value) => value.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  const handleQuickAction = (action: 'import' | 'review' | 'search' | 'report') => {
    if (action === 'import') {
      navigate('/import-students');
      return;
    }
    const actionMessages = {
      review: 'Showing registrations awaiting review.',
      search: 'Use the search field to find a student record.',
      report: 'Your registration report is ready to generate.'
    };
    setActionFeedback(actionMessages[action]);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
          <UniversityMark />
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-white">Rajarata</p>
            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon, to }) => {
            const isActive = label === 'Dashboard';
            return (
              <button
                key={label}
                type="button"
                onClick={() => to !== '#' && navigate(to)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
                
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
                {isActive && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}
              </button>);

          })}
        </nav>

        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">Admin Perera</p>
            <p className="text-xs text-white/55">Registrar Office</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden">
              <MenuIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Agriculture Faculty Dashboard</h1>
              <p className="text-xs text-slate-500">Academic Year 2026/2027 — Semester I</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <label className="hidden w-64 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 lg:flex">
              <SearchIcon className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or ID..." className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </label>
            <div className="relative">
              <IconButton label="Notifications"><BellIcon className="h-4 w-4" /></IconButton>
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-maroon-dark">2</span>
            </div>
            <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-maroon text-xs font-extrabold text-white sm:flex">AP</div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="mx-auto max-w-[1440px] space-y-5">
            {actionFeedback &&
            <div role="status" className="flex items-center justify-between rounded-lg border border-gold/50 bg-gold/10 px-4 py-3 text-sm font-medium text-maroon">
                <span>{actionFeedback}</span>
                <button type="button" onClick={() => setActionFeedback('')} className="text-xs font-bold text-maroon/70 hover:text-maroon">Dismiss</button>
              </div>
            }
            <section className="grid gap-4 md:grid-cols-3" aria-label="Registration summary">
              <MetricCard icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" value="165" label="New Agriculture Students" note="Current intake" trend="Annual intake" />
              <MetricCard icon={CalendarDaysIcon} iconClass="bg-gold/20 text-amber-700" value="18" label="Pending Registrations" note="Awaiting review" trend="4 today" />
              <MetricCard icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" value="141" label="Completed" note="Fully processed" trend="85.5%" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-slate-900">Registrations by Academic Department</h2>
                    <p className="mt-1 text-xs text-slate-500">Faculty of Agriculture · current intake</p>
                  </div>
                  <button type="button" className="flex items-center gap-2 rounded-md border border-stone-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-maroon hover:text-maroon">
                    <DownloadIcon className="h-3.5 w-3.5" aria-hidden="true" /> Export
                  </button>
                </div>
                <div className="mt-6 flex h-52 items-end gap-3 border-b border-stone-200 pt-3 sm:gap-6">
                  {facultyData.map((faculty) =>
                  <div key={faculty.label} className="flex h-full flex-1 flex-col justify-end gap-2 text-center">
                      <div className="group relative flex flex-1 items-end justify-center">
                        <span className="absolute -top-1 hidden rounded bg-maroon px-2 py-1 text-[10px] font-semibold text-white group-hover:block">{faculty.value}</span>
                        <div className="w-full max-w-10 rounded-t-md bg-maroon transition-colors group-hover:bg-gold" style={{ height: `${faculty.value * 2}%` }} />
                      </div>
                      <span className="pb-1 text-[10px] text-slate-500 sm:text-xs">{faculty.label}</span>
                    </div>
                  )}
                </div>
              </article>

              <QuickActionsPanel onAction={handleQuickAction} />
            </section>

            <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-stone-200 px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Recent Registrations</h2>
                  <p className="mt-1 text-xs text-slate-500">Showing {visibleRegistrations.length} of 7 records</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex rounded-md bg-stone-100 p-1">
                    {(['All', 'Completed', 'Pending', 'Error'] as FilterOption[]).map((filter) =>
                    <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded px-3 py-1.5 text-sm font-medium transition ${activeFilter === filter ? 'bg-white text-maroon shadow-sm' : 'text-slate-500 hover:text-maroon'}`}>{filter}</button>
                    )}
                  </div>
                  <button type="button" className="flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-maroon hover:text-maroon"><FilterIcon className="h-3.5 w-3.5" /> Filter</button>
                  <button type="button" className="flex items-center gap-1.5 rounded-md border border-stone-200 px-3 py-2 text-xs font-medium text-slate-600 hover:border-maroon hover:text-maroon"><DownloadIcon className="h-3.5 w-3.5" /> Export</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                    <tr><th className="px-5 py-3 font-semibold">Student ID</th><th className="px-5 py-3 font-semibold">Name</th><th className="px-5 py-3 font-semibold">Department</th><th className="px-5 py-3 font-semibold">Programme</th><th className="px-5 py-3 font-semibold">Date</th><th className="px-5 py-3 font-semibold">Docs</th><th className="px-5 py-3 font-semibold">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {visibleRegistrations.map((registration) => <RegistrationRow key={registration.id} registration={registration} />)}
                    {!visibleRegistrations.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">No registrations match this view.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-stone-200 px-5 py-3 text-xs text-slate-500">
                <p>Page 1 of 2 — 165 total records</p>
                <div className="flex items-center gap-1"><button className="rounded p-1 hover:text-maroon" aria-label="Previous page"><ChevronLeftIcon className="h-4 w-4" /></button><span className="rounded bg-maroon px-2.5 py-1 font-bold text-white">1</span><button className="rounded px-2 py-1 hover:text-maroon">2</button><button className="rounded px-2 py-1 hover:text-maroon">3</button><span>…</span><button className="rounded p-1 hover:text-maroon" aria-label="Next page"><ChevronRightIcon className="h-4 w-4" /></button></div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>);

}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}

function IconButton({ children, label }: {children: React.ReactNode;label: string;}) {
  return <button type="button" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-slate-500 transition hover:border-maroon hover:text-maroon">{children}</button>;
}

function MetricCard({ icon: Icon, iconClass, value, label, note, trend }: {icon: typeof UsersIcon;iconClass: string;value: string;label: string;note: string;trend: string;}) {
  return <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><span className={`flex h-10 w-10 items-center justify-center rounded-md ${iconClass}`}><Icon className="h-5 w-5" /></span><span className="text-xs font-bold text-emerald-600">↗ {trend}</span></div><p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-sm font-bold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">{note}</p></article>;
}

function RegistrationRow({ registration }: {registration: Registration;}) {
  const statusStyle = registration.status === 'Completed' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : registration.status === 'Pending' ? 'border-gold/60 bg-gold/10 text-amber-800' : 'border-rose-200 bg-rose-50 text-rose-600';
  return <tr className="text-xs text-slate-600"><td className="whitespace-nowrap px-5 py-4 font-mono text-[11px] text-maroon">{registration.id}</td><td className="whitespace-nowrap px-5 py-4 font-bold text-slate-900">{registration.name}</td><td className="whitespace-nowrap px-5 py-4">{registration.faculty}</td><td className="whitespace-nowrap px-5 py-4">{registration.programme}</td><td className="whitespace-nowrap px-5 py-4">{registration.date}</td><td className={`whitespace-nowrap px-5 py-4 font-semibold ${registration.documents === 'Complete' ? 'text-emerald-600' : 'text-rose-500'}`}>{registration.documents === 'Complete' ? '✓ Complete' : '× Missing'}</td><td className="whitespace-nowrap px-5 py-4"><span className={`rounded border px-2 py-1 text-[10px] font-extrabold uppercase ${statusStyle}`}>{registration.status}</span></td></tr>;
}
