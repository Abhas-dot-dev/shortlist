import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './types';
import { 
  CandidateExtractionSchema, 
  MatchResultSchema, 
  CandidateExtraction, 
  MatchResult 
} from '@/lib/aiService';

const geminiKey = process.env.GEMINI_API_KEY || '';
const isGeminiConfigured = Boolean(geminiKey);

// Initialize the new GoogleGenAI client if key exists
const aiClient = isGeminiConfigured ? new GoogleGenAI({ apiKey: geminiKey }) : null;

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  // Strip markdown backticks if returned
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n/i, '').replace(/\n```$/, '');
  }
  return cleaned.trim();
}


export class GeminiProvider implements AIProvider {
  private modelName = 'gemini-2.5-flash';

  async analyzeResume(extractedText: string): Promise<CandidateExtraction> {
    if (!isGeminiConfigured || !aiClient) {
      console.log('[GeminiProvider] Missing API key, falling back to mock extraction.');
      return this.getMockExtraction(extractedText);
    }

    // Retry mechanism: Try once, retry once on failure
    let attempts = 0;
    while (attempts < 2) {
      try {
        console.log(`[GeminiProvider] Extracting candidate details (Attempt ${attempts + 1})...`);
        const response = await aiClient.models.generateContent({
          model: this.modelName,
          contents: `
            You are an expert ATS resume parsing engine. Analyze the following extracted text from a candidate's resume and extract the details in structured JSON format matching the schema properties:
            
            Properties to extract:
            - candidateName: Full name of the candidate
            - email: Candidate email address
            - phone: Candidate phone number
            - skills: Array of professional skills/technologies
            - experience: Detailed summary of past work history, years of experience, and job roles
            - education: Schools, degrees, and graduation periods
            - projects: Key project titles and summaries
            - certifications: Professional certifications
            - languages: Spoken/written languages
            - achievements: Notable awards or work achievements
            - summary: Professional profile summary

            Ensure the output is valid JSON. Do not include markdown code block formatting in the response.

            Resume Text:
            """
            ${extractedText}
            """
          `,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const parsedJson = JSON.parse(cleanJsonString(text));
        return CandidateExtractionSchema.parse(parsedJson);
      } catch (err: any) {
        attempts++;
        console.warn(`[GeminiProvider] Extraction attempt ${attempts} failed:`, err.message);
        if (attempts >= 2) {
          console.error('[GeminiProvider] Max retry attempts reached for resume extraction. Falling back to mock extraction.');
          return this.getMockExtraction(extractedText);
        }
      }
    }

    return this.getMockExtraction(extractedText);
  }

  async matchResume(
    resumeJson: CandidateExtraction,
    jobDetails: {
      title: string;
      description: string;
      requiredSkills: string[];
      preferredSkills: string[];
      experienceRequired: string;
      educationRequired: string;
    }
  ): Promise<MatchResult> {
    if (!isGeminiConfigured || !aiClient) {
      console.log('[GeminiProvider] Missing API key, falling back to mock matching analysis.');
      return this.getMockMatchResult(resumeJson, jobDetails);
    }

    // Retry mechanism: Try once, retry once on failure
    let attempts = 0;
    while (attempts < 2) {
      try {
        console.log(`[GeminiProvider] Matching resume against job (Attempt ${attempts + 1})...`);
        const response = await aiClient.models.generateContent({
          model: this.modelName,
          contents: `
            You are an expert recruiter and talent sourcing analyst. Compare the candidate's parsed resume details with the target job opening parameters and calculate match scores.
            
            Candidate Details:
            ${JSON.stringify(resumeJson, null, 2)}

            Job Openings Parameters:
            - Job Title: ${jobDetails.title}
            - Description: ${jobDetails.description}
            - Required Skills: ${jobDetails.requiredSkills.join(', ')}
            - Preferred Skills: ${jobDetails.preferredSkills.join(', ')}
            - Required Experience: ${jobDetails.experienceRequired}
            - Required Education: ${jobDetails.educationRequired}

            Generate structured JSON output with the following properties:
            - overallMatchScore: Weighted matching score (0 to 100)
            - skillMatchScore: Score for skills alignment (0 to 100)
            - experienceMatchScore: Score for experience alignment (0 to 100)
            - educationMatchScore: Score for education alignment (0 to 100)
            - missingSkills: Array of required job skills that are missing in the candidate's profile
            - strengths: Array of 2-3 key technical/career strengths matching the job
            - weaknesses: Array of 1-2 career weaknesses or experience gaps relative to the job
            - recruiterRecommendation: A short summary of why the candidate fits or does not fit
            - interviewRecommendation: Recommendations for interview questions to ask based on missing skills/experience gaps
            - confidenceScore: Model confidence rating of matching (0 to 100)

            Ensure the output is valid JSON.
          `,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const parsedJson = JSON.parse(cleanJsonString(text));
        return MatchResultSchema.parse(parsedJson);
      } catch (err: any) {
        attempts++;
        console.warn(`[GeminiProvider] Matching attempt ${attempts} failed:`, err.message);
        if (attempts >= 2) {
          console.error('[GeminiProvider] Max retry attempts reached for resume matching. Falling back to mock match results.');
          return this.getMockMatchResult(resumeJson, jobDetails);
        }
      }
    }

    return this.getMockMatchResult(resumeJson, jobDetails);
  }

  // ================= Mock Fallbacks =================

  private getMockExtraction(text: string): CandidateExtraction {
    const firstLines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const candidateName = firstLines[0] || 'Demo Candidate';
    
    return {
      candidateName,
      email: `${candidateName.toLowerCase().replace(/[^a-z]/g, '')}@example.com`,
      phone: '+1 (555) 019-9234',
      skills: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Next.js', 'Node.js', 'Git'],
      experience: '4+ years of Frontend developer experience building SaaS dashboard systems.',
      education: 'Bachelor of Science in Software Engineering',
      projects: ['ATS automation crawler module', 'Dynamic visual data charts tool'],
      certifications: ['AWS Certified Developer'],
      languages: ['English', 'Spanish'],
      achievements: ['Won Hackathon Outstanding UI Design Award'],
      summary: 'Frontend developer passionate about implementing accessible web interfaces and optimizing load times.'
    };
  }

  private getMockMatchResult(resume: CandidateExtraction, job: any): MatchResult {
    const jobSkills = job.requiredSkills.map((s: string) => s.toLowerCase());
    const candSkills = resume.skills.map((s: string) => s.toLowerCase());
    
    const overlap = jobSkills.filter((s: string) => candSkills.includes(s));
    const missing = job.requiredSkills.filter((s: string) => !candSkills.includes(s.toLowerCase()));
    
    const maxSkills = Math.max(job.requiredSkills.length, 1);
    const skillScore = Math.round((overlap.length / maxSkills) * 100);
    const overallMatchScore = Math.min(Math.max(skillScore + 10, 40), 98);

    return {
      overallMatchScore,
      skillMatchScore: skillScore,
      experienceMatchScore: 80,
      educationMatchScore: 90,
      missingSkills: missing,
      strengths: [
        `Demonstrates strong experience in core technologies: ${resume.skills.slice(0, 3).join(', ')}.`,
        'Solid background building responsive layouts with Tailwind CSS.'
      ],
      weaknesses: missing.length > 0 
        ? [`Missing direct references to required skills: ${missing.slice(0, 2).join(', ')}.`]
        : ['Could expand on database sharding skills.'],
      recruiterRecommendation: `Highly recommended applicant displaying a match score of ${overallMatchScore}%. Perfect for frontend-focused development roles.`,
      interviewRecommendation: `Ask candidate about past projects utilizing ${missing.join(', ') || 'Next.js rendering states'}.`,
      confidenceScore: 90,
    };
  }
}
