'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="system-window p-8 max-w-md w-full">
        <h1 className="system-title text-center mb-8">HUNTER LOGIN</h1>

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
              className="w-full px-4 py-2 bg-system-bg border border-system-border rounded focus:outline-none focus:border-system-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-system disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter System'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          New Hunter?{' '}
          <Link href="/auth/signup" className="text-system-gold hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
