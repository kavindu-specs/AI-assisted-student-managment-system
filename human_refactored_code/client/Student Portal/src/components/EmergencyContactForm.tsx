import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ContactIcon, HomeIcon, MailIcon, PhoneIcon, SaveIcon, UserRoundIcon, UsersRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow } from '../StudentWorkflow';
import { api, ApiError } from '../lib/apiClient';
import { formatKeyValueBlock, parseKeyValueBlock } from '../lib/profileText';

type ContactFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
};

function ContactField({ label, value, onChange, required, type = 'text', icon: Icon }: ContactFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">
        {label}{required && <span className="ml-0.5 text-maroon">*</span>}
      </span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />}
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`h-9 w-full rounded-md border border-slate-200 bg-white ${Icon ? 'pl-9' : 'px-3'} pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10`} />
      </span>
    </label>);

}

function RelationshipField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">Relationship to Student<span className="ml-0.5 text-maroon">*</span></span>
      <span className="relative block">
        <UsersRoundIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />
        <select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10">
          <option>Father</option>
          <option>Mother</option>
          <option>Guardian</option>
          <option>Sibling</option>
          <option>Other</option>
        </select>
      </span>
    </label>);

}

// The schema has one `emergency_contact` VARCHAR(150) column and a separate
// dedicated `address` column. Home Address maps to the real `address` field;
// everything else about the emergency contact person is compiled into
// `emergency_contact` as "Label: value" lines (see lib/profileText.ts).
const NAME_LABEL = 'Name';
const RELATIONSHIP_LABEL = 'Relationship';
const PRIMARY_MOBILE_LABEL = 'Primary Mobile';
const ALT_MOBILE_LABEL = 'Alternate Mobile';
const EMAIL_LABEL = 'Email';

export function EmergencyContactForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { profileSnapshot, refresh } = useStudentWorkflow();

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Father');
  const [primaryMobile, setPrimaryMobile] = useState('');
  const [altMobile, setAltMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!profileSnapshot || initialized) return;
    const parsed = parseKeyValueBlock(profileSnapshot.profile.emergency_contact);
    setName(parsed[NAME_LABEL] ?? '');
    setRelationship(parsed[RELATIONSHIP_LABEL] || 'Father');
    setPrimaryMobile(parsed[PRIMARY_MOBILE_LABEL] ?? '');
    setAltMobile(parsed[ALT_MOBILE_LABEL] ?? '');
    setEmail(parsed[EMAIL_LABEL] ?? '');
    setAddress(profileSnapshot.profile.address ?? '');
    setInitialized(true);
  }, [profileSnapshot, initialized]);

  async function save(andContinue: boolean) {
    setError('');
    setSaving(true);
    try {
      // emergency_contact has a 150-char limit server-side - keep the block short.
      const emergencyContact = formatKeyValueBlock([
        [NAME_LABEL, name],
        [RELATIONSHIP_LABEL, relationship],
        [PRIMARY_MOBILE_LABEL, primaryMobile],
        [ALT_MOBILE_LABEL, altMobile],
        [EMAIL_LABEL, email],
      ]);
      await api.patch('/students/me/profile', {
        emergency_contact: emergencyContact || undefined,
        address: address || undefined,
      });
      await refresh();
      if (andContinue) navigate('/profile/upload-documents');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your emergency contact. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">3. Emergency Contact</h2>
          <p className="mt-1 text-xs text-slate-500">Add the person we should contact in an emergency.</p>
        </div>
        <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-maroon">Step 3 of 5</span>
      </div>

      <form className="grid grid-cols-1 gap-x-8 gap-y-4 px-5 py-4 lg:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="space-y-3">
          <legend className="mb-3 flex items-center gap-2 text-xs font-bold text-maroon">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10"><ContactIcon className="h-3.5 w-3.5" /></span>
            Primary Contact Details
          </legend>
          <ContactField label="Full Name" required value={name} onChange={setName} icon={UserRoundIcon} />
          <RelationshipField value={relationship} onChange={setRelationship} />
          <ContactField label="Primary Mobile Number" required value={primaryMobile} onChange={setPrimaryMobile} type="tel" icon={PhoneIcon} />
          <ContactField label="Alternate Mobile Number" value={altMobile} onChange={setAltMobile} type="tel" icon={PhoneIcon} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 flex items-center gap-2 text-xs font-bold text-maroon">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10"><HomeIcon className="h-3.5 w-3.5" /></span>
            Contact Location
          </legend>
          <ContactField label="Email Address" value={email} onChange={setEmail} type="email" icon={MailIcon} />
          <ContactField label="Home Address" required value={address} onChange={setAddress} icon={HomeIcon} />
          <div className="rounded-md border border-gold/40 bg-gold/10 px-3 py-3 text-xs leading-relaxed text-slate-600">
            <span className="font-bold text-maroon">Important:</span> Please ensure this person can be reached quickly in an urgent situation.
          </div>
        </fieldset>
      </form>

      {error && (
        <p role="alert" className="mx-5 mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile/family')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <button type="button" onClick={() => save(false)} disabled={saving} className="flex w-32 items-center justify-center gap-2 rounded-md border border-maroon bg-white py-2 text-xs font-bold text-maroon transition hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-70">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
        </div>
        <button type="button" onClick={() => save(true)} disabled={saving} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30 disabled:opacity-70">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}
