import React, { useState } from 'react';
import { ChevronRightIcon, EyeIcon, EyeOffIcon, ShieldIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const navigate = useNavigate();
  const isInvalidEmail = Boolean(email) && !email.toLowerCase().endsWith('@agri.rjt.ac.lk');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (requiresVerification) {
      if (otp !== '123456') {
        setError('Enter the six-digit verification code. For this prototype, use 123456.');
        return;
      }
      sessionStorage.setItem('rms-admin-authenticated', 'true');
      navigate('/dashboard');
      return;
    }
    if (!email || !password) {
      setError('Enter your institutional email address and password.');
      return;
    }
    if (!email.toLowerCase().endsWith('@agri.rjt.ac.lk') || password.length < 8) {
      setError('Use an Agriculture Faculty email address and a password of at least 8 characters.');
      return;
    }
    setError('');
    setRequiresVerification(true);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-2xl font-bold text-maroon sm:text-3xl">Administrator Login</h1>
      <p className="mt-1 text-sm text-gray-500">Faculty of Agriculture staff: enter your institutional credentials to continue.</p>
      <form className="mt-6 space-y-4 sm:mt-7 sm:space-y-5" onSubmit={handleSubmit}>
        <div><label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-maroon">Email Address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@agri.rjt.ac.lk" className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/15" />{isInvalidEmail && <p className="mt-1.5 text-xs text-rose-600">Use the demo email: <span className="font-semibold">admin@agri.rjt.ac.lk</span></p>}</div>
        <div><label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-maroon">Password</label><div className="relative mt-1.5"><input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••••••" className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-maroon focus:bg-white focus:ring-2 focus:ring-maroon/15" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 transition hover:text-gold-dark focus:outline-none">{showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}</button></div></div>
        <div className="flex items-center justify-between gap-3"><label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 sm:text-sm"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-gray-300 text-maroon accent-maroon focus:ring-maroon/30" />Remember me</label><button type="button" className="text-xs font-semibold text-gold-dark transition hover:text-maroon sm:text-sm">Forgot password?</button></div>
        {requiresVerification && <div><label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-maroon">Verification code</label><input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} placeholder="6-digit code" className="mt-1.5 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-maroon focus:bg-white" /><p className="mt-1.5 text-xs text-gray-500">A verification code was sent to your institutional email. Prototype code: 123456.</p></div>}
        {error && <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{error}</p>}
        <button type="submit" className="group flex w-full items-center justify-center gap-2 rounded-lg bg-maroon px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-maroon-light focus:outline-none focus:ring-2 focus:ring-maroon/40 focus:ring-offset-2">{requiresVerification ? 'Verify and continue' : 'Continue'}<ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></button>
        <div className="flex items-center gap-3 rounded-lg border border-gold/40 bg-gold/10 px-3.5 py-2.5"><ShieldIcon className="h-4 w-4 shrink-0 text-gold-dark" aria-hidden="true" /><p className="text-xs leading-relaxed text-gray-700">Two-factor authentication is required for all admin accounts.</p></div>
      </form>
    </div>);

}
