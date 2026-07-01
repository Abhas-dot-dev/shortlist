-- Supabase PostgreSQL Schema with Row Level Security (RLS) Policies

-- 1. Users Profile Table (linked to Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('recruiter', 'candidate')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can read their own profiles" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Recruiters can view candidate profiles" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'recruiter'
    )
  );

-- 2. Jobs Table (created by recruiters)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recruiter_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}' NOT NULL,
  preferred_skills TEXT[] DEFAULT '{}' NOT NULL,
  experience_required TEXT,
  education_required TEXT,
  location TEXT,
  employment_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Jobs RLS Policies
CREATE POLICY "Anyone can view active jobs" ON public.jobs
  FOR SELECT USING (status = 'active' OR recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert their own jobs" ON public.jobs
  FOR INSERT WITH CHECK (
    recruiter_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'recruiter'
    )
  );

CREATE POLICY "Recruiters can update their own jobs" ON public.jobs
  FOR UPDATE USING (
    recruiter_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'recruiter'
    )
  );

CREATE POLICY "Recruiters can delete their own jobs" ON public.jobs
  FOR DELETE USING (
    recruiter_id = auth.uid() AND 
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'recruiter'
    )
  );

-- 3. Resumes Table (uploaded by candidates or recruiters on behalf of candidates)
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  resume_url TEXT NOT NULL,
  extracted_text TEXT,
  ai_json JSONB DEFAULT '{}'::jsonb NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resumes RLS Policies
CREATE POLICY "Candidates can read their own resumes" ON public.resumes
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can insert their own resumes" ON public.resumes
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Candidates can update/delete their own resumes" ON public.resumes
  FOR ALL USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view resumes" ON public.resumes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'recruiter'
    )
  );

-- 4. Applications Table (matches candidates to jobs with score cards)
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  recruiter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER DEFAULT 0 NOT NULL,
  strengths TEXT[] DEFAULT '{}' NOT NULL,
  weaknesses TEXT[] DEFAULT '{}' NOT NULL,
  missing_skills TEXT[] DEFAULT '{}' NOT NULL,
  ai_summary TEXT,
  recruiter_notes TEXT DEFAULT '' NOT NULL,
  application_status TEXT DEFAULT 'applied' CHECK (application_status IN ('applied', 'shortlisted', 'rejected')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications RLS Policies
CREATE POLICY "Candidates can view their own applications" ON public.applications
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Candidates can insert applications" ON public.applications
  FOR INSERT WITH CHECK (candidate_id = auth.uid());

CREATE POLICY "Recruiters can view/update applications for their jobs" ON public.applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
    ) OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'recruiter'
    )
  );

-- Triggers to automate syncing users on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role, avatar_url)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Anonymous User'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'candidate'),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
