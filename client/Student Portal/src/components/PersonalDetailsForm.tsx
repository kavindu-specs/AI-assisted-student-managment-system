import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, ChevronDownIcon, DropletsIcon, MailIcon, SaveIcon, UserRoundIcon, UsersRoundIcon, ArrowRightIcon, ContactIcon, PhoneIcon } from 'lucide-react';

type FormFieldProps = {
  label: string;
  required?: boolean;
  value: string;
  icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;
  type?: string;
};

function FormField({ label, required, value, icon: Icon, type = 'text' }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">{label}{required && <span className="ml-0.5 text-maroon">*</span>}</span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />}
        <input type={type} defaultValue={value} className={`h-9 w-full rounded-md border border-slate-200 bg-white ${Icon ? 'pl-9' : 'px-3'} pr-3 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10`} />
      </span>
    </label>);

}

type SelectFieldProps = {label: string;required?: boolean;value: string;icon?: React.ComponentType<{className?: string;strokeWidth?: number;}>;};
function SelectField({ label, required, value, icon: Icon }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-slate-600">{label}{required && <span className="ml-0.5 text-maroon">*</span>}</span>
      <span className="relative block">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" strokeWidth={1.7} />}
        <select defaultValue={value} className={`h-9 w-full appearance-none rounded-md border border-slate-200 bg-white ${Icon ? 'pl-9' : 'px-3'} pr-8 text-xs font-medium text-slate-700 outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/10`}>
          <option>{value}</option>
          <option>Not specified</option>
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
      </span>
    </label>);

}

export function PersonalDetailsForm() {
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
          <h2 className="text-base font-bold text-slate-800">1. Personal Details</h2>
          <p className="mt-1 text-xs text-slate-500">Provide your basic personal information.</p>
        </div>
        <span className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">Step 1 of 5</span>
      </div>

      <form className="grid grid-cols-1 gap-x-8 gap-y-3 px-5 py-4 lg:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
        <div className="space-y-3">
          <FormField label="Full Name (as in NIC)" required value="Nimesh Perera" icon={UserRoundIcon} />
          <FormField label="Date of Birth" required value="2003-06-14" icon={CalendarDaysIcon} />
          <SelectField label="Gender" required value="Male" />
          <FormField label="NIC Number" required value="200312345678" icon={ContactIcon} />
          <SelectField label="Blood Group (Optional)" value="Select blood group" icon={DropletsIcon} />
        </div>
        <div className="space-y-3">
          <FormField label="Preferred Name" value="Nimesh" icon={UserRoundIcon} />
          <FormField label="Email Address" required value="nimesh.perera@example.com" icon={MailIcon} type="email" />
          <FormField label="Mobile Number" required value="+94 77 123 4567" icon={PhoneIcon} type="tel" />
          <SelectField label="Marital Status" value="Single" icon={UsersRoundIcon} />
        </div>
      </form>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
        <button type="button" onClick={saveDraft} disabled={saving} className="flex w-36 items-center justify-center gap-2 rounded-md border border-maroon bg-white py-2 text-xs font-bold text-maroon transition hover:bg-maroon/5 focus:outline-none focus:ring-2 focus:ring-maroon/20 disabled:opacity-70">
          <SaveIcon className="h-4 w-4" />
          {saving ? 'Saved' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => navigate('/profile/family')} className="flex w-36 items-center justify-center gap-2 rounded-md bg-maroon py-2 text-xs font-bold text-white shadow-sm transition hover:bg-maroon-deep focus:outline-none focus:ring-2 focus:ring-maroon/30">
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </section>);

}