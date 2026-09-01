import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  DownloadIcon,
  EyeIcon,
  FilterIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';

// NOTE: server/docs/API.md has no /admin/programmes (or similar) CRUD/list
// endpoint - programmes are reference data seeded directly in the database,
// not admin-managed through this API surface. Bulk import and student
// filters take a numeric programmeId, but there is nothing to look one up
// by, browse the catalogue, or edit capacity/status from the client. This
// page is left as static/local display data on purpose (per the integration
// plan) until such an endpoint exists - it is not backed by a live fetch.
type ProgrammeStatus = 'Active' | 'Draft' | 'Archived';
type Programme = {code: string;name: string;faculty: string;award: string;duration: string;intake: string;enrolled: number;capacity: number;status: ProgrammeStatus;};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


const programmes: Programme[] = [
{ code: 'AG-BSC-01', name: 'BSc Hons (Agriculture)', faculty: 'Faculty of Agriculture', award: 'Undergraduate', duration: '4 years', intake: 'July 2026', enrolled: 158, capacity: 165, status: 'Active' },
{ code: 'AG-PGRD-01', name: 'Postgraduate Diploma in Rural Development', faculty: 'Faculty of Agriculture', award: 'Postgraduate', duration: '1 year', intake: 'January 2027', enrolled: 32, capacity: 40, status: 'Active' },
{ code: 'AG-MAGR-01', name: 'Master of Agriculture', faculty: 'Faculty of Agriculture', award: 'Postgraduate', duration: '1 year', intake: 'January 2027', enrolled: 39, capacity: 45, status: 'Active' },
{ code: 'AG-MSC-01', name: 'MSc in Agroecology', faculty: 'Faculty of Agriculture', award: 'Postgraduate', duration: '2 years', intake: 'July 2026', enrolled: 26, capacity: 30, status: 'Active' },
{ code: 'AG-MPHIL-01', name: 'MPhil in Agriculture', faculty: 'Faculty of Agriculture', award: 'Postgraduate', duration: '2 years', intake: 'Research intake', enrolled: 12, capacity: 20, status: 'Active' },
{ code: 'AG-PHD-01', name: 'PhD in Agriculture', faculty: 'Faculty of Agriculture', award: 'Postgraduate', duration: '3 years', intake: 'Research intake', enrolled: 8, capacity: 15, status: 'Active' }];


export function ProgrammesPage() {
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState('All Faculties');
  const [award, setAward] = useState('All Awards');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const visibleProgrammes = useMemo(() => {
    const search = query.trim().toLowerCase();
    return programmes.filter((programme) => {
      const matchesSearch = !search || [programme.code, programme.name, programme.faculty].some((value) => value.toLowerCase().includes(search));
      return matchesSearch && (faculty === 'All Faculties' || programme.faculty === faculty) && (award === 'All Awards' || programme.award === award);
    });
  }, [query, faculty, award]);

  const exportProgrammes = () => {
    const rows = programmes.map((programme) => `${programme.code},${programme.name},${programme.faculty},${programme.award},${programme.intake},${programme.enrolled},${programme.capacity},${programme.status}`).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`Code,Programme,Faculty,Award,Intake,Enrolled,Capacity,Status\n${rows}`], { type: 'text/csv' }));
    link.download = 'rajarata-programmes.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
      <div className="h-1 bg-gold" />
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6"><UniversityMark /><div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p></div></div>
      <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">{navigationItems.map(({ label, icon: Icon, to }) => {const active = label === 'Programmes';return <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span>{active && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>;})}</nav>
      <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Registrar Office</p></div><LogoutButton /></div>
    </aside>
    {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}
    <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7"><div className="flex min-w-0 items-center gap-3 sm:gap-5"><button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button><button type="button" onClick={() => navigate('/dashboard')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Dashboard</button><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Programme Catalogue</h1><p className="text-xs text-slate-500">Manage academic programmes, intakes, and enrolment capacity</p></div></div><div className="flex items-center gap-2"><button type="button" onClick={exportProgrammes} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-maroon hover:text-maroon sm:flex"><DownloadIcon className="h-4 w-4" /> Export</button><button type="button" onClick={() => setNotice('Programme creation is not available yet - there is no admin-facing programme management endpoint in the API.')} className="flex items-center gap-2 rounded-md bg-maroon px-3.5 py-2.5 text-sm font-bold text-white hover:bg-maroon-light"><PlusIcon className="h-4 w-4" /><span className="hidden sm:inline">Add Programme</span></button></div></header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7"><div className="mx-auto max-w-[1360px] space-y-4">
        {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-maroon"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="text-xs font-bold hover:text-maroon-dark">Dismiss</button></div>}
        <div role="note" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">This catalogue is static placeholder data - the API has no admin-facing endpoint to list, create, or edit programmes yet, so nothing here is fetched from or saved to the server.</div>
        <section className="grid divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4" aria-label="Programme summary"><Metric icon={BookOpenIcon} iconClass="bg-maroon/10 text-maroon" label="Agriculture Programmes" value="6" /><Metric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Active Programmes" value="6" /><Metric icon={GraduationCapIcon} iconClass="bg-gold/20 text-amber-700" label="Current Intakes" value="4" /><Metric icon={UsersIcon} iconClass="bg-blue-100 text-blue-700" label="Available Places" value="40" /></section>
        <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-bold text-slate-900">Faculty of Agriculture Programmes</h2><p className="mt-1 text-xs text-slate-500">Showing {visibleProgrammes.length} of 6 programme offerings</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="flex min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 sm:w-72"><SearchIcon className="h-4 w-4 shrink-0 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search programme or code..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" /></label><CatalogueSelect icon={FilterIcon} value={faculty} onChange={setFaculty} options={['All Faculties', 'Faculty of Agriculture']} /><CatalogueSelect icon={GraduationCapIcon} value={award} onChange={setAward} options={['All Awards', 'Undergraduate', 'Postgraduate']} /></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[1080px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3 font-bold">Programme</th><th className="px-4 py-3 font-bold">Faculty</th><th className="px-4 py-3 font-bold">Award</th><th className="px-4 py-3 font-bold">Duration</th><th className="px-4 py-3 font-bold">Current Intake</th><th className="px-4 py-3 font-bold">Enrolment</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-stone-100">{visibleProgrammes.map((programme) => <ProgrammeRow key={programme.code} programme={programme} onView={() => setNotice(`${programme.name} is ready for programme review.`)} />)}{!visibleProgrammes.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">No programmes match these filters.</td></tr>}</tbody></table></div>
          <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-xs text-slate-500"><p>Showing all {visibleProgrammes.length} Faculty of Agriculture entries</p></div>
        </section>
      </div></div>
    </main>
    <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
  </div>;
}

function Metric({ icon: Icon, iconClass, label, value }: {icon: typeof BookOpenIcon;iconClass: string;label: string;value: string;}) {return <article className="flex items-center gap-4 p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p></div></article>;}
function CatalogueSelect({ icon: Icon, value, onChange, options }: {icon: typeof FilterIcon;value: string;onChange: (value: string) => void;options: string[];}) {return <label className="relative flex items-center"><Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" /><select aria-label="Filter programme catalogue" value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-maroon sm:w-44">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" /></label>;}
function ProgrammeRow({ programme, onView }: {programme: Programme;onView: () => void;}) {const statusClass = programme.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : programme.status === 'Draft' ? 'bg-gold/25 text-amber-800' : 'bg-slate-100 text-slate-600';const utilisation = Math.round(programme.enrolled / programme.capacity * 100);return <tr className="text-xs text-slate-700"><td className="px-4 py-3"><p className="font-bold text-slate-900">{programme.name}</p><p className="mt-1 font-mono text-[10px] text-maroon">{programme.code}</p></td><td className="whitespace-nowrap px-4 py-3">{programme.faculty}</td><td className="px-4 py-3">{programme.award}</td><td className="whitespace-nowrap px-4 py-3">{programme.duration}</td><td className="whitespace-nowrap px-4 py-3">{programme.intake}</td><td className="px-4 py-3"><div className="min-w-28"><div className="flex justify-between text-[10px] font-semibold"><span>{programme.enrolled} / {programme.capacity}</span><span className="text-slate-500">{utilisation}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-maroon" style={{ width: `${utilisation}%` }} /></div></div></td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${statusClass}`}>{programme.status}</span></td><td className="px-4 py-3"><button type="button" onClick={onView} className="flex items-center gap-1 rounded border border-stone-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-maroon hover:text-maroon"><EyeIcon className="h-3.5 w-3.5" /> View</button></td></tr>;}
function UniversityMark() {return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;}
