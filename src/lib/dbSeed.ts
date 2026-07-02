import { supabaseAdmin, isSupabaseConfigured } from './supabase';
import { mockJobs, mockCandidates, mockApplications } from './dummyData';

export async function seedDatabase() {
  if (!isSupabaseConfigured || !supabaseAdmin) {
    console.log('Skipping Supabase seeding because credentials are not configured.');
    return { success: false, message: 'Supabase not connected. Running in session mode.' };
  }

  try {
    console.log('Wiping existing mock accounts from auth.users (keeping user accounts)...');
    const { data: authUsersList } = await supabaseAdmin.auth.admin.listUsers();
    if (authUsersList?.users) {
      for (const u of authUsersList.users) {
        if (u.email && !u.email.includes('abhas')) {
          await supabaseAdmin.auth.admin.deleteUser(u.id);
        }
      }
    }

    console.log('Clearing existing database rows in public schema...');
    
    // Clear in order of dependencies
    const { error: delAppErr } = await supabaseAdmin.from('applications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delAppErr) throw delAppErr;

    const { error: delResumeErr } = await supabaseAdmin.from('resumes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delResumeErr) throw delResumeErr;

    const { error: delJobErr } = await supabaseAdmin.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delJobErr) throw delJobErr;

    const { error: delUserErr } = await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delUserErr) throw delUserErr;

    console.log('Cleared tables. Seeding fresh dataset...');

    // 1. Seed Recruiter profile
    const recruiterEmail = 'recruiter@domain.com';
    let recruiterId = '';
    
    const { data: authRecruiter, error: createRecError } = await supabaseAdmin.auth.admin.createUser({
      email: recruiterEmail,
      password: 'password123',
      email_confirm: true,
      user_metadata: { full_name: 'John Recruiter', role: 'recruiter' }
    });

    if (createRecError) {
      throw new Error(`Failed to create recruiter in auth.users: ${createRecError.message}`);
    }

    if (authRecruiter?.user) {
      recruiterId = authRecruiter.user.id;
    } else {
      throw new Error('Created recruiter auth user was empty.');
    }

    // Force insert recruiter user metadata profile
    const { error: insertRecError } = await supabaseAdmin.from('users').upsert({
      id: recruiterId,
      full_name: 'John Recruiter',
      email: recruiterEmail,
      role: 'recruiter'
    });
    if (insertRecError) throw insertRecError;

    // 2. Seed Candidates
    const candidateUserMap: { [key: string]: string } = {};
    for (const cand of mockCandidates) {
      const { data: authCand, error: createCandError } = await supabaseAdmin.auth.admin.createUser({
        email: cand.email,
        password: 'password123',
        email_confirm: true,
        user_metadata: { full_name: cand.name, role: 'candidate' }
      });

      if (createCandError) {
        throw new Error(`Failed to create candidate ${cand.email} in auth.users: ${createCandError.message}`);
      }

      const candId = authCand?.user?.id;
      if (!candId) {
        throw new Error(`Auth candidate ID was empty for ${cand.email}`);
      }
      candidateUserMap[cand._id] = candId;

      const { error: insertCandError } = await supabaseAdmin.from('users').upsert({
        id: candId,
        full_name: cand.name,
        email: cand.email,
        role: 'candidate'
      });
      if (insertCandError) throw insertCandError;
    }

    // 3. Seed Jobs
    const jobMap: { [key: string]: string } = {};
    for (const job of mockJobs) {
      const { data: dbJob, error: createJobError } = await supabaseAdmin
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

      if (createJobError) throw createJobError;

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

      const { data: dbResume, error: createResumeError } = await supabaseAdmin
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

      if (createResumeError) throw createResumeError;

      if (dbResume) {
        const { error: createAppError } = await supabaseAdmin.from('applications').insert({
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
        if (createAppError) throw createAppError;
      }
    }

    console.log('Seeding completed successfully!');
    return { success: true, message: 'Database seeded successfully' };
  } catch (error: any) {
    console.error('Error seeding database:', error);
    return { success: false, error: error.message };
  }
}
