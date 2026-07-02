import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured, verifyTableExists } from '@/lib/supabase';
import { GeminiProvider } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const candidateId = searchParams.get('candidateId');
    const resumeId = searchParams.get('resumeId');

    if (!candidateId) {
      return NextResponse.json({ error: 'candidateId parameter is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const { exists } = await verifyTableExists('resume_reviews');
      if (!exists) {
        return NextResponse.json({
          error: "Database schema is incomplete.",
          missing_table: "resume_reviews",
          solution: "Run supabase_reviews_migration.sql inside the Supabase SQL Editor."
        }, { status: 500 });
      }

      let query = supabaseAdmin
        .from('resume_reviews')
        .select(`
          *,
          resumes (
            id,
            resume_url,
            uploaded_at
          )
        `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (resumeId) {
        query = query.eq('resume_id', resumeId);
      }

      const { data: reviews, error } = await query;
      if (error) throw error;

      return NextResponse.json({ success: true, reviews });
    }

    // Fallback Mock Review data
    const mockReview = getMockReview(resumeId || 'mock_resume_1', candidateId);
    return NextResponse.json({ success: true, reviews: [mockReview] });
  } catch (error: any) {
    console.error('[ReviewAPI] GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { resumeId, candidateId } = await req.json();

    if (!resumeId || !candidateId) {
      return NextResponse.json({ error: 'Please provide resumeId and candidateId' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      const { exists } = await verifyTableExists('resume_reviews');
      if (!exists) {
        return NextResponse.json({
          error: "Database schema is incomplete.",
          missing_table: "resume_reviews",
          solution: "Run supabase_reviews_migration.sql inside the Supabase SQL Editor."
        }, { status: 500 });
      }

      // 1. Check if review already exists
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('resume_reviews')
        .select('*')
        .eq('resume_id', resumeId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (existing) {
        return NextResponse.json({ success: true, review: existing });
      }

      // 2. Fetch the resume text
      const { data: resume, error: fetchResumeError } = await supabaseAdmin
        .from('resumes')
        .select('extracted_text')
        .eq('id', resumeId)
        .single();

      if (fetchResumeError) throw fetchResumeError;
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }

      // 3. Generate review with Gemini
      const gemini = new GeminiProvider();
      const reviewResult = await gemini.generateResumeReview(resume.extracted_text || '');

      // 4. Save review in Supabase
      const { data: savedReview, error: saveError } = await supabaseAdmin
        .from('resume_reviews')
        .insert({
          resume_id: resumeId,
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

      return NextResponse.json({ success: true, review: savedReview });
    }

    // Fallback Mock Review creation
    const mockReview = getMockReview(resumeId, candidateId);
    return NextResponse.json({ success: true, review: mockReview });
  } catch (error: any) {
    console.error('[ReviewAPI] POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getMockReview(resumeId: string, candidateId: string) {
  return {
    id: 'mock_review_id',
    resume_id: resumeId,
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
    created_at: new Date().toISOString(),
  };
}
