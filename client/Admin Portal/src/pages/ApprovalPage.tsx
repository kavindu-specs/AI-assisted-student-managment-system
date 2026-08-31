

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  UsersIcon,
  XCircleIcon,
  Clock3Icon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';
import { api, ApiError } from '../lib/apiClient';
import { ApprovalResult, saveApprovalResults } from '../lib/registrationStore';

type CurrentStatus = 'Prospective' | 'Registered' | 'Graduated' | 'Released';
type UiStatus = 'Pending' | 'Approved' | 'Rejected';
type StatusFilter = 'All Status' | UiStatus;

type ApiStudent = {
  student_id: number;
  reg_number: string;
  full_name: string;
  nic: string;
  current_status: CurrentStatus;
  account_status: string;
  Programme?: { programme_id: number; programme_name: string; Faculty?: { faculty_id: number; faculty_name: string } };
};

type StudentRecord = {
  studentId: number;
  regNumber: string;
  name: string;
  faculty: string;
  programme: string;
  uiStatus: UiStatus;
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/approval' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


export function ApprovalPage() {
  const [records, setRecords] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionPending, setActionPending] = useState(false);
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState('All Faculties');
  const [programme, setProgramme] = useState('All Programmes');
  const [status, setStatus] = useState<StatusFilter>('All Status');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const approvalResultsRef = useRef<Map<number, ApprovalResult>>(new Map());
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError('');
    api.get<ApiStudent[]>('/admin/students?status=Prospective')
      .then((students) => {
        if (cancelled) return;
        setRecords(students.map((student) => ({
          studentId: student.student_id,
          regNumber: student.reg_number,
          name: student.full_name,
          faculty: student.Programme?.Faculty?.faculty_name ?? '—',
          programme: student.Programme?.programme_name ?? '—',
          uiStatus: 'Pending'
        })));
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof ApiError ? err.message : 'Failed to load students awaiting approval.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const facultyOptions = useMemo(() => ['All Faculties', ...Array.from(new Set(records.map((record) => record.faculty)))], [records]);
  const programmeOptions = useMemo(() => ['All Programmes', ...Array.from(new Set(records.map((record) => record.programme)))], [records]);

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return records.filter((record) => {
      const matchesQuery = !normalizedQuery || [record.regNumber, record.name, record.faculty, record.programme].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesFaculty = faculty === 'All Faculties' || record.faculty === faculty;
      const matchesProgramme = programme === 'All Programmes' || record.programme === programme;
      const matchesStatus = status === 'All Status' || record.uiStatus === status;
      return matchesQuery && matchesFaculty && matchesProgramme && matchesStatus;
    });
  }, [records, query, faculty, programme, status]);

  const metrics = useMemo(() => ({
    valid: records.length,
    approved: records.filter((record) => record.uiStatus === 'Approved').length,
    rejected: records.filter((record) => record.uiStatus === 'Rejected').length,
    pending: records.filter((record) => record.uiStatus === 'Pending').length
  }), [records]);

  const decide = async (studentIds: number[], decision: 'approve' | 'reject') => {
    if (!studentIds.length) return;
    setActionError('');
    setActionPending(true);
    try {
      const results = await api.post<ApprovalResult[]>(`/admin/students/${decision}`, { studentIds });
      const succeededIds = results.filter((result) => result.success).map((result) => result.studentId);
      const failed = results.filter((result) => !result.success);
      setRecords((current) => current.map((record) => (
        succeededIds.includes(record.studentId)
          ? { ...record, uiStatus: decision === 'approve' ? 'Approved' : 'Rejected' }
          : record
      )));
      setSelectedIds((current) => current.filter((id) => !succeededIds.includes(id)));
      if (decision === 'approve') {
        results.forEach((result) => approvalResultsRef.current.set(result.studentId, result));
        saveApprovalResults(Array.from(approvalResultsRef.current.values()).filter((result) => result.success));
      }
      if (failed.length) {
        setActionError(failed.map((result) => `Student #${result.studentId}: ${result.error ?? 'Unknown error'}`).join(' · '));
      } else {
        setNotice(`${succeededIds.length} registration${succeededIds.length === 1 ? '' : 's'} ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`);
      }
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : `Failed to ${decision} students.`);
    } finally {
      setActionPending(false);
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleAll = () => {
    const pendingIds = filteredRecords.filter((record) => record.uiStatus === 'Pending').map((record) => record.studentId);
    setSelectedIds(selectedIds.length === pendingIds.length ? [] : pendingIds);
  };

  const bulkApprove = () => {
    const idsToApprove = selectedIds.length ? selectedIds : records.filter((record) => record.uiStatus === 'Pending').map((record) => record.studentId);
    decide(idsToApprove, 'approve');
  };

  const proceedToAccountCreation = () => navigate('/account-creation');

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
          <div className="flex items-center gap-2"><button type="button" disabled={actionPending || metrics.pending === 0} onClick={bulkApprove} className="hidden items-center gap-2 rounded-md border border-maroon px-3 py-2.5 text-sm font-bold text-maroon hover:bg-maroon hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex"><CheckCircle2Icon className="h-4 w-4" /> Bulk Approve {selectedIds.length ? `Selected (${selectedIds.length})` : 'All'}</button><div className="relative"><button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:border-maroon hover:text-maroon"><BellIcon className="h-4 w-4" /></button><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-maroon-dark">2</span></div></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7"><div className="mx-auto max-w-[1360px] space-y-4">
          {notice && <div role="status" className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="font-bold">Dismiss</button></div>}
          {loadError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{loadError}</div>}
          {actionError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{actionError}</div>}
          <section className="grid divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm md:grid-cols-4 md:divide-x md:divide-y-0" aria-label="Approval summary">
            <ApprovalMetric icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" label="Total Valid Records" value={metrics.valid} />
            <ApprovalMetric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Approved" value={metrics.approved} />
            <ApprovalMetric icon={XCircleIcon} iconClass="bg-rose-100 text-rose-600" label="Rejected" value={metrics.rejected} />
            <ApprovalMetric icon={Clock3Icon} iconClass="bg-gold/20 text-amber-700" label="Pending Approval" value={metrics.pending} />
          </section>

          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-center"><label className="flex flex-1 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 lg:max-w-md"><SearchIcon className="h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by Reg. No. or Name..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" /></label><FilterSelect icon={GraduationCapIcon} value={faculty} onChange={setFaculty} options={facultyOptions} /><FilterSelect icon={BookOpenIcon} value={programme} onChange={setProgramme} options={programmeOptions} /><FilterSelect icon={SlidersHorizontalIcon} value={status} onChange={(value) => setStatus(value as StatusFilter)} options={['All Status', 'Pending', 'Approved', 'Rejected']} /></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.07em] text-slate-500"><tr><th className="px-4 py-3"><input type="checkbox" checked={Boolean(filteredRecords.length) && selectedIds.length === filteredRecords.filter((record) => record.uiStatus === 'Pending').length} onChange={toggleAll} className="h-4 w-4 rounded border-stone-300 accent-maroon" /></th><th className="px-4 py-3">Registration No.</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Faculty</th><th className="px-4 py-3">Programme</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-stone-100">{loading ? <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">Loading students awaiting approval…</td></tr> : filteredRecords.map((record) => <ApprovalRow key={record.studentId} record={record} selected={selectedIds.includes(record.studentId)} disabled={actionPending} onToggle={() => toggleSelection(record.studentId)} onApprove={() => decide([record.studentId], 'approve')} onReject={() => decide([record.studentId], 'reject')} />)}{!loading && !filteredRecords.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">No registrations match these filters.</td></tr>}</tbody></table></div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-xs text-slate-500"><p>Showing {filteredRecords.length} of {records.length} prospective students</p></div>
          </section>
          <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><HelpCircleIcon className="h-4 w-4 shrink-0" /> Only Prospective students are shown. Approve records to create student accounts. You can approve individually or use bulk approve.</div>
          <div className="flex justify-end"><button type="button" onClick={proceedToAccountCreation} className="flex items-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Proceed to Account Creation</button></div>
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

function ApprovalRow({ record, selected, disabled, onToggle, onApprove, onReject }: {record: StudentRecord;selected: boolean;disabled: boolean;onToggle: () => void;onApprove: () => void;onReject: () => void;}) {
  const statusStyle = record.uiStatus === 'Approved' ? 'bg-emerald-100 text-emerald-700' : record.uiStatus === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-gold/25 text-amber-800';
  const canAct = record.uiStatus === 'Pending';
  return <tr className="text-xs text-slate-700"><td className="px-4 py-3"><input type="checkbox" checked={selected} disabled={!canAct || disabled} onChange={onToggle} className="h-4 w-4 rounded border-stone-300 accent-maroon disabled:opacity-40" /></td><td className="whitespace-nowrap px-4 py-3 font-medium text-maroon">{record.regNumber}</td><td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">{record.name}</td><td className="max-w-44 px-4 py-3 leading-relaxed">{record.faculty}</td><td className="max-w-44 px-4 py-3 leading-relaxed">{record.programme}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${statusStyle}`}>{record.uiStatus}</span></td><td className="px-4 py-3"><div className="flex items-center gap-2">{canAct && <><button type="button" disabled={disabled} onClick={onApprove} className="flex items-center gap-1 rounded border border-emerald-400 px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"><CheckCircle2Icon className="h-3.5 w-3.5" /> Approve</button><button type="button" disabled={disabled} onClick={onReject} className="flex items-center gap-1 rounded border border-rose-400 px-2 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-50"><XCircleIcon className="h-3.5 w-3.5" /> Reject</button></>}</div></td></tr>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
