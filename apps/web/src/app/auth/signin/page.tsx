'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useSystemMessage } from '@/hooks/useSystemMessage';
import UI_TEXT from '@/lib/uiText';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { showMessage } = useSystemMessage();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(UI_TEXT.errors.authenticationFailed);
      showMessage('systemError');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="system-window p-8 max-w-md w-full">
        <h1 className="system-title text-center mb-8">◈ {UI_TEXT.pages.signin} ◈</h1>

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
              className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-system disabled:opacity-50"
          >
            {loading ? 'VERIFYING...' : UI_TEXT.buttons.signIn}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Unregistered Hunter?{' '}
          <Link href="/auth/signup" className="text-system-gold hover:underline">
            {UI_TEXT.buttons.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
