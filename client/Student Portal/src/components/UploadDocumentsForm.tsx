import React, { useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircle2Icon, ClockIcon, FileBadgeIcon, FileTextIcon, RefreshCwIcon, ShieldCheckIcon, SignatureIcon, UserRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow, ProfileSnapshot } from '../StudentWorkflow';
import { api, ApiError } from '../lib/apiClient';

type UploadTarget =
  | { kind: 'photo' }
  | { kind: 'signature' }
  | { kind: 'document'; docType: string };

type UploadCardProps = {
  title: string;
  required?: boolean;
  target: UploadTarget;
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  alreadyUploaded: boolean;
  verificationLabel?: string | null;
  onUploaded: () => void;
};

function uploadPath(target: UploadTarget) {
  if (target.kind === 'photo') return '/students/me/photo';
  if (target.kind === 'signature') return '/students/me/signature';
  return '/students/me/documents';
}

function UploadCard({ title, required = true, target, icon: Icon, alreadyUploaded, verificationLabel, onUploaded }: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      if (target.kind === 'document') form.append('docType', target.docType);
      await api.postForm(uploadPath(target), form);
      setFileName(file.name);
      onUploaded();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  const showUploaded = alreadyUploaded || Boolean(fileName);

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
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500"><FileTextIcon className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-slate-700">
            {uploading ? 'Uploading…' : showUploaded ? fileName || 'Uploaded' : 'No file selected'}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {verificationLabel && showUploaded ? verificationLabel : showUploaded ? 'On file' : 'Choose a file to upload'}
          </p>
        </div>
        {showUploaded && !uploading && <CheckCircle2Icon className="h-5 w-5 shrink-0 text-emerald-500" />}
      </div>

      {error && <p role="alert" className="mt-2 text-[11px] font-medium text-rose-600">{error}</p>}

      <div className="mt-3 flex items-center justify-between">
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) handleFile(file);
            event.target.value = '';
          }}
        />
        <button type="button" disabled={uploading} onClick={() => inputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-bold text-maroon transition hover:text-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-60">
          <RefreshCwIcon className="h-3.5 w-3.5" />
          {showUploaded ? 'Replace File' : 'Choose File'}
        </button>
      </div>
    </article>);

}

function findLatestDocument(documents: ProfileSnapshot['documents'], docType: string) {
  return documents
    .filter((doc) => doc.doc_type === docType)
    .sort((a, b) => b.document_id - a.document_id)[0];
}

function verificationLabelFor(doc: ProfileSnapshot['documents'][number] | undefined) {
  if (!doc) return null;
  return doc.is_verified ? 'Verified by university' : 'Pending verification';
}

export function UploadDocumentsForm() {
  const navigate = useNavigate();
  const { profileSnapshot, refresh } = useStudentWorkflow();
  const documents = profileSnapshot?.documents ?? [];

  const nicCopy = findLatestDocument(documents, 'NIC Copy');
  const birthCertificate = findLatestDocument(documents, 'Birth Certificate');
  const admissionLetter = findLatestDocument(documents, 'Admission Letter');
  const medicalCertificate = findLatestDocument(documents, 'Medical Certificate');

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
        <UploadCard
          title="1. Profile Photo"
          target={{ kind: 'photo' }}
          icon={UserRoundIcon}
          alreadyUploaded={Boolean(profileSnapshot?.photo)}
          onUploaded={refresh}
        />
        <UploadCard
          title="2. NIC Copy"
          target={{ kind: 'document', docType: 'NIC Copy' }}
          icon={FileBadgeIcon}
          alreadyUploaded={Boolean(nicCopy)}
          verificationLabel={verificationLabelFor(nicCopy)}
          onUploaded={refresh}
        />
        <UploadCard
          title="3. Birth Certificate"
          target={{ kind: 'document', docType: 'Birth Certificate' }}
          icon={FileTextIcon}
          alreadyUploaded={Boolean(birthCertificate)}
          verificationLabel={verificationLabelFor(birthCertificate)}
          onUploaded={refresh}
        />
        <UploadCard
          title="4. Signature"
          target={{ kind: 'signature' }}
          icon={SignatureIcon}
          alreadyUploaded={Boolean(profileSnapshot?.signature)}
          onUploaded={refresh}
        />
        <UploadCard
          title="5. Admission Letter"
          target={{ kind: 'document', docType: 'Admission Letter' }}
          icon={FileTextIcon}
          alreadyUploaded={Boolean(admissionLetter)}
          verificationLabel={verificationLabelFor(admissionLetter)}
          onUploaded={refresh}
        />
        <UploadCard
          title="Medical Certificate"
          required={false}
          target={{ kind: 'document', docType: 'Medical Certificate' }}
          icon={FileTextIcon}
          alreadyUploaded={Boolean(medicalCertificate)}
          verificationLabel={verificationLabelFor(medicalCertificate)}
          onUploaded={refresh}
        />
      </div>

      <div className="mx-5 mb-4 flex items-center gap-2 rounded-md border border-gold/45 bg-gold/10 px-3 py-2.5 text-xs text-slate-600">
        <ClockIcon className="h-4 w-4 shrink-0 text-maroon" />
        Accepted formats: .jpg, .jpeg, .png, .pdf <span className="mx-1 text-slate-300">|</span> Maximum file size: 5 MB per file
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <button type="button" onClick={() => navigate('/profile/emergency-contact')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
          <ArrowLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <button type="button" onClick={() => navigate('/profile/review')} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}

export function DocumentGuidelines() {
  const { profileSnapshot } = useStudentWorkflow();
  const pct = profileSnapshot ? Math.round(Number(profileSnapshot.profile.profile_completion_pct)) : 0;
  const arc = pct * 3.6;
  const guidelines = ['All documents must be clear and legible', 'Upload coloured copies', 'Ensure all information is visible', 'File size should not exceed 5 MB', 'Accepted formats: JPG, PNG, PDF'];
  return (
    <aside className="hidden w-[286px] shrink-0 space-y-4 2xl:block">
      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <h2 className="text-sm font-bold text-slate-800">Upload Progress</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(#F2C94C 0deg ${arc}deg, #eef0f3 ${arc}deg 360deg)` }}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700">{pct}%</div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500"><span className="font-bold text-slate-700">{pct >= 100 ? 'All set!' : 'Almost there!'}</span><br />Upload all required documents to continue.</p>
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
