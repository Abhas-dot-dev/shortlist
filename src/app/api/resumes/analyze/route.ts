import { NextResponse } from 'next/server';
import { parseResume } from '@/lib/parser';
import { storageProvider } from '@/lib/storage';
import { aiProvider } from '@/lib/ai';
import { getJobById, createApplicationFromAnalysis, saveResumeAndReview } from '@/lib/dataService';
import { verifyTableExists, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const jobId = formData.get('jobId') as string | null;
    const candidateId = formData.get('candidateId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name;
    const fileMime = file.type;

    // Step 1: Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Step 2: Extract text from PDF or DOCX using local parsers
    console.log('Extracting text from resume...');
    const extractedText = await parseResume(fileBuffer, fileMime);

    // Step 3: Upload using abstracted storage provider (resolves to Local or Cloudinary)
    console.log('Uploading file...');
    const resumeUrl = await storageProvider.uploadResume(fileBuffer, fileName, fileMime);

    // Step 4: Run AI semantic extraction
    console.log('Analyzing resume with Gemini AI...');
    const analysis = await aiProvider.analyzeResume(extractedText || fileName);

    // Step 5: If matching to a job, calculate match stats
    let matchResult = null;
    if (jobId) {
      const jobDetails = await getJobById(jobId);
      if (!jobDetails) {
        throw new Error(`Job opening with ID ${jobId} was not found.`);
      }
      console.log('Comparing candidate with job openings...');
      matchResult = await aiProvider.matchResume(analysis, {
        title: jobDetails.title,
        description: jobDetails.description,
        requiredSkills: jobDetails.requiredSkills,
        preferredSkills: jobDetails.preferredSkills,
        experienceRequired: jobDetails.experience,
        educationRequired: jobDetails.education,
      });
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

    // Step 6: Save to database or mock memory
    let reviewResult = null;
    let savedResumeId = null;

    if (candidateId) {
      if (isSupabaseConfigured) {
        const { exists } = await verifyTableExists('resume_reviews');
        if (!exists) {
          return NextResponse.json({
            error: "Database schema is incomplete.",
            missing_table: "resume_reviews",
            solution: "Run supabase_reviews_migration.sql inside the Supabase SQL Editor."
          }, { status: 500 });
        }
      }

      console.log('Saving resume and generating AI Resume Review...');
      const savedData = await saveResumeAndReview(
        candidateId,
        resumeUrl,
        extractedText || fileName,
        analysis
      );
      if (savedData) {
        reviewResult = savedData.review;
        savedResumeId = savedData.resume.id;
      }
    }

    if (jobId) {
      const newApp = await createApplicationFromAnalysis(
        jobId, 
        finalReport, 
        fileName, 
        resumeUrl, 
        extractedText
      );
      
      return NextResponse.json({
        ...finalReport,
        applicationId: newApp._id,
        resumeUrl,
        review: reviewResult,
        resumeId: savedResumeId,
      });
    }

    return NextResponse.json({
      ...finalReport,
      resumeUrl,
      review: reviewResult,
      resumeId: savedResumeId,
    });
  } catch (error: any) {
    console.error('API Error in analyze route:', error);
    return NextResponse.json({ error: error.message || 'An error occurred during analysis.' }, { status: 500 });
  }
}
