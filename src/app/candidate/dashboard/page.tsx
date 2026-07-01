'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  FileText, 
  Clock, 
  Briefcase, 
  Settings, 
  LogOut, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { FileUploader } from '@/components/ui/FileUploader';
import { Button, Input, Textarea } from '@/components/ui/Inputs';
import { ScoreCircle } from '@/components/ui/ScoreCircle';

export default function CandidateDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'applications'>('profile');
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Resume status
  const [resumeName, setResumeName] = useState('Sarah_Connor_Resume.pdf');
  const [resumeScore, setResumeScore] = useState(88);
  const [analyzedDetails, setAnalyzedDetails] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed.role !== 'candidate') {
        router.push('/login');
      } else {
        setCandidate(parsed);
        setName(parsed.name);
        setEmail(parsed.email);
        setPhone('+1 (555) 123-4567');
        setSkills('React, TypeScript, Next.js, Redux, Tailwind CSS, Jest');
        setExperience('6 years of frontend experience specializing in React & TypeScript.');
      }
    } else {
      // Mock default candidate access
      const defaultCand = { id: 'cand_1', name: 'Sarah Connor', email: 'sarah.connor@domain.com', role: 'candidate' };
      localStorage.setItem('user', JSON.stringify(defaultCand));
      setCandidate(defaultCand);
      setName(defaultCand.name);
      setEmail(defaultCand.email);
      setPhone('+1 (555) 123-4567');
      setSkills('React, TypeScript, Next.js, Redux, Tailwind CSS, Jest');
      setExperience('6 years of frontend experience specializing in React & TypeScript.');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast('Logged Out', 'Successfully signed out.', 'success');
    router.push('/login');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast('Success', 'Profile settings updated successfully.', 'success');
    }, 800);
  };

  const handleResumeUploadSuccess = (data: any) => {
    setResumeName(data.fileName || 'Uploaded_Resume.pdf');
    setResumeScore(data.overallMatchScore || 85);
    setAnalyzedDetails(data);
    toast('Resume Analyzed', 'Your profile details have been automatically updated.', 'success');
  };

  const dummyApplications = [
    { id: 1, title: 'Senior React Developer', company: 'Apex Technologies', status: 'shortlisted', date: '2026-06-28', score: 88 },
    { id: 2, title: 'Full Stack Engineer', company: 'StackFlow', status: 'applied', date: '2026-06-30', score: 72 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 space-y-6 flex-shrink-0">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">ShortlistAI</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-150 dark:border-slate-800/60">
          <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
            {name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-xs truncate">{name}</p>
            <p className="text-[10px] text-slate-400 truncate">Candidate Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex flex-col">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === 'profile' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <User className="h-5 w-5" /> Profile Settings
          </button>
          <button 
            onClick={() => setActiveTab('resume')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === 'resume' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <FileText className="h-5 w-5" /> Resume Analyzer
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left ${
              activeTab === 'applications' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Briefcase className="h-5 w-5" /> Applications Pool
          </button>
        </nav>

        {/* Footer */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Profile Details</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Edit your basic ATS metadata settings below.</p>
            </div>
            
            <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                <Input label="Email Address" type="email" value={email} disabled className="opacity-60 cursor-not-allowed" />
              </div>
              <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              <Input label="Skills Set (comma separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
              <Textarea label="Core Experience Summary" value={experience} onChange={(e) => setExperience(e.target.value)} />
              <div className="flex justify-end pt-2">
                <Button variant="primary" size="sm" type="submit" isLoading={savingProfile}>
                  Save Profile Settings
                </Button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Resume Parser</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Upload or replace your resume document to evaluate overall ATS fit details.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-4">Upload Resume Document</h3>
                  <FileUploader onUploadSuccess={handleResumeUploadSuccess} />
                </div>

                {resumeName && (
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
                    <FileCheck className="h-8 w-8 text-emerald-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{resumeName}</p>
                      <p className="text-[10px] text-slate-400">Successfully indexed inside database</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Match Score circular card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">ATS Score Indicator</span>
                <ScoreCircle score={resumeScore} size={80} />
                <h4 className="font-bold text-sm">Target Score Fit: {resumeScore}%</h4>
                <p className="text-[11px] text-slate-400">Our engine ranks profiles matching high-priority skills criteria.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Active Applications</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Track your progress for applied positions.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
              {dummyApplications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-all">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-50">{app.title}</h3>
                    <p className="text-xs text-slate-500 font-semibold uppercase">{app.company}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" /> Applied on {app.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-bold text-slate-500">{app.score}% Match</span>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                      app.status === 'shortlisted' 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
