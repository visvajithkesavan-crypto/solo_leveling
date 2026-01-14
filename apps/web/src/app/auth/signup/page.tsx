'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import UI_TEXT from '@/lib/uiText';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { showMessage } = useSystemMessage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Access codes do not match. Re-enter.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Access code must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      setSuccess(true);
      showMessage('welcomeNewUser');
      // Auto-redirect after successful signup
      setTimeout(() => router.push('/dashboard'), 3000);
    } catch (err: any) {
      setError(err.message || UI_TEXT.errors.registrationFailed);
      showMessage('systemError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="system-window p-8 max-w-md w-full">
        <h1 className="system-title text-center mb-8">◈ {UI_TEXT.pages.signup} ◈</h1>

        {success ? (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded text-center">
            <p className="font-bold mb-2">HUNTER REGISTRATION COMPLETE</p>
            <p className="text-sm">The System has acknowledged you. Initializing...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                {UI_TEXT.forms.email.label}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={UI_TEXT.forms.email.placeholder}
                required
                className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                {UI_TEXT.forms.password.label}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={UI_TEXT.forms.password.placeholder}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                {UI_TEXT.forms.confirmPassword.label}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={UI_TEXT.forms.confirmPassword.placeholder}
                required
                className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-system disabled:opacity-50"
            >
              {loading ? 'PROCESSING...' : UI_TEXT.buttons.signUp}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm">
          Existing Hunter?{' '}
          <Link href="/auth/signin" className="text-system-gold hover:underline">
            {UI_TEXT.buttons.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
