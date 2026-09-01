import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, ChevronDownIcon, DropletsIcon, MailIcon, SaveIcon, UserRoundIcon, ArrowRightIcon, ContactIcon, PhoneIcon } from 'lucide-react';
import { useStudentWorkflow } from '../StudentWorkflow';
import { api, ApiError } from '../lib/apiClient';
import { formatKeyValueBlock, parseKeyValueBlock } from '../lib/profileText';

type FormFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  type?: string;
};

function FormField({ label, required, value, onChange, disabled, icon: Icon, type = 'text' }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">{label}{required && <span className="ml-0.5 text-maroon">*</span>}</span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />}
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(event.target.value)}
          className={`h-9 w-full rounded-md border border-slate-200 bg-white ${Icon ? 'pl-9' : 'px-3'} pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500`} />
      </span>
    </label>);

}

type SelectFieldProps = {label: string;required?: boolean;value: string;onChange: (value: string) => void;options: string[];icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;};
function SelectField({ label, required, value, onChange, options, icon: Icon }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">{label}{required && <span className="ml-0.5 text-maroon">*</span>}</span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />}
        <select value={value} onChange={(event) => onChange(event.target.value)} className={`h-9 w-full appearance-none rounded-md border border-slate-200 bg-white ${Icon ? 'pl-9' : 'px-3'} pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10`}>
          <option value="">Not specified</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
      </span>
    </label>);

}

export function PersonalDetailsForm() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();
  const { profileSnapshot, refresh } = useStudentWorkflow();

  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  // No dedicated columns exist for these three - they're folded into the
  // free-text `other_details` column (see lib/profileText.ts).
  const [preferredName, setPreferredName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');

  useEffect(() => {
    if (!profileSnapshot || initialized) return;
    setDateOfBirth(profileSnapshot.profile.date_of_birth ?? '');
    setGender(profileSnapshot.profile.gender ?? '');
    setEmail(profileSnapshot.profile.email ?? '');
    setContactNo(profileSnapshot.profile.contact_no ?? '');
    const other = parseKeyValueBlock(profileSnapshot.profile.other_details);
    setPreferredName(other['Preferred Name'] ?? '');
    setBloodGroup(other['Blood Group'] ?? '');
    setMaritalStatus(other['Marital Status'] ?? '');
    setInitialized(true);
  }, [profileSnapshot, initialized]);

  async function save(andContinue: boolean) {
    setError('');
    setSaving(true);
    try {
      const otherDetails = formatKeyValueBlock([
        ['Preferred Name', preferredName],
        ['Blood Group', bloodGroup],
        ['Marital Status', maritalStatus],
      ]);
      await api.patch('/students/me/profile', {
        date_of_birth: dateOfBirth || undefined,
        gender: gender || undefined,
        email: email || undefined,
        contact_no: contactNo || undefined,
        other_details: otherDetails || undefined,
      });
      await refresh();
      if (andContinue) navigate('/profile/family');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save your details. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const student = profileSnapshot?.student;

  return (
    <section className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">1. Personal Details</h2>
          <p className="mt-1 text-xs text-slate-500">Provide your basic personal information.</p>
        </div>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Step 1 of 5</span>
      </div>

      <form className="grid grid-cols-1 gap-x-8 gap-y-3 px-5 py-4 lg:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <div className="space-y-3">
          <FormField label="Full Name (as in NIC)" value={student?.full_name ?? ''} disabled icon={UserRoundIcon} />
          <FormField label="Date of Birth" required value={dateOfBirth} onChange={setDateOfBirth} icon={CalendarDaysIcon} type="date" />
          <SelectField label="Gender" required value={gender} onChange={setGender} options={['Male', 'Female', 'Other']} />
          <FormField label="NIC Number" value={student?.nic ?? ''} disabled icon={ContactIcon} />
          <FormField label="Blood Group (Optional)" value={bloodGroup} onChange={setBloodGroup} icon={DropletsIcon} />
        </div>
        <div className="space-y-3">
          <FormField label="Preferred Name" value={preferredName} onChange={setPreferredName} icon={UserRoundIcon} />
          <FormField label="Email Address" required value={email} onChange={setEmail} icon={MailIcon} type="email" />
          <FormField label="Mobile Number" required value={contactNo} onChange={setContactNo} icon={PhoneIcon} type="tel" />
          <FormField label="Marital Status" value={maritalStatus} onChange={setMaritalStatus} icon={UserRoundIcon} />
        </div>
      </form>

      {error && (
        <p role="alert" className="mx-5 mb-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <button type="button" onClick={() => save(false)} disabled={saving} className="flex w-36 items-center justify-center gap-2 rounded-md border border-maroon bg-white py-2 text-xs font-bold text-maroon transition hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-70">
          <SaveIcon className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => save(true)} disabled={saving} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30 disabled:opacity-70">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}
