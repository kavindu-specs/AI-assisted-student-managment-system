import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CheckCircle2Icon, ClipboardCheckIcon, FileCheck2Icon, ShieldCheckIcon } from 'lucide-react';

type DocumentStatus = 'Pending review' | 'Verified';
type StudentDocument = { id: string; name: string; idCopy: boolean; birthCertificate: boolean; schoolCertificate: boolean; status: DocumentStatus; };

const initialStudents: StudentDocument[] = [
  { id: 'RUSL/AG/2026/0001', name: 'Dissanayake, Tharindu', idCopy: true, birthCertificate: true, schoolCertificate: true, status: 'Pending review' },
  { id: 'RUSL/AG/2026/0002', name: 'Perera, Nimesh', idCopy: true, birthCertificate: true, schoolCertificate: true, status: 'Pending review' },
  { id: 'RUSL/AG/2026/0003', name: 'Fernando, Pasindu', idCopy: true, birthCertificate: true, schoolCertificate: true, status: 'Pending review' },
  { id: 'RUSL/AG/2026/0004', name: 'Silva, Kavindi', idCopy: true, birthCertificate: true, schoolCertificate: true, status: 'Pending review' },
  { id: 'RUSL/AG/2026/0005', name: 'Jayawardena, Hasini', idCopy: true, birthCertificate: true, schoolCertificate: true, status: 'Pending review' },
  { id: 'RUSL/AG/2026/0006', name: 'Wijesinghe, Sachith', idCopy: true, birthCertificate: true, schoolCertificate: true, status: 'Pending review' }
];

export function DocumentUploadPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState(initialStudents);
  const verified = students.filter((student) => student.status === 'Verified').length;
  const verifyStudent = (id: string) => setStudents((current) => current.map((student) => student.id === id ? { ...student, status: 'Verified' } : student));
  const verifyAll = () => setStudents((current) => current.map((student) => ({ ...student, status: 'Verified' })));
  const documentsReceived = useMemo(() => students.filter((student) => student.idCopy && student.birthCertificate && student.schoolCertificate).length, [students]);

  return <main className="h-screen h-[100dvh] overflow-y-auto bg-[#f7f6f4] px-4 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-6xl pb-8">
    <button onClick={() => navigate('/account-creation')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-maroon"><ArrowLeftIcon className="h-4 w-4" /> Back to account creation</button>
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-xs font-bold uppercase tracking-widest text-maroon">Step 8 of 9</p><h1 className="mt-2 text-2xl font-extrabold text-maroon">Student document review</h1><p className="mt-2 max-w-2xl text-sm text-slate-600">Review documents submitted by the approved student batch. This records the administrator’s verification; students upload their own documents through the student portal.</p></div><button onClick={verifyAll} className="flex shrink-0 items-center justify-center gap-2 rounded-md border border-maroon px-4 py-3 text-sm font-bold text-maroon hover:bg-maroon/5"><ClipboardCheckIcon className="h-4 w-4" /> Verify all documents</button></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric icon={FileCheck2Icon} label="Student documents received" value={`${documentsReceived} / ${students.length}`} tone="text-blue-700 bg-blue-50" /><Metric icon={ShieldCheckIcon} label="Verified by administrator" value={`${verified} / ${students.length}`} tone="text-emerald-700 bg-emerald-50" /><Metric icon={ClipboardCheckIcon} label="Pending review" value={String(students.length - verified)} tone="text-amber-800 bg-amber-50" /></div>
      <div className="mt-6 overflow-hidden rounded-lg border border-stone-200"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-stone-200 bg-stone-50 text-[10px] uppercase tracking-[0.08em] text-slate-500"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">National ID</th><th className="px-4 py-3">Birth certificate</th><th className="px-4 py-3">School certificate</th><th className="px-4 py-3">Review status</th><th className="px-4 py-3" /></tr></thead><tbody className="divide-y divide-stone-100">{students.map((student) => <tr key={student.id}><td className="px-4 py-4"><p className="font-bold text-slate-900">{student.name}</p><p className="mt-1 text-xs text-maroon">{student.id}</p></td><DocumentCell available={student.idCopy} /><DocumentCell available={student.birthCertificate} /><DocumentCell available={student.schoolCertificate} /><td className="px-4 py-4"><span className={`rounded px-2 py-1 text-xs font-bold ${student.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{student.status}</span></td><td className="px-4 py-4">{student.status === 'Verified' ? <span className="flex items-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2Icon className="h-4 w-4" /> Verified</span> : <button onClick={() => verifyStudent(student.id)} className="rounded border border-emerald-400 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">Verify</button>}</td></tr>)}</tbody></table></div></div>
      <div className="mt-6 flex justify-end border-t border-stone-200 pt-5"><button onClick={() => navigate('/semester-registration')} className="flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Continue to semester registration</button></div>
    </section></div></main>;
}

function DocumentCell({ available }: { available: boolean }) { return <td className="px-4 py-4">{available ? <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700"><CheckCircle2Icon className="h-4 w-4" /> Received</span> : <span className="text-xs font-bold text-rose-700">Missing</span>}</td>; }
function Metric({ icon: Icon, label, value, tone }: { icon: typeof FileCheck2Icon; label: string; value: string; tone: string }) { return <div className="flex items-center gap-3 rounded-lg border border-stone-200 p-4"><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span><div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-extrabold text-slate-900">{value}</p></div></div>; }
