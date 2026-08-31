import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2Icon, LockKeyholeIcon } from 'lucide-react';
import { useStudentWorkflow } from '../StudentWorkflow';
import { api, ApiError, setToken } from '../lib/apiClient';

export function FirstLoginSetup() {
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { completeFirstLogin } = useStudentWorkflow();
  const navigate = useNavigate();
  const valid = password.length >= 8 && password === confirmed;

  async function continueToProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!valid) return;
    setError('');

    const preAuthToken = sessionStorage.getItem('rms-student-preauth-token');
    if (!preAuthToken) {
      setError('Your session expired. Please log in again.');
      navigate('/');
      return;
    }

    setSubmitting(true);
    try {
      const { token } = await api.post<{ token: string }>(
        '/auth/student/first-login',
        { newPassword: password, confirmPassword: confirmed },
        preAuthToken,
      );
      setToken(token);
      sessionStorage.removeItem('rms-student-preauth-token');
      completeFirstLogin();
      navigate('/profile');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not set your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 px-5 py-12 text-slate-900">
      <main className="mx-auto max-w-lg rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2Icon className="h-6 w-6" />
        </span>
        <h1 className="mt-5 text-2xl font-extrabold text-maroon">Welcome to the Student Portal</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your student account has been created. For your first login, set a permanent password before completing your registration profile.
        </p>
        <form className="mt-7 space-y-5" onSubmit={continueToProfile}>
          <label className="block text-xs font-bold text-slate-700">
            New password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
              required
              minLength={8}
            />
          </label>
          <label className="block text-xs font-bold text-slate-700">
            Confirm new password
            <input
              type="password"
              value={confirmed}
              onChange={(event) => setConfirmed(event.target.value)}
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-maroon/15"
              required
            />
          </label>
          <p className="text-xs text-slate-500">Use at least 8 characters. Passwords must match.</p>
          {error && (
            <p role="alert" className="rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!valid || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-maroon px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
          >
            <LockKeyholeIcon className="h-4 w-4" />
            {submitting ? 'Saving…' : 'Save password and continue'}
          </button>
        </form>
      </main>
    </div>
  );
}
