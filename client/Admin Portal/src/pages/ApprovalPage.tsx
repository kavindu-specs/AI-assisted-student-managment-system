

import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
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
  EyeIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PencilIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  XCircleIcon,
  Clock3Icon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';

type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';
type StatusFilter = 'All Status' | ApprovalStatus;

type StudentRecord = {
  id: string;
  name: string;
  faculty: string;
  programme: string;
  image: string;
  status: ApprovalStatus;
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/approval' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


const students: StudentRecord[] = [
{ id: 'RUSL/AG/2026/0001', name: 'Dissanayake, Tharindu', faculty: 'Plant Sciences', programme: 'Agricultural Biology', image: "/f51a47aa-9dec-4dbd-83ed-1b6d4a5a2978.jpg", status: 'Pending' },
{ id: 'RUSL/AG/2026/0002', name: 'Perera, Nimesh', faculty: 'Agricultural Systems', programme: 'Agricultural Economics and Extension', image: "/5444421c-9c70-43dc-8d6c-acbd2619f049.jpg", status: 'Pending' },
{ id: 'RUSL/AG/2026/0003', name: 'Fernando, Pasindu', faculty: 'Agricultural Engineering & Soil Science', programme: 'Agricultural Engineering', image: "/f5a58a86-4b94-43c9-b066-2f0f774aaec3.jpg", status: 'Pending' },
{ id: 'RUSL/AG/2026/0004', name: 'Silva, Kavindi', faculty: 'Agricultural Systems', programme: 'Agricultural Systems and Management', image: "/5f5eb2d9-54fb-4d95-8a52-d74ae2719296.jpg", status: 'Pending' },
{ id: 'RUSL/AG/2026/0005', name: 'Jayawardena, Hasini', faculty: 'Animal & Food Sciences', programme: 'Animal Production and Technology', image: "/5444421c-9c70-43dc-8d6c-acbd2619f049.jpg", status: 'Pending' },
{ id: 'RUSL/AG/2026/0006', name: 'Wijesinghe, Sachith', faculty: 'Plant Sciences', programme: 'Crop Science', image: "/f5a58a86-4b94-43c9-b066-2f0f774aaec3.jpg", status: 'Pending' }];


export function ApprovalPage() {
  const [records, setRecords] = useState(students);
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState('All Faculties');
  const [programme, setProgramme] = useState('All Programmes');
  const [status, setStatus] = useState<StatusFilter>('All Status');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return records.filter((record) => {
      const matchesQuery = !normalizedQuery || [record.id, record.name, record.faculty, record.programme].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesFaculty = faculty === 'All Faculties' || record.faculty === faculty;
      const matchesProgramme = programme === 'All Programmes' || record.programme === programme;
      const matchesStatus = status === 'All Status' || record.status === status;
      return matchesQuery && matchesFaculty && matchesProgramme && matchesStatus;
    });
  }, [records, query, faculty, programme, status]);

  const metrics = useMemo(() => ({
    valid: records.length,
    approved: records.filter((record) => record.status === 'Approved').length,
    rejected: records.filter((record) => record.status === 'Rejected').length,
    pending: records.filter((record) => record.status === 'Pending').length
  }), [records]);

  const setRecordStatus = (id: string, nextStatus: ApprovalStatus) => {
    setRecords((current) => current.map((record) => record.id === id ? { ...record, status: nextStatus } : record));
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
    setNotice(`Registration ${nextStatus.toLowerCase()} successfully.`);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    const pendingIds = filteredRecords.filter((record) => record.status === 'Pending').map((record) => record.id);
    setSelectedIds(selectedIds.length === pendingIds.length ? [] : pendingIds);
  };

  const bulkApprove = () => {
    const idsToApprove = selectedIds.length ? selectedIds : records.filter((record) => record.status === 'Pending').map((record) => record.id);
    if (!idsToApprove.length) {
      navigate('/account-creation');
      return;
    }
    setRecords((current) => current.map((record) => idsToApprove.includes(record.id) ? { ...record, status: 'Approved' } : record));
    setSelectedIds([]);
    navigate('/account-creation');
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
          <div className="flex min-w-0 items-center gap-3 sm:gap-5"><button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button><button type="button" onClick={() => navigate('/validation-results')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Back to Validation</button><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Registration Review & Approval</h1><p className="text-xs text-slate-500">Review validated student records and approve to create accounts</p></div></div>
          <div className="flex items-center gap-2"><button type="button" onClick={bulkApprove} className="hidden items-center gap-2 rounded-md border border-maroon px-3 py-2.5 text-sm font-bold text-maroon hover:bg-maroon hover:text-white sm:flex"><DownloadIcon className="h-4 w-4" /> Bulk Approve All</button><div className="relative"><button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:border-maroon hover:text-maroon"><BellIcon className="h-4 w-4" /></button><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-maroon-dark">2</span></div></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7"><div className="mx-auto max-w-[1360px] space-y-4">
          {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="font-bold">Dismiss</button></div>}
          <section className="grid divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-4 md:divide-x md:divide-y-0" aria-label="Approval summary">
            <ApprovalMetric icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" label="Total Valid Records" value={metrics.valid} />
            <ApprovalMetric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Approved" value={metrics.approved} />
            <ApprovalMetric icon={XCircleIcon} iconClass="bg-rose-100 text-rose-600" label="Rejected" value={metrics.rejected} />
            <ApprovalMetric icon={Clock3Icon} iconClass="bg-gold/20 text-amber-700" label="Pending Approval" value={metrics.pending} />
          </section>

          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-center"><label className="flex flex-1 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 lg:max-w-md"><SearchIcon className="h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by Reg. No., Name or NIC..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" /></label><FilterSelect icon={GraduationCapIcon} value={faculty} onChange={setFaculty} options={['All Faculties', 'Agricultural Engineering & Soil Science', 'Agricultural Systems', 'Animal & Food Sciences', 'Plant Sciences']} /><FilterSelect icon={BookOpenIcon} value={programme} onChange={setProgramme} options={['All Programmes', 'Agricultural Biology', 'Agricultural Economics and Extension', 'Agricultural Engineering', 'Agricultural Systems and Management', 'Animal Production and Technology', 'Crop Science', 'Environmental Soil Management', 'Food and Postharvest Technology']} /><FilterSelect icon={SlidersHorizontalIcon} value={status} onChange={(value) => setStatus(value as StatusFilter)} options={['All Status', 'Pending', 'Approved', 'Rejected']} /></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[1150px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.07em] text-slate-500"><tr><th className="px-4 py-3"><input type="checkbox" checked={Boolean(filteredRecords.length) && selectedIds.length === filteredRecords.filter((record) => record.status === 'Pending').length} onChange={toggleAll} className="h-4 w-4 rounded border-stone-300 accent-maroon" /></th><th className="px-4 py-3">Photo</th><th className="px-4 py-3">Registration No.</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Specialization</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-stone-100">{filteredRecords.map((record) => <ApprovalRow key={record.id} record={record} selected={selectedIds.includes(record.id)} onToggle={() => toggleSelection(record.id)} onApprove={() => setRecordStatus(record.id, 'Approved')} onReject={() => setRecordStatus(record.id, 'Rejected')} onDetails={() => setNotice(`${record.name}'s registration details are ready for review.`)} />)}{!filteredRecords.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-500">No registrations match these filters.</td></tr>}</tbody></table></div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-xs text-slate-500"><p>Showing 1 to {filteredRecords.length} of 165 agriculture registrations</p><div className="flex items-center gap-1"><button className="rounded border border-stone-200 p-1 text-slate-400" aria-label="Previous page"><ChevronLeftIcon className="h-4 w-4" /></button><span className="rounded bg-maroon px-2.5 py-1 font-bold text-white">1</span><button className="rounded px-2 py-1 hover:text-maroon">2</button><button className="rounded border border-stone-200 p-1" aria-label="Next page"><ChevronRightIcon className="h-4 w-4" /></button></div></div>
          </section>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><HelpCircleIcon className="h-4 w-4 shrink-0" /> Only validated records are shown. Approve records to create student accounts. You can approve individually or use bulk approve.</div>
          <div className="flex justify-end"><button type="button" onClick={() => navigate('/account-creation')} className="flex items-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Proceed to Account Creation</button></div>
        </div></div>
      </main>
      <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
    </div>);

}

function FilterSelect({ icon: Icon, value, onChange, options }: {icon: typeof GraduationCapIcon;value: string;onChange: (value: string) => void;options: string[];}) {
  return <label className="relative flex items-center"><Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-600" /><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-maroon lg:w-48"><>{options.map((option) => <option key={option}>{option}</option>)}</></select><ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" /></label>;
}

function ApprovalMetric({ icon: Icon, iconClass, label, value }: {icon: typeof UsersIcon;iconClass: string;label: string;value: number;}) {
  return <div className="flex items-center gap-4 p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-6 w-6" /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value.toLocaleString()}</p></div></div>;
}

function ApprovalRow({ record, selected, onToggle, onApprove, onReject, onDetails }: {record: StudentRecord;selected: boolean;onToggle: () => void;onApprove: () => void;onReject: () => void;onDetails: () => void;}) {
  const statusStyle = record.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : record.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-gold/25 text-amber-800';
  const canAct = record.status === 'Pending';
  return <tr className="text-xs text-slate-700"><td className="px-4 py-3"><input type="checkbox" checked={selected} disabled={!canAct} onChange={onToggle} className="h-4 w-4 rounded border-stone-300 accent-maroon disabled:opacity-40" /></td><td className="px-4 py-3"><img src={record.image} alt={`Portrait of ${record.name}`} className="h-12 w-12 rounded-lg object-cover" /></td><td className="whitespace-nowrap px-4 py-3 font-medium text-maroon">{record.id}</td><td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{record.name}</td><td className="max-w-44 px-4 py-3 leading-relaxed">{record.faculty}</td><td className="max-w-44 px-4 py-3 leading-relaxed">{record.programme}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${statusStyle}`}>{record.status}</span></td><td className="px-4 py-3"><div className="flex items-center gap-2">{canAct && <><button type="button" onClick={onApprove} className="flex items-center gap-1 rounded border border-emerald-400 px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50"><CheckCircle2Icon className="h-3.5 w-3.5" /> Approve</button><button type="button" onClick={onReject} className="flex items-center gap-1 rounded border border-rose-400 px-2 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50"><XCircleIcon className="h-3.5 w-3.5" /> Reject</button><button type="button" onClick={onDetails} aria-label={`Edit ${record.name}`} className="rounded border border-blue-300 p-1.5 text-blue-600 hover:bg-blue-50"><PencilIcon className="h-3.5 w-3.5" /></button></>}<button type="button" onClick={onDetails} className="flex items-center gap-1 rounded border border-stone-200 px-2 py-1.5 text-[11px] font-bold text-slate-600 hover:border-maroon hover:text-maroon"><EyeIcon className="h-3.5 w-3.5" /> Details</button></div></td></tr>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
