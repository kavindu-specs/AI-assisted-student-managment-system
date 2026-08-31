
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, InfoIcon, ArrowRightIcon } from 'lucide-react';
import { api, ApiError, setToken } from '../lib/apiClient';

export function LoginForm() {
  const [registration, setRegistration] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!registration || !password) {
      setError('Enter your registration number and password.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await api.post<{
        requiresFirstLogin: boolean;
        preAuthToken?: string;
        token?: string;
      }>('/auth/student/login', { regNumber: registration, password });

      if (result.requiresFirstLogin && result.preAuthToken) {
        sessionStorage.setItem('rms-student-preauth-token', result.preAuthToken);
        navigate('/first-login');
      } else if (result.token) {
        setToken(result.token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-maroon">Student Login</h2>
        <p className="mt-2 text-[15px] text-slate-500">
          Login using your registration number and NIC / temporary password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Registration number */}
        <div>
          <label
            htmlFor="registration"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            
            Registration Number
          </label>
          <div className="group relative">
            <UserIcon
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-maroon"
              strokeWidth={1.75} />
            
            <input
              id="registration"
              type="text"
              autoComplete="username"
              value={registration}
              onChange={(e) => setRegistration(e.target.value)}
              placeholder="Enter your registration number"
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-maroon focus:ring-4 focus:ring-maroon/10" />
            
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
            
            NIC / Temporary Password
          </label>
          <div className="group relative">
            <LockIcon
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-maroon"
              strokeWidth={1.75} />
            
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your NIC or temporary password"
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition-shadow focus:border-maroon focus:ring-4 focus:ring-maroon/10" />
            
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-maroon focus:text-maroon focus:outline-none">
              
              {showPassword ?
              <EyeOffIcon className="h-5 w-5" strokeWidth={1.75} /> :

              <EyeIcon className="h-5 w-5" strokeWidth={1.75} />
              }
            </button>
          </div>
        </div>

        {/* Remember / forgot */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex cursor-pointer select-none items-center gap-2.5">
            <span className="relative flex h-5 w-5 items-center justify-center">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 bg-white transition-colors checked:border-maroon checked:bg-maroon focus:outline-none focus:ring-4 focus:ring-maroon/10" />
              
              <svg
                className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                viewBox="0 0 12 12"
                fill="none">
                
                <path d="M2 6l2.5 2.5L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-sm font-medium text-slate-600">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm font-semibold text-maroon transition-colors hover:text-maroon-deep">
            
            Forgot password?
          </button>
        </div>

        {error && (
          <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
            {error}
          </p>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={submitting}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-maroon py-4 text-[15px] font-bold text-white shadow-lg shadow-maroon/25 transition-colors hover:bg-maroon-deep focus:outline-none focus:ring-4 focus:ring-maroon/25 disabled:opacity-70">
          
          {submitting ?
          <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Verifying…
            </> :

          <>
              Login
              <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </>
          }
        </motion.button>
      </form>

      {/* First time login notice */}
      <div className="mt-6 flex gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
        <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-maroon" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-bold text-maroon">First Time Login</p>
          <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
            You will be required to verify your identity and change your password
            before accessing the system.
          </p>
        </div>
      </div>
    </div>);

}
