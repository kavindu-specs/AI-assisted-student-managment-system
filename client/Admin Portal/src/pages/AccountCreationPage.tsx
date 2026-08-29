
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  CopyIcon,
  DownloadIcon,
  HelpCircleIcon,
  InfoIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LockKeyholeIcon,
  MailIcon,
  MenuIcon,
  SendIcon,
  SettingsIcon,
  UserRoundPlusIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';

type Account = {
  registration: string;
  name: string;
  username: string;
  password: string;
  email: string;
};

const accounts: Account[] = [
{ registration: 'RUSL/AG/2026/0001', name: 'Dissanayake, Tharindu', username: 'ag20260001', password: 'X7k@8Lm3', email: 'tharindu.d@agri.rjt.ac.lk' },
{ registration: 'RUSL/AG/2026/0002', name: 'Perera, Nimesh', username: 'ag20260002', password: 'P9m#2Qw8', email: 'nimesh.p@agri.rjt.ac.lk' },
{ registration: 'RUSL/AG/2026/0003', name: 'Fernando, Pasindu', username: 'ag20260003', password: 'B6v$4Rt9', email: 'pasindu.f@agri.rjt.ac.lk' },
{ registration: 'RUSL/AG/2026/0004', name: 'Silva, Kavindi', username: 'ag20260004', password: 'K3n%5Ty2', email: 'kavindi.s@agri.rjt.ac.lk' },
{ registration: 'RUSL/AG/2026/0005', name: 'Jayawardena, Hasini', username: 'ag20260005', password: 'Z8t^7Gh1', email: 'hasini.j@agri.rjt.ac.lk' },
{ registration: 'RUSL/AG/2026/0006', name: 'Wijesinghe, Sachith', username: 'ag20260006', password: 'M2q*9Lp7', email: 'sachith.w@agri.rjt.ac.lk' }];


const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/account-creation' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


export function AccountCreationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice('Copy is not available in this browser.');
    }
  };

  const downloadList = () => {
    const csv = ['Registration No,Student Name,Username,Temporary Password,Student Email', ...accounts.map((account) => `${account.registration},${account.name},${account.username},${account.password},${account.email}`)].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = 'rajarata-student-account-credentials.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6"><UniversityMark /><div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p></div></div>
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">{navigationItems.map(({ label, icon: Icon, to }) => {const active = label === 'Registrations';return <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" /><span>{label}</span>{active && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>;})}</nav>
        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Registrar Office</p></div><LogoutButton /></div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5"><button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button><button type="button" onClick={() => navigate('/approval')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Back to Approval</button><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Automatic Account Creation</h1><p className="text-xs text-slate-500">Student accounts have been automatically created</p></div></div>
          <div className="flex items-center gap-2"><button type="button" onClick={downloadList} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-maroon hover:text-maroon sm:flex"><DownloadIcon className="h-4 w-4" /> Download List</button><div className="relative"><button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:border-maroon hover:text-maroon"><BellIcon className="h-4 w-4" /></button><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-maroon-dark">2</span></div></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7"><div className="mx-auto max-w-[1360px] space-y-4">
          <ol className="mb-6 hidden items-center justify-between gap-3 xl:flex" aria-label="Registration flow"><ProgressStep number="1" label="Configure" /><ProgressStep number="2" label="Upload File" /><ProgressStep number="3" label="Validate" /><ProgressStep number="4" label="Review & Approval" /><ProgressStep number="5" label="Account Creation" active /></ol>
          {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="font-bold">Dismiss</button></div>}
          <section className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-500 bg-white text-emerald-600"><CheckCircle2Icon className="h-6 w-6" /></span><div><h2 className="font-bold text-emerald-800">Accounts Created Successfully!</h2><p className="mt-1 text-sm text-emerald-700">141 Faculty of Agriculture student accounts have been created automatically.</p></div></section>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5" aria-label="Account creation summary"><CreationMetric icon={UserRoundPlusIcon} iconClass="bg-emerald-100 text-emerald-600" label="Total Accounts Created" value="141" /><CreationMetric icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" label="Usernames Generated" value="141" /><CreationMetric icon={LockKeyholeIcon} iconClass="bg-gold/20 text-amber-700" label="Temporary Passwords Generated" value="141" /><CreationMetric icon={MailIcon} iconClass="bg-violet-100 text-violet-600" label="Emails Available" value="136" detail="96.5%" /><CreationMetric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Registration Status" value="Completed" compact /></section>
          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.07em] text-slate-500"><tr><th className="px-4 py-4">Registration No.</th><th className="px-4 py-4">Student Name</th><th className="px-4 py-4">Username (Generated)</th><th className="px-4 py-4">Temporary Password (Generated)</th><th className="px-4 py-4">Student Email</th><th className="px-4 py-4">Status</th></tr></thead><tbody className="divide-y divide-stone-100">{accounts.map((account) => <AccountRow key={account.registration} account={account} onCopy={copyToClipboard} />)}</tbody></table></div><div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-xs text-slate-500"><p>Showing 1 to 6 of 141 agriculture accounts</p><Pagination /></div></section>
          <section className="flex flex-col gap-3 sm:flex-row"><div className="flex flex-1 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><InfoIcon className="h-4 w-4 shrink-0" /> Temporary passwords are valid for 7 days.</div><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => setNotice('Credentials are queued for delivery to all available student email addresses.')} className="flex items-center justify-center gap-2 rounded-md border border-maroon px-4 py-3 text-sm font-bold text-maroon hover:bg-maroon/5"><SendIcon className="h-4 w-4" /> Send Credentials</button><button type="button" onClick={downloadList} className="flex items-center justify-center gap-2 rounded-md border border-maroon px-4 py-3 text-sm font-bold text-maroon hover:bg-maroon/5"><DownloadIcon className="h-4 w-4" /> Download List</button><button type="button" onClick={() => navigate('/documents')} className="flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Student Documents</button></div></section>
        </div></div>
      </main>
      <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
    </div>);

}

function CreationMetric({ icon: Icon, iconClass, label, value, detail, compact = false }: {icon: typeof UserRoundPlusIcon;iconClass: string;label: string;value: string;detail?: string;compact?: boolean;}) {
  return <article className="flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs leading-relaxed text-slate-500">{label}</p><p className={`mt-1 font-extrabold tracking-tight text-slate-900 ${compact ? 'text-base text-emerald-700' : 'text-xl'}`}>{value} {detail && <span className="text-sm font-medium text-slate-500">({detail})</span>}</p></div></article>;
}

function AccountRow({ account, onCopy }: {account: Account;onCopy: (value: string, label: string) => void;}) {
  return <tr className="text-xs text-slate-700"><td className="whitespace-nowrap px-4 py-3.5 font-medium text-maroon">{account.registration}</td><td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900">{account.name}</td><td className="px-4 py-3.5"><CopyField label="username" value={account.username} onCopy={onCopy} /></td><td className="px-4 py-3.5"><CopyField label="temporary password" value={account.password} onCopy={onCopy} /></td><td className="whitespace-nowrap px-4 py-3.5">{account.email}</td><td className="px-4 py-3.5"><span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">Created</span></td></tr>;
}

function CopyField({ label, value, onCopy }: {label: string;value: string;onCopy: (value: string, label: string) => void;}) {
  return <span className="flex items-center gap-2 whitespace-nowrap"><span>{value}</span><button type="button" aria-label={`Copy ${label}`} onClick={() => onCopy(value, label)} className="rounded p-1 text-slate-400 hover:bg-stone-100 hover:text-maroon"><CopyIcon className="h-3.5 w-3.5" /></button></span>;
}

function Pagination() {
  return <div className="flex items-center gap-1"><button className="rounded border border-stone-200 p-1 text-slate-400" aria-label="Previous page"><ChevronLeftIcon className="h-4 w-4" /></button><span className="rounded bg-maroon px-2.5 py-1 font-bold text-white">1</span><button className="rounded px-2 py-1 hover:text-maroon">2</button><button className="rounded px-2 py-1 hover:text-maroon">3</button><span>…</span><button className="rounded px-2 py-1 hover:text-maroon">189</button><button className="rounded border border-stone-200 p-1" aria-label="Next page"><ChevronRightIcon className="h-4 w-4" /></button></div>;
}

function ProgressStep({ number, label, active = false }: {number: string;label: string;active?: boolean;}) {
  return <li className="flex flex-1 items-center gap-3 last:flex-none"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${active ? 'bg-gold text-maroon-dark shadow-sm' : 'bg-slate-100 text-slate-500'}`}>{number}</span><span className={`whitespace-nowrap text-sm font-semibold ${active ? 'text-maroon' : 'text-slate-500'}`}>{label}</span><span className="ml-1 h-px flex-1 bg-stone-200 last:hidden" /></li>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
