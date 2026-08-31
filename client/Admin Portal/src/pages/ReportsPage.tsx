import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  DownloadIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PrinterIcon,
  RefreshCwIcon,
  SettingsIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';
import { api, ApiError } from '../lib/apiClient';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
  { label: 'Students', icon: UsersIcon, to: '/students' },
  { label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
  { label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
  { label: 'Reports', icon: BarChart3Icon, to: '/reports' },
  { label: 'Settings', icon: SettingsIcon, to: '/settings' }
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const currentYear = new Date().getFullYear();
const yearOptions = [currentYear, currentYear - 1, currentYear - 2].map((year) => String(year));

type ReportsSummary = {
  summary: {
    students: number;
    registeredStudents: number;
    intakes: number;
    courseRegistrations: number;
    programmes: number;
  };
  facultyDistribution: { faculty: string; count: number }[];
  monthlyCourseRegistrations: { month: number; count: number }[];
};

export function ReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [year, setYear] = useState(String(currentYear));
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [data, setData] = useState<ReportsSummary | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    api.get<ReportsSummary>(`/admin/reports/summary?year=${encodeURIComponent(year)}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Failed to load report summary.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [year]);

  const monthlyByIndex = useMemo(() => {
    const counts = new Array(12).fill(0);
    (data?.monthlyCourseRegistrations ?? []).forEach((row) => {
      if (row.month >= 1 && row.month <= 12) counts[row.month - 1] = row.count;
    });
    return counts;
  }, [data]);

  const maxMonthlyCount = Math.max(1, ...monthlyByIndex);
  const totalMonthly = monthlyByIndex.reduce((sum, count) => sum + count, 0);
  const facultyDistribution = data?.facultyDistribution ?? [];
  const maxFacultyCount = Math.max(1, ...facultyDistribution.map((item) => item.count));

  const exportSummary = () => {
    if (!data) return;
    const lines = [
      'Faculty,Students',
      ...facultyDistribution.map((item) => `${item.faculty},${item.count}`)
    ];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    link.download = `rajarata-report-summary-${year}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('Report summary exported successfully.');
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6"><UniversityMark /><div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">Agriculture Faculty · RMS</p></div></div>
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon, to }) => <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${label === 'Reports' ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /><span>{label}</span>{label === 'Reports' && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>)}
        </nav>
        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Agriculture Faculty</p></div><LogoutButton /></div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5"><button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button><button type="button" onClick={() => navigate('/dashboard')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Dashboard</button><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Faculty Reports</h1><p className="text-xs text-slate-500">Agriculture enrolment, registration, and programme analytics</p></div></div>
          <div className="flex items-center gap-2"><button type="button" onClick={() => window.print()} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-maroon hover:text-maroon sm:flex"><PrinterIcon className="h-4 w-4" /> Print</button><button type="button" disabled={!data} onClick={exportSummary} className="flex items-center gap-2 rounded-md bg-maroon px-3.5 py-2.5 text-sm font-bold text-white hover:bg-maroon-light disabled:cursor-not-allowed disabled:opacity-50"><DownloadIcon className="h-4 w-4" /> Export Report</button><button type="button" aria-label="Notifications" className="relative hidden h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:text-maroon md:flex"><BellIcon className="h-4 w-4" /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-gold" /></button></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="mx-auto max-w-[1440px] space-y-5">
            {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="flex items-center gap-2"><CheckCircle2Icon className="h-4 w-4" />{notice}</span><button type="button" onClick={() => setNotice('')} className="text-xs font-bold">Dismiss</button></div>}
            {loadError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</div>}

            <section className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end" aria-label="Report filters">
              <SelectFilter label="Year" icon={CalendarDaysIcon} value={year} onChange={setYear} options={yearOptions} />
              <button type="button" onClick={() => setNotice(`Report data refreshed for ${year}.`)} className="flex items-center justify-center gap-2 rounded-md border border-maroon px-4 py-2.5 text-sm font-bold text-maroon hover:bg-maroon/5"><RefreshCwIcon className="h-4 w-4" /> Refresh</button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Report summary">
              <MetricCard icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" label="Total Students" value={loading ? '—' : String(data?.summary.students ?? 0)} detail="All programmes" />
              <MetricCard icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-700" label="Registered Students" value={loading ? '—' : String(data?.summary.registeredStudents ?? 0)} detail="Currently Registered" />
              <MetricCard icon={GraduationCapIcon} iconClass="bg-blue-100 text-blue-700" label="Intakes" value={loading ? '—' : String(data?.summary.intakes ?? 0)} detail="Total intakes on record" />
              <MetricCard icon={BookOpenIcon} iconClass="bg-gold/20 text-amber-700" label="Programmes" value={loading ? '—' : String(data?.summary.programmes ?? 0)} detail="UG and postgraduate" />
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Monthly Course Registrations</h2><p className="mt-1 text-xs text-slate-500">Count of course_registration rows by registration month, {year}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{totalMonthly} total</span></div>
                <div className="mt-7 flex h-56 items-end gap-2 border-b border-stone-200 sm:gap-3">{monthNames.map((label, index) => <div key={label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-slate-500">{monthlyByIndex[index]}</span><div className="w-full max-w-8 rounded-t bg-maroon transition-colors hover:bg-gold" style={{ height: `${(monthlyByIndex[index] / maxMonthlyCount) * 190}px` }} /><span className="pb-2 text-[10px] font-semibold text-slate-500">{label}</span></div>)}</div>
              </article>

              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Students by Faculty</h2><p className="mt-1 text-xs text-slate-500">Distribution of {data?.summary.students ?? 0} enrolled students</p></div><BarChart3Icon className="h-5 w-5 text-maroon" /></div>
                <div className="mt-6 space-y-4">
                  {!loading && !facultyDistribution.length && <p className="text-sm text-slate-500">No faculty distribution data available.</p>}
                  {facultyDistribution.map((item) => <div key={item.faculty}><div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-700">{item.faculty}</span><span className="shrink-0 font-bold text-slate-900">{item.count}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-maroon" style={{ width: `${(item.count / maxFacultyCount) * 100}%` }} /></div></div>)}
                </div>
              </article>
            </section>

            <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">There is no report catalogue or per-programme enrolment breakdown endpoint in the API yet — this page shows exactly what <code className="mx-1 rounded bg-blue-100 px-1">GET /admin/reports/summary</code> returns (aggregate counts, faculty distribution, and monthly course registrations).</div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SelectFilter({ label, icon: Icon, value, onChange, options }: {label: string;icon: typeof CalendarDaysIcon;value: string;onChange: (value: string) => void;options: string[];}) {
  return <label className="block min-w-52"><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span><span className="relative mt-2 flex items-center"><Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" /><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-maroon">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" /></span></label>;
}

function MetricCard({ icon: Icon, iconClass, label, value, detail }: {icon: typeof UsersIcon;iconClass: string;label: string;value: string;detail: string;}) {
  return <article className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-5 w-5" /></span><div><p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p><p className="text-xs font-bold text-slate-700">{label}</p><p className="mt-0.5 text-[10px] text-slate-500">{detail}</p></div></article>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
