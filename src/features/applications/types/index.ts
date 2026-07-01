export interface Application {
  id: string;
  candidate_id: string;
  recruiter_id: string | null;
  job_id: string;
  resume_id: string;
  match_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  ai_summary: string;
  recruiter_notes: string;
  application_status: 'applied' | 'shortlisted' | 'rejected';
  created_at: string;
}
