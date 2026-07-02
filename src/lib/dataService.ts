import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { mockJobs, mockCandidates, mockApplications } from './dummyData';
import { GeminiProvider } from './ai/gemini';

// Global in-memory storage for mock fallback
let inMemoryJobs = [...mockJobs];
let inMemoryCandidates = [...mockCandidates];
let inMemoryApplications = [...mockApplications];

export async function getJobs() {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(j => ({
        ...j,
        requiredSkills: j.required_skills || [],
        preferredSkills: j.preferred_skills || [],
        experience: j.experience_required,
        education: j.education_required,
        employmentType: j.employment_type,
        _id: j.id, // preserve compatibility
      }));
    } catch (e) {
      console.warn('Supabase error fetching jobs, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  return [...inMemoryJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getJobById(id: string) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        return {
          ...data,
          requiredSkills: data.required_skills || [],
          preferredSkills: data.preferred_skills || [],
          experience: data.experience_required,
          education: data.education_required,
          employmentType: data.employment_type,
          _id: data.id,
        };
      }
    } catch (e) {
      console.warn('Supabase error fetching job by id, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  return inMemoryJobs.find((j) => j._id === id) || null;
}

export async function createJob(jobData: any, recruiterId: string = '') {
  let resolvedRecruiterId = recruiterId || 'recruiter_default';
  
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      if (!recruiterId || recruiterId === 'recruiter_default') {
        // Query for a default recruiter to link job opening
        const { data: firstRecruiter } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('role', 'recruiter')
          .limit(1)
          .maybeSingle();
        
        if (firstRecruiter) {
          resolvedRecruiterId = firstRecruiter.id;
        } else {
          // Create a placeholder recruiter to satisfy foreign key constraints
          const tempRecruiterId = crypto.randomUUID();
          await supabaseAdmin.from('users').insert({
            id: tempRecruiterId,
            full_name: 'System Default Recruiter',
            email: 'default_recruiter@domain.com',
            role: 'recruiter',
          });
          resolvedRecruiterId = tempRecruiterId;
        }
      }

      const { data, error } = await supabaseAdmin
        .from('jobs')
        .insert({
          recruiter_id: resolvedRecruiterId,
          title: jobData.title,
          description: jobData.description,
          required_skills: jobData.requiredSkills || [],
          preferred_skills: jobData.preferredSkills || [],
          experience_required: jobData.experience,
          education_required: jobData.education,
          location: jobData.location,
          employment_type: jobData.employmentType,
          status: jobData.status || 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        requiredSkills: data.required_skills || [],
        preferredSkills: data.preferred_skills || [],
        experience: data.experience_required,
        education: data.education_required,
        employmentType: data.employment_type,
        _id: data.id,
      };
    } catch (e) {
      console.warn('Supabase error creating job, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  const newJob = {
    _id: `job_${Math.random().toString(36).substring(2, 9)}`,
    ...jobData,
    status: jobData.status || 'active',
    createdAt: new Date().toISOString(),
  };
  inMemoryJobs.push(newJob);
  return newJob;
}

export async function updateJob(id: string, jobData: any) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .update({
          title: jobData.title,
          description: jobData.description,
          required_skills: jobData.requiredSkills,
          preferred_skills: jobData.preferredSkills,
          experience_required: jobData.experience,
          education_required: jobData.education,
          location: jobData.location,
          employment_type: jobData.employmentType,
          status: jobData.status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        requiredSkills: data.required_skills || [],
        preferredSkills: data.preferred_skills || [],
        experience: data.experience_required,
        education: data.education_required,
        employmentType: data.employment_type,
        _id: data.id,
      };
    } catch (e) {
      console.warn('Supabase error updating job, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  const idx = inMemoryJobs.findIndex((j) => j._id === id);
  if (idx !== -1) {
    inMemoryJobs[idx] = { ...inMemoryJobs[idx], ...jobData };
    return inMemoryJobs[idx];
  }
  return null;
}

export async function deleteJob(id: string) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { error } = await supabaseAdmin
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase error deleting job, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  inMemoryJobs = inMemoryJobs.filter((j) => j._id !== id);
  inMemoryApplications = inMemoryApplications.filter((a) => a.jobId !== id);
  return true;
}

export async function getCandidates(filters: {
  search?: string;
  jobId?: string;
  experience?: string;
  skills?: string;
  education?: string;
  score?: string;
  sort?: string;
} = {}) {
  let apps: any[] = [];
  
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          users!applications_candidate_id_fkey(*),
          jobs(*),
          resumes(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      apps = data.map((a: any) => ({
        _id: a.id,
        jobId: a.job_id,
        candidateId: a.candidate_id,
        resumeId: a.resume_id,
        matchScore: a.match_score,
        status: a.application_status,
        recruiterNotes: a.recruiter_notes,
        aiAnalysis: {
          strengths: a.strengths || [],
          weaknesses: a.weaknesses || [],
          missingSkills: a.missing_skills || [],
          summary: a.ai_summary || '',
        },
        createdAt: a.created_at,
        candidateDetails: a.users ? {
          _id: a.users.id,
          name: a.users.full_name,
          email: a.users.email,
          phone: a.resumes?.ai_json?.phone || '+1 (555) 000-0000',
          experience: a.resumes?.ai_json?.experience || '',
          education: a.resumes?.ai_json?.education || '',
          skills: a.resumes?.ai_json?.skills || [],
          projects: a.resumes?.ai_json?.projects || [],
          certifications: a.resumes?.ai_json?.certifications || [],
          summary: a.resumes?.ai_json?.summary || '',
        } : undefined,
        jobDetails: a.jobs ? {
          _id: a.jobs.id,
          title: a.jobs.title,
          company: 'Apex Technologies', // fallback label
          location: a.jobs.location,
          employmentType: a.jobs.employment_type,
          experience: a.jobs.experience_required,
          education: a.jobs.education_required,
          requiredSkills: a.jobs.required_skills || [],
          preferredSkills: a.jobs.preferred_skills || [],
          status: a.jobs.status,
        } : undefined
      }));
    } catch (e) {
      console.warn('Supabase error fetching applications, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }

  // Fallback to memory
  if (apps.length === 0 && !isSupabaseConfigured) {
    apps = inMemoryApplications.map((app) => {
      const candidateDetails = inMemoryCandidates.find((c) => c._id === app.candidateId);
      const jobDetails = inMemoryJobs.find((j) => j._id === app.jobId);
      return {
        ...app,
        candidateDetails,
        jobDetails,
      };
    });
  }

  // Filters logic
  if (filters.jobId && filters.jobId !== 'all') {
    apps = apps.filter((a) => a.jobId === filters.jobId);
  }
  if (filters.search) {
    const s = filters.search.toLowerCase();
    apps = apps.filter(
      (a) =>
        a.candidateDetails?.name.toLowerCase().includes(s) ||
        a.candidateDetails?.email.toLowerCase().includes(s) ||
        a.candidateDetails?.skills.some((sk: string) => sk.toLowerCase().includes(s))
    );
  }
  if (filters.experience && filters.experience !== 'all') {
    apps = apps.filter((a) => {
      const expStr = a.candidateDetails?.experience?.toLowerCase() || '';
      const numMatch = expStr.match(/\d+/);
      const years = numMatch ? parseInt(numMatch[0]) : 0;
      if (filters.experience === '0-2') return years <= 2;
      if (filters.experience === '3-5') return years > 2 && years <= 5;
      if (filters.experience === '5+') return years > 5;
      return true;
    });
  }
  if (filters.score && filters.score !== 'all') {
    apps = apps.filter((a) => {
      const s = a.matchScore;
      if (filters.score === '80+') return s >= 80;
      if (filters.score === '60-79') return s >= 60 && s < 80;
      if (filters.score === 'under60') return s < 60;
      return true;
    });
  }

  // Sorting
  if (filters.sort === 'highest') {
    apps.sort((a, b) => b.matchScore - a.matchScore);
  } else if (filters.sort === 'lowest') {
    apps.sort((a, b) => a.matchScore - b.matchScore);
  } else if (filters.sort === 'oldest') {
    apps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } else {
    apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return apps;
}

export async function getCandidateById(id: string) {
  const apps = await getCandidates();
  return apps.find((a) => a._id === id) || null;
}

export async function updateApplicationStatus(id: string, status: 'applied' | 'shortlisted' | 'rejected') {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .update({ application_status: status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase error updating status, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  const idx = inMemoryApplications.findIndex((a) => a._id === id);
  if (idx !== -1) {
    inMemoryApplications[idx].status = status;
    return inMemoryApplications[idx];
  }
  return null;
}

export async function updateApplicationNotes(id: string, notes: string) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .update({ recruiter_notes: notes })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      console.warn('Supabase error updating notes, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  const idx = inMemoryApplications.findIndex((a) => a._id === id);
  if (idx !== -1) {
    inMemoryApplications[idx].recruiterNotes = notes;
    return inMemoryApplications[idx];
  }
  return null;
}

export async function deleteCandidate(id: string) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data: app } = await supabaseAdmin
        .from('applications')
        .select('resume_id')
        .eq('id', id)
        .single();

      if (app) {
        await supabaseAdmin.from('resumes').delete().eq('id', app.resume_id);
      }
      
      const { error } = await supabaseAdmin
        .from('applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase error deleting candidate, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }
  const app = inMemoryApplications.find((a) => a._id === id);
  if (app) {
    inMemoryCandidates = inMemoryCandidates.filter((c) => c._id !== app.candidateId);
  }
  inMemoryApplications = inMemoryApplications.filter((a) => a._id !== id);
  return true;
}

export async function createApplicationFromAnalysis(
  jobId: string, 
  analysis: any, 
  fileName: string, 
  resumeUrl: string = 'https://res.cloudinary.com/demo/image/upload/v123456/sample_resume.pdf',
  extractedText: string = ''
) {
  const name = analysis.candidateName || 'Unknown Candidate';
  const email = analysis.email || `candidate_${Math.random().toString(36).substring(2, 6)}@domain.com`;
  const phone = analysis.phone || '+1 (555) 000-0000';
  const experience = analysis.experience || 'Not specified';
  const education = analysis.education || 'Not specified';
  const skills = analysis.skills || [];
  const projects = analysis.projects || [];
  const certifications = analysis.certifications || [];
  const summary = analysis.summary || '';
  const matchScore = analysis.overallMatchScore || 70;

  const strengths = analysis.strengths || ['Good technical background'];
  const weaknesses = analysis.weaknesses || ['Could detail projects further'];
  const missingSkills = analysis.missingSkills || [];

  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // Find or create User profile in public.users
      let candidateId = '';
      const { data: userProfile } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userProfile) {
        candidateId = userProfile.id;
      } else {
        // Create user placeholder inside auth.users and public.users will sync via trigger
        // For bypass trigger or direct insertion if trigger is not ready:
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password: 'PasswordDemo123',
          email_confirm: true,
          user_metadata: { full_name: name, role: 'candidate' }
        });

        if (authUser?.user) {
          candidateId = authUser.user.id;
        } else {
          // If auth creation fails, insert directly into public.users
          const tempId = crypto.randomUUID();
          const { data: directProfile } = await supabaseAdmin
            .from('users')
            .insert({
              id: tempId,
              full_name: name,
              email,
              role: 'candidate',
            })
            .select()
            .single();
          candidateId = directProfile?.id || tempId;
        }
      }

      // Query for the job recruiter_id to link
      const { data: targetJob } = await supabaseAdmin
        .from('jobs')
        .select('recruiter_id')
        .eq('id', jobId)
        .maybeSingle();
      
      const recruiterId = targetJob?.recruiter_id || null;

      // Insert Resume record
      const { data: dbResume, error: resumeError } = await supabaseAdmin
        .from('resumes')
        .insert({
          candidate_id: candidateId,
          resume_url: resumeUrl,
          extracted_text: extractedText || experience,
          ai_json: {
            candidateName: name,
            email,
            phone,
            experience,
            education,
            skills,
            projects,
            certifications,
            summary,
          }
        })
        .select()
        .single();

      if (resumeError) throw resumeError;

      // Insert Application record
      const { data: dbApp, error: appError } = await supabaseAdmin
        .from('applications')
        .insert({
          candidate_id: candidateId,
          recruiter_id: recruiterId,
          job_id: jobId,
          resume_id: dbResume.id,
          match_score: matchScore,
          strengths,
          weaknesses,
          missing_skills: missingSkills,
          ai_summary: summary,
          application_status: 'applied',
        })
        .select()
        .single();

      if (appError) throw appError;
      return {
        _id: dbApp.id,
      };
    } catch (e) {
      console.warn('Supabase error creating application, using memory fallback:', e);
      if (isSupabaseConfigured) throw e;
    }
  }

  // Memory Fallback
  const candidateId = `cand_${Math.random().toString(36).substring(2, 9)}`;
  const resumeId = `res_${Math.random().toString(36).substring(2, 9)}`;
  const applicationId = `app_${Math.random().toString(36).substring(2, 9)}`;

  const newCandidate = {
    _id: candidateId,
    name,
    email,
    phone,
    role: 'candidate' as const,
    experience,
    education,
    skills,
    projects,
    certifications,
    summary,
  };
  inMemoryCandidates.push(newCandidate);

  const newApplication = {
    _id: applicationId,
    jobId,
    candidateId,
    resumeId,
    matchScore,
    status: 'applied' as const,
    recruiterNotes: '',
    aiAnalysis: {
      strengths,
      weaknesses,
      missingSkills,
      summary,
    },
    createdAt: new Date().toISOString(),
  };
  inMemoryApplications.push(newApplication);

  return newApplication;
}

export async function getDashboardStats() {
  const jobs = await getJobs();
  const candidates = await getCandidates();

  const totalJobs = jobs.length;
  const totalCandidates = candidates.length;
  const shortlisted = candidates.filter((c) => c.status === 'shortlisted').length;
  const rejected = candidates.filter((c) => c.status === 'rejected').length;
  const applied = candidates.filter((c) => c.status === 'applied').length;
  
  const totalScore = candidates.reduce((acc, c) => acc + c.matchScore, 0);
  const averageMatchScore = totalCandidates > 0 ? Math.round(totalScore / totalCandidates) : 0;

  const recentActivity = candidates
    .slice(0, 5)
    .map((c) => ({
      id: c._id,
      candidateName: c.candidateDetails?.name || 'Candidate',
      jobTitle: c.jobDetails?.title || 'Job Opening',
      matchScore: c.matchScore,
      status: c.status,
      time: c.createdAt,
    }));

  // Aggregate Status Distribution
  const shortlistedVsRejected = [
    { name: 'Shortlisted', value: shortlisted, color: '#10b981' },
    { name: 'Applied', value: applied, color: '#3b82f6' },
    { name: 'Rejected', value: rejected, color: '#ef4444' },
  ];

  // Aggregate Experience Distribution
  let exp0_2 = 0;
  let exp3_5 = 0;
  let exp5Plus = 0;
  for (const c of candidates) {
    const expStr = c.candidateDetails?.experience?.toLowerCase() || '';
    const numMatch = expStr.match(/\d+/);
    const years = numMatch ? parseInt(numMatch[0]) : 0;
    if (years <= 2) exp0_2++;
    else if (years <= 5) exp3_5++;
    else exp5Plus++;
  }
  const experienceDistribution = [
    { name: '0-2 years', count: exp0_2 },
    { name: '3-5 years', count: exp3_5 },
    { name: '5+ years', count: exp5Plus },
  ];

  // Aggregate Top Skills
  const skillCounts: { [key: string]: number } = {};
  for (const c of candidates) {
    const skills = c.candidateDetails?.skills || [];
    for (const s of skills) {
      const normalized = s.trim();
      if (!normalized) continue;
      skillCounts[normalized] = (skillCounts[normalized] || 0) + 1;
    }
  }
  const topSkills = Object.entries(skillCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Aggregate applications per day over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const applicationsOverTime = last7Days.map((date) => {
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
    const count = candidates.filter((c) => {
      const appDate = new Date(c.createdAt);
      return appDate.toDateString() === date.toDateString();
    }).length;
    return { date: dateStr, count };
  });

  return {
    totalJobs,
    totalCandidates,
    shortlisted,
    averageMatchScore,
    recentActivity,
    charts: {
      applicationsOverTime,
      topSkills,
      experienceDistribution,
      shortlistedVsRejected,
    }
  };
}

export async function saveResumeAndReview(
  candidateId: string,
  resumeUrl: string,
  extractedText: string,
  analysis: any
) {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      // 1. Insert Resume record
      const { data: dbResume, error: resumeError } = await supabaseAdmin
        .from('resumes')
        .insert({
          candidate_id: candidateId,
          resume_url: resumeUrl,
          extracted_text: extractedText,
          ai_json: analysis,
        })
        .select()
        .single();

      if (resumeError) throw resumeError;

      // 2. Generate review with Gemini
      const gemini = new GeminiProvider();
      const reviewResult = await gemini.generateResumeReview(extractedText);

      // 3. Save review in Supabase
      const { data: savedReview, error: saveError } = await supabaseAdmin
        .from('resume_reviews')
        .insert({
          resume_id: dbResume.id,
          candidate_id: candidateId,
          overall_score: reviewResult.overallScore,
          ats_score: reviewResult.atsScore,
          grammar_score: reviewResult.grammarScore,
          formatting_score: reviewResult.formattingScore,
          professionalism_score: reviewResult.professionalismScore,
          strengths: reviewResult.strengths,
          weaknesses: reviewResult.weaknesses,
          missing_keywords: reviewResult.missingKeywords,
          improvements: reviewResult.improvements,
          career_suggestions: reviewResult.careerSuggestions,
          improved_summary: reviewResult.improvedSummary,
          interview_probability: reviewResult.interviewProbability,
          shortlist_probability: reviewResult.shortlistProbability,
          technical_questions: reviewResult.technicalQuestions,
          hr_questions: reviewResult.hrQuestions,
          project_questions: reviewResult.projectQuestions,
          raw_ai_response: reviewResult, // save all parsed rich details inside JSONB
        })
        .select()
        .single();

      if (saveError) throw saveError;

      return {
        resume: dbResume,
        review: savedReview
      };
    } catch (e) {
      console.error('[saveResumeAndReview] Error:', e);
      if (isSupabaseConfigured) throw e;
    }
  }

  // Mock Fallback
  return {
    resume: { id: 'mock_resume_id', resume_url: resumeUrl },
    review: {
      id: 'mock_review_id',
      resume_id: 'mock_resume_id',
      candidate_id: candidateId,
      overall_score: 85,
      ats_score: 80,
      grammar_score: 90,
      formatting_score: 75,
      professionalism_score: 85,
      strengths: ['Strong technical summary', 'Quantified project achievements'],
      weaknesses: ['Missing certification details', 'Few emerging cloud tools'],
      missing_keywords: ['Kubernetes', 'CI/CD', 'Terraform'],
      improvements: ['Include AWS Cloud credentials', 'Structure portfolio link'],
      career_suggestions: {
        jobRoles: ['Frontend Engineer', 'Next.js developer'],
        careerPaths: ['Senior Developer', 'Architect'],
        technologiesToLearn: ['Docker', 'Kubernetes'],
        certifications: ['AWS Cloud Practitioner'],
        projectsToBuild: ['Real-time dashboard application'],
      },
      improvedSummary: 'A highly motivated Software Engineer with 6 years of expertise in designing and maintaining user interfaces using React, TypeScript, and Next.js...',
      interview_probability: 75,
      shortlist_probability: 80,
      technical_questions: ['Explain the diffing algorithm of React.', 'What are the main benefits of TypeScript interfaces over types?'],
      hr_questions: ['Tell me about a time you handled conflict in a team.', 'Why do you want to join our organization?'],
      project_questions: ['How did you measure the performance improvement in your frontend canvas project?'],
      raw_ai_response: {
        skillsAnalysis: {
          strongSkills: ['React', 'TypeScript', 'TailwindCSS'],
          moderateSkills: ['Node.js', 'Jest'],
          missingIndustrySkills: ['Docker', 'GraphQL'],
          emergingSkillsToLearn: ['Next.js App Router', 'Server Actions']
        },
        projectAnalysis: [
          {
            title: 'ATS Resume Parser',
            projectScore: 88,
            businessImpact: 'High business value by automating candidate screening',
            technicalComplexity: 'Medium complexity integrating Gemini AI API',
            resumeValue: 'Shows practical capability implementing AI SDKs',
            improvementSuggestions: 'Elaborate on the error retries mechanism'
          }
        ],
        experienceAnalysis: {
          experienceQuality: 'Strong developer pedigree with 6+ years specializing in UI frameworks',
          careerProgression: 'Clear advancement from developer to lead designer roles',
          leadership: 'Mentored 3 junior devs and led agile sprint retrospectives',
          ownership: 'Shipped core widgets used by 50k+ daily active users',
          impact: 'Reduced page loading times by 40% using code-splitting methods'
        },
        atsReview: {
          missingKeywords: ['Docker', 'AWS'],
          poorHeadings: [],
          weakBulletPoints: [],
          tooLong: false,
          tooShort: false,
          missingContactInfo: false,
          missingGithub: false,
          missingLinkedin: false,
          missingPortfolio: true
        },
        grammarReview: {
          grammarErrors: [],
          spellingErrors: [],
          weakSentences: [],
          passiveVoice: [],
          repetitiveWording: []
        },
        recruiterPerspective: {
          wouldReadFurther: 'Yes, strong visual experience matching job criteria.',
          wouldRejectImmediately: 'No immediate red flags detected.',
          estimatedInterviewProbability: 75,
          estimatedShortlistProbability: 80
        }
      },
      created_at: new Date().toISOString()
    }
  };
}
