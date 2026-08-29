
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, ContactIcon, HomeIcon, MailIcon, PhoneIcon, SaveIcon, UserRoundIcon, UsersRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ContactFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
};

function ContactField({ label, value, required, type = 'text', icon: Icon }: ContactFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">
        {label}{required && <span className="ml-0.5 text-maroon">*</span>}
      </span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />}
        <input type={type} defaultValue={value} className={`h-9 w-full rounded-md border border-slate-200 bg-white ${Icon ? 'pl-9' : 'px-3'} pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10`} />
      </span>
    </label>);

}

function RelationshipField() {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">Relationship to Student<span className="ml-0.5 text-maroon">*</span></span>
      <span className="relative block">
        <UsersRoundIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />
        <select defaultValue="Father" className="h-9 w-full appearance-none rounded-md border border-slate-200 bg-white pl-9 pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10">
          <option>Father</option>
          <option>Mother</option>
          <option>Guardian</option>
          <option>Sibling</option>
          <option>Other</option>
        </select>
      </span>
    </label>);

}

export function EmergencyContactForm() {
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
          <ContactField label="Full Name" required value="Sunil Perera" icon={UserRoundIcon} />
          <RelationshipField />
          <ContactField label="Primary Mobile Number" required value="+94 71 456 7890" type="tel" icon={PhoneIcon} />
          <ContactField label="Alternate Mobile Number" value="+94 77 889 1200" type="tel" icon={PhoneIcon} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 flex items-center gap-2 text-xs font-bold text-maroon">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10"><HomeIcon className="h-3.5 w-3.5" /></span>
            Contact Location
          </legend>
          <ContactField label="Email Address" value="sunil.perera@example.com" type="email" icon={MailIcon} />
          <ContactField label="Home Address" required value="No. 42, Temple Road, Anuradhapura" icon={HomeIcon} />
          <div className="rounded-md border border-gold/40 bg-gold/10 px-3 py-3 text-xs leading-relaxed text-slate-600">
            <span className="font-bold text-maroon">Important:</span> Please ensure this person can be reached quickly in an urgent situation.
          </div>
        </fieldset>
      </form>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile/family')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <button type="button" onClick={saveDraft} disabled={saving} className="flex w-32 items-center justify-center gap-2 rounded-md border border-maroon bg-white py-2 text-xs font-bold text-maroon transition hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-70">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saved' : 'Save Draft'}
          </button>
        </div>
        <button type="button" onClick={() => navigate('/profile/upload-documents')} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}