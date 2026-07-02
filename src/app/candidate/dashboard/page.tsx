'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  FileText, 
  Clock, 
  Briefcase, 
  LogOut, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  FileCheck,
  Award,
  BookOpen,
  Check,
  AlertTriangle,
  Download,
  History,
  Copy,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Wrench,
  Folder,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { FileUploader } from '@/components/ui/FileUploader';
import { Button, Input, Textarea } from '@/components/ui/Inputs';
import { ScoreCircle } from '@/components/ui/ScoreCircle';

export default function CandidateDashboard() {
  const router = useRouter();
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'review' | 'applications'>('profile');
  
  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Resume state
  const [resumesList, setResumesList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  
  // UI Accordion States
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async (candId: string) => {
    try {
      setLoading(true);
      // Fetch reviews and resumes
      const res = await fetch(`/api/resumes/review?candidateId=${candId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.reviews) {
          setReviewsList(data.reviews);
          if (data.reviews.length > 0) {
            // Set the latest review as default active review
            setSelectedReview(data.reviews[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

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
        setPhone(parsed.phone || '+1 (555) 123-4567');
        setSkills(parsed.skills || 'React, TypeScript, Next.js, Tailwind CSS');
        setExperience(parsed.experience || 'Frontend specialized developer.');
        fetchDashboardData(parsed.id);
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
      fetchDashboardData(defaultCand.id);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast('Logged Out', 'Successfully signed out.', 'success');
    router.push('/login');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      toast('Success', 'Profile settings updated successfully.', 'success');
    }, 800);
  };

  const handleResumeUploadSuccess = (data: any) => {
    toast('Resume Analyzed', 'AI Resume Review generated successfully!', 'success');
    if (candidate) {
      fetchDashboardData(candidate.id);
    }
    // Switch to the review tab to see the feedback!
    setActiveTab('review');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast('Copied', 'Summary copied to clipboard.', 'success');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const downloadPDF = () => {
    window.print();
  };

  const dummyApplications = [
    { id: 1, title: 'Senior React Developer', company: 'Apex Technologies', status: 'shortlisted', date: '2026-06-28', score: 88 },
    { id: 2, title: 'Full Stack Engineer', company: 'StackFlow', status: 'applied', date: '2026-06-30', score: 72 }
  ];

  // Destructure rich details from selectedReview
  const richDetails = selectedReview?.raw_ai_response || {};
  const skillsAnalysis = richDetails.skillsAnalysis || {};
  const projectAnalysis = richDetails.projectAnalysis || [];
  const experienceAnalysis = richDetails.experienceAnalysis || {};
  const atsReview = richDetails.atsReview || {};
  const grammarReview = richDetails.grammarReview || {};
  const recruiterPerspective = richDetails.recruiterPerspective || {};

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300 print:bg-white print:text-black">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 space-y-6 flex-shrink-0 print:hidden">
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
            <FileText className="h-5 w-5" /> Resume Upload
          </button>
          <button 
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all text-left relative ${
              activeTab === 'review' 
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Sparkles className="h-5 w-5" /> AI Resume Review
            {reviewsList.length > 0 && (
              <span className="absolute right-2 top-2.5 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
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
      <main className="flex-1 p-6 md:p-10 max-w-5xl overflow-y-auto">
        
        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Profile Details</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Edit your basic ATS metadata settings below.</p>
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

        {/* RESUME UPLOAD TAB */}
        {activeTab === 'resume' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Resume Parser</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
                Upload or replace your resume document to evaluate overall ATS fit details.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-sm uppercase tracking-wide mb-4">Upload Resume Document</h3>
                  <FileUploader onUploadSuccess={handleResumeUploadSuccess} candidateId={candidate?.id} />
                </div>

                {selectedReview && (
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center gap-3">
                    <FileCheck className="h-8 w-8 text-emerald-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">Resume Version ({new Date(selectedReview.created_at).toLocaleDateString()})</p>
                      <p className="text-[10px] text-slate-400 font-medium">Successfully indexed and AI review generated</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Match Score circular card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall AI Quality Score</span>
                <ScoreCircle score={selectedReview?.overall_score || 0} size={80} />
                <h4 className="font-bold text-sm">Target Score Fit: {selectedReview?.overall_score || 0}%</h4>
                <p className="text-[11px] text-slate-400 font-medium font-sans">Our engine ranks profiles matching high-priority skills criteria.</p>
              </div>
            </div>
          </div>
        )}

        {/* AI RESUME REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="space-y-6">
            
            {/* Version Selection Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm print:shadow-none print:border-none">
              <div>
                <h2 className="text-xl font-bold tracking-tight">AI Resume Review</h2>
                {name && (
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-bold mt-0.5">
                    Candidate: {name}
                  </p>
                )}
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium print:hidden mt-1">
                  In-depth ChatGPT-style parsing, feedback suggestions, and interview prep.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 items-center print:hidden">
                {reviewsList.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-semibold uppercase">Version:</span>
                    <select
                      value={selectedReview?.id}
                      onChange={(e) => {
                        const rev = reviewsList.find(r => r.id === e.target.value);
                        if (rev) setSelectedReview(rev);
                      }}
                      className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold"
                    >
                      {reviewsList.map((rev, index) => (
                        <option key={rev.id} value={rev.id}>
                          v{reviewsList.length - index} ({new Date(rev.created_at).toLocaleDateString()}) - Score {rev.overall_score}%
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <Button variant="outline" size="sm" onClick={downloadPDF} className="flex gap-2 text-xs font-bold">
                  <Download className="h-4 w-4" /> Download PDF Review
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm text-slate-400 font-medium">Loading AI Review data...</p>
              </div>
            ) : !selectedReview ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4">
                <FileText className="h-12 w-12 text-slate-400" />
                <div>
                  <h3 className="font-bold text-sm uppercase">No AI Review Available</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Upload your resume in the **Resume Upload** tab to automatically generate a premium review feedback scorecard.
                  </p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setActiveTab('resume')}>
                  Go to Upload Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* 1. Score Matrix & Progression Trajectory */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Overall Quality', score: selectedReview.overall_score, color: 'text-blue-500' },
                    { label: 'ATS Compatibility', score: selectedReview.ats_score, color: 'text-emerald-500' },
                    { label: 'Grammar & Style', score: selectedReview.grammar_score, color: 'text-indigo-500' },
                    { label: 'Formatting Fit', score: selectedReview.formatting_score, color: 'text-purple-500' },
                    { label: 'Professionalism', score: selectedReview.professionalism_score, color: 'text-amber-500' },
                  ].map((s, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
                      <ScoreCircle score={s.score} size={60} />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.score}%</span>
                    </div>
                  ))}
                </div>

                {/* Score Progression graph/timeline */}
                {reviewsList.length > 1 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm print:hidden">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                      <History className="h-4 w-4 text-blue-500" /> Resume Version Trajectory
                    </h3>
                    <div className="flex items-center gap-6 overflow-x-auto pb-2">
                      {reviewsList.slice().reverse().map((rev, index) => (
                        <div key={rev.id} className="flex items-center gap-4 shrink-0">
                          <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                            selectedReview.id === rev.id
                              ? 'bg-blue-50/50 border-blue-300 dark:bg-blue-950/20 dark:border-blue-800'
                              : 'bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800'
                          }`}>
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                              v{index + 1}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Score: {rev.overall_score}%</p>
                              <p className="text-[10px] text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          {index < reviewsList.length - 1 && (
                            <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-700" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Key Feedback & Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Principal Strengths
                    </h3>
                    <ul className="space-y-2">
                      {selectedReview.strengths.map((str: string, i: number) => (
                        <li key={i} className="text-xs font-medium flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Crucial Weaknesses
                    </h3>
                    <ul className="space-y-2">
                      {selectedReview.weaknesses.map((weak: string, i: number) => (
                        <li key={i} className="text-xs font-medium flex items-start gap-2 text-slate-700 dark:text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ATS Flags Block */}
                {atsReview && (
                  <div className="p-5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/40 rounded-2xl space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4" /> ATS Scan Flags & Warnings
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Too Long', flag: atsReview.tooLong },
                        { label: 'Too Short', flag: atsReview.tooShort },
                        { label: 'Missing Contacts', flag: atsReview.missingContactInfo },
                        { label: 'Missing GitHub', flag: atsReview.missingGithub },
                        { label: 'Missing LinkedIn', flag: atsReview.missingLinkedin },
                        { label: 'Missing Portfolio', flag: atsReview.missingPortfolio },
                      ].map((item, i) => (
                        <div key={i} className={`p-3 border rounded-xl flex items-center justify-between gap-2 text-xs font-semibold ${
                          item.flag 
                            ? 'bg-rose-50/50 border-rose-200 text-rose-700 dark:bg-rose-950/10 dark:border-rose-900/50 dark:text-rose-400'
                            : 'bg-emerald-50/30 border-emerald-100 text-emerald-700 dark:bg-emerald-950/5 dark:border-emerald-900/20 dark:text-emerald-400'
                        }`}>
                          <span>{item.label}</span>
                          <span>{item.flag ? '⚠️ Yes' : '✅ Clear'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. AI Improved Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-blue-500" /> AI-Improved Professional Summary
                    </h3>
                    <button 
                      onClick={() => copyToClipboard(selectedReview.improvedSummary)}
                      className="text-slate-400 hover:text-blue-500 transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      {copiedSummary ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      {copiedSummary ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-slate-600 dark:text-slate-300">
                    "{selectedReview.improvedSummary}"
                  </p>
                </div>

                {/* 4. Skills Analysis */}
                {skillsAnalysis && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Wrench className="h-4 w-4 text-indigo-500" /> Semantic Skills Category Review
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Strong */}
                      <div className="p-4 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100 dark:border-emerald-900/20 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Strong Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsAnalysis.strongSkills?.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-emerald-100/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                      {/* Moderate */}
                      <div className="p-4 bg-blue-50/20 dark:bg-blue-950/5 border border-blue-100 dark:border-blue-900/20 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-blue-700 dark:text-blue-400 font-sans">Moderate Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsAnalysis.moderateSkills?.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-100/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                      {/* Missing */}
                      <div className="p-4 bg-amber-50/20 dark:bg-amber-950/5 border border-amber-100 dark:border-amber-900/20 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">Missing Industry Skills</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsAnalysis.missingIndustrySkills?.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-100/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded text-[10px] font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                      {/* Emerging */}
                      <div className="p-4 bg-indigo-50/20 dark:bg-indigo-950/5 border border-indigo-100 dark:border-indigo-900/20 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Emerging Skills to Learn</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {skillsAnalysis.emergingSkillsToLearn?.map((s: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-indigo-100/50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-bold">{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Projects Accordion */}
                {projectAnalysis.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Folder className="h-4 w-4 text-blue-500" /> Deep-Dive Project Evaluations
                    </h3>
                    <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                      {projectAnalysis.map((proj: any, idx: number) => (
                        <div key={idx} className="pt-3 first:pt-0">
                          <button
                            onClick={() => setExpandedProject(expandedProject === idx ? null : idx)}
                            className="w-full flex items-center justify-between text-left py-2 font-bold text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:text-blue-500"
                          >
                            <span className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-[10px] text-slate-500">Score: {proj.projectScore}%</span>
                              {proj.title}
                            </span>
                            {expandedProject === idx ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                          </button>
                          
                          {expandedProject === idx && (
                            <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl space-y-3 animate-fade-in">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Business Impact</p>
                                  <p className="mt-0.5 text-slate-800 dark:text-slate-200">{proj.businessImpact}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Technical Complexity</p>
                                  <p className="mt-0.5 text-slate-800 dark:text-slate-200">{proj.technicalComplexity}</p>
                                </div>
                              </div>
                              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resume Fit Value</p>
                                <p className="mt-0.5 text-slate-800 dark:text-slate-200">{proj.resumeValue}</p>
                              </div>
                              <div className="p-3 bg-blue-50/20 border border-blue-100/30 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400">
                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Suggestions for Improvement</p>
                                <p className="mt-0.5 text-slate-800 dark:text-slate-200 leading-relaxed">{proj.improvementSuggestions}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. Experience & Recruiter Opinion */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Experience */}
                  {experienceAnalysis && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Award className="h-4 w-4 text-emerald-500" /> Work Experience Review
                      </h3>
                      <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Quality of Roles</span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">{experienceAnalysis.experienceQuality}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Progression & Career growth</span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">{experienceAnalysis.careerProgression}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ownership & Mentorship</span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5">{experienceAnalysis.ownership} / {experienceAnalysis.leadership}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Recruiter perspective */}
                  {recruiterPerspective && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4 text-blue-500" /> Recruiter First Impression
                      </h3>
                      <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Shortlist Prob.</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{recruiterPerspective.estimatedShortlistProbability}%</p>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Interview Prob.</span>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{recruiterPerspective.estimatedInterviewProbability}%</p>
                          </div>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Would read further?</span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">{recruiterPerspective.wouldReadFurther}</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Immediate rejection risk?</span>
                          <p className="text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">{recruiterPerspective.wouldRejectImmediately}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 7. Grammar review */}
                {grammarReview && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-purple-500" /> Editorial & Grammar Quality Check
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Errors & passive voice instances</h4>
                        <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                          {grammarReview.grammarErrors?.map((err: string, i: number) => (
                            <p key={i}>❌ {err}</p>
                          ))}
                          {grammarReview.passiveVoice?.map((err: string, i: number) => (
                            <p key={i}>⚠️ Passive voice: {err}</p>
                          ))}
                          {grammarReview.grammarErrors?.length === 0 && grammarReview.passiveVoice?.length === 0 && (
                            <p className="text-emerald-500">✅ No grammar errors or passive voice detected.</p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">Weak Sentences & Repetitions</h4>
                        <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                          {grammarReview.weakSentences?.map((err: string, i: number) => (
                            <p key={i}>🔍 Weak: {err}</p>
                          ))}
                          {grammarReview.repetitiveWording?.map((err: string, i: number) => (
                            <p key={i}>🔁 Repetitive: {err}</p>
                          ))}
                          {grammarReview.weakSentences?.length === 0 && grammarReview.repetitiveWording?.length === 0 && (
                            <p className="text-emerald-500">✅ Writing style is strong and varied.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 8. Career suggestions */}
                {selectedReview.career_suggestions && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-blue-500" /> Executive Career Sourcing Suggestions
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">Recommended Job Roles</h4>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {selectedReview.career_suggestions.jobRoles?.map((r: string, i: number) => (
                            <li key={i} className="flex gap-1 items-center">🔹 {r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">Technologies to Learn</h4>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {selectedReview.career_suggestions.technologiesToLearn?.map((r: string, i: number) => (
                            <li key={i} className="flex gap-1 items-center">🔸 {r}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">Recommended Projects to Build</h4>
                        <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                          {selectedReview.career_suggestions.projectsToBuild?.map((r: string, i: number) => (
                            <li key={i} className="flex gap-1 items-center">🛠️ {r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* 9. Generated Prep Interview Questions */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-indigo-500" /> Generated Custom Prep Interview Questions (20 Qs)
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs font-semibold">
                    <div className="space-y-2.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-indigo-500">Technical Questions (10)</h4>
                      <ol className="space-y-1.5 list-decimal list-inside text-slate-600 dark:text-slate-400">
                        {selectedReview.technical_questions?.map((q: string, i: number) => (
                          <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-emerald-500">HR & Behavior Questions (5)</h4>
                      <ol className="space-y-1.5 list-decimal list-inside text-slate-600 dark:text-slate-400">
                        {selectedReview.hr_questions?.map((q: string, i: number) => (
                          <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-2.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider text-amber-500">Project Specific Questions (5)</h4>
                      <ol className="space-y-1.5 list-decimal list-inside text-slate-600 dark:text-slate-400">
                        {selectedReview.project_questions?.map((q: string, i: number) => (
                          <li key={i} className="leading-relaxed">{q}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>

                {/* 10. Recommended Action Plan checklist */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-blue-500" /> Recommended Action Plan
                  </h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {selectedReview.improvements?.map((imp: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-800/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                        <div className="h-5 w-5 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-full flex items-center justify-center font-bold shrink-0">
                          {i+1}
                        </div>
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Active Applications</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">Track your progress for applied positions.</p>
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
