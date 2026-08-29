import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, Edit3Icon } from 'lucide-react';
import { useStudentWorkflow } from '../StudentWorkflow';

export function CourseReview() {
  const { selectedCourses, confirmRegistration } = useStudentWorkflow();
  const navigate = useNavigate();
  function confirm() { confirmRegistration(); navigate('/registration-confirmation'); }
  return <main className="px-5 py-6 sm:px-8 lg:px-9"><section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 sm:p-8"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-maroon"><CheckCircle2Icon className="h-6 w-6" /></span><h1 className="mt-4 text-2xl font-extrabold text-maroon">Review & Confirm Registration</h1><p className="mt-2 text-sm text-slate-600">Confirm your selected courses before the registration is completed.</p><div className="mt-6 rounded-lg border border-slate-200"><div className="border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-800">Selected courses ({selectedCourses.length})</div><ul className="divide-y divide-slate-100">{selectedCourses.map((code) => <li key={code} className="px-4 py-3 text-sm font-semibold text-slate-700">{code}</li>)}</ul></div><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" onClick={() => navigate('/course-registration')} className="inline-flex items-center gap-2 rounded-md border border-maroon/50 px-4 py-2.5 text-xs font-bold text-maroon"><Edit3Icon className="h-4 w-4" />Edit selection</button><button type="button" onClick={confirm} className="rounded-md bg-maroon px-5 py-2.5 text-xs font-bold text-white">Confirm registration</button></div></section></main>;
}
