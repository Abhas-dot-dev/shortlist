-- Run this complete RLS policy and recursion fix script in your Supabase SQL Editor:

-- 1. Drop existing recursive policies
DROP POLICY IF EXISTS "Recruiters can view candidate profiles" ON public.users;
DROP POLICY IF EXISTS "Recruiters can insert their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters can update their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters can delete their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Recruiters can view resumes" ON public.resumes;
DROP POLICY IF EXISTS "Recruiters can view/update applications for their jobs" ON public.applications;
DROP POLICY IF EXISTS "Allow profile insertion during registration" ON public.users;

-- 2. Add non-recursive SELECT and INSERT policies for public.users using JWT metadata
CREATE POLICY "Recruiters can view candidate profiles" ON public.users
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter'
  );

CREATE POLICY "Allow profile insertion during registration" ON public.users
  FOR INSERT WITH CHECK (true);

-- 3. Update jobs policies to use JWT metadata instead of recursive queries
CREATE POLICY "Recruiters can insert their own jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    recruiter_id = auth.uid() AND 
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter'
  );

CREATE POLICY "Recruiters can update their own jobs" ON public.jobs
  FOR UPDATE USING (
    recruiter_id = auth.uid() AND 
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter'
  );

CREATE POLICY "Recruiters can delete their own jobs" ON public.jobs
  FOR DELETE USING (
    recruiter_id = auth.uid() AND 
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter'
  );

-- 4. Update resumes policy
CREATE POLICY "Recruiters can view resumes" ON public.resumes
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter'
  );

-- 5. Update applications policy
CREATE POLICY "Recruiters can view/update applications for their jobs" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
    ) OR (
      coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter'
    )
  );
