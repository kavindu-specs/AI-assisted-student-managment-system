import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, ArrowLeftIcon, CheckCircle2Icon, EyeIcon, FileCheck2Icon, ImageIcon, PenLineIcon, ShieldCheckIcon, XCircleIcon } from 'lucide-react';
import { api, ApiError } from '../lib/apiClient';

// NOTE ON API COVERAGE: server/docs/API.md has no endpoint that lists a
// student's documents/photo/signature for an admin (only the student's own
// GET /students/me/profile includes that, and that route requires a student
// token). The only admin-facing routes are by-ID: GET .../:id/file (view)
// and PATCH /admin/documents/:documentId/verify (verify/reject documents
// only - photos and signatures have no verification workflow in this
// schema). So this screen can't show "student X has documents [A, B, C]"
// automatically; the admin must already know the numeric ID (e.g. from an
// audit log, a support ticket, or asking the student) and look it up here.
// The student picker below is for context only - it does not filter or
// supply IDs.

type CurrentStatus = 'Prospective' | 'Registered' | 'Graduated' | 'Released';

type ApiStudent = {
  student_id: number;
  reg_number: string;
  full_name: string;
  current_status: CurrentStatus;
};

const docTypes = ['NIC Copy', 'Birth Certificate', 'Admission Letter', 'Medical Certificate', 'School Certificate', 'Other'];

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  // Give the new tab a moment to load the blob before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function DocumentUploadPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [studentsError, setStudentsError] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  const [documentId, setDocumentId] = useState('');
  const [docViewing, setDocViewing] = useState(false);
  const [docVerifying, setDocVerifying] = useState(false);
  const [docReason, setDocReason] = useState('');
  const [docError, setDocError] = useState('');
  const [docNotice, setDocNotice] = useState('');

  const [photoId, setPhotoId] = useState('');
  const [photoViewing, setPhotoViewing] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [signatureId, setSignatureId] = useState('');
  const [signatureViewing, setSignatureViewing] = useState(false);
  const [signatureError, setSignatureError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.get<ApiStudent[]>('/admin/students?status=Registered')
      .then((rows) => { if (!cancelled) setStudents(rows); })
      .catch((err) => { if (!cancelled) setStudentsError(err instanceof ApiError ? err.message : 'Failed to load students.'); });
    return () => { cancelled = true; };
  }, []);

  const viewDocument = async () => {
    if (!documentId) return;
    setDocError('');
    setDocViewing(true);
    try {
      const blob = await api.getFile(`/admin/documents/${documentId}/file`);
      openBlob(blob);
    } catch (err) {
      setDocError(err instanceof ApiError ? err.message : 'Failed to open document.');
    } finally {
      setDocViewing(false);
    }
  };

  const verifyDocument = async (isVerified: boolean) => {
    if (!documentId) return;
    setDocError('');
    setDocNotice('');
    setDocVerifying(true);
    try {
      await api.patch(`/admin/documents/${documentId}/verify`, isVerified ? { isVerified: true } : { isVerified: false, reason: docReason || undefined });
      setDocNotice(`Document #${documentId} marked ${isVerified ? 'verified' : 'rejected'}.`);
    } catch (err) {
      setDocError(err instanceof ApiError ? err.message : 'Failed to update document verification.');
    } finally {
      setDocVerifying(false);
    }
  };

  const viewPhoto = async () => {
    if (!photoId) return;
    setPhotoError('');
    setPhotoViewing(true);
    try {
      const blob = await api.getFile(`/admin/photos/${photoId}/file`);
      openBlob(blob);
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : 'Failed to open photo.');
    } finally {
      setPhotoViewing(false);
    }
  };

  const viewSignature = async () => {
    if (!signatureId) return;
    setSignatureError('');
    setSignatureViewing(true);
    try {
      const blob = await api.getFile(`/admin/signatures/${signatureId}/file`);
      openBlob(blob);
    } catch (err) {
      setSignatureError(err instanceof ApiError ? err.message : 'Failed to open signature.');
    } finally {
      setSignatureViewing(false);
    }
  };

  return <main className="h-screen h-[100dvh] overflow-y-auto bg-[#f7f6f4] px-4 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-5xl pb-8">
    <button onClick={() => navigate('/account-creation')} className="mb-6 flex items-center gap-2 text-sm font-semibold text-maroon"><ArrowLeftIcon className="h-4 w-4" /> Back to account creation</button>
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7">
      <p className="text-xs font-bold uppercase tracking-widest text-maroon">Step 8 of 9</p>
      <h1 className="mt-2 text-2xl font-extrabold text-maroon">Student document review</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate-600">View and verify documents submitted by students. Students upload their own documents, photo, and signature through the student portal.</p>

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" /> There is no endpoint that lists a student&apos;s documents/photo/signature for admins - only a lookup by numeric ID exists (<code className="mx-1 rounded bg-blue-100 px-1">GET /admin/documents/:id/file</code>, <code className="mx-1 rounded bg-blue-100 px-1">/admin/photos/:id/file</code>, <code className="mx-1 rounded bg-blue-100 px-1">/admin/signatures/:id/file</code>). The student picker below is for reference only; enter the ID you already have to view or verify a file.</div>

      {studentsError && <p role="alert" className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{studentsError}</p>}

      <div className="mt-6">
        <label className="block text-sm font-bold text-slate-800">Student (reference only)
          <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)} className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 p-3 text-sm font-normal outline-none focus:border-maroon focus:bg-white">
            <option value="">Select a registered student…</option>
            {students.map((student) => <option key={student.student_id} value={student.student_id}>{student.reg_number} — {student.full_name}</option>)}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-lg border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-maroon"><FileCheck2Icon className="h-5 w-5" /><h2 className="font-bold">Supporting document</h2></div>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Document ID
            <input type="number" min={1} value={documentId} onChange={(event) => setDocumentId(event.target.value)} placeholder="e.g. 42" className="mt-1.5 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-maroon focus:bg-white" />
          </label>
          <p className="mt-1 text-[11px] text-slate-500">One of: {docTypes.join(', ')}</p>
          <button type="button" disabled={!documentId || docViewing} onClick={viewDocument} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-maroon px-3 py-2 text-xs font-bold text-maroon hover:bg-maroon/5 disabled:cursor-not-allowed disabled:opacity-50"><EyeIcon className="h-3.5 w-3.5" /> {docViewing ? 'Opening…' : 'View file'}</button>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Rejection reason (optional)
            <input value={docReason} onChange={(event) => setDocReason(event.target.value)} placeholder="Blurry scan, please re-upload" className="mt-1.5 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-maroon focus:bg-white" />
          </label>
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={!documentId || docVerifying} onClick={() => verifyDocument(true)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"><CheckCircle2Icon className="h-3.5 w-3.5" /> Verify</button>
            <button type="button" disabled={!documentId || docVerifying} onClick={() => verifyDocument(false)} className="flex flex-1 items-center justify-center gap-1 rounded-md border border-rose-400 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"><XCircleIcon className="h-3.5 w-3.5" /> Reject</button>
          </div>
          {docError && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{docError}</p>}
          {docNotice && <p role="status" className="mt-2 text-xs font-medium text-emerald-700">{docNotice}</p>}
        </article>

        <article className="rounded-lg border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-maroon"><ImageIcon className="h-5 w-5" /><h2 className="font-bold">Profile photo</h2></div>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Photo ID
            <input type="number" min={1} value={photoId} onChange={(event) => setPhotoId(event.target.value)} placeholder="e.g. 12" className="mt-1.5 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-maroon focus:bg-white" />
          </label>
          <p className="mt-1 text-[11px] text-slate-500">View only — photos have no verification workflow in this schema.</p>
          <button type="button" disabled={!photoId || photoViewing} onClick={viewPhoto} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-maroon px-3 py-2 text-xs font-bold text-maroon hover:bg-maroon/5 disabled:cursor-not-allowed disabled:opacity-50"><EyeIcon className="h-3.5 w-3.5" /> {photoViewing ? 'Opening…' : 'View photo'}</button>
          {photoError && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{photoError}</p>}
        </article>

        <article className="rounded-lg border border-stone-200 p-4">
          <div className="flex items-center gap-2 text-maroon"><PenLineIcon className="h-5 w-5" /><h2 className="font-bold">Signature</h2></div>
          <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-slate-500">Signature ID
            <input type="number" min={1} value={signatureId} onChange={(event) => setSignatureId(event.target.value)} placeholder="e.g. 12" className="mt-1.5 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-maroon focus:bg-white" />
          </label>
          <p className="mt-1 text-[11px] text-slate-500">View only — signatures have no verification workflow in this schema.</p>
          <button type="button" disabled={!signatureId || signatureViewing} onClick={viewSignature} className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border border-maroon px-3 py-2 text-xs font-bold text-maroon hover:bg-maroon/5 disabled:cursor-not-allowed disabled:opacity-50"><EyeIcon className="h-3.5 w-3.5" /> {signatureViewing ? 'Opening…' : 'View signature'}</button>
          {signatureError && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{signatureError}</p>}
        </article>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-stone-200 bg-stone-50 p-4 text-xs text-slate-600"><ShieldCheckIcon className="h-4 w-4 shrink-0 text-emerald-600" /> Verifying or rejecting a document writes an audit log entry (DOCUMENT_VERIFIED / DOCUMENT_REJECTED); a rejection reason is stored only in the audit log, not on the document record.</div>

      <div className="mt-6 flex justify-end border-t border-stone-200 pt-5"><button onClick={() => navigate('/semester-registration')} className="flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white hover:bg-maroon-light"><CheckCircle2Icon className="h-4 w-4" /> Continue to semester registration</button></div>
    </section></div></main>;
}
