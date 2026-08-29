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
  FilterIcon,
  GraduationCapIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MailIcon,
  MenuIcon,
  SearchIcon,
  SettingsIcon,
  UserPlusIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';

type StudentStatus = 'Active' | 'Pending' | 'On Hold';
type StatusFilter = 'All Status' | StudentStatus;

type Student = {
  id: string;
  name: string;
  initials: string;
  faculty: string;
  programme: string;
  email: string;
  intake: string;
  status: StudentStatus;
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


const students: Student[] = [
{ id: 'RUSL/AG/2026/0001', name: 'Tharindu Dissanayake', initials: 'TD', faculty: 'Plant Sciences', programme: 'Agricultural Biology', email: 'tharindu.d@agri.rjt.ac.lk', intake: 'July 2026', status: 'Active' },
{ id: 'RUSL/AG/2026/0002', name: 'Nimesh Perera', initials: 'NP', faculty: 'Agricultural Systems', programme: 'Agricultural Economics and Extension', email: 'nimesh.p@agri.rjt.ac.lk', intake: 'July 2026', status: 'Active' },
{ id: 'RUSL/AG/2026/0003', name: 'Pasindu Fernando', initials: 'PF', faculty: 'Agricultural Engineering & Soil Science', programme: 'Agricultural Engineering', email: 'pasindu.f@agri.rjt.ac.lk', intake: 'July 2026', status: 'Active' },
{ id: 'RUSL/AG/2026/0004', name: 'Kavindi Silva', initials: 'KS', faculty: 'Agricultural Systems', programme: 'Agricultural Systems and Management', email: 'kavindi.s@agri.rjt.ac.lk', intake: 'July 2026', status: 'Pending' },
{ id: 'RUSL/AG/2026/0005', name: 'Hasini Jayawardena', initials: 'HJ', faculty: 'Animal & Food Sciences', programme: 'Animal Production and Technology', email: 'hasini.j@agri.rjt.ac.lk', intake: 'July 2026', status: 'Active' },
{ id: 'RUSL/AG/2026/0006', name: 'Sachith Wijesinghe', initials: 'SW', faculty: 'Plant Sciences', programme: 'Crop Science', email: 'sachith.w@agri.rjt.ac.lk', intake: 'January 2026', status: 'On Hold' },
{ id: 'RUSL/AG/2026/0007', name: 'Chathuri Bandara', initials: 'CB', faculty: 'Animal & Food Sciences', programme: 'Food and Postharvest Technology', email: 'chathuri.b@agri.rjt.ac.lk', intake: 'January 2026', status: 'Active' }];


export function StudentsPage() {
  const [query, setQuery] = useState('');
  const [faculty, setFaculty] = useState('All Faculties');
  const [status, setStatus] = useState<StatusFilter>('All Status');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const visibleStudents = useMemo(() => {
    const search = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesSearch = !search || [student.id, student.name, student.email, student.programme].some((value) => value.toLowerCase().includes(search));
      const matchesFaculty = faculty === 'All Faculties' || student.faculty === faculty;
      const matchesStatus = status === 'All Status' || student.status === status;
      return matchesSearch && matchesFaculty && matchesStatus;
    });
  }, [query, faculty, status]);

  const downloadDirectory = () => {
    const rows = students.map((student) => `${student.id},${student.name},${student.faculty},${student.programme},${student.email},${student.status}`).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`Student ID,Student Name,Faculty,Programme,Email,Status\n${rows}`], { type: 'text/csv' }));
    link.download = 'rajarata-student-directory.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6"><UniversityMark /><div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p></div></div>
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon, to }) => {
            const active = label === 'Students';
            return <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span>{active && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>;
          })}
        </nav>
        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Registrar Office</p></div><LogoutButton /></div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5"><button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button><button type="button" onClick={() => navigate('/dashboard')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Dashboard</button><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Agriculture Student Directory</h1><p className="text-xs text-slate-500">Manage Faculty of Agriculture students and specializations</p></div></div>
          <div className="flex items-center gap-2"><button type="button" onClick={downloadDirectory} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:border-maroon hover:text-maroon sm:flex"><DownloadIcon className="h-4 w-4" /> Export</button><button type="button" onClick={() => setNotice('New student registration starts from the Import Student Data workflow.')} className="flex items-center gap-2 rounded-md bg-maroon px-3.5 py-2.5 text-sm font-bold text-white hover:bg-maroon-light"><UserPlusIcon className="h-4 w-4" /><span className="hidden sm:inline">Add Student</span></button></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7"><div className="mx-auto max-w-[1360px] space-y-4">
          {notice && <div role="status" className="flex items-center justify-between gap-3 rounded-lg border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-maroon"><span>{notice}</span><button type="button" onClick={() => setNotice('')} className="text-xs font-bold hover:text-maroon-dark">Dismiss</button></div>}
          <section className="grid divide-y divide-stone-200 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4" aria-label="Student directory summary"><Metric icon={UsersIcon} iconClass="bg-maroon/10 text-maroon" label="Agriculture Students" value="642" /><Metric icon={CheckCircle2Icon} iconClass="bg-emerald-100 text-emerald-600" label="Active Students" value="611" /><Metric icon={GraduationCapIcon} iconClass="bg-gold/20 text-amber-700" label="Current Intake" value="165" /><Metric icon={MailIcon} iconClass="bg-blue-100 text-blue-700" label="Email Verified" value="628" /></section>

          <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-stone-200 p-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-bold text-slate-900">Faculty Students</h2><p className="mt-1 text-xs text-slate-500">Showing {visibleStudents.length} of 642 agriculture student records</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="flex min-w-0 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 sm:w-72"><SearchIcon className="h-4 w-4 shrink-0 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, ID or email..." className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400" /></label><DirectorySelect icon={GraduationCapIcon} value={faculty} onChange={setFaculty} options={['All Faculties', 'Agricultural Engineering & Soil Science', 'Agricultural Systems', 'Animal & Food Sciences', 'Plant Sciences']} /><DirectorySelect icon={FilterIcon} value={status} onChange={(value) => setStatus(value as StatusFilter)} options={['All Status', 'Active', 'Pending', 'On Hold']} /></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3 font-bold">Student</th><th className="px-4 py-3 font-bold">Registration No.</th><th className="px-4 py-3 font-bold">Department</th><th className="px-4 py-3 font-bold">Specialization</th><th className="px-4 py-3 font-bold">Intake</th><th className="px-4 py-3 font-bold">Status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-stone-100">{visibleStudents.map((student) => <StudentRow key={student.id} student={student} onView={() => setNotice(`${student.name}'s student record is ready for review.`)} />)}{!visibleStudents.length && <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">No students match these filters.</td></tr>}</tbody></table></div>
            <div className="flex items-center justify-between gap-3 border-t border-stone-200 px-4 py-3 text-xs text-slate-500"><p>Showing 1 to {visibleStudents.length} of 642 entries</p><div className="flex items-center gap-1"><button type="button" aria-label="Previous page" className="rounded border border-stone-200 p-1 text-slate-400"><ChevronLeftIcon className="h-4 w-4" /></button><span className="rounded bg-maroon px-2.5 py-1 font-bold text-white">1</span><button type="button" className="rounded px-2 py-1 hover:text-maroon">2</button><button type="button" className="rounded px-2 py-1 hover:text-maroon">3</button><span>…</span><button type="button" aria-label="Next page" className="rounded border border-stone-200 p-1 hover:text-maroon"><ChevronRightIcon className="h-4 w-4" /></button></div></div>
          </section>
        </div></div>
      </main>
      <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
    </div>);

}

function Metric({ icon: Icon, iconClass, label, value }: {icon: typeof UsersIcon;iconClass: string;label: string;value: string;}) {
  return <article className="flex items-center gap-4 p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-lg ${iconClass}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p></div></article>;
}

function DirectorySelect({ icon: Icon, value, onChange, options }: {icon: typeof GraduationCapIcon;value: string;onChange: (value: string) => void;options: string[];}) {
  return <label className="relative flex items-center"><Icon className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" /><select aria-label="Filter student directory" value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-700 outline-none focus:border-maroon sm:w-44"><>{options.map((option) => <option key={option}>{option}</option>)}</></select><ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-slate-500" /></label>;
}

function StudentRow({ student, onView }: {student: Student;onView: () => void;}) {
  const palette = student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : student.status === 'Pending' ? 'bg-gold/25 text-amber-800' : 'bg-slate-100 text-slate-600';
  return <tr className="text-xs text-slate-700"><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-maroon/10 text-[11px] font-extrabold text-maroon">{student.initials}</span><div><p className="font-bold text-slate-900">{student.name}</p><p className="mt-0.5 text-slate-500">{student.email}</p></div></div></td><td className="whitespace-nowrap px-4 py-3 font-medium text-maroon">{student.id}</td><td className="whitespace-nowrap px-4 py-3">{student.faculty}</td><td className="max-w-56 px-4 py-3 leading-relaxed">{student.programme}</td><td className="whitespace-nowrap px-4 py-3">{student.intake}</td><td className="px-4 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${palette}`}>{student.status}</span></td><td className="px-4 py-3"><button type="button" onClick={onView} className="flex items-center gap-1 rounded border border-stone-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:border-maroon hover:text-maroon"><EyeIcon className="h-3.5 w-3.5" /> View</button></td></tr>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
