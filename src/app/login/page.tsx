'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // Wait! In Next.js, we import Link from 'next/link'. Let's use 'next/link'.
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui/Inputs';
import { useToast } from '@/components/ui/Toast';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Error', 'Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Store basic user details in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      toast('Success', `Welcome back, ${data.user.name}!`, 'success');

      if (data.user.role === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    } catch (err: any) {
      toast('Authentication Failed', err.message || 'Check your credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (role: 'recruiter' | 'candidate') => {
    if (role === 'recruiter') {
      setEmail('recruiter@domain.com');
      setPassword('password123');
      toast('Quick Fill', 'Recruiter credentials populated', 'info');
    } else {
      setEmail('candidate@example.com');
      setPassword('password123');
      toast('Quick Fill', 'Candidate credentials populated', 'info');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">


      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 mb-3 cursor-pointer">
              <Sparkles className="h-5.5 w-5.5" />
            </div>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight">Log in to ShortlistAI</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Enter your details below to access your applicant dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button variant="primary" className="w-full h-11 flex gap-2" type="submit" isLoading={isLoading}>
              Sign In <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Demo Logins */}
          <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Demo Quick Fill</p>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" onClick={() => handleQuickLogin('recruiter')}>
                Recruiter Profile
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleQuickLogin('candidate')}>
                Candidate Profile
              </Button>
            </div>
          </div>
        </div>

        {/* Sign up Redirect */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
