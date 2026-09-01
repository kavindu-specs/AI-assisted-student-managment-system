
import React, { ChangeEvent, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  HelpCircleIcon,
  InfoIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SettingsIcon,
  UploadIcon,
  UsersIcon,
  XIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';
import { api, ApiError } from '../lib/apiClient';
import { ImportApiResult, saveImportResult } from '../lib/registrationStore';

type Configuration = {
  programmeId: string;
  intakeId: string;
  regulationId: string;
};

const initialConfiguration: Configuration = {
  programmeId: '',
  intakeId: '',
  regulationId: ''
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


const expectedColumns = [
{ key: 'A', label: 'Full Name', required: true },
{ key: 'B', label: 'NIC', required: true },
{ key: 'C', label: 'DOB', required: true },
{ key: 'D', label: 'Gender', required: true },
{ key: 'E', label: 'Email', required: false },
{ key: 'F', label: 'Phone', required: false },
{ key: 'G', label: 'Address', required: false }];


export function ImportStudentDataPage() {
  const [configuration, setConfiguration] = useState<Configuration>(initialConfiguration);
  const [file, setFile] = useState<File | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const isReadyToValidate = Boolean(file && Object.values(configuration).every(Boolean));

  const updateConfiguration = (field: keyof Configuration, value: string) => {
    setConfiguration((current) => ({ ...current, [field]: value }));
    setValidationMessage('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (!selectedFile) return;
    const isAccepted = /\.(xlsx|xls|csv)$/i.test(selectedFile.name);
    if (!isAccepted) {
      setValidationMessage('Please select a .xlsx, .xls, or .csv file.');
      setFile(null);
      return;
    }
    setFile(selectedFile);
    setValidationMessage('');
  };

  const downloadTemplate = () => {
    const template = 'Full Name,NIC,DOB,Gender,Email,Phone,Address\n';
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([template], { type: 'text/csv' }));
    link.download = 'rajarata-student-import-template.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const submitImport = async () => {
    if (!isReadyToValidate || !file) return;
    setValidationMessage('');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('programmeId', configuration.programmeId);
      form.append('intakeId', configuration.intakeId);
      form.append('regulationId', configuration.regulationId);
      const result = await api.postForm<ImportApiResult>('/admin/imports', form);
      saveImportResult(result);
      navigate('/validation-results');
    } catch (err) {
      setValidationMessage(err instanceof ApiError ? err.message : 'Import failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
          <UniversityMark />
          <div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon, to }) => {
            const isActive = label === 'Registrations';
            return <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span>{isActive && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>;
          })}
        </nav>
        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Registrar Office</p></div><LogoutButton /></div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button>
            <button type="button" onClick={() => navigate('/dashboard')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 transition hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Dashboard</button>
            <div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">Import Student Data</h1><p className="text-xs text-slate-500">Upload and validate admission records before importing</p></div>
          </div>
          <div className="flex items-center gap-2"><button type="button" onClick={downloadTemplate} className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-maroon hover:text-maroon sm:flex"><DownloadIcon className="h-4 w-4" /> Download Template</button><div className="relative"><button type="button" aria-label="Notifications" className="flex h-9 w-9 items-center justify-center rounded-md border border-stone-200 text-slate-500 hover:border-maroon hover:text-maroon"><BellIcon className="h-4 w-4" /></button><span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-extrabold text-maroon-dark">2</span></div></div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="mx-auto max-w-[1140px]">
            <ol className="mb-7 hidden items-center justify-between gap-3 lg:flex" aria-label="Import progress">
              <Step number="1" label="Configure Options" active /><Step number="2" label="Upload File" /><Step number="3" label="Validate" /><Step number="4" label="Import" />
            </ol>
            {validationMessage && <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><span>{validationMessage}</span><button type="button" onClick={() => setValidationMessage('')} aria-label="Dismiss message"><XIcon className="h-4 w-4" /></button></div>}

            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
              <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-bold text-slate-900">Import Configuration</h2><p className="mt-1 text-xs text-slate-500">Every student in the sheet is assigned to this one programme, intake, and regulation</p>
                <div className="mt-6 space-y-4">
                  <NumberField label="Programme ID" value={configuration.programmeId} onChange={(value) => updateConfiguration('programmeId', value)} placeholder="e.g. 1" />
                  <NumberField label="Intake ID" value={configuration.intakeId} onChange={(value) => updateConfiguration('intakeId', value)} placeholder="e.g. 1" />
                  <NumberField label="Regulation ID" value={configuration.regulationId} onChange={(value) => updateConfiguration('regulationId', value)} placeholder="e.g. 1" />
                  <p className="flex items-start gap-2 text-xs text-slate-500"><InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" /> There is no lookup endpoint for programmes/intakes/regulations yet — enter the numeric IDs configured in the academic setup.</p>
                </div>
              </section>

              <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-bold text-slate-900">Upload File</h2>
                <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} className="sr-only" />
                <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 flex min-h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-200 bg-stone-50/50 px-6 text-center transition hover:border-maroon/40 hover:bg-maroon/[0.02] focus:outline-none focus:ring-2 focus:ring-maroon/20">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-maroon/10 text-maroon"><UploadIcon className="h-6 w-6" /></span>
                  {file ? <><span className="mt-4 text-sm font-bold text-slate-900">{file.name}</span><span className="mt-1 text-xs text-slate-500">{Math.ceil(file.size / 1024)} KB · Select another file to replace</span></> : <><span className="mt-4 text-base font-bold text-slate-900">Drag & drop your file here</span><span className="mt-1 text-sm text-slate-500">or <span className="font-semibold text-maroon">browse files</span></span><span className="mt-4 text-xs text-slate-400">.xlsx · .xls · .csv — max 10 MB</span></>}
                </button>
                <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={!isReadyToValidate || submitting} onClick={submitImport} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-maroon px-4 py-3 text-sm font-bold text-white transition hover:bg-maroon-light disabled:cursor-not-allowed disabled:bg-slate-300"><CheckCircle2Icon className="h-4 w-4" /> {submitting ? 'Uploading…' : 'Upload & Validate'}</button><button type="button" disabled={submitting} onClick={() => {setFile(null);setValidationMessage('');}} className="rounded-md border border-stone-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-maroon hover:text-maroon disabled:opacity-50">Cancel</button></div>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><InfoIcon className="h-4 w-4" /> Complete all configuration fields and upload a file to import.</p>
              </section>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
              <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><InfoIcon className="h-4 w-4 text-gold-dark" /><h2 className="font-bold text-slate-900">File Notes</h2></div><ul className="mt-4 space-y-2 text-sm text-slate-600"><li>• Accepted file types: .xlsx, .xls, .csv (max 10 MB)</li><li>• Every row is validated server-side; rows with a hard error create no account</li><li>• Passing rows (Valid or Warning) get a student account created immediately, starting Inactive/Prospective</li></ul><button type="button" onClick={downloadTemplate} className="mt-5 flex items-center gap-2 text-sm font-semibold text-maroon hover:text-gold-dark"><DownloadIcon className="h-4 w-4" /> Download CSV template</button></section>
              <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-2"><FileSpreadsheetIcon className="h-4 w-4 text-maroon" /><h2 className="font-bold text-slate-900">Expected Columns</h2></div><div className="mt-4 grid gap-2 sm:grid-cols-2">{expectedColumns.map((column) => <div key={column.key} className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded bg-maroon text-[10px] font-bold text-white">{column.key}</span><span className="min-w-0 flex-1 text-sm text-slate-700">{column.label}</span><span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${column.required ? 'bg-maroon/10 text-maroon' : 'bg-slate-100 text-slate-500'}`}>{column.required ? 'Required' : 'Optional'}</span></div>)}</div></section>
            </div>
          </div>
        </div>
        <footer className="flex shrink-0 items-center justify-between border-t border-stone-200 bg-white px-5 py-3 text-[10px] text-slate-400 sm:px-7 sm:text-xs"><span>© 2024 Rajarata University of Sri Lanka · IT Division</span><span className="hidden sm:block">RURU-RMS / v3.1.0</span></footer>
      </main>
      <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
    </div>);

}

function NumberField({ label, value, onChange, placeholder }: {label: string;value: string;onChange: (value: string) => void;placeholder: string;}) {
  return <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-maroon">{label}</span><input type="number" min={1} inputMode="numeric" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/15" /></label>;
}

function Step({ number, label, active = false }: {number: string;label: string;active?: boolean;}) {
  return <li className="flex flex-1 items-center gap-3 last:flex-none"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${active ? 'bg-gold text-maroon-dark' : 'bg-slate-100 text-slate-500'}`}>{number}</span><span className={`whitespace-nowrap text-sm font-semibold ${active ? 'text-maroon' : 'text-slate-500'}`}>{label}</span><span className="ml-1 h-px flex-1 bg-stone-200 last:hidden" /></li>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
