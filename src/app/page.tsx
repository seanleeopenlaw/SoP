'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, Shield } from 'lucide-react';
import { setSession, isAuthenticated, isAdminUser } from '@/lib/auth-utils';
import { toast } from 'sonner';

export default function Home() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated()) {
      if (isAdminUser()) {
        router.push('/admin/import');
      } else {
        router.push('/profile');
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      // Call login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();

      // Save session
      setSession(data.email, data.name, data.isAdmin);

      // Show toast if new user was created
      if (data.isNewUser) {
        toast.success('Welcome! Your profile has been created.', {
          description: 'You can now edit your profile information.',
          duration: 5000,
        });
      }

      // Admin goes to admin import page, regular users go to profile
      if (data.isAdmin) {
        router.push('/admin/import');
      } else {
        router.push('/profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.svg"
              alt="People Profile Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            People Profile
          </h1>
          <p className="text-muted-foreground">
            Enter your email to create or edit your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@company.com"
              required
              className="w-full bg-input border border-border text-foreground px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-indigo text-white px-6 py-3 rounded-md hover:bg-brand-indigo-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Loading your profile...' : 'Continue'}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Your email is only used to identify your profile. No password required.
          </p>
        </form>

        <div className="pt-4 border-t border-border">
          <button
            onClick={() => router.push('/users')}
            className="w-full bg-accent text-foreground px-6 py-3 rounded-md hover:bg-accent/80 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            View Team Directory
          </button>
        </div>
      </div>
    </main>
  );
}
