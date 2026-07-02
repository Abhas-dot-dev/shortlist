import { GoogleGenAI } from '@google/genai';
import { AIProvider } from './types';
import { 
  CandidateExtractionSchema, 
  MatchResultSchema, 
  ResumeReviewSchema,
  CandidateExtraction, 
  MatchResult,
  ResumeReview
} from '@/lib/aiService';

const geminiKey = process.env.GEMINI_API_KEY || '';
const isGeminiConfigured = Boolean(geminiKey);

// Lazily initialize the GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && isGeminiConfigured) {
    aiClient = new GoogleGenAI({ apiKey: geminiKey });
  }
  return aiClient;
}

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
    const client = getAiClient();
    if (!isGeminiConfigured || !client) {
      throw new Error('[GeminiProvider] Gemini API key is missing or not configured.');
    }

    let lastError: any = null;
    let attempts = 0;
    while (attempts < 2) {
      try {
        console.log(`[GeminiProvider] Extracting candidate details (Attempt ${attempts + 1})...`);
        const response = await client.models.generateContent({
          model: this.modelName,
          contents: `
            You are an expert ATS resume parsing engine. Analyze the following extracted text from a candidate's resume and extract the details in structured JSON format.

            You MUST return ONLY valid JSON.
            Do not use markdown.
            Do not wrap the response inside \`\`\`json.
            Do not include explanations or trailing/leading text outside of the JSON object.

            Return exactly one JSON object matching this structure:
            {
              "candidateName": "Full name of the candidate",
              "email": "Candidate email address",
              "phone": "Candidate phone number",
              "skills": ["Skill 1", "Skill 2"],
              "experience": "Detailed summary of past work history and years of experience",
              "education": "Schools, degrees, and graduation periods",
              "projects": ["Project 1", "Project 2"],
              "certifications": ["Certification 1", "Certification 2"],
              "languages": ["Language 1", "Language 2"],
              "achievements": ["Achievement 1", "Achievement 2"],
              "summary": "Professional profile summary"
            }

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
        const cleanedText = cleanJsonString(text);
        const parsedJson = JSON.parse(cleanedText);
        return CandidateExtractionSchema.parse(parsedJson);
      } catch (err: any) {
        lastError = err;
        attempts++;
        console.warn(`[GeminiProvider] Extraction attempt ${attempts} failed:`, err.message);
      }
    }

    throw new Error(`[GeminiProvider] Failed to extract candidate details: ${lastError?.message || 'Unknown error'}`);
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
    const client = getAiClient();
    if (!isGeminiConfigured || !client) {
      throw new Error('[GeminiProvider] Gemini API key is missing or not configured.');
    }

    let lastError: any = null;
    let attempts = 0;
    while (attempts < 2) {
      try {
        console.log(`[GeminiProvider] Matching resume against job (Attempt ${attempts + 1})...`);
        const response = await client.models.generateContent({
          model: this.modelName,
          contents: `
            You are an expert recruiter and talent sourcing analyst. Compare the candidate's parsed resume details with the target job opening parameters and calculate match scores.

            You MUST return ONLY valid JSON.
            Do not use markdown.
            Do not wrap the response inside \`\`\`json.
            Do not include explanations or trailing/leading text outside of the JSON object.

            Return exactly one JSON object matching this structure:
            {
              "overallMatchScore": 85,
              "skillMatchScore": 90,
              "experienceMatchScore": 80,
              "educationMatchScore": 95,
              "missingSkills": ["Missing Skill 1", "Missing Skill 2"],
              "strengths": ["Key Strength 1", "Key Strength 2"],
              "weaknesses": ["Key Weakness 1"],
              "recruiterRecommendation": "Short summary of fit / recommendation",
              "interviewRecommendation": "Interview questions to ask",
              "confidenceScore": 90
            }
            
            Candidate Details:
            ${JSON.stringify(resumeJson, null, 2)}

            Job Openings Parameters:
            - Job Title: ${jobDetails.title}
            - Description: ${jobDetails.description}
            - Required Skills: ${jobDetails.requiredSkills.join(', ')}
            - Preferred Skills: ${jobDetails.preferredSkills.join(', ')}
            - Required Experience: ${jobDetails.experienceRequired}
            - Required Education: ${jobDetails.educationRequired}
          `,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const cleanedText = cleanJsonString(text);
        const parsedJson = JSON.parse(cleanedText);
        return MatchResultSchema.parse(parsedJson);
      } catch (err: any) {
        lastError = err;
        attempts++;
        console.warn(`[GeminiProvider] Matching attempt ${attempts} failed:`, err.message);
      }
    }

    throw new Error(`[GeminiProvider] Failed to match resume against job: ${lastError?.message || 'Unknown error'}`);
  }

  async generateResumeReview(resumeText: string): Promise<ResumeReview> {
    const client = getAiClient();
    if (!isGeminiConfigured || !client) {
      throw new Error('[GeminiProvider] Gemini API key is missing or not configured.');
    }

    let lastError: any = null;
    let attempts = 0;
    while (attempts < 2) {
      try {
        console.log(`[GeminiProvider] Generating resume review (Attempt ${attempts + 1})...`);
        const response = await client.models.generateContent({
          model: this.modelName,
          contents: `
            You are an expert resume reviewer and executive career coach. Review the candidate's resume text and calculate quality scores (0 to 100), detailed feedback metrics, recruiter insights, and career path recommendations.

            You MUST return ONLY valid JSON.
            Do not use markdown.
            Do not wrap the response inside \`\`\`json.
            Do not include explanations or trailing/leading text outside of the JSON object.

            Return exactly one JSON object matching this structure:
            {
              "overallScore": 82,
              "atsScore": 80,
              "grammarScore": 90,
              "formattingScore": 75,
              "professionalismScore": 85,
              "strengths": ["Clear technical skillset", "Strong project descriptions"],
              "weaknesses": ["Passive voice in work summary", "No LinkedIn profile listed"],
              "missingKeywords": ["Docker", "CI/CD pipelines"],
              "improvements": ["Convert bullet points to action verbs", "Add a certifications section"],
              "improvedSummary": "A revised, higher impact professional summary here...",
              "interviewProbability": 65,
              "shortlistProbability": 70,
              "technicalQuestions": [
                "Technical question 1...",
                "Technical question 2..."
              ],
              "hrQuestions": [
                "HR question 1...",
                "HR question 2..."
              ],
              "projectQuestions": [
                "Project question 1...",
                "Project question 2..."
              ],
              "skillsAnalysis": {
                "strongSkills": ["React", "TypeScript"],
                "moderateSkills": ["Node.js", "Jest"],
                "missingIndustrySkills": ["GraphQL", "Kubernetes"],
                "emergingSkillsToLearn": ["Next.js App Router", "Server Components"]
              },
              "projectAnalysis": [
                {
                  "title": "Name of project 1",
                  "projectScore": 85,
                  "businessImpact": "High/Medium/Low business impact summary",
                  "technicalComplexity": "High/Medium/Low technical complexity details",
                  "resumeValue": "How this project values the profile",
                  "improvementSuggestions": "Actionable suggestions to improve this project description"
                }
              ],
              "experienceAnalysis": {
                "experienceQuality": "Feedback on work experience quality",
                "careerProgression": "Detailed career trajectory assessment",
                "leadership": "Mentorship, management, or self-direction indicators",
                "ownership": "Examples of owning modules or delivering value",
                "impact": "Quantifiable outcomes of achievements"
              },
              "atsReview": {
                "missingKeywords": ["Kubernetes", "AWS Cloud"],
                "poorHeadings": ["Weak/Stale headings detected or none"],
                "weakBulletPoints": ["Bullet points that lack action verbs/metrics"],
                "tooLong": false,
                "tooShort": false,
                "missingContactInfo": false,
                "missingGithub": true,
                "missingLinkedin": false,
                "missingPortfolio": true
              },
              "grammarReview": {
                "grammarErrors": ["Any spelling/grammar issues detected"],
                "spellingErrors": ["Any misspelled words detected"],
                "weakSentences": ["Sentences that lack energy or clear metric indicators"],
                "passiveVoice": ["Instances of was made/was done instead of designed/built"],
                "repetitiveWording": ["Too many repetitions of worked on or built"]
              },
              "recruiterPerspective": {
                "wouldReadFurther": "Yes/No with explanation of recruiter interest",
                "wouldRejectImmediately": "Yes/No with critical red flags",
                "estimatedInterviewProbability": 60,
                "estimatedShortlistProbability": 65
              },
              "careerSuggestions": {
                "jobRoles": ["Frontend Engineer", "Full Stack Developer"],
                "careerPaths": ["Senior Frontend Dev", "Staff UI Engineer"],
                "technologiesToLearn": ["Rust", "Go"],
                "certifications": ["AWS Developer Associate"],
                "projectsToBuild": ["Real-time collaborative canvas app"]
              }
            }

            Resume Text:
            """
            ${resumeText}
            """
          `,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const text = response.text || '';
        const cleanedText = cleanJsonString(text);
        const parsedJson = JSON.parse(cleanedText);
        return ResumeReviewSchema.parse(parsedJson);
      } catch (err: any) {
        lastError = err;
        attempts++;
        console.warn(`[GeminiProvider] Review attempt ${attempts} failed:`, err.message);
      }
    }

    throw new Error(`[GeminiProvider] Failed to generate resume review: ${lastError?.message || 'Unknown error'}`);
  }
}
