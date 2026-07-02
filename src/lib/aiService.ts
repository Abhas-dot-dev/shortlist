import { z } from 'zod';

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

export const ResumeReviewSchema = z.object({
  overallScore: resilientNumber(70),
  atsScore: resilientNumber(70),
  grammarScore: resilientNumber(70),
  formattingScore: resilientNumber(70),
  professionalismScore: resilientNumber(70),
  strengths: resilientArray(),
  weaknesses: resilientArray(),
  missingKeywords: resilientArray(),
  improvements: resilientArray(),
  improvedSummary: resilientString(''),
  interviewProbability: resilientNumber(50),
  shortlistProbability: resilientNumber(50),
  technicalQuestions: resilientArray(),
  hrQuestions: resilientArray(),
  projectQuestions: resilientArray(),
  skillsAnalysis: z.object({
    strongSkills: resilientArray(),
    moderateSkills: resilientArray(),
    missingIndustrySkills: resilientArray(),
    emergingSkillsToLearn: resilientArray(),
  }).default({
    strongSkills: [],
    moderateSkills: [],
    missingIndustrySkills: [],
    emergingSkillsToLearn: [],
  }),
  projectAnalysis: z.array(z.object({
    title: resilientString(''),
    projectScore: resilientNumber(70),
    businessImpact: resilientString(''),
    technicalComplexity: resilientString(''),
    resumeValue: resilientString(''),
    improvementSuggestions: resilientString(''),
  })).default([]),
  experienceAnalysis: z.object({
    experienceQuality: resilientString(''),
    careerProgression: resilientString(''),
    leadership: resilientString(''),
    ownership: resilientString(''),
    impact: resilientString(''),
  }).default({
    experienceQuality: '',
    careerProgression: '',
    leadership: '',
    ownership: '',
    impact: '',
  }),
  atsReview: z.object({
    missingKeywords: resilientArray(),
    poorHeadings: resilientArray(),
    weakBulletPoints: resilientArray(),
    tooLong: z.preprocess((val) => val === true || val === 'true', z.boolean().default(false)),
    tooShort: z.preprocess((val) => val === true || val === 'true', z.boolean().default(false)),
    missingContactInfo: z.preprocess((val) => val === true || val === 'true', z.boolean().default(false)),
    missingGithub: z.preprocess((val) => val === true || val === 'true', z.boolean().default(false)),
    missingLinkedin: z.preprocess((val) => val === true || val === 'true', z.boolean().default(false)),
    missingPortfolio: z.preprocess((val) => val === true || val === 'true', z.boolean().default(false)),
  }).default({
    missingKeywords: [],
    poorHeadings: [],
    weakBulletPoints: [],
    tooLong: false,
    tooShort: false,
    missingContactInfo: false,
    missingGithub: false,
    missingLinkedin: false,
    missingPortfolio: false,
  }),
  grammarReview: z.object({
    grammarErrors: resilientArray(),
    spellingErrors: resilientArray(),
    weakSentences: resilientArray(),
    passiveVoice: resilientArray(),
    repetitiveWording: resilientArray(),
  }).default({
    grammarErrors: [],
    spellingErrors: [],
    weakSentences: [],
    passiveVoice: [],
    repetitiveWording: [],
  }),
  recruiterPerspective: z.object({
    wouldReadFurther: resilientString(''),
    wouldRejectImmediately: resilientString(''),
    estimatedInterviewProbability: resilientNumber(50),
    estimatedShortlistProbability: resilientNumber(50),
  }).default({
    wouldReadFurther: '',
    wouldRejectImmediately: '',
    estimatedInterviewProbability: 50,
    estimatedShortlistProbability: 50,
  }),
  careerSuggestions: z.object({
    jobRoles: resilientArray(),
    careerPaths: resilientArray(),
    technologiesToLearn: resilientArray(),
    certifications: resilientArray(),
    projectsToBuild: resilientArray(),
  }).default({
    jobRoles: [],
    careerPaths: [],
    technologiesToLearn: [],
    certifications: [],
    projectsToBuild: [],
  }),
});

export type ResumeReview = z.infer<typeof ResumeReviewSchema>;
