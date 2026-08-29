
import React, { useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, BriefcaseBusinessIcon, ContactIcon, MailIcon, PhoneIcon, SaveIcon, UserRoundIcon, UsersRoundIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type InputFieldProps = {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
};

function InputField({ label, value, required, type = 'text', icon: Icon }: InputFieldProps) {
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

export function FamilyInformationForm() {
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
          <InputField label="Full Name" required value="Sunil Perera" icon={UserRoundIcon} />
          <InputField label="NIC Number" value="197812345678" icon={ContactIcon} />
          <InputField label="Occupation" value="Government Service" icon={BriefcaseBusinessIcon} />
          <InputField label="Mobile Number" required value="+94 71 456 7890" type="tel" icon={PhoneIcon} />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="mb-3 flex items-center gap-2 text-xs font-bold text-maroon">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-maroon/10"><UsersRoundIcon className="h-3.5 w-3.5" /></span>
            Mother / Guardian Details
          </legend>
          <InputField label="Full Name" required value="Chamari Perera" icon={UserRoundIcon} />
          <InputField label="NIC Number" value="198012345678" icon={ContactIcon} />
          <InputField label="Occupation" value="Teacher" icon={BriefcaseBusinessIcon} />
          <InputField label="Email Address" value="family.perera@example.com" type="email" icon={MailIcon} />
        </fieldset>
      </form>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/profile')} className="flex w-28 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-600 transition hover:border-maroon hover:text-maroon focus:outline-none focus:ring-2 focus:ring-maroon/20">
            <ArrowLeftIcon className="h-4 w-4" />
            Previous
          </button>
          <button type="button" onClick={saveDraft} disabled={saving} className="flex w-32 items-center justify-center gap-2 rounded-md border border-maroon bg-white py-2 text-xs font-bold text-maroon transition hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-70">
            <SaveIcon className="h-4 w-4" />
            {saving ? 'Saved' : 'Save Draft'}
          </button>
        </div>
        <button type="button" onClick={() => navigate('/profile/emergency-contact')} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}