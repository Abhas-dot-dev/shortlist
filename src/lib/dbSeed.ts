import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { mockJobs, mockCandidates, mockApplications } from './dummyData';

export async function seedDatabase() {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    console.log('Skipping Supabase seeding because credentials are not configured.');
    return { success: false, message: 'Supabase not connected. Running in session mode.' };
  }

  try {
    console.log('Clearing existing database rows in public schema...');
    
    // Clear in order of dependencies
    await supabaseAdmin.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('resumes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    console.log('Cleared tables. Seeding fresh dataset...');

    // 1. Seed Recruiter profile
    // We create recruiter via auth admin to let trigger/policies handle it
    const recruiterEmail = 'recruiter@domain.com';
    let recruiterId = '';
    
    const { data: authRecruiter } = await supabaseAdmin.auth.admin.createUser({
      email: recruiterEmail,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'John Recruiter', role: 'recruiter' }
    });

    if (authRecruiter?.user) {
      recruiterId = authRecruiter.user.id;
    } else {
      // Fallback direct insert if user exists
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', recruiterEmail)
        .maybeSingle();
      recruiterId = existing?.id || crypto.randomUUID();
    }

    // Force insert recruiter user metadata profile
    await supabaseAdmin.from('users').upsert({
      id: recruiterId,
      full_name: 'John Recruiter',
      email: recruiterEmail,
      role: 'recruiter'
    });

    // 2. Seed Candidates
    const candidateUserMap: { [key: string]: string } = {};
    for (const cand of mockCandidates) {
      const { data: authCand } = await supabaseAdmin.auth.admin.createUser({
        email: cand.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: cand.name, role: 'candidate' }
      });

      const candId = authCand?.user?.id || crypto.randomUUID();
      candidateUserMap[cand._id] = candId;

      await supabaseAdmin.from('users').upsert({
        id: candId,
        full_name: cand.name,
        email: cand.email,
        role: 'candidate'
      });
    }

    // 3. Seed Jobs
    const jobMap: { [key: string]: string } = {};
    for (const job of mockJobs) {
      const { data: dbJob, error } = await supabaseAdmin
        .from('jobs')
        .insert({
          recruiter_id: recruiterId,
          title: job.title,
          description: job.description,
          required_skills: job.requiredSkills,
          preferred_skills: job.preferredSkills,
          experience_required: job.experience,
          education_required: job.education,
          location: job.location,
          employment_type: job.employmentType,
          status: job.status,
        })
        .select()
        .single();

      if (dbJob) {
        jobMap[job._id] = dbJob.id;
      }
    }

    // 4. Seed Resumes and Applications
    for (const app of mockApplications) {
      const candidateId = candidateUserMap[app.candidateId];
      const jobId = jobMap[app.jobId];
      if (!candidateId || !jobId) continue;

      const mockCandInfo = mockCandidates.find(c => c._id === app.candidateId);

      const { data: dbResume } = await supabaseAdmin
        .from('resumes')
        .insert({
          candidate_id: candidateId,
          resume_url: 'https://res.cloudinary.com/demo/image/upload/v123456/sample_resume.pdf',
          extracted_text: mockCandInfo?.experience || '',
          ai_json: {
            candidateName: mockCandInfo?.name,
            email: mockCandInfo?.email,
            phone: mockCandInfo?.phone || '+1 (555) 000-0000',
            experience: mockCandInfo?.experience || '',
            education: mockCandInfo?.education || '',
            skills: mockCandInfo?.skills || [],
            projects: mockCandInfo?.projects || [],
            certifications: mockCandInfo?.certifications || [],
            summary: mockCandInfo?.summary || '',
          }
        })
        .select()
        .single();

      if (dbResume) {
        await supabaseAdmin.from('applications').insert({
          candidate_id: candidateId,
          recruiter_id: recruiterId,
          job_id: jobId,
          resume_id: dbResume.id,
          match_score: app.matchScore,
          strengths: app.aiAnalysis.strengths,
          weaknesses: app.aiAnalysis.weaknesses,
          missing_skills: app.aiAnalysis.missingSkills,
          ai_summary: app.aiAnalysis.summary,
          recruiter_notes: app.recruiterNotes,
          application_status: app.status,
        });
      }
    }

    console.log('Seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
}
