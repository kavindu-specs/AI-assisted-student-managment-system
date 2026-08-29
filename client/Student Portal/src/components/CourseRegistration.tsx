import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow } from '../StudentWorkflow';
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  InfoIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersRoundIcon } from
'lucide-react';

type CourseType = 'Compulsory' | 'Elective';
type Course = {
  code: string;
  title: string;
  type: CourseType;
  credits: number;
  prerequisite: string;
};

type FilterType = 'All Courses' | CourseType;

const COURSES: Course[] = [
{ code: 'ES1101', title: 'Agro-meteorology', type: 'Compulsory', credits: 1, prerequisite: '—' },
{ code: 'ES1102', title: 'Analytical Chemistry', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'ES1103', title: 'Basic Engineering Physics', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'ES1104', title: 'Farm Power and Mechanization', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'AS1101', title: 'Microeconomic Theory', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'AF1101', title: 'Introduction to Animal Production and Aquaculture', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'PS1101', title: 'Principles of Agronomy', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'PS1102', title: 'Plant Systematics', type: 'Compulsory', credits: 2, prerequisite: '—' },
{ code: 'PS1103', title: 'Principles of Plant Physiology', type: 'Compulsory', credits: 2, prerequisite: '—' }];


const INITIAL_SELECTION = ['ES1101', 'ES1102', 'ES1103', 'ES1104', 'AS1101', 'AF1101', 'PS1101', 'PS1102'];
const MIN_CREDITS = 15;
const MAX_CREDITS = 22;

function courseByCode(code: string) {
  return COURSES.find((course) => course.code === code);
}

export function CourseRegistration() {
  const [selectedCodes, setSelectedCodes] = useState<string[]>(INITIAL_SELECTION);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('All Courses');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const { startCourseReview } = useStudentWorkflow();

  const selectedCourses = useMemo(() => selectedCodes.map(courseByCode).filter((course): course is Course => Boolean(course)), [selectedCodes]);
  const totalCredits = selectedCourses.reduce((total, course) => total + course.credits, 0);
  const remainingCredits = MAX_CREDITS - totalCredits;
  const isValid = totalCredits >= MIN_CREDITS && totalCredits <= MAX_CREDITS;
  const filteredCourses = COURSES.filter((course) => {
    const matchesQuery = `${course.code} ${course.title}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (filter === 'All Courses' || course.type === filter);
  });

  function addCourse(code: string) {
    const course = courseByCode(code);
    if (!course || selectedCodes.includes(code) || totalCredits + course.credits > MAX_CREDITS) return;
    setSelectedCodes((codes) => [...codes, code]);
    setSubmitted(false);
  }

  function removeCourse(code: string) {
    setSelectedCodes((codes) => codes.filter((item) => item !== code));
    setSubmitted(false);
  }

  function resetSelection() {
    setSelectedCodes(INITIAL_SELECTION);
    setQuery('');
    setFilter('All Courses');
    setSaved(false);
    setSubmitted(false);
  }

  function saveSelection() {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Course Registration</h1>
            <p className="mt-1 text-sm text-slate-500">Select your Faculty of Agriculture courses for the current semester. Please ensure you meet all prerequisites and credit requirements.</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <CalendarDaysIcon className="h-5 w-5 text-maroon" strokeWidth={1.7} />
            <div><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Current Semester</p><p className="mt-0.5 text-xs font-bold text-slate-700">Year 1, Semester 1 · 2026/2027</p></div>
          </div>
        </section>

        <section aria-label="Credit requirements" className="mt-6 grid divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
          <Metric icon={UsersRoundIcon} label="Minimum Credits" value={`${MIN_CREDITS} Credits`} className="bg-blue-50 text-blue-600" />
          <Metric icon={ShieldCheckIcon} label="Maximum Credits" value={`${MAX_CREDITS} Credits`} className="bg-indigo-50 text-indigo-600" />
          <Metric icon={CalendarDaysIcon} label="Selected Credits" value={`${totalCredits} Credits`} className="bg-gold/15 text-maroon" valueClass="text-emerald-600" />
          <Metric icon={AlertCircleIcon} label="Remaining (Max)" value={`${remainingCredits} Credits`} className="bg-red-50 text-red-500" valueClass="text-blue-600" />
          <Metric icon={CheckCircle2Icon} label="Status" value={isValid ? 'Valid Selection' : 'Needs Adjustment'} className={isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} valueClass={isValid ? 'text-emerald-700' : 'text-red-600'} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.76fr)_300px]">
          <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500">
              <span className="border-b-2 border-gold px-5 py-4 text-maroon">Available Courses</span>
              <span className="px-5 py-4">Compulsory Subjects</span>
              <span className="px-5 py-4">Elective Subjects</span>
            </div>
            <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search available courses</span>
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search course code or name…" className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10" />
              </label>
              <label className="relative">
                <span className="sr-only">Filter courses by type</span>
                <select value={filter} onChange={(event) => setFilter(event.target.value as FilterType)} className="h-9 appearance-none rounded-md border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-slate-600 outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10"><option>All Courses</option><option>Compulsory</option><option>Elective</option></select>
                <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Course Title</th><th className="px-3 py-3 font-bold">Type</th><th className="px-3 py-3 text-center font-bold">Credits</th><th className="px-3 py-3 font-bold">Pre-requisite</th><th className="px-4 py-3 text-right font-bold">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((course) => {
                    const selected = selectedCodes.includes(course.code);
                    const canAdd = !selected && totalCredits + course.credits <= MAX_CREDITS;
                    return <tr key={course.code} className="text-slate-600"><td className="px-4 py-3 font-bold text-slate-700">{course.code}</td><td className="px-3 py-3 font-medium text-slate-700">{course.title}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${course.type === 'Compulsory' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{course.type}</span></td><td className="px-3 py-3 text-center font-bold">{course.credits}</td><td className="px-3 py-3">{course.prerequisite}</td><td className="px-4 py-3 text-right"><button type="button" disabled={!canAdd} onClick={() => addCourse(course.code)} className="inline-flex items-center gap-1 rounded border border-maroon/50 px-2 py-1 text-[11px] font-bold text-maroon transition hover:bg-maroon hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"><PlusIcon className="h-3.5 w-3.5" />{selected ? 'Added' : 'Add'}</button></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            {filteredCourses.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-500">No courses match your search.</p>}
            <div className="flex items-center justify-center gap-2 border-t border-slate-100 px-4 py-3"><button type="button" className="rounded border border-slate-200 p-1.5 text-slate-500"><MinusIcon className="h-3 w-3" /></button><span className="rounded border border-maroon bg-maroon/5 px-3 py-1 text-xs font-bold text-maroon">1</span><span className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-500">2</span><span className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-500">3</span></div>
          </article>

          <div className="space-y-4">
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Selected Courses ({selectedCourses.length})</h2><button type="button" onClick={() => setSelectedCodes([])} className="text-xs font-bold text-red-500 hover:text-red-700">Clear All</button></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[400px] text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Course Title</th><th className="px-3 py-3 text-center font-bold">Credits</th><th className="px-5 py-3 text-right font-bold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedCourses.map((course) => <tr key={course.code}><td className="px-5 py-3 font-bold text-slate-700">{course.code}</td><td className="px-3 py-3 font-medium text-slate-700">{course.title}</td><td className="px-3 py-3 text-center font-bold text-slate-700">{course.credits}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => removeCourse(course.code)} aria-label={`Remove ${course.title}`} className="text-red-500 transition hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"><Trash2Icon className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
              <div className="space-y-3 border-t border-slate-100 px-5 py-4"><div className="flex justify-between text-xs font-bold text-slate-700"><span>Total Credits</span><span>{totalCredits}</span></div><div className="flex justify-between text-xs font-bold text-slate-700"><span>Status</span><span className={`rounded px-2 py-1 text-[10px] ${isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{isValid ? 'Within Limit' : 'Needs Adjustment'}</span></div></div>
            </article>
            <article className={`flex gap-3 rounded-lg border px-4 py-4 ${isValid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}><CheckCircle2Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isValid ? 'text-emerald-600' : 'text-red-500'}`} /><div><h2 className={`text-xs font-extrabold ${isValid ? 'text-emerald-800' : 'text-red-700'}`}>{isValid ? 'Selection is Valid' : 'Selection needs adjustment'}</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-600">{isValid ? 'You can submit your course registration.' : `Select between ${MIN_CREDITS} and ${MAX_CREDITS} credits to continue.`}</p></div></article>
          </div>

          <aside className="space-y-4">
            <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Credit Summary</h2><div className="mt-5 flex items-center gap-5"><div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(#6ab04c 0deg ${totalCredits / MAX_CREDITS * 360}deg, #F2C94C ${totalCredits / MAX_CREDITS * 360}deg ${(totalCredits + remainingCredits) / MAX_CREDITS * 360}deg, #e5e7eb ${(totalCredits + remainingCredits) / MAX_CREDITS * 360}deg 360deg)` }}><div className="flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white"><span className="text-xl font-extrabold text-maroon">{totalCredits}</span><span className="text-[10px] text-slate-500">Credits</span></div></div><dl className="space-y-3 text-xs"><Legend color="bg-emerald-500" label="Selected" value={totalCredits} /><Legend color="bg-gold" label="Remaining" value={remainingCredits} /><Legend color="bg-slate-300" label="Minimum" value={MIN_CREDITS} /><Legend color="bg-blue-500" label="Maximum" value={MAX_CREDITS} /></dl></div></article>
            <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Registration Rules</h2><ul className="mt-4 space-y-3">{['Minimum 15 credits required', 'Maximum 22 credits allowed', 'No duplicate courses', 'No time table conflicts', 'Pre-requisites must be satisfied'].map((rule) => <li key={rule} className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-500" />{rule}</li>)}</ul></article>
            <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Conflict Check</h2><div className="mt-4 space-y-3 text-xs text-slate-600"><p className="flex items-center gap-2"><CheckCircle2Icon className="h-4 w-4 text-emerald-500" />No time table conflicts</p><p className="flex items-center gap-2"><CheckCircle2Icon className="h-4 w-4 text-emerald-500" />No duplicate courses</p><div className="flex gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-[11px]"><InfoIcon className="h-4 w-4 shrink-0 text-blue-600" />All good! No issues found.</div></div></article>
          </aside>
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-lg border border-gold/45 bg-gold/10 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-3"><InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-maroon" /><div><h2 className="text-xs font-bold text-slate-800">Important Note</h2><p className="mt-1 text-[11px] text-slate-600">Please review your selected courses carefully before confirming.</p></div></div><div className="flex flex-wrap gap-3"><button type="button" onClick={resetSelection} className="inline-flex items-center justify-center gap-2 rounded-md border border-maroon/60 bg-white px-5 py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white"><RotateCcwIcon className="h-4 w-4" />Reset</button><button type="button" onClick={saveSelection} className="inline-flex items-center justify-center gap-2 rounded-md border border-maroon/60 bg-white px-5 py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white"><SaveIcon className="h-4 w-4" />{saved ? 'Saved' : 'Save'}</button><button type="button" disabled={!isValid || submitted} onClick={() => { setSubmitted(true); startCourseReview(selectedCodes); navigate('/course-review'); }} className="inline-flex items-center justify-center gap-2 rounded-md bg-maroon px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50"><SendIcon className="h-4 w-4" />Review selection</button></div></section>
        {submitted && <div role="status" className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800"><CheckCircle2Icon className="h-5 w-5" />Your course selection has been submitted for Semester 1.</div>}
      </div>
    </main>);

}

type MetricProps = {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;value: string;className: string;valueClass?: string;};
function Metric({ icon: Icon, label, value, className, valueClass = 'text-slate-800' }: MetricProps) {
  return <div className="flex items-center gap-3 px-5 py-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="h-4 w-4" strokeWidth={1.8} /></span><div><p className="text-[10px] font-semibold text-slate-500">{label}</p><p className={`mt-1 text-xs font-bold ${valueClass}`}>{value}</p></div></div>;
}
function Legend({ color, label, value }: {color: string;label: string;value: number;}) {
  return <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-sm ${color}`} /><span className="text-slate-600">{label}</span><strong className="ml-auto text-slate-700">{value}</strong></div>;
}
