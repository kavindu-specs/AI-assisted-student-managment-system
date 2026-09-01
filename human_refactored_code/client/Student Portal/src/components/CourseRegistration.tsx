import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow, SelectedCourse } from '../StudentWorkflow';
import { api, ApiError } from '../lib/apiClient';
import {
  AlertCircleIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  InfoIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersRoundIcon } from
'lucide-react';

// Shape returned by GET /students/me/courses/available - see server/docs/API.md.
type Course = {
  course_id: number;
  course_code: string;
  course_name: string;
  credits: number;
  is_elective: boolean;
};

type FilterType = 'All Courses' | 'Compulsory' | 'Elective';

const MIN_CREDITS = 15;
const MAX_CREDITS = 22;

// There is no semester-listing endpoint in this API (confirmed against
// server/docs/API.md) - GET /students/me/courses/available takes a
// semesterId as a plain query param with no way to discover valid IDs from
// the client. We surface it as a simple number input defaulting to 1 rather
// than inventing a catalogue endpoint that doesn't exist server-side.
const DEFAULT_SEMESTER_ID = 1;

export function CourseRegistration() {
  const [semesterId, setSemesterId] = useState(DEFAULT_SEMESTER_ID);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('All Courses');
  const navigate = useNavigate();
  const { startCourseReview } = useStudentWorkflow();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const data = await api.get<Course[]>(`/students/me/courses/available?semesterId=${semesterId}`);
        if (!cancelled) {
          setCourses(data);
          setSelectedIds((current) => current.filter((id) => data.some((course) => course.course_id === id)));
        }
      } catch (err) {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Could not load available courses.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [semesterId]);

  const courseById = useMemo(() => new Map(courses.map((course) => [course.course_id, course])), [courses]);
  const selectedCourses = useMemo(
    () => selectedIds.map((id) => courseById.get(id)).filter((course): course is Course => Boolean(course)),
    [selectedIds, courseById],
  );
  const totalCredits = selectedCourses.reduce((total, course) => total + course.credits, 0);
  const remainingCredits = MAX_CREDITS - totalCredits;
  const isValid = totalCredits >= MIN_CREDITS && totalCredits <= MAX_CREDITS;
  const filteredCourses = courses.filter((course) => {
    const matchesQuery = `${course.course_code} ${course.course_name}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter = filter === 'All Courses' || (filter === 'Elective' ? course.is_elective : !course.is_elective);
    return matchesQuery && matchesFilter;
  });

  function addCourse(course: Course) {
    if (selectedIds.includes(course.course_id) || totalCredits + course.credits > MAX_CREDITS) return;
    setSelectedIds((ids) => [...ids, course.course_id]);
  }

  function removeCourse(courseId: number) {
    setSelectedIds((ids) => ids.filter((id) => id !== courseId));
  }

  function resetSelection() {
    setSelectedIds([]);
    setQuery('');
    setFilter('All Courses');
  }

  function reviewSelection() {
    if (!isValid) return;
    // Duplicate-selection is structurally impossible here (selectedIds is a
    // deduped array built only through addCourse), but the server still
    // re-validates both duplicates and the credit range on submit regardless.
    const chosen: SelectedCourse[] = selectedCourses.map((course) => ({
      course_id: course.course_id,
      course_code: course.course_code,
      course_name: course.course_name,
      credits: course.credits,
      is_elective: course.is_elective,
    }));
    startCourseReview(chosen, semesterId);
    navigate('/course-review');
  }

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Course Registration</h1>
            <p className="mt-1 text-sm text-slate-500">Select your courses for the semester below. Every active course is offered to every eligible student - there is no programme/year filtering in this system.</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <CalendarDaysIcon className="h-5 w-5 text-maroon" strokeWidth={1.7} />
            <div>
              <label htmlFor="semesterId" className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Semester ID</label>
              <input
                id="semesterId"
                type="number"
                min={1}
                value={semesterId}
                onChange={(event) => setSemesterId(Math.max(1, Number(event.target.value) || 1))}
                className="mt-0.5 h-7 w-20 rounded border border-slate-200 px-2 text-xs font-bold text-slate-700 outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/10"
              />
            </div>
          </div>
        </section>

        {loadError && (
          <p role="alert" className="mt-4 rounded-md bg-rose-50 px-4 py-2.5 text-xs font-medium text-rose-700">{loadError}</p>
        )}

        <section aria-label="Credit requirements" className="mt-6 grid divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-5">
          <Metric icon={UsersRoundIcon} label="Minimum Credits" value={`${MIN_CREDITS} Credits`} className="bg-blue-50 text-blue-600" />
          <Metric icon={ShieldCheckIcon} label="Maximum Credits" value={`${MAX_CREDITS} Credits`} className="bg-indigo-50 text-indigo-600" />
          <Metric icon={CalendarDaysIcon} label="Selected Credits" value={`${totalCredits} Credits`} className="bg-gold/15 text-maroon" valueClass="text-emerald-600" />
          <Metric icon={AlertCircleIcon} label="Remaining (Max)" value={`${remainingCredits} Credits`} className="bg-red-50 text-red-500" valueClass="text-blue-600" />
          <Metric icon={CheckCircle2Icon} label="Status" value={isValid ? 'Valid Selection' : 'Needs Adjustment'} className={isValid ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'} valueClass={isValid ? 'text-emerald-700' : 'text-red-600'} />
        </section>

        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(360px,0.9fr)]">
          <article className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500">
              <span className="border-b-2 border-gold px-5 py-4 text-maroon">Available Courses</span>
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
              <table className="w-full min-w-[560px] text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Course Title</th><th className="px-3 py-3 font-bold">Type</th><th className="px-3 py-3 text-center font-bold">Credits</th><th className="px-4 py-3 text-right font-bold">Action</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((course) => {
                    const selected = selectedIds.includes(course.course_id);
                    const canAdd = !selected && totalCredits + course.credits <= MAX_CREDITS;
                    return <tr key={course.course_id} className="text-slate-600"><td className="px-4 py-3 font-bold text-slate-700">{course.course_code}</td><td className="px-3 py-3 font-medium text-slate-700">{course.course_name}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${!course.is_elective ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{course.is_elective ? 'Elective' : 'Compulsory'}</span></td><td className="px-3 py-3 text-center font-bold">{course.credits}</td><td className="px-4 py-3 text-right"><button type="button" disabled={!canAdd} onClick={() => addCourse(course)} className="inline-flex items-center gap-1 rounded border border-maroon/50 px-2 py-1 text-[11px] font-bold text-maroon transition hover:bg-maroon hover:text-white disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"><PlusIcon className="h-3.5 w-3.5" />{selected ? 'Added' : 'Add'}</button></td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            {!loading && filteredCourses.length === 0 && <p className="px-4 py-8 text-center text-xs text-slate-500">{courses.length === 0 ? 'No courses available for this semester.' : 'No courses match your search.'}</p>}
            {loading && <p className="px-4 py-8 text-center text-xs text-slate-500">Loading available courses…</p>}
          </article>

          <div className="space-y-4">
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Selected Courses ({selectedCourses.length})</h2><button type="button" onClick={() => setSelectedIds([])} className="text-xs font-bold text-red-500 hover:text-red-700">Clear All</button></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[400px] text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Course Title</th><th className="px-3 py-3 text-center font-bold">Credits</th><th className="px-5 py-3 text-right font-bold">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedCourses.map((course) => <tr key={course.course_id}><td className="px-5 py-3 font-bold text-slate-700">{course.course_code}</td><td className="px-3 py-3 font-medium text-slate-700">{course.course_name}</td><td className="px-3 py-3 text-center font-bold text-slate-700">{course.credits}</td><td className="px-5 py-3 text-right"><button type="button" onClick={() => removeCourse(course.course_id)} aria-label={`Remove ${course.course_name}`} className="text-red-500 transition hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"><Trash2Icon className="h-4 w-4" /></button></td></tr>)}</tbody></table></div>
              <div className="space-y-3 border-t border-slate-100 px-5 py-4"><div className="flex justify-between text-xs font-bold text-slate-700"><span>Total Credits</span><span>{totalCredits}</span></div><div className="flex justify-between text-xs font-bold text-slate-700"><span>Status</span><span className={`rounded px-2 py-1 text-[10px] ${isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{isValid ? 'Within Limit' : 'Needs Adjustment'}</span></div></div>
            </article>
            <article className={`flex gap-3 rounded-lg border px-4 py-4 ${isValid ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}><CheckCircle2Icon className={`mt-0.5 h-5 w-5 shrink-0 ${isValid ? 'text-emerald-600' : 'text-red-500'}`} /><div><h2 className={`text-xs font-extrabold ${isValid ? 'text-emerald-800' : 'text-red-700'}`}>{isValid ? 'Selection is Valid' : 'Selection needs adjustment'}</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-600">{isValid ? 'You can submit your course registration.' : `Select between ${MIN_CREDITS} and ${MAX_CREDITS} credits to continue.`}</p></div></article>
            <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Registration Rules</h2><ul className="mt-4 space-y-3">{['Minimum 15 credits required', 'Maximum 22 credits allowed', 'No duplicate courses'].map((rule) => <li key={rule} className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-500" />{rule}</li>)}</ul></article>
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-lg border border-gold/45 bg-gold/10 p-4 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-3"><InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-maroon" /><div><h2 className="text-xs font-bold text-slate-800">Important Note</h2><p className="mt-1 text-[11px] text-slate-600">Please review your selected courses carefully before confirming. Final validation (credits, duplicates) happens on the server when you submit.</p></div></div><div className="flex flex-wrap gap-3"><button type="button" onClick={resetSelection} className="inline-flex items-center justify-center gap-2 rounded-md border border-maroon/60 bg-white px-5 py-2.5 text-xs font-bold text-maroon transition hover:bg-maroon hover:text-white"><RotateCcwIcon className="h-4 w-4" />Reset</button><button type="button" disabled={!isValid || courses.length === 0} onClick={reviewSelection} className="inline-flex items-center justify-center gap-2 rounded-md bg-maroon px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep disabled:cursor-not-allowed disabled:opacity-50"><SendIcon className="h-4 w-4" />Review selection</button></div></section>
      </div>
    </main>);

}

type MetricProps = {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;value: string;className: string;valueClass?: string;};
function Metric({ icon: Icon, label, value, className, valueClass = 'text-slate-800' }: MetricProps) {
  return <div className="flex items-center gap-3 px-5 py-4"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${className}`}><Icon className="h-4 w-4" strokeWidth={1.8} /></span><div><p className="text-[10px] font-semibold text-slate-500">{label}</p><p className={`mt-1 text-xs font-bold ${valueClass}`}>{value}</p></div></div>;
}
