
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  HelpCircleIcon,
  InfoIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
  XCircleIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';
import { getImportResult, ImportRow, ValidationStatus } from '../lib/registrationStore';

type ResultFilter = 'All' | ValidationStatus;

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


export function ValidationResultsPage() {
  const [filter, setFilter] = useState<ResultFilter>('All');
  const [query, setQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const importResult = useMemo(() => getImportResult(), []);
  const records = importResult?.rows ?? [];
  const batch = importResult?.batch ?? null;

  const visibleRecords = useMemo(() => {
    const search = query.toLowerCase().trim();
    return records.filter((record) => {
      const passesFilter = filter === 'All' || record.validation_status === filter;
      const passesSearch = !search || [record.reg_number, record.full_name, record.nic, record.message].some((value) => (value ?? '').toLowerCase().includes(search));
      return passesFilter && passesSearch;
    });
  }, [records, filter, query]);

  const exportErrors = () => {
    const errorRows = records.filter((record) => record.validation_status !== 'Valid').map((record) => `${record.reg_number ?? ''},${record.full_name ?? ''},${record.validation_status},${record.message ?? ''}`).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`Registration,Student,Status,Message\n${errorRows}`], { type: 'text/csv' }));
    link.download = 'student-import-validation-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6"><UniversityMark /><div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p></div></div>
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon, to }) => {const active = label === 'Registrations';return <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /><span>{label}</span>{active && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>;})}
        </nav>
        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Registrar Office</p></div><LogoutButton /></div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5"><button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button><button type="button" onClick={() => navigate('/import-students')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Back to Import</button><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Validation Results</h1><p className="text-xs text-slate-500">Review and fix validation issues before importing</p></div></div>
          <div className="flex items-center gap-2"><button type="button" onClick={exportErrors} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-maroon hover:text-maroon sm:flex"><DownloadIcon className="h-4 w-4" /> Export Error Report</button><div className="relative"><button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:border-maroon hover:text-maroon"><BellIcon className="h-4 w-4" /></button><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-maroon-dark">2</span></div></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7"><div className="mx-auto max-w-[1320px] space-y-4">
          <ol className="mb-6 hidden items-center justify-between gap-3 lg:flex" aria-label="Import progress"><ProgressStep number="1" label="Configure" /><ProgressStep number="2" label="Upload File" /><ProgressStep number="3" label="Validate" active /><ProgressStep number="4" label="Import" /></ol>
          {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="font-bold">Dismiss</button></div>}
          {!importResult && <div role="alert" className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><InfoIcon className="h-4 w-4 shrink-0" /> No import results found for this session. <Link to="/import-students" className="font-bold underline">Run an import</Link> to see validation results here.</div>}
          <section className="grid divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-4 md:divide-x md:divide-y-0" aria-label="Validation summary">
            <SummaryMetric icon={FileTextIcon} iconClass="bg-maroon/10 text-maroon" label="Total Records" value={String(batch?.total_records ?? 0)} />
            <SummaryMetric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Valid Records" value={String(batch?.valid_records ?? 0)} />
            <SummaryMetric icon={AlertTriangleIcon} iconClass="bg-gold/20 text-amber-700" label="Warnings" value={String(records.filter((r) => r.validation_status === 'Warning').length)} />
            <SummaryMetric icon={XCircleIcon} iconClass="bg-rose-100 text-rose-600" label="Errors" value={String(batch?.invalid_records ?? 0)} />
          </section>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><InfoIcon className="h-4 w-4 shrink-0" /> Rows marked Valid or Warning already have a student account created (Prospective, Inactive). Rows marked Error created nothing and must be re-imported in a corrected file.</div>
          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Batch #{batch?.batch_id ?? '—'} record validation</h2><p className="mt-1 text-xs text-slate-500">Showing {visibleRecords.length} of {records.length} imported records</p></div><div className="flex gap-2"><label className="flex w-full items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 sm:w-72"><SearchIcon className="h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by Reg. No, Name or NIC..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" /></label><div className="relative"><select aria-label="Filter validation records" value={filter} onChange={(event) => setFilter(event.target.value as ResultFilter)} className="appearance-none rounded-md border border-stone-200 bg-white py-2 pl-8 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-maroon"><option>All</option><option>Valid</option><option>Warning</option><option>Error</option></select><FilterIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /><ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /></div></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3 font-bold">Row</th><th className="px-4 py-3 font-bold">Registration No</th><th className="px-4 py-3 font-bold">Student Name</th><th className="px-4 py-3 font-bold">NIC</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Error / Warning Message</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-stone-100">{visibleRecords.map((record) => <ValidationRow key={record.row_number} record={record} />)}{!visibleRecords.length && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No validation records match this filter.</td></tr>}</tbody></table></div>
          </section>
          <section className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => navigate('/import-students')} className="flex items-center justify-center gap-2 rounded-md border border-maroon px-4 py-3 text-sm font-bold text-maroon hover:bg-maroon/5"><FileTextIcon className="h-4 w-4" /> Re-import corrected file</button><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => navigate('/approval')} className="flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Review for Approval</button></div></section>
        </div></div>
      </main>
      <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
    </div>);

}

function SummaryMetric({ icon: Icon, iconClass, label, value, detail }: {icon: typeof FileTextIcon;iconClass: string;label: string;value: string;detail?: string;}) {
  return <div className="flex items-center gap-4 p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-6 w-6" /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value} {detail && <span className="text-base font-medium text-slate-500">({detail})</span>}</p></div></div>;
}

function ProgressStep({ number, label, active = false }: {number: string;label: string;active?: boolean;}) {
  return <li className="flex flex-1 items-center gap-3 last:flex-none"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${active ? 'bg-gold text-maroon-dark shadow-sm' : 'bg-slate-100 text-slate-500'}`}>{number}</span><span className={`whitespace-nowrap text-sm font-semibold ${active ? 'text-maroon' : 'text-slate-500'}`}>{label}</span><span className="ml-1 h-px flex-1 bg-stone-200 last:hidden" /></li>;
}

function ValidationRow({ record }: {record: ImportRow;}) {
  const status = record.validation_status;
  const rowClass = status === 'Error' ? 'bg-rose-50/70' : status === 'Warning' ? 'bg-gold/10' : '';
  const badgeClass = status === 'Valid' ? 'bg-emerald-100 text-emerald-700' : status === 'Warning' ? 'bg-gold/25 text-amber-800' : 'bg-rose-100 text-rose-700';
  const messageClass = status === 'Error' ? 'text-rose-600' : status === 'Warning' ? 'text-amber-700' : 'text-slate-500';
  return <tr className={`text-xs ${rowClass}`}><td className="whitespace-nowrap px-4 py-3 text-slate-500">{record.row_number}</td><td className="whitespace-nowrap px-4 py-3 font-medium text-maroon">{record.reg_number ?? '—'}</td><td className="whitespace-nowrap px-4 py-3 text-slate-700">{record.full_name ?? '—'}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{record.nic ?? '—'}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${badgeClass}`}>{status}</span></td><td className={`px-4 py-3 font-medium ${messageClass}`}>{record.message ?? '—'}</td><td className="px-4 py-3">{status === 'Error' ? <XCircleIcon className="ml-auto h-5 w-5 text-rose-500" /> : status === 'Warning' ? <AlertTriangleIcon className="ml-auto h-5 w-5 text-amber-600" /> : null}</td></tr>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
