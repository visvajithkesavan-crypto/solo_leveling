'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await signUp(email, password);
      setSuccess(true);
      // Auto-redirect after successful signup
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="system-window p-8 max-w-md w-full">
        <h1 className="system-title text-center mb-8">HUNTER REGISTRATION</h1>

        {success ? (
          <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded text-center">
            <p className="font-bold mb-2">Registration Successful!</p>
            <p className="text-sm">Welcome to the System. Redirecting...</p>
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
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-system disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Join the System'}
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-sm">
          Already a Hunter?{' '}
          <Link href="/auth/signin" className="text-system-gold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
