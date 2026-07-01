'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Inputs';
import { ScoreCircle } from '@/components/ui/ScoreCircle';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Zap, 
  Shield, 
  Cpu, 
  Filter, 
  Layers, 
  ChevronDown, 
  Check, 
  Menu, 
  X,
  FileText
} from 'lucide-react';

export default function LandingPage() {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Workflow visualizer states
  const [matchingStatus, setMatchingStatus] = useState<'idle' | 'extracting' | 'analyzing' | 'done'>('idle');
  const [simulatedScore, setSimulatedScore] = useState(0);

  const triggerMatchSimulation = async () => {
    if (matchingStatus !== 'idle') return;
    
    setMatchingStatus('extracting');
    toast('Simulating Text Extraction', 'Parsing candidate resume metadata...', 'info');
    await new Promise((r) => setTimeout(r, 1200));
    
    setMatchingStatus('analyzing');
    toast('Simulating AI Analysis', 'Matching candidate skills against Job details...', 'info');
    await new Promise((r) => setTimeout(r, 1500));
    
    setMatchingStatus('done');
    setSimulatedScore(88);
    toast('Simulation Completed!', 'Score: 88% Match found.', 'success');
  };

  const resetSimulation = () => {
    setMatchingStatus('idle');
    setSimulatedScore(0);
  };

  const faqs = [
    {
      q: 'How does the AI match score work?',
      a: 'Our AI compares the core skills, experience timelines, project scopes, and education requirements in the candidate resume directly with your detailed Job Description to generate a weighted semantic matching percentage.'
    },
    {
      q: 'Can I upload files in bulk?',
      a: 'Yes, the ShortlistAI recruiter dashboard supports dragging and dropping multiple PDF/DOCX resumes simultaneously to speed up screening pipelines.'
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely. Resumes are securely stored in Cloudinary via encrypted channels, and metadata parameters are stored privately inside your dedicated MongoDB instance.'
    },
    {
      q: 'Can I customize the matching parameters?',
      a: 'Yes, you can edit requirements (skills, experience ranges, certifications) in the Job Description at any time to automatically recalibrate and re-score candidate matching records.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-300">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              ShortlistAI
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">Features</a>
            <a href="#workflow" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">How It Works</a>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">Log In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-950 text-sm font-medium"
            >
              Features
            </a>
            <a 
              href="#workflow" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-950 text-sm font-medium"
            >
              How It Works
            </a>
            <div className="pt-2 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800">
              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full" size="sm">Log In</Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="primary" className="w-full" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[120px] dark:bg-blue-500/5" />
        <div className="absolute top-1/3 left-1/3 -z-10 h-[250px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px] dark:bg-indigo-500/5" />

        <div className="container mx-auto px-4 text-center max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <Sparkles className="h-3 w-3 animate-spin" style={{ animationDuration: '3s' }} /> Next-Gen ATS Shortlisting
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Smarter Candidate Shortlisting <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
              Powered by GenAI
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
            Upload resumes, extract structured candidate profiles, compare them directly with your job description, and automatically rank applicants with semantic match scores.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button variant="primary" size="lg" className="h-12 flex gap-2">
                Start Screening For Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#workflow">
              <Button variant="outline" size="lg" className="h-12">
                Watch Demo Flow
              </Button>
            </a>
          </div>

          <div className="pt-8 flex justify-center items-center gap-8 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Cloud Storage</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Cpu className="h-4 w-4" /> Deep Matching</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4" /> Instant Results</span>
          </div>
        </div>
      </section>

      {/* Matching Flow Simulation Section */}
      <section id="workflow" className="py-16 bg-slate-100/50 dark:bg-slate-900/20 border-y border-slate-200/50 dark:border-slate-800/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Interactive Matching Workflow</h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Simulate how our AI parsing engine extracts candidate specifications and compares profiles against requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-base flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-500" /> Target Job Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-xs font-semibold text-slate-400">JOB TITLE</label>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Senior React Developer</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">REQUIRED SKILLS</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <SkillBadge name="React" type="required" />
                    <SkillBadge name="TypeScript" type="required" />
                    <SkillBadge name="Next.js" type="required" />
                    <SkillBadge name="Tailwind CSS" type="required" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 space-y-3">
                <h3 className="font-bold text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-500" /> Candidate Resume</h3>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800/60 flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 dark:bg-slate-900 text-blue-500 rounded-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">Sarah_Connor_Resume.pdf</p>
                    <p className="text-[10px] text-slate-400">Skills: React, TypeScript, Next.js, Redux</p>
                  </div>
                </div>
              </div>

              {matchingStatus === 'idle' ? (
                <Button variant="primary" className="w-full mt-2" onClick={triggerMatchSimulation}>
                  Simulate Matching Analysis
                </Button>
              ) : (
                <Button variant="outline" className="w-full mt-2" onClick={resetSimulation}>
                  Reset Simulation
                </Button>
              )}
            </div>

            {/* Pipeline Step Visualizer Column */}
            <div className="lg:col-span-2 flex flex-col justify-center items-center gap-3">
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                matchingStatus === 'extracting' ? 'bg-blue-600 text-white animate-pulse border-blue-600' : matchingStatus === 'analyzing' || matchingStatus === 'done' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
              }`}>
                {matchingStatus === 'analyzing' || matchingStatus === 'done' ? <Check className="h-4 w-4" /> : '1'}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Extract</p>
              
              <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-800" />

              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                matchingStatus === 'analyzing' ? 'bg-blue-600 text-white animate-pulse border-blue-600' : matchingStatus === 'done' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
              }`}>
                {matchingStatus === 'done' ? <Check className="h-4 w-4" /> : '2'}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Match</p>

              <div className="h-6 w-0.5 bg-slate-300 dark:bg-slate-800" />

              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                matchingStatus === 'done' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-slate-100 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
              }`}>
                3
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</p>
            </div>

            {/* AI Analysis Result Card Output */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[300px] flex flex-col justify-between">
              {matchingStatus === 'idle' && (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-400">
                  <Cpu className="h-10 w-10 mb-2 animate-bounce" />
                  <p className="text-sm font-semibold">Click "Simulate Matching" to see AI report.</p>
                </div>
              )}

              {matchingStatus === 'extracting' && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Extracting text & contact information...</p>
                </div>
              )}

              {matchingStatus === 'analyzing' && (
                <div className="flex flex-col items-center justify-center flex-1 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 font-medium">Cross-referencing experience and skills...</p>
                </div>
              )}

              {matchingStatus === 'done' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">Sarah Connor</h4>
                      <p className="text-xs text-slate-500">sarah.connor@domain.com</p>
                    </div>
                    <ScoreCircle score={simulatedScore} size={50} />
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-400">EXPERIENCE</span>
                      <p className="dark:text-slate-300">6 years specializing in React and frontend.</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">MATCHING SKILLS</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <SkillBadge name="React" type="matching" />
                        <SkillBadge name="TypeScript" type="matching" />
                        <SkillBadge name="Next.js" type="matching" />
                      </div>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">MISSING SKILLS</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <SkillBadge name="Tailwind CSS" type="missing" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-950 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold">AI Verdict:</span> Highly recommended candidate matching almost all critical React frontend developer features.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Enterprise Screening Features</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm sm:text-base font-medium">
              Powerful tools designed to replace manual screening, reducing candidate sourcing timelines from hours to seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Automated Resume Parsing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Extract complete candidate history, contact information, education timelines, and skillsets instantly.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Job Semantic Matching</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Calculate overall match percentages based on deep parsing instead of simple keyword lookups.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-slate-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Filter className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-lg mb-2">Advanced Filtering</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sort applicants by match scores, experience years, required skills, or education levels.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-slate-800 dark:text-slate-200">
              ShortlistAI
            </span>
          </div>

          <p className="text-xs">© 2026 ShortlistAI. All rights reserved. Built for recruitment excellence.</p>

          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
