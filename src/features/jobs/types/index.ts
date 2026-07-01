export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  experience_required: string;
  education_required: string;
  location: string;
  employment_type: string;
  status: 'active' | 'closed' | 'draft';
  created_at: string;
}
