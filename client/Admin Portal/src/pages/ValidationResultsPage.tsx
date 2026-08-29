
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
  ChevronLeftIcon,
  ChevronRightIcon,
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

type ResultStatus = 'Valid' | 'Warning' | 'Error';
type ResultFilter = 'All' | ResultStatus;

type ValidationRecord = {
  registration: string;
  name: string;
  nic: string;
  status: ResultStatus;
  message: string;
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


const records: ValidationRecord[] = [
{ registration: 'RUSL/AG/2026/0001', name: 'Dissanayake, Tharindu', nic: '200412345678', status: 'Valid', message: '—' },
{ registration: 'RUSL/AG/2026/0002', name: 'Perera, Nimesh', nic: '200513456789', status: 'Error', message: 'NIC already exists in the system.' },
{ registration: 'RUSL/AG/2026/0003', name: 'Fernando, Pasindu', nic: '200623567890', status: 'Error', message: 'Registration No is missing.' },
{ registration: 'RUSL/AG/2026/0004', name: 'Silva, Kavindi', nic: '200734678901', status: 'Warning', message: 'Date of Birth is empty.' },
{ registration: 'RUSL/AG/2026/0005', name: 'Jayawardena, Hasini', nic: '200845789012', status: 'Valid', message: '—' },
{ registration: 'RUSL/AG/2026/0006', name: 'Wijesinghe, Sachith', nic: '201056789013', status: 'Warning', message: 'Email is missing.' },
{ registration: 'RUSL/AG/2026/0007', name: 'Kumara, Dinindu', nic: '201167890124', status: 'Error', message: 'Invalid NIC format.' },
{ registration: 'RUSL/AG/2026/0008', name: 'Bandara, Chathuri', nic: '201278901235', status: 'Valid', message: '—' }];


export function ValidationResultsPage() {
  const [filter, setFilter] = useState<ResultFilter>('All');
  const [query, setQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const visibleRecords = useMemo(() => {
    const search = query.toLowerCase().trim();
    return records.filter((record) => {
      const passesFilter = filter === 'All' || record.status === filter;
      const passesSearch = !search || [record.registration, record.name, record.nic, record.message].some((value) => value.toLowerCase().includes(search));
      return passesFilter && passesSearch;
    });
  }, [filter, query]);

  const exportErrors = () => {
    const errorRows = records.filter((record) => record.status !== 'Valid').map((record) => `${record.registration},${record.name},${record.status},${record.message}`).join('\n');
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
          <section className="grid divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-4 md:divide-x md:divide-y-0" aria-label="Validation summary">
            <SummaryMetric icon={FileTextIcon} iconClass="bg-maroon/10 text-maroon" label="Agriculture Records" value="165" />
            <SummaryMetric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Valid Records" value="141" detail="85.5%" />
            <SummaryMetric icon={AlertTriangleIcon} iconClass="bg-gold/20 text-amber-700" label="Warnings" value="14" detail="8.5%" />
            <SummaryMetric icon={XCircleIcon} iconClass="bg-rose-100 text-rose-600" label="Errors" value="10" detail="6.0%" />
          </section>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><InfoIcon className="h-4 w-4 shrink-0" /> Please review the validation results below. Errors must be fixed before importing. You may choose to ignore warnings if necessary.</div>
          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stone-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Agriculture record validation</h2><p className="mt-1 text-xs text-slate-500">Showing {visibleRecords.length} of 165 imported records</p></div><div className="flex gap-2"><label className="flex w-full items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 sm:w-72"><SearchIcon className="h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by Reg. No, Name or NIC..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" /></label><div className="relative"><select aria-label="Filter validation records" value={filter} onChange={(event) => setFilter(event.target.value as ResultFilter)} className="appearance-none rounded-md border border-stone-200 bg-white py-2 pl-8 pr-8 text-xs font-semibold text-slate-600 outline-none focus:border-maroon"><option>All</option><option>Valid</option><option>Warning</option><option>Error</option></select><FilterIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /><ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" /></div></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3 font-bold">Registration No</th><th className="px-4 py-3 font-bold">Student Name</th><th className="px-4 py-3 font-bold">NIC</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3 font-bold">Error / Warning Message</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-stone-100">{visibleRecords.map((record) => <ValidationRow key={record.registration} record={record} />)}{!visibleRecords.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">No validation records match this filter.</td></tr>}</tbody></table></div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-xs text-slate-500"><p>Showing 1 to {visibleRecords.length} of 1,250 entries</p><div className="flex items-center gap-1"><button className="rounded border border-stone-200 p-1 text-slate-400" aria-label="Previous page"><ChevronLeftIcon className="h-4 w-4" /></button><span className="rounded bg-maroon px-2.5 py-1 font-bold text-white">1</span><button className="rounded px-2 py-1 hover:text-maroon">2</button><button className="rounded px-2 py-1 hover:text-maroon">3</button><span>…</span><button className="rounded px-2 py-1 hover:text-maroon">157</button><button className="rounded border border-stone-200 p-1" aria-label="Next page"><ChevronRightIcon className="h-4 w-4" /></button></div></div>
          </section>
          <section className="flex flex-col gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => navigate('/import-students')} className="flex items-center justify-center gap-2 rounded-md border border-maroon px-4 py-3 text-sm font-bold text-maroon hover:bg-maroon/5"><FileTextIcon className="h-4 w-4" /> Fix Errors</button><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => setNotice('Warnings will be ignored for this demo import.')} className="flex items-center justify-center gap-2 rounded-md border border-gold px-4 py-3 text-sm font-bold text-amber-800 hover:bg-gold/10"><AlertTriangleIcon className="h-4 w-4" /> Ignore Warnings</button><button type="button" onClick={() => navigate('/approval')} className="flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Review for Approval</button></div></section>
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

function ValidationRow({ record }: {record: ValidationRecord;}) {
  const rowClass = record.status === 'Error' ? 'bg-rose-50/70' : record.status === 'Warning' ? 'bg-gold/10' : '';
  const badgeClass = record.status === 'Valid' ? 'bg-emerald-100 text-emerald-700' : record.status === 'Warning' ? 'bg-gold/25 text-amber-800' : 'bg-rose-100 text-rose-700';
  const messageClass = record.status === 'Error' ? 'text-rose-600' : record.status === 'Warning' ? 'text-amber-700' : 'text-slate-500';
  return <tr className={`text-xs ${rowClass}`}><td className="whitespace-nowrap px-4 py-3 font-medium text-maroon">{record.registration}</td><td className="whitespace-nowrap px-4 py-3 text-slate-700">{record.name}</td><td className="whitespace-nowrap px-4 py-3 text-slate-600">{record.nic}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${badgeClass}`}>{record.status}</span></td><td className={`px-4 py-3 font-medium ${messageClass}`}>{record.message}</td><td className="px-4 py-3">{record.status === 'Error' ? <XCircleIcon className="ml-auto h-5 w-5 text-rose-500" /> : record.status === 'Warning' ? <AlertTriangleIcon className="ml-auto h-5 w-5 text-amber-600" /> : null}</td></tr>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
