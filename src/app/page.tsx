'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Users, Shield } from 'lucide-react';
import { setSession, isAuthenticated, isAdminUser } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
              src="/logo.png"
              alt="People Profile Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground">
            Enter your email to create or edit your profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@company.com"
              required
              className="h-11"
            />
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-indigo hover:bg-brand-indigo-dark h-11"
          >
            {loading ? 'Loading your profile...' : 'Continue'}
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Your email is only used to identify your profile. No password required.
          </p>
        </form>

        <div className="pt-4 border-t border-border">
          <Button
            onClick={() => router.push('/users')}
            variant="secondary"
            className="w-full h-11"
          >
            <Users className="w-5 h-5" />
            View Team Directory
          </Button>
        </div>
      </div>
    </main>
  );
}
