import React, { useMemo, useState } from 'react';
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
  FileBarChartIcon,
  FileTextIcon,
  FilterIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PieChartIcon,
  PrinterIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  TrendingUpIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
  { label: 'Students', icon: UsersIcon, to: '/students' },
  { label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
  { label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
  { label: 'Reports', icon: BarChart3Icon, to: '/reports' },
  { label: 'Settings', icon: SettingsIcon, to: '/settings' }
];

const departmentData = [
  { name: 'Agricultural Engineering & Soil Science', short: 'Engineering & Soil', students: 168, color: 'bg-maroon' },
  { name: 'Agricultural Systems', short: 'Agri. Systems', students: 154, color: 'bg-gold' },
  { name: 'Animal & Food Sciences', short: 'Animal & Food', students: 161, color: 'bg-emerald-600' },
  { name: 'Plant Sciences', short: 'Plant Sciences', students: 159, color: 'bg-blue-600' }
];

const specializationData = [
  { name: 'Agricultural Biology', students: 82 },
  { name: 'Agricultural Economics and Extension', students: 78 },
  { name: 'Agricultural Engineering', students: 74 },
  { name: 'Agricultural Systems and Management', students: 80 },
  { name: 'Animal Production and Technology', students: 76 },
  { name: 'Crop Science', students: 85 },
  { name: 'Environmental Soil Management', students: 77 },
  { name: 'Food and Postharvest Technology', students: 90 }
];

const monthlyRegistrations = [
  { month: 'Jan', count: 11 }, { month: 'Feb', count: 17 }, { month: 'Mar', count: 22 },
  { month: 'Apr', count: 19 }, { month: 'May', count: 27 }, { month: 'Jun', count: 24 },
  { month: 'Jul', count: 31 }, { month: 'Aug', count: 14 }
];

const reportRows = [
  { name: 'Student Enrolment Summary', category: 'Students', period: '2026/2027', records: 642, updated: '25 Aug 2026', status: 'Ready' },
  { name: 'Current Intake Registration Status', category: 'Registrations', period: 'July 2026', records: 165, updated: '25 Aug 2026', status: 'Ready' },
  { name: 'Department Distribution', category: 'Academic', period: 'Semester I', records: 642, updated: '24 Aug 2026', status: 'Ready' },
  { name: 'Specialization Enrolment', category: 'Academic', period: '2026/2027', records: 642, updated: '24 Aug 2026', status: 'Ready' },
  { name: 'Registration Validation Issues', category: 'Registrations', period: 'July 2026', records: 24, updated: '23 Aug 2026', status: 'Needs review' },
  { name: 'Postgraduate Programme Intake', category: 'Programmes', period: '2026', records: 117, updated: '22 Aug 2026', status: 'Ready' }
];

export function ReportsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [academicYear, setAcademicYear] = useState('2026 / 2027');
  const [category, setCategory] = useState('All Reports');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const visibleReports = useMemo(() => {
    const search = query.trim().toLowerCase();
    return reportRows.filter((report) =>
      (category === 'All Reports' || report.category === category) &&
      (!search || [report.name, report.category, report.period].some((value) => value.toLowerCase().includes(search)))
    );
  }, [category, query]);

  const exportSummary = () => {
    const lines = [
      'Department,Students,Share',
      ...departmentData.map((item) => `${item.name},${item.students},${(item.students / 642 * 100).toFixed(1)}%`)
    ];
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    link.download = `agriculture-faculty-report-${academicYear.replaceAll(' ', '')}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('Faculty report exported successfully.');
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
          <div className="flex items-center gap-2"><button type="button" onClick={() => window.print()} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-maroon hover:text-maroon sm:flex"><PrinterIcon className="h-4 w-4" /> Print</button><button type="button" onClick={exportSummary} className="flex items-center gap-2 rounded-md bg-maroon px-3.5 py-2.5 text-sm font-bold text-white hover:bg-maroon-light"><DownloadIcon className="h-4 w-4" /> Export Report</button><button type="button" aria-label="Notifications" className="relative hidden h-10 w-10 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:text-maroon md:flex"><BellIcon className="h-4 w-4" /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-gold" /></button></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="mx-auto max-w-[1440px] space-y-5">
            {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="flex items-center gap-2"><CheckCircle2Icon className="h-4 w-4" />{notice}</span><button type="button" onClick={() => setNotice('')} className="text-xs font-bold">Dismiss</button></div>}

            <section className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm lg:flex-row lg:items-end" aria-label="Report filters">
              <SelectFilter label="Academic Year" icon={CalendarDaysIcon} value={academicYear} onChange={setAcademicYear} options={['2026 / 2027', '2025 / 2026', '2024 / 2025']} />
              <SelectFilter label="Report Category" icon={FilterIcon} value={category} onChange={setCategory} options={['All Reports', 'Students', 'Registrations', 'Academic', 'Programmes']} />
              <label className="min-w-0 flex-1"><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Search Reports</span><span className="mt-2 flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5"><SearchIcon className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search report name or period..." className="min-w-0 flex-1 bg-transparent text-xs outline-none" /></span></label>
              <button type="button" onClick={() => setNotice(`Report data refreshed for ${academicYear}.`)} className="flex items-center justify-center gap-2 rounded-md border border-maroon px-4 py-2.5 text-sm font-bold text-maroon hover:bg-maroon/5"><RefreshCwIcon className="h-4 w-4" /> Refresh</button>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Report summary">
              <MetricCard icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" label="Total Students" value="642" detail="Faculty enrolment" />
              <MetricCard icon={GraduationCapIcon} iconClass="bg-blue-100 text-blue-700" label="Current Intake" value="165" detail="2026/2027 intake" />
              <MetricCard icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-700" label="Completed Registrations" value="141" detail="85.5% processed" />
              <MetricCard icon={BookOpenIcon} iconClass="bg-gold/20 text-amber-700" label="Active Programmes" value="6" detail="UG and postgraduate" />
            </section>

            <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Monthly Registrations</h2><p className="mt-1 text-xs text-slate-500">Current intake registration activity</p></div><span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"><TrendingUpIcon className="h-3.5 w-3.5" /> 165 total</span></div>
                <div className="mt-7 flex h-56 items-end gap-3 border-b border-stone-200 sm:gap-5">{monthlyRegistrations.map((item) => <div key={item.month} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-bold text-slate-500">{item.count}</span><div className="w-full max-w-10 rounded-t bg-maroon transition-colors hover:bg-gold" style={{ height: `${item.count * 5}px` }} /><span className="pb-2 text-[10px] font-semibold text-slate-500">{item.month}</span></div>)}</div>
              </article>

              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Registration Status</h2><p className="mt-1 text-xs text-slate-500">Current intake progress</p></div><PieChartIcon className="h-5 w-5 text-maroon" /></div>
                <div className="mx-auto mt-6 flex h-40 w-40 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#166534 0 85.5%, #d8a62a 85.5% 96.4%, #e11d48 96.4% 100%)' }}><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white"><span className="text-3xl font-extrabold text-slate-900">165</span><span className="text-[10px] uppercase tracking-wider text-slate-500">records</span></div></div>
                <div className="mt-6 grid grid-cols-3 gap-2 text-center"><StatusLegend color="bg-emerald-700" label="Completed" value="141" /><StatusLegend color="bg-gold" label="Pending" value="18" /><StatusLegend color="bg-rose-600" label="Errors" value="6" /></div>
              </article>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Students by Department</h2><p className="mt-1 text-xs text-slate-500">Distribution of 642 enrolled students</p></div><BarChart3Icon className="h-5 w-5 text-maroon" /></div><div className="mt-6 space-y-4">{departmentData.map((item) => <div key={item.name}><div className="flex items-center justify-between gap-3 text-xs"><span className="truncate font-semibold text-slate-700">{item.name}</span><span className="shrink-0 font-bold text-slate-900">{item.students} <span className="font-medium text-slate-400">({(item.students / 642 * 100).toFixed(1)}%)</span></span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.students / 1.8}%` }} /></div></div>)}</div></article>
              <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold text-slate-900">Specialization Enrolment</h2><p className="mt-1 text-xs text-slate-500">BSc Hons (Agriculture) advanced programme</p></div><GraduationCapIcon className="h-5 w-5 text-maroon" /></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{specializationData.map((item) => <div key={item.name} className="flex items-center justify-between gap-3 rounded-md border border-stone-100 bg-stone-50 px-3 py-2.5"><span className="text-[11px] font-semibold leading-tight text-slate-700">{item.name}</span><span className="shrink-0 rounded bg-maroon/10 px-2 py-1 text-xs font-extrabold text-maroon">{item.students}</span></div>)}</div></article>
            </section>

            <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4"><div><h2 className="font-bold text-slate-900">Available Reports</h2><p className="mt-1 text-xs text-slate-500">Showing {visibleReports.length} report summaries</p></div><FileBarChartIcon className="h-5 w-5 text-maroon" /></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-5 py-3">Report</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Period</th><th className="px-5 py-3">Records</th><th className="px-5 py-3">Last Updated</th><th className="px-5 py-3">Status</th><th className="px-5 py-3" /></tr></thead><tbody className="divide-y divide-stone-100">{visibleReports.map((report) => <tr key={report.name} className="text-xs text-slate-600"><td className="px-5 py-4"><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded bg-maroon/10 text-maroon"><FileTextIcon className="h-4 w-4" /></span><span className="font-bold text-slate-900">{report.name}</span></span></td><td className="px-5 py-4">{report.category}</td><td className="px-5 py-4">{report.period}</td><td className="px-5 py-4 font-bold text-slate-800">{report.records}</td><td className="px-5 py-4">{report.updated}</td><td className="px-5 py-4"><span className={`rounded px-2 py-1 text-[10px] font-bold ${report.status === 'Ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-gold/20 text-amber-800'}`}>{report.status}</span></td><td className="px-5 py-4"><button type="button" onClick={() => setNotice(`${report.name} is ready to download.`)} className="flex items-center gap-1 rounded border border-stone-200 px-2.5 py-1.5 font-bold text-maroon hover:border-maroon"><DownloadIcon className="h-3.5 w-3.5" /> Download</button></td></tr>)}{!visibleReports.length && <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">No reports match these filters.</td></tr>}</tbody></table></div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function SelectFilter({ label, icon: Icon, value, onChange, options }: {label: string;icon: typeof FilterIcon;value: string;onChange: (value: string) => void;options: string[];}) {
  return <label className="block min-w-52"><span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</span><span className="relative mt-2 flex items-center"><Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-400" /><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-stone-200 bg-stone-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-maroon">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-400" /></span></label>;
}

function MetricCard({ icon: Icon, iconClass, label, value, detail }: {icon: typeof UsersIcon;iconClass: string;label: string;value: string;detail: string;}) {
  return <article className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-5 w-5" /></span><div><p className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</p><p className="text-xs font-bold text-slate-700">{label}</p><p className="mt-0.5 text-[10px] text-slate-500">{detail}</p></div></article>;
}

function StatusLegend({ color, label, value }: {color: string;label: string;value: string;}) {
  return <div><div className="flex items-center justify-center gap-1.5"><span className={`h-2 w-2 rounded-full ${color}`} /><span className="text-[10px] text-slate-500">{label}</span></div><p className="mt-1 text-sm font-extrabold text-slate-800">{value}</p></div>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
