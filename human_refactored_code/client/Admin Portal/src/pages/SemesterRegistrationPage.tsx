import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, ArrowLeftIcon } from 'lucide-react';
import { getImportConfiguration, setWorkflowValue } from '../lib/registrationStore';

export function SemesterRegistrationPage() {
  const navigate = useNavigate();
  const configuration = getImportConfiguration();
  const approvedStudentCount = 6;
  const [semester, setSemester] = useState('Semester I');
  const [complete, setComplete] = useState(false);
  const activate = () => { setWorkflowValue('semester-registration', { semester, academicYear: configuration.academicYear, activated: approvedStudentCount }); setWorkflowValue('notifications', true); setComplete(true); };
  return <main className="min-h-screen bg-[#f7f6f4] px-4 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-3xl"><button onClick={() => navigate('/documents')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-maroon"><ArrowLeftIcon className="h-4 w-4" /> Student documents</button><section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-widest text-maroon">Step 9 of 9</p><h1 className="mt-2 text-2xl font-extrabold text-maroon">Semester registration</h1><p className="mt-2 text-sm text-slate-600">Assign the academic period and activate the approved student batch.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Academic year<input value={configuration.academicYear || '2024 / 2025'} readOnly className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 p-3 font-normal" /></label><label className="text-sm font-bold">Semester<select value={semester} onChange={(event) => setSemester(event.target.value)} className="mt-2 w-full rounded-md border border-stone-200 bg-white p-3 font-normal"><option>Semester I</option><option>Semester II</option></select></label></div><div className="mt-5 rounded-lg bg-stone-50 p-4 text-sm"><strong>{approvedStudentCount} approved students</strong> will be activated and notified through the portal.</div>{complete ? <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2Icon className="mr-2 inline h-5 w-5" /> Registration completed. All {approvedStudentCount} student accounts are active and notifications have been queued.</div> : <button onClick={activate} className="mt-6 w-full rounded-md bg-maroon px-4 py-3 font-bold text-white">Activate students and send notifications</button>}<button onClick={() => navigate('/dashboard')} className="mt-3 w-full rounded-md border border-maroon px-4 py-3 font-bold text-maroon">Return to dashboard</button></section></div></main>;
}
