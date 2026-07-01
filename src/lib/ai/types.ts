import { CandidateExtraction, MatchResult } from '@/lib/aiService';

export interface AIProvider {
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
