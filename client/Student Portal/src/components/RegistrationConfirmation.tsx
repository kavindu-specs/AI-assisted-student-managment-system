
import React, { useState } from 'react';
import {
  BadgeCheckIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  DownloadIcon,
  GraduationCapIcon,
  InfoIcon,
  MailIcon,
  PrinterIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  UsersRoundIcon } from
'lucide-react';

type Course = {
  code: string;
  title: string;
  type: 'Compulsory' | 'Elective';
  credits: number;
};

const COURSES: Course[] = [
{ code: 'ES1101', title: 'Agro-meteorology', type: 'Compulsory', credits: 1 },
{ code: 'ES1102', title: 'Analytical Chemistry', type: 'Compulsory', credits: 2 },
{ code: 'ES1103', title: 'Basic Engineering Physics', type: 'Compulsory', credits: 2 },
{ code: 'ES1104', title: 'Farm Power and Mechanization', type: 'Compulsory', credits: 2 },
{ code: 'AS1101', title: 'Microeconomic Theory', type: 'Compulsory', credits: 2 },
{ code: 'AF1101', title: 'Introduction to Animal Production and Aquaculture', type: 'Compulsory', credits: 2 },
{ code: 'PS1101', title: 'Principles of Agronomy', type: 'Compulsory', credits: 2 },
{ code: 'PS1102', title: 'Plant Systematics', type: 'Compulsory', credits: 2 }];


const QR_PATTERN = [
'111111100101011111111',
'100000101101010000001',
'101110100001010111101',
'101110101111010111101',
'101110100101010111101',
'100000101010010000001',
'111111101010111111111',
'000000001101000000000',
'110110111011101010101',
'001101000110010111010',
'111010111011111001101',
'010111000100101110010',
'101001111010011011101',
'000000001111110100011',
'111111101001011010101',
'100000100111110101010',
'101110101010010111101',
'101110100111110100011',
'101110101001010111110',
'100000101101110000101',
'111111101011011111111'];


function SummaryCard({ icon: Icon, label, children, tone = 'emerald' }: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;children: React.ReactNode;tone?: 'emerald' | 'violet' | 'gold';}) {
  const tones = { emerald: 'bg-emerald-50 text-emerald-700', violet: 'bg-violet-50 text-violet-700', gold: 'bg-gold/15 text-maroon' };
  return (
    <article className="flex min-h-[104px] items-center gap-4 rounded-lg border border-slate-200 bg-white p-5">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}><Icon className="h-6 w-6" strokeWidth={1.7} /></span>
      <div className="min-w-0"><p className="text-[11px] font-semibold text-slate-500">{label}</p><div className="mt-2 text-sm font-extrabold leading-tight text-slate-800">{children}</div></div>
    </article>);

}

export function RegistrationConfirmation() {
  const [downloaded, setDownloaded] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [emailed, setEmailed] = useState(false);

  function notify(action: 'download' | 'print' | 'email') {
    if (action === 'download') {setDownloaded(true);window.setTimeout(() => setDownloaded(false), 1600);}
    if (action === 'print') {setPrinted(true);window.setTimeout(() => setPrinted(false), 1600);}
    if (action === 'email') {setEmailed(true);window.setTimeout(() => setEmailed(false), 1600);}
  }

  return (
    <main className="px-5 py-6 sm:px-8 lg:px-9">
      <div className="mx-auto max-w-[1440px]">
        <section>
          <h1 className="text-2xl font-extrabold tracking-tight text-maroon">Registration Confirmation</h1>
          <p className="mt-1 text-sm text-slate-500">Congratulations! Your course registration has been completed successfully.</p>
        </section>

        <section className="mt-5 flex items-center justify-between gap-5 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-emerald-600"><CheckCircle2Icon className="h-7 w-7" strokeWidth={2} /></span><div><h2 className="text-sm font-extrabold text-emerald-800">Registration Successful!</h2><p className="mt-1 text-xs text-slate-600">Your registration has been confirmed. You will receive a confirmation email shortly.</p></div></div>
          <BadgeCheckIcon className="hidden h-12 w-12 text-gold sm:block" strokeWidth={1.5} />
        </section>

        <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={BadgeCheckIcon} label="Registration Number"><span className="text-emerald-700">RUSL/AG/2026/0081</span></SummaryCard>
          <SummaryCard icon={GraduationCapIcon} label="Programme" tone="violet">BSc Hons<br />(Agriculture)</SummaryCard>
          <SummaryCard icon={CalendarDaysIcon} label="Academic Year" tone="gold">2026/2027 <span className="mt-1 block text-xs font-medium text-slate-500">Semester 1</span></SummaryCard>
          <SummaryCard icon={ShieldCheckIcon} label="Registration Status"><span className="rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700">Confirmed</span><span className="ml-2 text-xs font-medium text-slate-500">Active</span></SummaryCard>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.78fr)_280px]">
          <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-800">Registered Courses ({COURSES.length})</h2></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-xs"><thead className="border-b border-slate-100 bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Code</th><th className="px-3 py-3 font-bold">Course Title</th><th className="px-3 py-3 font-bold">Type</th><th className="px-5 py-3 text-right font-bold">Credits</th></tr></thead><tbody className="divide-y divide-slate-100">{COURSES.map((course) => <tr key={course.code}><td className="px-5 py-3 font-bold text-slate-700">{course.code}</td><td className="px-3 py-3 font-medium text-slate-700">{course.title}</td><td className="px-3 py-3"><span className={`rounded px-2 py-1 text-[10px] font-bold ${course.type === 'Compulsory' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700'}`}>{course.type}</span></td><td className="px-5 py-3 text-right font-bold text-slate-700">{course.credits}</td></tr>)}</tbody></table></div>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-xs font-extrabold text-emerald-700"><span>Total Credits Registered</span><span>15</span></div>
          </article>

          <article className="rounded-lg border border-slate-200 bg-white p-5"><h2 className="text-sm font-bold text-slate-800">Registration Details</h2><dl className="mt-5 space-y-4"><Detail icon={CalendarDaysIcon} label="Date of Registration" value="20 May 2026, 10:45 AM" /><Detail icon={UserRoundIcon} label="Registered By" value="Nimesh Perera" /><Detail icon={GraduationCapIcon} label="Study Level" value="Undergraduate" /><Detail icon={UsersRoundIcon} label="Faculty" value="Faculty of Agriculture" /><Detail icon={BadgeCheckIcon} label="Programme Stage" value="Agriculture Core Programme" /><Detail icon={CalendarDaysIcon} label="Academic Year" value="2026/2027 Semester 1" /></dl></article>

          <article className="rounded-lg border border-slate-200 bg-white p-5 text-center"><h2 className="text-sm font-bold text-slate-800">Confirmation QR Code</h2><div className="mx-auto mt-4 flex w-fit rounded-lg border border-slate-200 bg-white p-3 shadow-sm"><div aria-label="Registration verification QR code" className="grid grid-cols-[repeat(21,5px)] grid-rows-[repeat(21,5px)] bg-white sm:grid-cols-[repeat(21,6px)] sm:grid-rows-[repeat(21,6px)]">{QR_PATTERN.flatMap((row, rowIndex) => row.split('').map((cell, columnIndex) => <span key={`${rowIndex}-${columnIndex}`} className={cell === '1' ? 'bg-slate-950' : 'bg-white'} />))}</div></div><QrCodeIcon className="mx-auto mt-4 h-4 w-4 text-maroon" /><p className="mt-2 text-xs leading-relaxed text-slate-600">Scan to verify your registration information.</p></article>
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"><article className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-3"><ActionButton icon={DownloadIcon} label={downloaded ? 'Download ready' : 'Download PDF'} description="Download registration slip" onClick={() => notify('download')} /><ActionButton icon={PrinterIcon} label={printed ? 'Print sent' : 'Print'} description="Print registration slip" onClick={() => notify('print')} /><ActionButton icon={MailIcon} label={emailed ? 'Email sent' : 'Email Confirmation'} description="Send to your email" onClick={() => notify('email')} /></article><article className="flex items-center gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white text-emerald-600"><CheckCircle2Icon className="h-6 w-6" /></span><div><h2 className="text-sm font-extrabold text-emerald-800">All Done!</h2><p className="mt-1 text-xs leading-relaxed text-slate-600">Your registration is complete. You can now access all student portal services.</p></div></article></section>

        <section className="mt-5 flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700"><InfoIcon className="h-4 w-4 shrink-0" />This is a computer generated confirmation and does not require a signature.</section>
      </div>
    </main>);

}

function Detail({ icon: Icon, label, value }: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;value: string;}) {
  return <div className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Icon className="h-4 w-4" strokeWidth={1.7} /></span><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="ml-auto text-right text-xs font-bold text-slate-700">{value}</dd></div>;
}

function ActionButton({ icon: Icon, label, description, onClick }: {icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;label: string;description: string;onClick: () => void;}) {
  return <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-md border border-maroon/50 bg-white px-4 py-3 text-left transition hover:bg-maroon hover:text-white focus:outline-none focus:ring-2 focus:ring-maroon/25"><Icon className="h-5 w-5 shrink-0 text-maroon group-hover:text-white" strokeWidth={1.7} /><span><span className="block text-xs font-bold">{label}</span><span className="mt-1 block text-[10px] text-slate-500">{description}</span></span></button>;
}
