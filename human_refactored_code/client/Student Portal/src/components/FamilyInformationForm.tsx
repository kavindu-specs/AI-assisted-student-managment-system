import React, { useEffect, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseBusinessIcon, ContactIcon, MailIcon, PhoneIcon, SaveIcon, UserRoundIcon, UsersRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudentWorkflow } from '../StudentWorkflow';
import { api, ApiError } from '../lib/apiClient';
import { formatKeyValueBlock, parseKeyValueBlock } from '../lib/profileText';

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
};

function InputField({ label, value, onChange, required, type = 'text', icon: Icon }: InputFieldProps) {
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

// The schema has one flat `family_info` TEXT column - there's no per-relative
// table. Father/Guardian and Mother/Guardian details are compiled into one
// "Label: value" block (see lib/profileText.ts) and parsed back out on load.
type FieldKey = 'fatherName' | 'fatherNic' | 'fatherOccupation' | 'fatherMobile' | 'motherName' | 'motherNic' | 'motherOccupation' | 'motherEmail';

const FIELD_LABELS: Record<FieldKey, string> = {
  fatherName: 'Father/Guardian Name',
  fatherNic: 'Father/Guardian NIC',
  fatherOccupation: 'Father/Guardian Occupation',
  fatherMobile: 'Father/Guardian Mobile',
  motherName: 'Mother/Guardian Name',
  motherNic: 'Mother/Guardian NIC',
  motherOccupation: 'Mother/Guardian Occupation',
  motherEmail: 'Mother/Guardian Email',
};

export function FamilyInformationForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { profileSnapshot, refresh } = useStudentWorkflow();

  const [fields, setFields] = useState<Record<FieldKey, string>>({
    fatherName: '', fatherNic: '', fatherOccupation: '', fatherMobile: '',
    motherName: '', motherNic: '', motherOccupation: '', motherEmail: '',
  });

  function setField(key: FieldKey, value: string) {
    setFields((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!profileSnapshot || initialized) return;
    const parsed = parseKeyValueBlock(profileSnapshot.profile.family_info);
    setFields({
      fatherName: parsed[FIELD_LABELS.fatherName] ?? '',
      fatherNic: parsed[FIELD_LABELS.fatherNic] ?? '',
      fatherOccupation: parsed[FIELD_LABELS.fatherOccupation] ?? '',
      fatherMobile: parsed[FIELD_LABELS.fatherMobile] ?? '',
      motherName: parsed[FIELD_LABELS.motherName] ?? '',
      motherNic: parsed[FIELD_LABELS.motherNic] ?? '',
      motherOccupation: parsed[FIELD_LABELS.motherOccupation] ?? '',
      motherEmail: parsed[FIELD_LABELS.motherEmail] ?? '',
    });
    setInitialized(true);
  }, [profileSnapshot, initialized]);

  async function save(andContinue: boolean) {
    setError('');
    setSaving(true);
    try {
      const familyInfo = formatKeyValueBlock(
        (Object.keys(fields) as FieldKey[]).map((key) => [FIELD_LABELS[key], fields[key]]),
      );
      await api.patch('/students/me/profile', { family_info: familyInfo || undefined });
      await refresh();
      if (andContinue) navigate('/profile/emergency-contact');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save family information. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">2. Family Information</h2>
          <p className="mt-1 text-xs text-slate-500">Provide contact details for your parent or guardian.</p>
        </div>
        <span className="rounded bg-gold/15 px-2.5 py-1 text-[11px] font-bold text-maroon">Step 2 of 5</span>
      </div>

      <form className="grid grid-cols-1 gap-x-8 gap-y-4 px-5 py-4 lg:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <fieldset className="space-y-3">
          <legend className="mb-3 flex items-center gap-2 text-xs font-bold text-maroon">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10"><UserRoundIcon className="h-3.5 w-3.5" /></span>
            Father / Guardian Details
          </legend>
          <InputField label="Full Name" required value={fields.fatherName} onChange={(v) => setField('fatherName', v)} icon={UserRoundIcon} />
          <InputField label="NIC Number" value={fields.fatherNic} onChange={(v) => setField('fatherNic', v)} icon={ContactIcon} />
          <InputField label="Occupation" value={fields.fatherOccupation} onChange={(v) => setField('fatherOccupation', v)} icon={BriefcaseBusinessIcon} />
          <InputField label="Mobile Number" required value={fields.fatherMobile} onChange={(v) => setField('fatherMobile', v)} type="tel" icon={PhoneIcon} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 flex items-center gap-2 text-xs font-bold text-maroon">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10"><UsersRoundIcon className="h-3.5 w-3.5" /></span>
            Mother / Guardian Details
          </legend>
          <InputField label="Full Name" required value={fields.motherName} onChange={(v) => setField('motherName', v)} icon={UserRoundIcon} />
          <InputField label="NIC Number" value={fields.motherNic} onChange={(v) => setField('motherNic', v)} icon={ContactIcon} />
          <InputField label="Occupation" value={fields.motherOccupation} onChange={(v) => setField('motherOccupation', v)} icon={BriefcaseBusinessIcon} />
          <InputField label="Email Address" value={fields.motherEmail} onChange={(v) => setField('motherEmail', v)} type="email" icon={MailIcon} />
        </fieldset>
      </form>

      {error && (
        <p role="alert" className="mx-5 mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
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
