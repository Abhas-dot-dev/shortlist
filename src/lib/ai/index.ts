import { AIProvider } from './types';
import { GeminiProvider } from './gemini';

let activeAiProvider: AIProvider | null = null;
function getAiProvider(): AIProvider {
  if (!activeAiProvider) {
    activeAiProvider = new GeminiProvider();
  }
  return activeAiProvider;
}

export const aiProvider: AIProvider = {
  analyzeResume: (extractedText) => getAiProvider().analyzeResume(extractedText),
  matchResume: (resumeJson, jobDetails) => getAiProvider().matchResume(resumeJson, jobDetails),
  generateResumeReview: (resumeText) => getAiProvider().generateResumeReview(resumeText),
};

export * from './types';
