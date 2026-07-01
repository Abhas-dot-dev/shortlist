import { AIProvider } from './types';
import { GeminiProvider } from './gemini';

export const aiProvider: AIProvider = new GeminiProvider();

export * from './types';
