'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { Button, Input, Select } from '@/components/ui/Inputs';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();


  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('candidate');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast('Error', 'Please fill in all fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      toast('Registration Successful!', 'You can now log in with your credentials.', 'success');
      router.push('/login');
    } catch (err: any) {
      toast('Registration Failed', err.message || 'Check your details.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { label: 'Candidate (Looking for job)', value: 'candidate' },
    { label: 'Recruiter (Hiring Candidates)', value: 'recruiter' }
  ];

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
          <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Fill in your details below to set up your ATS workspace.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <Select
              label="Account Role"
              options={roleOptions}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <Button variant="primary" className="w-full h-11 flex gap-2 pt-2" type="submit" isLoading={isLoading}>
              Register Account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Sign in Redirect */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
