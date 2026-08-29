

import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, FileBadgeIcon, FileTextIcon, ImageIcon, InfoIcon, RefreshCwIcon, SaveIcon, ShieldCheckIcon, SignatureIcon, Trash2Icon, UploadCloudIcon, UserRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type DocumentKind = 'photo' | 'nic' | 'certificate' | 'signature' | 'letter';

type DocumentCardProps = {
  title: string;
  fileName: string;
  fileSize: string;
  kind: DocumentKind;
  required?: boolean;
};

const DOCUMENT_ICONS: Record<DocumentKind, React.ComponentType<{className?: string;strokeWidth?: number;}>> = {
  photo: UserRoundIcon,
  nic: FileBadgeIcon,
  certificate: FileTextIcon,
  signature: SignatureIcon,
  letter: FileTextIcon
};

function DocumentCard({ title, fileName, fileSize, kind, required = true }: DocumentCardProps) {
  const [uploaded, setUploaded] = useState(true);
  const Icon = DOCUMENT_ICONS[kind];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-maroon/8 text-maroon">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          <p className={`mt-1 text-[11px] font-semibold ${required ? 'text-red-500' : 'text-slate-400'}`}>{required ? 'Required' : 'Optional'}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 border-y border-slate-100 py-3">
        {kind === 'photo' ?
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-maroon text-sm font-bold text-gold">NP</span> :

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><FileTextIcon className="h-5 w-5" /></span>
        }
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-700">{uploaded ? fileName : 'No file selected'}</p>
          <p className="mt-1 text-[11px] text-slate-500">{uploaded ? fileSize : 'Choose a file to upload'}</p>
        </div>
        {uploaded && <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-500" />}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button type="button" onClick={() => setUploaded((value) => !value)} className="flex items-center gap-1.5 text-xs font-bold text-maroon transition hover:text-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/20">
          <RefreshCwIcon className="h-3.5 w-3.5" />
          {uploaded ? 'Replace File' : 'Choose File'}
        </button>
        {uploaded && <button type="button" onClick={() => setUploaded(false)} aria-label={`Remove ${title}`} className="text-red-500 transition hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-200"><Trash2Icon className="h-4 w-4" /></button>}
      </div>
    </article>);

}

function Dropzone() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500"><FileTextIcon className="h-5 w-5" /></span>
        <div>
          <h3 className="text-sm font-bold text-slate-800">Medical Certificate</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-400">Optional</p>
        </div>
      </div>
      <input ref={inputRef} type="file" className="sr-only" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? '')} />
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 flex h-[90px] w-full flex-col items-center justify-center rounded-md border border-dashed border-maroon/30 bg-maroon/[0.02] text-center transition hover:border-maroon hover:bg-maroon/[0.04] focus:outline-none focus:ring-2 focus:ring-maroon/20">
        <UploadCloudIcon className="h-6 w-6 text-maroon" strokeWidth={1.7} />
        <span className="mt-2 text-xs font-bold text-slate-700">{fileName || 'Drag & drop file here'}</span>
        <span className="mt-1 text-[11px] text-slate-500">or <span className="font-semibold text-maroon">browse files</span></span>
      </button>
    </article>);

}

export function UploadDocumentsForm() {
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  function saveDraft() {
    setSaving(true);
    window.setTimeout(() => setSaving(false), 900);
  }

  return (
    <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">4. Upload Required Documents</h2>
          <p className="mt-1 text-xs text-slate-500">Upload clear and valid copies of your required documents.</p>
        </div>
        <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-maroon">Step 4 of 5</span>
      </div>

      <div className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-2 xl:grid-cols-3">
        <DocumentCard title="1. Profile Photo" fileName="profile_photo.jpg" fileSize="124 KB" kind="photo" />
        <DocumentCard title="2. NIC Copy" fileName="nic_copy.pdf" fileSize="512 KB" kind="nic" />
        <DocumentCard title="3. Birth Certificate" fileName="birth_certificate.pdf" fileSize="342 KB" kind="certificate" />
        <DocumentCard title="4. Signature" fileName="signature.png" fileSize="98 KB" kind="signature" />
        <DocumentCard title="5. Admission Letter" fileName="admission_letter.pdf" fileSize="256 KB" kind="letter" />
        <Dropzone />
      </div>

      <div className="mx-5 mb-4 flex items-center gap-2 rounded-md border border-gold/45 bg-gold/10 px-3 py-2.5 text-xs text-slate-600">
        <InfoIcon className="h-4 w-4 shrink-0 text-maroon" />
        Accepted formats: .jpg, .jpeg, .png, .pdf <span className="mx-1 text-slate-300">|</span> Maximum file size: 5 MB per file
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile/emergency-contact')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <button type="button" onClick={saveDraft} disabled={saving} className="flex w-32 items-center justify-center gap-2 rounded-md border border-maroon bg-white py-2 text-xs font-bold text-maroon transition hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-70">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saved' : 'Save Draft'}
          </button>
        </div>
        <button type="button" onClick={() => navigate('/profile/review')} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}

export function DocumentGuidelines() {
  const guidelines = ['All documents must be clear and legible', 'Upload coloured copies', 'Ensure all information is visible', 'File size should not exceed 5 MB', 'Accepted formats: JPG, PNG, PDF'];
  return (
    <aside className="hidden w-[286px] shrink-0 space-y-4 2xl:block">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800">Upload Progress</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'conic-gradient(#F2C94C 0deg 288deg, #eef0f3 288deg 360deg)' }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">80%</div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500"><span className="font-bold text-slate-700">Almost there!</span><br />Upload all required documents to continue.</p>
        </div>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800">Document Guidelines</h2>
        <ul className="mt-4 space-y-3">
          {guidelines.map((guideline) => <li key={guideline} className="flex gap-2 text-xs text-slate-600"><CheckCircle2Icon className="h-4 w-4 shrink-0 text-emerald-500" />{guideline}</li>)}
        </ul>
      </section>
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex gap-3"><ShieldCheckIcon className="h-5 w-5 shrink-0 text-maroon" /><div><h2 className="text-sm font-bold text-slate-800">Important Note</h2><p className="mt-2 text-xs leading-relaxed text-slate-500">All uploaded documents will be verified by the university. You will be notified if any document needs to be re-uploaded.</p></div></div>
      </section>
    </aside>);

}