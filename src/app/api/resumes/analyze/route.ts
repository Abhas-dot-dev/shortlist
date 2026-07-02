import { NextResponse } from 'next/server';
import { parseResume } from '@/lib/parser';
import { storageProvider } from '@/lib/storage';
import { aiProvider } from '@/lib/ai';
import { getJobById, createApplicationFromAnalysis } from '@/lib/dataService';
import { verifyTableExists, isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase';
import { GeminiProvider } from '@/lib/ai/gemini';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  // Runtime environment verification
  console.log('Runtime Env Check:', {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
    CLOUDINARY_CLOUD_NAME: !!process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: !!process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: !!process.env.CLOUDINARY_API_SECRET,
  });

  let formData: FormData;
  let file: File | null = null;
  let jobId: string | null = null;
  let candidateId: string | null = null;
  
  // 1. Request received
  try {
    console.log('→ Starting stage: Request received');
    formData = await req.formData();
    console.log('✓ Request received');
  } catch (error: any) {
    console.error('✗ Request received failed:', error);
    return NextResponse.json({
      stage: 'Request received',
      message: error.message || 'Failed to read request form data.',
      stack: error.stack || '',
      details: 'Failed at the very beginning of request processing.'
    }, { status: 500 });
  }

  // 2. File validation
  try {
    console.log('→ Starting stage: File validation');
    file = formData.get('file') as File | null;
    jobId = formData.get('jobId') as string | null;
    candidateId = formData.get('candidateId') as string | null;

    if (!file) {
      throw new Error('No file uploaded in the request.');
    }
    console.log('✓ File validation');
  } catch (error: any) {
    console.error('✗ File validation failed:', error);
    return NextResponse.json({
      stage: 'File validation',
      message: error.message,
      stack: error.stack || '',
      details: 'Form data parsed, but file was missing or invalid.'
    }, { status: 500 });
  }

  const fileName = file.name;
  const fileMime = file.type;

  // 3. Buffer creation
  let fileBuffer: Buffer;
  try {
    console.log('→ Starting stage: Buffer creation');
    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
    console.log('✓ Buffer creation');
  } catch (error: any) {
    console.error('✗ Buffer creation failed:', error);
    return NextResponse.json({
      stage: 'Buffer creation',
      message: error.message,
      stack: error.stack || '',
      details: 'Failed to convert file arrayBuffer into a Node.js Buffer.'
    }, { status: 500 });
  }

  // 4. PDF/DOCX parsing
  let extractedText = '';
  try {
    console.log('→ Starting stage: PDF/DOCX parsing');
    extractedText = await parseResume(fileBuffer, fileMime);
    console.log('✓ PDF/DOCX parsing');
  } catch (error: any) {
    console.error('✗ PDF/DOCX parsing failed:', error);
    return NextResponse.json({
      stage: 'PDF/DOCX parsing',
      message: error.message,
      stack: error.stack || '',
      details: `Failed while parsing file of type ${fileMime}.`
    }, { status: 500 });
  }

  // 5. Storage provider initialization
  try {
    console.log('→ Starting stage: Storage provider initialization');
    if (!storageProvider) {
      throw new Error('storageProvider resolved to null or undefined.');
    }
    console.log('✓ Storage provider initialization');
  } catch (error: any) {
    console.error('✗ Storage provider initialization failed:', error);
    return NextResponse.json({
      stage: 'Storage provider initialization',
      message: error.message,
      stack: error.stack || '',
      details: 'Failed to initialize local or Cloudinary storage provider.'
    }, { status: 500 });
  }

  // 6. Cloudinary upload
  let resumeUrl = '';
  try {
    console.log('→ Starting stage: Cloudinary upload');
    resumeUrl = await storageProvider.uploadResume(fileBuffer, fileName, fileMime);
    console.log('✓ Cloudinary upload');
  } catch (error: any) {
    console.error('✗ Cloudinary upload failed:', error);
    return NextResponse.json({
      stage: 'Cloudinary upload',
      message: error.message,
      stack: error.stack || '',
      details: `Failed to upload file using storage provider. Target filename: ${fileName}`
    }, { status: 500 });
  }

  // 7. Gemini request
  let analysis: any = null;
  let matchResult: any = null;
  try {
    console.log('→ Starting stage: Gemini request');
    analysis = await aiProvider.analyzeResume(extractedText || fileName);
    
    if (jobId) {
      const jobDetails = await getJobById(jobId);
      if (!jobDetails) {
        throw new Error(`Job opening with ID ${jobId} was not found.`);
      }
      matchResult = await aiProvider.matchResume(analysis, {
        title: jobDetails.title,
        description: jobDetails.description,
        requiredSkills: jobDetails.requiredSkills,
        preferredSkills: jobDetails.preferredSkills,
        experienceRequired: jobDetails.experience,
        educationRequired: jobDetails.education,
      });
    }
    console.log('✓ Gemini request');
  } catch (error: any) {
    console.error('✗ Gemini request failed:', error);
    return NextResponse.json({
      stage: 'Gemini request',
      message: error.message,
      stack: error.stack || '',
      details: 'Failed while calling Gemini API to extract data or match against job.'
    }, { status: 500 });
  }

  // Merge analysis & match result
  const finalReport = {
    ...analysis,
    ...(matchResult || {
      overallMatchScore: 0,
      skillMatchScore: 0,
      experienceMatchScore: 0,
      educationMatchScore: 0,
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      recruiterRecommendation: 'No job matching requested.',
      interviewRecommendation: '',
      confidenceScore: 100,
    }),
  };

  // 8. Supabase insert
  let dbResume: any = null;
  let savedResumeId: string | null = null;
  try {
    console.log('→ Starting stage: Supabase insert');
    if (candidateId && isSupabaseConfigured && supabaseAdmin) {
      const { exists } = await verifyTableExists('resumes');
      if (!exists) {
        throw new Error('Table "resumes" does not exist in Supabase.');
      }
      
      const { data, error } = await supabaseAdmin
        .from('resumes')
        .insert({
          candidate_id: candidateId,
          resume_url: resumeUrl,
          extracted_text: extractedText || fileName,
          ai_json: analysis,
        })
        .select()
        .single();
      
      if (error) throw error;
      dbResume = data;
      savedResumeId = data.id;
    }
    console.log('✓ Supabase insert');
  } catch (error: any) {
    console.error('✗ Supabase insert failed:', error);
    return NextResponse.json({
      stage: 'Supabase insert',
      message: error.message,
      stack: error.stack || '',
      details: 'Failed to insert the resume record into Supabase.'
    }, { status: 500 });
  }

  // 9. Resume review generation
  let reviewResult: any = null;
  try {
    console.log('→ Starting stage: Resume review generation');
    if (candidateId) {
      if (isSupabaseConfigured && supabaseAdmin) {
        const { exists } = await verifyTableExists('resume_reviews');
        if (!exists) {
          throw new Error('Table "resume_reviews" does not exist. Run migration first.');
        }

        // Generate review
        const gemini = new GeminiProvider();
        const review = await gemini.generateResumeReview(extractedText || fileName);

        // Save review
        const { data, error } = await supabaseAdmin
          .from('resume_reviews')
          .insert({
            resume_id: dbResume.id,
            candidate_id: candidateId,
            overall_score: review.overallScore,
            ats_score: review.atsScore,
            grammar_score: review.grammarScore,
            formatting_score: review.formattingScore,
            professionalism_score: review.professionalismScore,
            strengths: review.strengths,
            weaknesses: review.weaknesses,
            missing_keywords: review.missingKeywords,
            improvements: review.improvements,
            career_suggestions: review.careerSuggestions,
            improved_summary: review.improvedSummary,
            interview_probability: review.interviewProbability,
            shortlist_probability: review.shortlistProbability,
            technical_questions: review.technicalQuestions,
            hr_questions: review.hrQuestions,
            project_questions: review.projectQuestions,
            raw_ai_response: review,
          })
          .select()
          .single();

        if (error) throw error;
        reviewResult = data;
      } else {
        // Mock review fallback
        reviewResult = { id: 'mock_review_id', overall_score: 85 };
        savedResumeId = savedResumeId || 'mock_resume_id';
      }
    }
    console.log('✓ Resume review generation');
  } catch (error: any) {
    console.error('✗ Resume review generation failed:', error);
    return NextResponse.json({
      stage: 'Resume review generation',
      message: error.message,
      stack: error.stack || '',
      details: 'Failed to generate and save resume review.'
    }, { status: 500 });
  }

  // 10. Response sent
  try {
    console.log('→ Starting stage: Response sent');
    if (jobId) {
      const newApp = await createApplicationFromAnalysis(
        jobId,
        finalReport,
        fileName,
        resumeUrl,
        extractedText
      );
      
      const resData = {
        ...finalReport,
        applicationId: newApp._id,
        resumeUrl,
        review: reviewResult,
        resumeId: savedResumeId,
      };
      console.log('✓ Response sent');
      return NextResponse.json(resData);
    }

    const resData = {
      ...finalReport,
      resumeUrl,
      review: reviewResult,
      resumeId: savedResumeId,
    };
    console.log('✓ Response sent');
    return NextResponse.json(resData);
  } catch (error: any) {
    console.error('✗ Response sent failed:', error);
    return NextResponse.json({
      stage: 'Response sent',
      message: error.message,
      stack: error.stack || '',
      details: 'Failed to create candidate application or build final response payload.'
    }, { status: 500 });
  }
}
