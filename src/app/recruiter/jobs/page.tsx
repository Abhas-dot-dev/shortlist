'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Trash2, 
  Edit,
  Eye
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Dialog } from '@/components/ui/Dialog';
import { Button, Input, Textarea, Select, Badge } from '@/components/ui/Inputs';
import { EmptyState } from '@/components/ui/EmptyState';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';

export default function JobsManagement() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');
  const [experience, setExperience] = useState('3+ years');
  const [education, setEducation] = useState("Bachelor's Degree");
  const [requiredSkills, setRequiredSkills] = useState('');
  const [preferredSkills, setPreferredSkills] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (e) {
      console.error('Error fetching jobs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleOpenCreateDialog = () => {
    setEditingJob(null);
    setTitle('');
    setCompany('');
    setLocation('');
    setEmploymentType('Full-time');
    setExperience('3+ years');
    setEducation("Bachelor's Degree");
    setRequiredSkills('');
    setPreferredSkills('');
    setSalary('');
    setDescription('');
    setStatus('active');
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (job: any) => {
    setEditingJob(job);
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setEmploymentType(job.employmentType);
    setExperience(job.experience);
    setEducation(job.education);
    setRequiredSkills(job.requiredSkills.join(', '));
    setPreferredSkills(job.preferredSkills.join(', '));
    setSalary(job.salary);
    setDescription(job.description);
    setStatus(job.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !company || !location || !description) {
      toast('Error', 'Please fill in all required fields.', 'error');
      return;
    }

    const jobData = {
      title,
      company,
      location,
      employmentType,
      experience,
      education,
      requiredSkills: requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: preferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      salary,
      description,
      status,
    };

    try {
      if (editingJob) {
        const res = await fetch(`/api/jobs/${editingJob._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        });
        if (res.ok) {
          toast('Job Updated', 'Job opening details updated successfully.', 'success');
        }
      } else {
        const res = await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        });
        if (res.ok) {
          toast('Job Created', 'New job posting added successfully.', 'success');
        }
      }
      setIsDialogOpen(false);
      fetchJobs();
    } catch (err) {
      toast('Operation Failed', 'Could not save job opening.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job opening? This will also remove associated candidate match data.')) {
      return;
    }

    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Job Deleted', 'Job opening removed.', 'success');
        fetchJobs();
      }
    } catch (err) {
      toast('Delete Failed', 'Failed to delete job.', 'error');
    }
  };

  const empTypeOptions = [
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Contract', value: 'Contract' },
    { label: 'Remote', value: 'Remote' }
  ];

  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Closed', value: 'closed' },
    { label: 'Draft', value: 'draft' }
  ];

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Job Openings</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
            Create, edit, or close target job specifications.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreateDialog} className="flex gap-2">
          <Plus className="h-4.5 w-4.5" /> Create Job
        </Button>
      </div>

      {/* Grid of jobs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No Job Openings Created"
          description="Build your first job opening requirement parameters to match candidates."
          action={
            <Button variant="primary" onClick={handleOpenCreateDialog}>
              Create Job Opening
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div 
              key={job._id} 
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{job.title}</h3>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{job.company}</p>
                  </div>
                  <Badge className={
                    job.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' 
                      : job.status === 'closed'
                      ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                  }>
                    {job.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-slate-400" /> {job.employmentType}</span>
                  {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-slate-400" /> {job.salary}</span>}
                </div>

                <div className="space-y-1.5 pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.map((skill: string) => (
                      <Badge key={skill} className="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
                  {job.description}
                </p>
              </div>

              {/* Actions footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-6">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(job)} className="flex gap-1.5">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(job._id)} className="flex gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creation/Editing Dialog */}
      <Dialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        title={editingJob ? 'Edit Job Opening' : 'Create Job Opening'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Job Title *" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Senior React Developer" 
            required 
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Company *" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)} 
              placeholder="Apex Technologies" 
              required 
            />
            <Input 
              label="Location *" 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="San Francisco, CA" 
              required 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select 
              label="Employment Type" 
              options={empTypeOptions} 
              value={employmentType} 
              onChange={(e) => setEmploymentType(e.target.value)} 
            />
            <Input 
              label="Salary (Optional)" 
              value={salary} 
              onChange={(e) => setSalary(e.target.value)} 
              placeholder="$120k - $140k or Hourly" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Experience Range *" 
              value={experience} 
              onChange={(e) => setExperience(e.target.value)} 
              placeholder="5+ years" 
              required 
            />
            <Input 
              label="Education Requirements *" 
              value={education} 
              onChange={(e) => setEducation(e.target.value)} 
              placeholder="Bachelor in Computer Science" 
              required 
            />
          </div>
          <Input 
            label="Required Skills (Comma separated) *" 
            value={requiredSkills} 
            onChange={(e) => setRequiredSkills(e.target.value)} 
            placeholder="React, TypeScript, Next.js" 
            required 
          />
          <Input 
            label="Preferred Skills (Comma separated)" 
            value={preferredSkills} 
            onChange={(e) => setPreferredSkills(e.target.value)} 
            placeholder="Node.js, AWS, Docker" 
          />
          <Textarea 
            label="Job Description *" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Explain duties, daily responsibilities, and team composition..." 
            required 
          />
          <Select 
            label="Status" 
            options={statusOptions} 
            value={status} 
            onChange={(e) => setStatus(e.target.value)} 
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              {editingJob ? 'Save Changes' : 'Create Opening'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
