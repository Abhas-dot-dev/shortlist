'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Plus, 
  FileUp, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { FileUploader } from '@/components/ui/FileUploader';
import { ScoreCircle } from '@/components/ui/ScoreCircle';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button, Input, Select, Badge } from '@/components/ui/Inputs';

export default function CandidatesDashboard() {
  const { toast } = useToast();
  
  // Data lists
  const [candidates, setCandidates] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog state
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [jobId, setJobId] = useState('all');
  const [experience, setExperience] = useState('all');
  const [score, setScore] = useState('all');
  const [sort, setSort] = useState('highest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  // Target upload job selection
  const [uploadJobId, setUploadJobId] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
      if (data.length > 0) {
        setUploadJobId(data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        jobId,
        experience,
        score,
        sort,
        page: page.toString(),
        limit: '8',
      });
      const res = await fetch(`/api/candidates?${params.toString()}`);
      const data = await res.json();
      setCandidates(data.candidates || []);
      setPagination(data.pagination || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [search, jobId, experience, score, sort, page]);

  const handleStatusChange = async (id: string, newStatus: 'shortlisted' | 'rejected') => {
    try {
      const res = await fetch(`/api/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast(
          newStatus === 'shortlisted' ? 'Candidate Shortlisted' : 'Candidate Rejected',
          `Applicant status updated successfully.`,
          newStatus === 'shortlisted' ? 'success' : 'info'
        );
        fetchCandidates();
      }
    } catch (e) {
      toast('Update Failed', 'Failed to update candidate status.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this applicant?')) {
      return;
    }
    try {
      const res = await fetch(`/api/candidates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Applicant Deleted', 'Candidate profile removed from job application pool.', 'success');
        fetchCandidates();
      }
    } catch (e) {
      toast('Deletion Failed', 'Failed to delete applicant.', 'error');
    }
  };

  const handleUploadSuccess = (data: any) => {
    toast('Analysis Added', `${data.candidateName}'s resume matches with score ${data.overallMatchScore}%`, 'success');
    setIsUploadOpen(false);
    fetchCandidates();
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidate Database</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Upload resumes, review AI match metrics, and manage shortlists.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsUploadOpen(true)} className="flex gap-2">
          <FileUp className="h-4.5 w-4.5" /> Parse Candidate Resume
        </Button>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search box */}
          <Input 
            placeholder="Search candidate name, skills..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            icon={<Search className="h-4 w-4" />}
          />

          {/* Job select */}
          <Select
            options={[
              { label: 'All Jobs', value: 'all' },
              ...jobs.map(j => ({ label: j.title, value: j._id }))
            ]}
            value={jobId}
            onChange={(e) => { setJobId(e.target.value); setPage(1); }}
          />

          {/* Experience filter */}
          <Select
            options={[
              { label: 'All Experience levels', value: 'all' },
              { label: '0-2 Years (Junior)', value: '0-2' },
              { label: '3-5 Years (Mid-level)', value: '3-5' },
              { label: '5+ Years (Senior)', value: '5+' }
            ]}
            value={experience}
            onChange={(e) => { setExperience(e.target.value); setPage(1); }}
          />

          {/* Score filter */}
          <Select
            options={[
              { label: 'All Match Scores', value: 'all' },
              { label: 'High Score (80%+)', value: '80+' },
              { label: 'Good Score (60-79%)', value: '60-79' },
              { label: 'Under 60% Match', value: 'under60' }
            ]}
            value={score}
            onChange={(e) => { setScore(e.target.value); setPage(1); }}
          />

          {/* Sorting */}
          <Select
            options={[
              { label: 'Highest Score first', value: 'highest' },
              { label: 'Lowest Score first', value: 'lowest' },
              { label: 'Newest candidates', value: 'newest' },
              { label: 'Oldest candidates', value: 'oldest' }
            ]}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Candidate Listings table */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
          {[1, 2, 3, 4].map(i => <TableRowSkeleton key={i} />)}
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          title="No Applicants Found"
          description="Try broadening your search query or upload candidate resumes for the selected job opening."
          action={
            <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
              Upload Candidate Resume
            </Button>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 font-semibold text-slate-400 dark:text-slate-500 text-xs tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Applied Job</th>
                  <th className="py-4 px-6">Experience</th>
                  <th className="py-4 px-6">Key Skills</th>
                  <th className="py-4 px-6 text-center">Score</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {candidates.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0">
                          {cand.candidateDetails?.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold truncate text-slate-800 dark:text-slate-100">{cand.candidateDetails?.name}</p>
                          <p className="text-xs text-slate-400 truncate">{cand.candidateDetails?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      {cand.jobDetails?.title || 'General Pool'}
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                      {cand.candidateDetails?.experience || 'Not specified'}
                    </td>
                    <td className="py-4 px-6 max-w-[200px]">
                      <div className="flex flex-wrap gap-1">
                        {cand.candidateDetails?.skills.slice(0, 3).map((s: string) => (
                          <SkillBadge key={s} name={s} className="px-1.5 py-0.5" />
                        ))}
                        {cand.candidateDetails?.skills.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-400">+{cand.candidateDetails?.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex justify-center">
                        <ScoreCircle score={cand.matchScore} size={40} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Badge className={
                        cand.status === 'shortlisted'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : cand.status === 'rejected'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      }>
                        {cand.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <Link href={`/recruiter/candidates/${cand._id}`}>
                          <button className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800" title="View Profile">
                            <Eye className="h-4.5 w-4.5" />
                          </button>
                        </Link>
                        {cand.status !== 'shortlisted' && (
                          <button 
                            onClick={() => handleStatusChange(cand._id, 'shortlisted')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 hover:bg-slate-50 dark:hover:bg-slate-800" 
                            title="Shortlist Applicant"
                          >
                            <CheckCircle className="h-4.5 w-4.5" />
                          </button>
                        )}
                        {cand.status !== 'rejected' && (
                          <button 
                            onClick={() => handleStatusChange(cand._id, 'rejected')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-450 hover:bg-slate-50 dark:hover:bg-slate-800" 
                            title="Reject Applicant"
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(cand._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-50 dark:hover:bg-slate-800" 
                          title="Delete Application"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls */}
          {pagination.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total applicants)</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, pagination.totalPages))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Parse Dialog */}
      <Dialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Extract Candidate Resume">
        <div className="space-y-4">
          <Select
            label="Associate Target Job Opening *"
            options={jobs.map(j => ({ label: j.title, value: j._id }))}
            value={uploadJobId}
            onChange={(e) => setUploadJobId(e.target.value)}
          />
          
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
              Upload Resume File *
            </label>
            <FileUploader 
              jobId={uploadJobId} 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={(err) => toast('Parsing Failed', err, 'error')}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
