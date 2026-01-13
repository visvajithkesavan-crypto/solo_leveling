'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

export default function Home() {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && session) {
      router.push('/dashboard');
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-system-gold text-2xl animate-pulse">Loading System...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="system-window p-8 max-w-2xl w-full">
        <div className="text-center space-y-6">
          <h1 className="system-title text-4xl mb-4">SOLO LEVELING SYSTEM</h1>
          <p className="text-system-text text-lg mb-8">
            Welcome, Hunter. The system has chosen you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/signin" 
              className="btn-system"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="btn-system bg-system-gold text-system-bg hover:bg-system-border hover:text-white"
            >
              Begin Journey
            </Link>
          </div>

          <div className="mt-8 p-4 bg-system-bg border border-system-border rounded">
            <p className="text-sm text-system-text opacity-75">
              "Only those who are prepared to sacrifice everything will achieve greatness."
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
