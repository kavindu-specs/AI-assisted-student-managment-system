import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  BarChart3Icon,
  BellIcon,
  BookOpenIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClipboardListIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  MenuIcon,
  SaveIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  UsersIcon } from
'lucide-react';
import { LogoutButton } from '../components/LogoutButton';

type SettingsForm = {
  displayName: string;
  email: string;
  intake: string;
  academicYear: string;
  registrationPrefix: string;
  sessionTimeout: string;
  twoFactorRequired: boolean;
  emailNotifications: boolean;
  approvalReminders: boolean;
};

const initialSettings: SettingsForm = {
  displayName: 'Admin Perera',
  email: 'admin.perera@rjt.ac.lk',
  intake: 'July 2026 Intake',
  academicYear: '2026 / 2027',
  registrationPrefix: 'RUSL',
  sessionTimeout: '30 minutes',
  twoFactorRequired: true,
  emailNotifications: true,
  approvalReminders: true
};

const navigationItems = [
{ label: 'Dashboard', icon: LayoutDashboardIcon, to: '/dashboard' },
{ label: 'Students', icon: UsersIcon, to: '/students' },
{ label: 'Registrations', icon: ClipboardListIcon, to: '/import-students' },
{ label: 'Programmes', icon: BookOpenIcon, to: '/programmes' },
{ label: 'Reports', icon: BarChart3Icon, to: '/reports' },
{ label: 'Settings', icon: SettingsIcon, to: '/settings' }];


export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsForm>(initialSettings);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const updateSetting = <Key extends keyof SettingsForm,>(key: Key, value: SettingsForm[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice('');
  };

  const saveSettings = () => {
    setNotice('Settings saved successfully. Your registration workspace is up to date.');
  };

  const resetSettings = () => {
    setSettings(initialSettings);
    setNotice('Changes discarded. Default settings have been restored.');
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full overflow-hidden bg-[#f7f6f4] text-slate-900">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col bg-maroon-dark text-white transition-transform lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : ''}`}>
        <div className="h-1 bg-gold" />
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-6">
          <UniversityMark />
          <div><p className="text-xs font-extrabold uppercase tracking-[0.16em]">Rajarata</p><p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold">University · RMS</p></div>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-6" aria-label="Main navigation">
          {navigationItems.map(({ label, icon: Icon, to }) => {
            const isActive = label === 'Settings';
            return <Link key={label} to={to} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-white/15 text-white shadow-sm' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}><Icon className="h-4 w-4" aria-hidden="true" /><span>{label}</span>{isActive && <span className="ml-auto h-5 w-1 rounded-full bg-gold" />}</Link>;
          })}
        </nav>
        <div className="m-4 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">Admin Perera</p><p className="text-xs text-white/55">Registrar Office</p></div><LogoutButton /></div>
      </aside>
      {isSidebarOpen && <button type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" />}

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-20 shrink-0 items-center justify-between gap-4 border-b border-stone-200 bg-white px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <button type="button" onClick={() => setIsSidebarOpen(true)} aria-label="Open navigation" className="rounded-md p-2 text-slate-600 hover:bg-stone-100 lg:hidden"><MenuIcon className="h-5 w-5" /></button>
            <button type="button" onClick={() => navigate('/dashboard')} className="hidden items-center gap-2 border-r border-stone-200 pr-5 text-sm font-medium text-slate-600 hover:text-maroon sm:flex"><ArrowLeftIcon className="h-4 w-4" /> Dashboard</button>
            <div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-maroon sm:text-xl">System Settings</h1><p className="text-xs text-slate-500">Manage your account and registration workspace preferences</p></div>
          </div>
          <button type="button" onClick={saveSettings} className="flex shrink-0 items-center gap-2 rounded-md bg-maroon px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-maroon-light focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:ring-offset-2"><SaveIcon className="h-4 w-4" /> <span className="hidden sm:inline">Save Changes</span></button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-7">
          <div className="mx-auto max-w-[1280px] space-y-5">
            {notice && <div role="status" className="flex items-start justify-between gap-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><span className="flex items-center gap-2"><CheckCircle2Icon className="h-4 w-4 shrink-0" />{notice}</span><button type="button" onClick={() => setNotice('')} className="text-xs font-bold text-emerald-700 hover:text-emerald-950">Dismiss</button></div>}

            <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]">
              <aside className="h-fit rounded-lg border border-stone-200 bg-white p-3 shadow-sm" aria-label="Settings categories">
                <p className="px-3 pb-2 pt-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-400">Settings</p>
                <a href="#profile" className="flex items-center gap-3 rounded-md bg-maroon px-3 py-3 text-sm font-bold text-white"><UserRoundIcon className="h-4 w-4" /> My Profile</a>
                <a href="#registration" className="mt-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-stone-50 hover:text-maroon"><SlidersHorizontalIcon className="h-4 w-4" /> Registration Defaults</a>
                <a href="#security" className="mt-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-stone-50 hover:text-maroon"><ShieldCheckIcon className="h-4 w-4" /> Security & Access</a>
                <a href="#notifications" className="mt-1 flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold text-slate-600 hover:bg-stone-50 hover:text-maroon"><BellIcon className="h-4 w-4" /> Notifications</a>
                <div className="mt-4 rounded-md border border-gold/50 bg-gold/10 p-3"><p className="text-xs font-bold text-maroon">Registrar workspace</p><p className="mt-1 text-xs leading-relaxed text-slate-600">Changes affect the next registration intake and your administrator session.</p></div>
              </aside>

              <div className="space-y-5">
                <section id="profile" className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="profile-heading">
                  <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-maroon/10 text-maroon"><UserRoundIcon className="h-5 w-5" /></span><div><h2 id="profile-heading" className="font-bold text-slate-900">Administrator Profile</h2><p className="mt-1 text-xs text-slate-500">Details shown in administrative records and notifications.</p></div></div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2"><TextField label="Display Name" value={settings.displayName} onChange={(value) => updateSetting('displayName', value)} /><TextField label="Institutional Email" type="email" value={settings.email} onChange={(value) => updateSetting('email', value)} /></div>
                  <div className="mt-5 flex items-center gap-3 rounded-md border border-stone-200 bg-stone-50 p-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-xs font-extrabold text-maroon-dark">AP</span><div><p className="text-sm font-bold text-slate-800">Registrar Office Administrator</p><p className="text-xs text-slate-500">Role permissions are managed by the IT Division.</p></div></div>
                </section>

                <section id="registration" className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="registration-heading">
                  <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold/20 text-amber-700"><SlidersHorizontalIcon className="h-5 w-5" /></span><div><h2 id="registration-heading" className="font-bold text-slate-900">Registration Defaults</h2><p className="mt-1 text-xs text-slate-500">Set the baseline context applied when importing a new student batch.</p></div></div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><SelectField label="Current Intake" value={settings.intake} onChange={(value) => updateSetting('intake', value)} options={['July 2026 Intake', 'January 2027 Intake']} /><SelectField label="Academic Year" value={settings.academicYear} onChange={(value) => updateSetting('academicYear', value)} options={['2026 / 2027', '2027 / 2028']} /><TextField label="Registration Prefix" value={settings.registrationPrefix} onChange={(value) => updateSetting('registrationPrefix', value.toUpperCase())} hint="Used before generated registration numbers" /></div>
                </section>

                <section id="security" className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="security-heading">
                  <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><ShieldCheckIcon className="h-5 w-5" /></span><div><h2 id="security-heading" className="font-bold text-slate-900">Security & Access</h2><p className="mt-1 text-xs text-slate-500">Keep your administrator access protected and accountable.</p></div></div>
                  <div className="mt-6 grid gap-4 lg:grid-cols-2"><ToggleRow label="Require two-factor authentication" description="All administrator sign-ins require a second verification step." checked={settings.twoFactorRequired} onChange={(checked) => updateSetting('twoFactorRequired', checked)} /><SelectField label="Automatic Session Timeout" value={settings.sessionTimeout} onChange={(value) => updateSetting('sessionTimeout', value)} options={['15 minutes', '30 minutes', '60 minutes']} /></div>
                  <div className="mt-4 flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"><span>Last successful sign-in: Today, 09:41 AM · Anuradhapura, LK</span><button type="button" onClick={() => setNotice('A security activity report is ready for review.')} className="font-bold underline underline-offset-2 hover:text-blue-950">View activity</button></div>
                </section>

                <section id="notifications" className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="notifications-heading">
                  <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><BellIcon className="h-5 w-5" /></span><div><h2 id="notifications-heading" className="font-bold text-slate-900">Notification Preferences</h2><p className="mt-1 text-xs text-slate-500">Choose how the Registrar Office receives workflow updates.</p></div></div>
                  <div className="mt-6 divide-y divide-stone-100 rounded-md border border-stone-200"><ToggleRow label="Email notifications" description="Send a daily summary for completed imports and account creation." checked={settings.emailNotifications} onChange={(checked) => updateSetting('emailNotifications', checked)} bordered={false} /><ToggleRow label="Approval reminders" description="Alert the office when registrations remain pending for more than one day." checked={settings.approvalReminders} onChange={(checked) => updateSetting('approvalReminders', checked)} bordered={false} /></div>
                </section>

                <div className="flex flex-col-reverse gap-3 pb-2 sm:flex-row sm:items-center sm:justify-end"><button type="button" onClick={resetSettings} className="rounded-md border border-stone-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-maroon hover:text-maroon">Discard Changes</button><button type="button" onClick={saveSettings} className="flex items-center justify-center gap-2 rounded-md bg-maroon px-5 py-2.5 text-sm font-bold text-white transition hover:bg-maroon-light"><SaveIcon className="h-4 w-4" /> Save Settings</button></div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <button type="button" aria-label="Help" className="fixed bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-maroon text-white shadow-lg hover:bg-maroon-light"><HelpCircleIcon className="h-5 w-5" /></button>
    </div>);

}

function TextField({ label, value, onChange, type = 'text', hint }: {label: string;value: string;onChange: (value: string) => void;type?: string;hint?: string;}) {
  return <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-maroon">{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 w-full rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/15" />{hint && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}</label>;
}

function SelectField({ label, value, onChange, options }: {label: string;value: string;onChange: (value: string) => void;options: string[];}) {
  return <label className="block"><span className="text-xs font-bold uppercase tracking-wider text-maroon">{label}</span><span className="relative mt-2 block"><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-md border border-stone-200 bg-stone-50 px-3 py-3 pr-9 text-sm text-slate-800 outline-none transition focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/15">{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /></span></label>;
}

function ToggleRow({ label, description, checked, onChange, bordered = true }: {label: string;description: string;checked: boolean;onChange: (checked: boolean) => void;bordered?: boolean;}) {
  return <div className={`flex items-center justify-between gap-4 p-4 ${bordered ? 'rounded-md border border-stone-200 bg-stone-50' : ''}`}><div><p className="text-sm font-bold text-slate-800">{label}</p><p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-500">{description}</p></div><button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 shrink-0 rounded-full transition focus:outline-none focus:ring-2 focus:ring-maroon/30 focus:ring-offset-2 ${checked ? 'bg-maroon' : 'bg-slate-300'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>;
}

function UniversityMark() {
  return <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold text-sm font-medium text-gold"><span className="rounded-full border border-gold/40 px-1.5 py-0.5">RU</span></div>;
}
