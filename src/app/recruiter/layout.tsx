'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/components/ui/ThemeContext';
import { useToast } from '@/components/ui/Toast';
import { 
  Sparkles, 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut, 
  Search,
  Bell,
  Menu,
  X,
  Database
} from 'lucide-react';

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recruiterName, setRecruiterName] = useState('John Recruiter');
  const [dbSeeded, setDbSeeded] = useState(false);
  const [seedingLoading, setSeedingLoading] = useState(false);

  useEffect(() => {
    // Retrieve authenticated recruiter profile from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== 'recruiter') {
        router.push('/login');
      } else {
        setTimeout(() => {
          setRecruiterName(parsed.name);
        }, 0);
      }
    } else {
      // For easy demo access, if they navigate directly without login, set demo recruiter
      localStorage.setItem('user', JSON.stringify({ id: 'recruiter_default', name: 'John Recruiter', role: 'recruiter' }));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast('Logged Out', 'You have been safely signed out.', 'success');
    router.push('/login');
  };

  const handleSeedDb = async () => {
    setSeedingLoading(true);
    try {
      const res = await fetch('/api/debug/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast('Database Seeded', 'Mock data populated successfully inside MongoDB.', 'success');
        setDbSeeded(true);
        // Refresh page content
        window.location.reload();
      } else {
        toast('Seeding Info', 'MongoDB URI is not set. Running app in in-memory session mode.', 'info');
      }
    } catch (e) {
      toast('Seeding Failed', 'Failed to communicate with seeding api.', 'error');
    } finally {
      setSeedingLoading(false);
    }
  };

  const menuItems = [
    { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/recruiter/jobs', icon: Briefcase },
    { name: 'Candidates', href: '/recruiter/candidates', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-white">ShortlistAI</span>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
          {/* MongoDB seed triggers */}
          <button
            onClick={handleSeedDb}
            disabled={seedingLoading}
            className="flex w-full items-center justify-center gap-2 text-xs font-semibold py-2 px-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-900/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Database className="h-4.5 w-4.5" />
            {seedingLoading ? 'Seeding...' : 'Seed MongoDB Atlas'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Breadcrumbs or greeting */}
            <h1 className="text-sm font-semibold hidden sm:block text-slate-500 dark:text-slate-400">
              Welcome back, <span className="text-slate-800 dark:text-slate-100 font-bold">{recruiterName}</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">


            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-sm border border-blue-200 dark:border-blue-900">
                {recruiterName.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 hidden md:block">
                {recruiterName}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                      : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleSeedDb}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300"
            >
              <Database className="h-5 w-5" /> Seed MongoDB
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
              className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500"
            >
              <LogOut className="h-5 w-5" /> Logout
            </button>
          </div>
        )}

        {/* Dashboard Main Viewport */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
