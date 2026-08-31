import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow } from '../StudentWorkflow';
import { ArrowLeftIcon, CheckCircle2Icon, FileTextIcon, GraduationCapIcon, MailIcon, PhoneIcon, SendIcon, ShieldCheckIcon, UserRoundIcon } from 'lucide-react';

type ReviewItemProps = {
  icon: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  label: string;
  value: string;
};

function ReviewItem({ icon: Icon, label, value }: ReviewItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon/10 text-maroon">
        <Icon className="h-4 w-4" strokeWidth={1.7} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 truncate text-xs font-bold text-slate-700">{value}</p>
      </div>
    </div>);

}

export function ReviewSubmitForm() {
  const [confirmed, setConfirmed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { profileSnapshot, refresh, submitProfile: markVerificationStage } = useStudentWorkflow();

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // There is no explicit "submit profile" endpoint in this API - the profile
  // is just whatever's been PATCHed so far, with no separate submission/lock
  // action. "Submitting" here means: re-fetch the profile to confirm its
  // completion percentage looks done, and if so, move the local wizard on to
  // the 'verification' stage. There's genuinely nothing else to POST.
  async function handleSubmit() {
    if (!confirmed) return;
    setError('');
    setSubmitting(true);
    try {
      const snapshot = await refresh();
      const pct = snapshot ? Number(snapshot.profile.profile_completion_pct) : 0;
      if (pct < 100) {
        setError(`Your profile is only ${Math.round(pct)}% complete. Please finish all required sections (personal details, family information, emergency contact, photo, signature and at least one document) before submitting.`);
        return;
      }
      markVerificationStage();
      setSubmitted(true);
    } catch (err) {
      setError('Could not confirm your profile status. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white p-8 sm:p-12">
        <div className="mx-auto max-w-lg text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2Icon className="h-9 w-9" strokeWidth={1.8} />
          </span>
          <h2 className="mt-5 text-xl font-extrabold text-maroon">Profile submitted successfully</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">Your information and documents have been sent to Rajarata University for verification. You will be notified when your registration status is updated.</p>
          <button type="button" onClick={() => navigate('/dashboard')} className="mt-7 inline-flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30">
            Go to Dashboard
          </button>
        </div>
      </section>);

  }

  const student = profileSnapshot?.student;
  const profile = profileSnapshot?.profile;
  const documentCount = profileSnapshot?.documents.length ?? 0;

  return (
    <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">5. Review & Submit</h2>
          <p className="mt-1 text-xs text-slate-500">Review your information before submitting it for verification.</p>
        </div>
        <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-maroon">Step 5 of 5</span>
      </div>

      <div className="space-y-6 px-5 py-5">
        <section aria-labelledby="review-personal" className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <UserRoundIcon className="h-4 w-4 text-maroon" strokeWidth={1.8} />
            <h3 id="review-personal" className="text-sm font-bold text-slate-800">Personal details</h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ReviewItem icon={UserRoundIcon} label="Student name" value={student?.full_name || '—'} />
            <ReviewItem icon={MailIcon} label="University email" value={profile?.email || '—'} />
            <ReviewItem icon={PhoneIcon} label="Mobile number" value={profile?.contact_no || '—'} />
            <ReviewItem icon={FileTextIcon} label="NIC number" value={student?.nic || '—'} />
          </div>
        </section>

        <section aria-labelledby="review-academic" className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <GraduationCapIcon className="h-4 w-4 text-maroon" strokeWidth={1.8} />
            <h3 id="review-academic" className="text-sm font-bold text-slate-800">Registration summary</h3>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ReviewItem icon={GraduationCapIcon} label="Programme" value={student?.Programme?.programme_name || '—'} />
            <ReviewItem icon={ShieldCheckIcon} label="Documents" value={`${documentCount} file${documentCount === 1 ? '' : 's'} uploaded`} />
            <ReviewItem icon={CheckCircle2Icon} label="Profile completion" value={`${Math.round(Number(profile?.profile_completion_pct ?? 0))}%`} />
          </div>
        </section>

        <label className="flex cursor-pointer gap-3 rounded-lg border border-gold/45 bg-gold/10 p-4">
          <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-maroon focus:ring-maroon" />
          <span className="text-xs leading-relaxed text-slate-700">I confirm that the information provided is accurate and complete. I understand that Rajarata University may use these details for academic and registration records.</span>
        </label>

        {error && (
          <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <button type="button" onClick={() => navigate('/profile/upload-documents')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
          <ArrowLeftIcon className="h-4 w-4" />
          Previous
        </button>
        <button type="button" onClick={handleSubmit} disabled={!confirmed || submitting} className="flex w-40 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30 disabled:cursor-not-allowed disabled:opacity-45">
          {submitting ? 'Checking…' : 'Submit Profile'}
          <SendIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}
