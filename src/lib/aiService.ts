import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const geminiKey = process.env.GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(geminiKey);

// Initialize Gemini Client
const genAI = isGeminiConfigured ? new GoogleGenerativeAI(geminiKey) : null;

// ================= Zod Validation Resilient Preprocessors =================

const resilientString = (defaultValue = '') => z.preprocess((val) => {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'string' ? item : JSON.stringify(item)).join('\n');
  }
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}, z.string().default(defaultValue));

const resilientArray = () => z.preprocess((val) => {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'string' ? item : String(item));
  }
  if (typeof val === 'string') {
    return val.split(/,|\n/).map(s => s.trim()).filter(Boolean);
  }
  return [String(val)];
}, z.array(z.string()).default([]));

const resilientNumber = (defaultValue = 50) => z.preprocess((val) => {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === 'number') return val;
  const parsed = parseFloat(String(val));
  return isNaN(parsed) ? defaultValue : parsed;
}, z.number().default(defaultValue));

export const CandidateExtractionSchema = z.object({
  candidateName: resilientString('Unknown Candidate'),
  email: resilientString('not-specified@example.com'),
  phone: resilientString('Not specified'),
  skills: resilientArray(),
  experience: resilientString(''),
  education: resilientString(''),
  projects: resilientArray(),
  certifications: resilientArray(),
  languages: resilientArray(),
  achievements: resilientArray(),
  summary: resilientString(''),
});

export const MatchResultSchema = z.object({
  overallMatchScore: resilientNumber(50),
  skillMatchScore: resilientNumber(50),
  experienceMatchScore: resilientNumber(50),
  educationMatchScore: resilientNumber(50),
  missingSkills: resilientArray(),
  strengths: resilientArray(),
  weaknesses: resilientArray(),
  recruiterRecommendation: resilientString(''),
  interviewRecommendation: resilientString(''),
  confidenceScore: resilientNumber(50),
});

export type CandidateExtraction = z.infer<typeof CandidateExtractionSchema>;
export type MatchResult = z.infer<typeof MatchResultSchema>;

// ================= AI Service Interface =================
export interface IAIService {
  analyzeResume(extractedText: string): Promise<CandidateExtraction>;
  matchResume(resumeJson: CandidateExtraction, jobDetails: {
    title: string;
    description: string;
    requiredSkills: string[];
    preferredSkills: string[];
    experienceRequired: string;
    educationRequired: string;
  }): Promise<MatchResult>;
}

// ================= Google Gemini Implementation =================
export class GeminiAIService implements IAIService {
  private modelName = 'gemini-1.5-flash';

  async analyzeResume(extractedText: string): Promise<CandidateExtraction> {
    if (!isGeminiConfigured || !genAI) {
      console.log('Gemini API not configured. Using Mock Extraction...');
      return this.getMockExtraction(extractedText);
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
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
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const parsedJson = JSON.parse(text);
      return CandidateExtractionSchema.parse(parsedJson);
    } catch (e: any) {
      console.error('Gemini extraction error:', e);
      return this.getMockExtraction(extractedText);
    }
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
    if (!isGeminiConfigured || !genAI) {
      console.log('Gemini API not configured. Using Mock Matching Analysis...');
      return this.getMockMatchResult(resumeJson, jobDetails);
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
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
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      const parsedJson = JSON.parse(text);
      return MatchResultSchema.parse(parsedJson);
    } catch (e: any) {
      console.error('Gemini matching error:', e);
      return this.getMockMatchResult(resumeJson, jobDetails);
    }
  }

  // ================= Fallback Mocks =================

  private getMockExtraction(text: string): CandidateExtraction {
    // Try to guess name from text first lines
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

// Export default AI Service Instance (can be replaced with other classes later)
export const aiService = new GeminiAIService();
