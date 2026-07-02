-- Run this SQL in your Supabase SQL Editor to create the resume_reviews table and establish correct RLS policies:

-- 1. Create table public.resume_reviews
CREATE TABLE IF NOT EXISTS public.resume_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  candidate_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  overall_score INTEGER NOT NULL,
  ats_score INTEGER NOT NULL,
  grammar_score INTEGER NOT NULL,
  formatting_score INTEGER NOT NULL,
  professionalism_score INTEGER NOT NULL,
  strengths TEXT[] DEFAULT '{}' NOT NULL,
  weaknesses TEXT[] DEFAULT '{}' NOT NULL,
  missing_keywords TEXT[] DEFAULT '{}' NOT NULL,
  improvements TEXT[] DEFAULT '{}' NOT NULL,
  career_suggestions JSONB DEFAULT '{}'::jsonb NOT NULL,
  improved_summary TEXT NOT NULL,
  interview_probability INTEGER DEFAULT 50 NOT NULL,
  shortlist_probability INTEGER DEFAULT 50 NOT NULL,
  technical_questions TEXT[] DEFAULT '{}' NOT NULL,
  hr_questions TEXT[] DEFAULT '{}' NOT NULL,
  project_questions TEXT[] DEFAULT '{}' NOT NULL,
  raw_ai_response JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_resume_reviews_candidate_id ON public.resume_reviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_resume_reviews_resume_id ON public.resume_reviews(resume_id);

-- 3. Enable Row Level Security
ALTER TABLE public.resume_reviews ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Candidates can read their own resume reviews" ON public.resume_reviews;
DROP POLICY IF EXISTS "Candidates can insert their own resume reviews" ON public.resume_reviews;
DROP POLICY IF EXISTS "Candidates can update their own resume reviews" ON public.resume_reviews;
DROP POLICY IF EXISTS "Recruiters can read reviews of applied candidates" ON public.resume_reviews;
DROP POLICY IF EXISTS "Allow insertions into resume reviews" ON public.resume_reviews;

-- 5. Define SELECT policies
CREATE POLICY "Candidates can read their own resume reviews" ON public.resume_reviews
  FOR SELECT USING (candidate_id = auth.uid());

CREATE POLICY "Recruiters can read reviews of applied candidates" ON public.resume_reviews
  FOR SELECT USING (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'recruiter' AND
    EXISTS (
      SELECT 1 FROM public.applications
      WHERE applications.candidate_id = resume_reviews.candidate_id AND applications.recruiter_id = auth.uid()
    )
  );

-- 6. Define INSERT policies (Candidates can insert their own, Service Role key bypasses RLS)
CREATE POLICY "Candidates can insert their own resume reviews" ON public.resume_reviews
  FOR INSERT WITH CHECK (candidate_id = auth.uid() OR auth.uid() IS NULL);

-- 7. Define UPDATE policies
CREATE POLICY "Candidates can update their own resume reviews" ON public.resume_reviews
  FOR UPDATE USING (candidate_id = auth.uid());

-- 8. Define DELETE policies
CREATE POLICY "Candidates can delete their own resume reviews" ON public.resume_reviews
  FOR DELETE USING (candidate_id = auth.uid());
