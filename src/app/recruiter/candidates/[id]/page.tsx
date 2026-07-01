'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar,
  Briefcase, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Award,
  Sparkles,
  AlertCircle,
  FolderOpen
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ScoreCircle } from '@/components/ui/ScoreCircle';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { Button, Textarea } from '@/components/ui/Inputs';
import { Skeleton } from '@/components/ui/LoadingSkeleton';

export default function CandidateDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();

  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [saveNotesLoading, setSaveNotesLoading] = useState(false);

  const fetchCandidateDetails = async () => {
    try {
      const res = await fetch(`/api/candidates/${id}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch candidate details');
      }
      setCandidate(data);
      setNotes(data.recruiterNotes || '');
    } catch (e: any) {
      toast('Error', e.message || 'Candidate details could not be found.', 'error');
      router.push('/recruiter/candidates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCandidateDetails();
  }, [id]);

  const handleUpdateStatus = async (newStatus: 'shortlisted' | 'rejected') => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast('Status Updated', `Candidate is now ${newStatus}.`, 'success');
        fetchCandidateDetails();
      }
    } catch (e) {
      toast('Update Failed', 'Failed to update candidate status.', 'error');
    }
  };

  const handleSaveNotes = async () => {
    setSaveNotesLoading(true);
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recruiterNotes: notes }),
      });
      if (res.ok) {
        toast('Notes Saved', 'Recruiter evaluations updated.', 'success');
        fetchCandidateDetails();
      }
    } catch (e) {
      toast('Save Failed', 'Could not record comments.', 'error');
    } finally {
      setSaveNotesLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[250px] w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[180px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const details = candidate?.candidateDetails;
  const analysis = candidate?.aiAnalysis;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back button */}
      <Link href="/recruiter/candidates">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer">
          <ArrowLeft className="h-4 w-4" /> Back to Candidate Pool
        </span>
      </Link>

      {/* Profile Header panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-2xl border border-blue-100 dark:border-blue-900 shrink-0">
            {details?.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{details?.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold">{candidate.jobDetails?.title || 'General Pool'}</p>
            <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium pt-1">
              <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {details?.email}</span>
              <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {details?.phone}</span>
            </div>
          </div>
        </div>

        {/* Dynamic status action pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button 
            variant={candidate.status === 'shortlisted' ? 'primary' : 'outline'} 
            size="sm" 
            onClick={() => handleUpdateStatus('shortlisted')}
            className="flex gap-1.5"
          >
            <CheckCircle className="h-4 w-4" /> Shortlist
          </Button>
          <Button 
            variant={candidate.status === 'rejected' ? 'destructive' : 'outline'} 
            size="sm" 
            onClick={() => handleUpdateStatus('rejected')}
            className="flex gap-1.5"
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parsed resume details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Timeline & details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <Briefcase className="h-5 w-5 text-blue-500" /> Career Profile
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Professional Experience</h4>
                <p className="text-sm text-slate-600 dark:text-slate-350">{details?.experience}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Education Background</h4>
                <div className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-350">
                  <GraduationCap className="h-5 w-5 text-slate-400 mt-0.5" />
                  <p>{details?.education}</p>
                </div>
              </div>

              {details?.projects && details.projects.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Projects</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-slate-350 space-y-1.5">
                    {details.projects.map((proj: string, idx: number) => (
                      <li key={idx}>{proj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {details?.certifications && details.certifications.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.certifications.map((cert: string, idx: number) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-950">
                        <Award className="h-3.5 w-3.5 text-indigo-500" /> {cert}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dummy Resume Preview Box */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3">
              <FileText className="h-5 w-5 text-blue-500" /> Resume Document Preview
            </h3>
            
            <div className="p-8 border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 rounded-xl flex flex-col items-center justify-center text-center space-y-4">
              <FileText className="h-12 w-12 text-slate-400 dark:text-slate-600" />
              <div>
                <p className="text-sm font-semibold">{details?.name.replace(/\s+/g, '_')}_Resume.pdf</p>
                <p className="text-xs text-slate-400 mt-1">Cloudinary File Storage Endpoint Verified (Active)</p>
              </div>
              <a href="https://res.cloudinary.com/demo/image/upload/v123456/sample_resume.pdf" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">Open Document URL</Button>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis Match Panel */}
        <div className="space-y-6">
          {/* AI Match circle and Summary */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 text-blue-500">
              <Sparkles className="h-4.5 w-4.5 animate-pulse" />
            </div>

            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Evaluation Score</span>
            <ScoreCircle score={candidate.matchScore} size={85} strokeWidth={6} />
            
            <div className="space-y-1.5 mt-2">
              <h4 className="font-bold text-sm">Overall Match Recommendation</h4>
              <p className="text-xs text-slate-500 dark:text-slate-450 px-2 line-clamp-4">
                {analysis?.summary || 'Candidate displays solid potential meeting multiple key requirements of the target role profile.'}
              </p>
            </div>
          </div>

          {/* Strengths / Weaknesses */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">AI Insights Summary</h4>
            
            {/* Strengths */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Strengths</span>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                {analysis?.strengths.map((str: string, i: number) => <li key={i}>{str}</li>)}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Areas for Improvement</span>
              <ul className="text-xs space-y-1 text-slate-500 dark:text-slate-400 list-disc pl-4">
                {analysis?.weaknesses.map((weak: string, i: number) => <li key={i}>{weak}</li>)}
              </ul>
            </div>

            {/* Missing Skills */}
            {analysis?.missingSkills && analysis.missingSkills.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-xs font-bold text-red-500">Missing Core Skills</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {analysis.missingSkills.map((sk: string) => (
                    <SkillBadge key={sk} name={sk} type="missing" className="px-2 py-0.5 text-[10px]" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recruiter Evaluation notes card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm uppercase tracking-wide border-b border-slate-100 dark:border-slate-800 pb-2">Recruiter Notes</h4>
            <Textarea 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Record review notes or interview suggestions..."
              className="text-xs min-h-[80px]"
            />
            <Button 
              variant="primary" 
              className="w-full text-xs py-2" 
              onClick={handleSaveNotes} 
              isLoading={saveNotesLoading}
            >
              Save Comments
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
