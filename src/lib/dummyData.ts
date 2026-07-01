export interface JobMock {
  _id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  experience: string;
  education: string;
  requiredSkills: string[];
  preferredSkills: string[];
  salary: string;
  description: string;
  status: 'active' | 'closed' | 'draft';
  createdAt: string;
}

export interface CandidateMock {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'recruiter' | 'candidate';
  experience: string;
  education: string;
  skills: string[];
  projects: string[];
  certifications: string[];
  summary: string;
}

export interface ApplicationMock {
  _id: string;
  jobId: string;
  candidateId: string;
  resumeId: string;
  matchScore: number;
  status: 'applied' | 'shortlisted' | 'rejected';
  recruiterNotes: string;
  aiAnalysis: {
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
    summary: string;
  };
  createdAt: string;
  candidateDetails?: CandidateMock;
  jobDetails?: JobMock;
}

// 10 Mock Jobs
export const mockJobs: JobMock[] = [
  {
    _id: 'job_1',
    title: 'Senior React Developer',
    company: 'Apex Technologies',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'Full-time',
    experience: '5+ years',
    education: 'Bachelor in Computer Science or equivalent',
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux'],
    preferredSkills: ['GraphQL', 'Node.js', 'AWS', 'Docker'],
    salary: '$130,000 - $160,000',
    description: 'We are looking for a Senior Frontend Engineer specialized in React and Next.js to build user-facing products with premium design standards.',
    status: 'active',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    _id: 'job_2',
    title: 'Full Stack Engineer',
    company: 'StackFlow',
    location: 'Remote (US)',
    employmentType: 'Full-time',
    experience: '3+ years',
    education: 'Bachelor in CS or related field',
    requiredSkills: ['Node.js', 'React', 'MongoDB', 'Express', 'TypeScript'],
    preferredSkills: ['Redis', 'Kubernetes', 'Next.js', 'PostgreSQL'],
    salary: '$110,000 - $140,000',
    description: 'Join our team as a Full Stack Engineer to lead new feature developments on our collaboration tools built with Node.js and React.',
    status: 'active',
    createdAt: '2026-06-05T12:00:00Z',
  },
  {
    _id: 'job_3',
    title: 'UI/UX Product Designer',
    company: 'PixelPerfect SaaS',
    location: 'New York, NY (Hybrid)',
    employmentType: 'Full-time',
    experience: '4+ years',
    education: 'Degree in Design, Fine Arts, or equivalent',
    requiredSkills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research'],
    preferredSkills: ['Webflow', 'HTML/CSS', 'Design Systems', 'Motion Design'],
    salary: '$95,000 - $125,000',
    description: 'Looking for a visual designer who can build state-of-the-art interactive dashboards and clean landing pages for our B2B SaaS users.',
    status: 'active',
    createdAt: '2026-06-08T09:00:00Z',
  },
  {
    _id: 'job_4',
    title: 'Data Scientist (Machine Learning)',
    company: 'Neural Labs',
    location: 'Austin, TX',
    employmentType: 'Full-time',
    experience: '3+ years',
    education: 'Master or PhD in Statistics, Data Science, or Physics',
    requiredSkills: ['Python', 'PyTorch', 'SQL', 'Machine Learning', 'Pandas'],
    preferredSkills: ['Scikit-Learn', 'AWS', 'TensorFlow', 'LLMs'],
    salary: '$140,000 - $180,000',
    description: 'Build predictive AI engines, evaluate resume analysis patterns, and deploy models onto serverless architectures.',
    status: 'active',
    createdAt: '2026-06-10T14:30:00Z',
  },
  {
    _id: 'job_5',
    title: 'DevOps / Site Reliability Engineer',
    company: 'CloudScale Inc.',
    location: 'Remote (Worldwide)',
    employmentType: 'Full-time',
    experience: '4+ years',
    education: 'Bachelor in CS or Equivalent IT experience',
    requiredSkills: ['AWS', 'Terraform', 'CI/CD', 'Docker', 'Linux', 'Kubernetes'],
    preferredSkills: ['Prometheus', 'Bash/Python', 'Azure', 'Ansible'],
    salary: '$120,000 - $150,000',
    description: 'Ensure 99.99% uptime of our developer portal SaaS. Automate infrastructure-as-code pipelines using Terraform and AWS.',
    status: 'active',
    createdAt: '2026-06-12T08:00:00Z',
  },
  {
    _id: 'job_6',
    title: 'Marketing Specialist',
    company: 'GrowthGenius',
    location: 'Chicago, IL',
    employmentType: 'Full-time',
    experience: '2+ years',
    education: 'Bachelor in Marketing or Communications',
    requiredSkills: ['SEO', 'Content Strategy', 'Google Analytics', 'Copywriting', 'Email Campaigns'],
    preferredSkills: ['HubSpot', 'AdWords', 'Figma', 'A/B Testing'],
    salary: '$65,000 - $85,000',
    description: 'Drive traffic to our SaaS landing pages, optimize advertising spend, and run newsletter campaigns.',
    status: 'active',
    createdAt: '2026-06-14T11:00:00Z',
  },
  {
    _id: 'job_7',
    title: 'Product Manager',
    company: 'FeatureFlow',
    location: 'Boston, MA (Hybrid)',
    employmentType: 'Full-time',
    experience: '5+ years',
    education: 'Bachelor or MBA',
    requiredSkills: ['Agile', 'Product Roadmap', 'Jira', 'A/B Testing', 'Stakeholder Management'],
    preferredSkills: ['SQL', 'Product Analytics', 'UX Principles'],
    salary: '$130,000 - $160,000',
    description: 'Own the roadmap for our core ATS platform features. Coordinate between design, engineering, and sales teams.',
    status: 'active',
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    _id: 'job_8',
    title: 'HR Talent Acquisition Partner',
    company: 'Apex Technologies',
    location: 'San Francisco, CA (Hybrid)',
    employmentType: 'Full-time',
    experience: '3+ years',
    education: 'Degree in Business Administration or HR',
    requiredSkills: ['ATS Systems', 'Technical Sourcing', 'Interviewing', 'Onboarding', 'Talent Pool Management'],
    preferredSkills: ['LinkedIn Recruiter', 'SaaS Recruitment', 'Employer Branding'],
    salary: '$75,000 - $95,000',
    description: 'Manage full-cycle technical recruitment, shortlisting potential candidates using advanced ATS applications.',
    status: 'active',
    createdAt: '2026-06-18T16:00:00Z',
  },
  {
    _id: 'job_9',
    title: 'Security Engineer',
    company: 'SafeGuard Sec',
    location: 'Remote (US)',
    employmentType: 'Contract',
    experience: '4+ years',
    education: 'Degree in Cybersecurity or CS',
    requiredSkills: ['Penetration Testing', 'Network Security', 'OWASP Top 10', 'IAM', 'Security Audits'],
    preferredSkills: ['Rust', 'Docker Security', 'SIEM'],
    salary: '$90 - $120 / hour',
    description: 'Conduct security audits, penetration tests, and design secure authentication middleware for our Next.js backend endpoints.',
    status: 'active',
    createdAt: '2026-06-20T10:00:00Z',
  },
  {
    _id: 'job_10',
    title: 'Mobile App Developer (Flutter)',
    company: 'GoMobile Tech',
    location: 'Los Angeles, CA',
    employmentType: 'Full-time',
    experience: '3+ years',
    education: 'Bachelor in CS or equivalent portfolio',
    requiredSkills: ['Flutter', 'Dart', 'State Management', 'REST APIs', 'Firebase'],
    preferredSkills: ['iOS Native', 'Android Native', 'App Store Deployments'],
    salary: '$100,000 - $130,000',
    description: 'Help build our client applications for iOS and Android using Flutter. Deliver beautiful transitions and smooth cross-platform designs.',
    status: 'active',
    createdAt: '2026-06-22T13:00:00Z',
  }
];

// Generate 30 Candidates
export const mockCandidates: CandidateMock[] = [
  {
    _id: 'cand_1',
    name: 'Sarah Connor',
    email: 'sarah.connor@domain.com',
    phone: '+1 (555) 123-4567',
    role: 'candidate',
    experience: '6 years of frontend experience specializing in React & TypeScript.',
    education: 'B.S. in Computer Science - UCLA (2020)',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Redux', 'GraphQL', 'Jest', 'Git'],
    projects: ['Built a Next.js ecommerce app with stripe integration', 'Designed open-source UI libraries'],
    certifications: ['AWS Certified Solutions Architect', 'Meta React Developer Certificate'],
    summary: 'A highly motivated Senior React developer with expertise in building responsive, high-performance web applications using modern web ecosystems.'
  },
  {
    _id: 'cand_2',
    name: 'John Miller',
    email: 'john.miller@domain.com',
    phone: '+1 (555) 987-6543',
    role: 'candidate',
    experience: '3 years of Full Stack Development experience with Node.js and MongoDB.',
    education: 'B.S. in Software Engineering - UT Austin (2023)',
    skills: ['Node.js', 'React', 'MongoDB', 'Express', 'JavaScript', 'Tailwind CSS', 'REST APIs'],
    projects: ['Social Media platform API with microservices', 'Task board project management app'],
    certifications: ['MongoDB Developer Associate'],
    summary: 'Full Stack Engineer with strong backend architecture understanding, database optimization capabilities, and solid frontend dashboard building blocks.'
  },
  {
    _id: 'cand_3',
    name: 'Emily Davis',
    email: 'emily.davis@design.com',
    phone: '+1 (555) 246-8101',
    role: 'candidate',
    experience: '5 years creating clean dashboards, landing pages and interactive components.',
    education: 'B.F.A in Graphic Design - RISD (2021)',
    skills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping', 'User Research', 'Webflow', 'Adobe Suite'],
    projects: ['Redesigned bank portal with focus on accessibility', 'Created cohesive brand guidelines for SaaS startup'],
    certifications: ['Google UX Design Professional Certificate'],
    summary: 'Creative UX designer dedicated to bringing premium product journeys to life via rapid prototypes, polished visuals, and actionable user testing.'
  },
  {
    _id: 'cand_4',
    name: 'Marcus Aurelius',
    email: 'marcus.aurelius@stoic.com',
    phone: '+1 (555) 369-1215',
    role: 'candidate',
    experience: '8 years of system engineering, containerization, and cloud infrastructure management.',
    education: 'B.S. in Computer Science - MIT',
    skills: ['AWS', 'Terraform', 'CI/CD', 'Docker', 'Linux', 'Kubernetes', 'Python', 'Go'],
    projects: ['Migrated monolithic web apps to Kubernetes clusters', 'Automated server scaling reducing cost by 40%'],
    certifications: ['AWS Certified DevOps Engineer - Professional', 'Certified Kubernetes Administrator'],
    summary: 'DevOps Leader focused on implementing high availability deployment procedures, scripting backups, and automating server provisioning.'
  },
  {
    _id: 'cand_5',
    name: 'Sophia Loren',
    email: 'sophia.loren@model.com',
    phone: '+1 (555) 555-0199',
    role: 'candidate',
    experience: '4 years analyzing datasets, developing neural networks, and optimizing SQL pipelines.',
    education: 'M.S. in Data Science - Stanford University',
    skills: ['Python', 'SQL', 'Machine Learning', 'PyTorch', 'Pandas', 'Scikit-Learn', 'Tableau'],
    projects: ['Built recommendations engine for video streaming', 'Sentiment analyzer using natural language processing'],
    certifications: ['DeepLearning.AI TensorFlow Developer'],
    summary: 'Passionate Data Scientist with deep mathematical roots and experience applying Machine Learning algorithms to business classification tasks.'
  },
  // Add 25 more candidates programmatically to satisfy the "At least 30 candidates" requirement
  ...Array.from({ length: 25 }).map((_, index) => {
    const id = index + 6;
    const names = ['Alex Mercer', 'Jane Doe', 'Michael Smith', 'Robert Johnson', 'Patricia Williams', 'Linda Brown', 'David Jones', 'Richard Miller', 'Charles Davis', 'Jessica Taylor', 'Thomas Anderson', 'Barbara Martin', 'Joseph Garcia', 'Margaret White', 'Ashley Robinson', 'Matthew Clark', 'Karen Rodriguez', 'Daniel Lewis', 'Nancy Lee', 'Mark Walker', 'Elizabeth Hall', 'Steven Allen', 'Sandra Young', 'Paul Hernandez', 'Dorothy King'];
    const skillsPool = [
      ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Redux'],
      ['Node.js', 'Express', 'MongoDB', 'SQL', 'PostgreSQL'],
      ['Python', 'SQL', 'Machine Learning', 'Data Analysis', 'Tableau'],
      ['Figma', 'UI/UX Design', 'HTML', 'CSS', 'User Research'],
      ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Linux'],
      ['Flutter', 'Dart', 'Firebase', 'REST APIs', 'Mobile Design'],
      ['SEO', 'Content Strategy', 'Google Analytics', 'HubSpot', 'Copywriting']
    ];
    const experiencePool = [
      '2 years of experience in modern development frameworks.',
      '4 years of experience delivering premium dashboard views.',
      '7 years of enterprise backend architecture building.',
      '1 year of startup experience with fast iterations.',
      '5 years of data pipelines and predictive modeling.'
    ];
    const educationPool = [
      'B.S. in Computer Science - State University',
      'M.S. in Information Systems - Tech College',
      'B.A. in Digital Arts - Creative Academy',
      'Self-Taught Portfolio with Coding Bootcamp Certificate'
    ];

    const name = names[index % names.length] + ` (Cand ${id})`;
    const skills = skillsPool[index % skillsPool.length];
    const experience = experiencePool[index % experiencePool.length];
    const education = educationPool[index % educationPool.length];

    return {
      _id: `cand_${id}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'candidate' as const,
      experience,
      education,
      skills,
      projects: [`Project platform showcase ${id}`, `Interactive dashboard module ${id}`],
      certifications: [`Industry Certified Professional #${id}`],
      summary: `Skilled professional with hands-on knowledge of modern software development, specifically focusing on ${skills.slice(0, 3).join(', ')}.`
    };
  })
];

// Generate 30 mock applications mapping candidates to jobs with score variations
export const mockApplications: ApplicationMock[] = mockCandidates.map((cand, index) => {
  // Distribute applications across our 10 jobs
  const jobIdx = index % mockJobs.length;
  const job = mockJobs[jobIdx];

  // Calculate a matching score based on overlaps in skills
  const overlap = cand.skills.filter(s => job.requiredSkills.includes(s) || job.preferredSkills.includes(s)).length;
  const maxSkills = Math.max(job.requiredSkills.length, 1);
  const matchScore = Math.min(Math.floor((overlap / maxSkills) * 60 + 40 + Math.random() * 10), 100);

  // Status distribution
  let status: 'applied' | 'shortlisted' | 'rejected' = 'applied';
  if (matchScore >= 80) {
    status = Math.random() > 0.4 ? 'shortlisted' : 'applied';
  } else if (matchScore < 50) {
    status = Math.random() > 0.5 ? 'rejected' : 'applied';
  }

  const strengths = [
    `Excellent proficiency in core technologies: ${cand.skills.slice(0, 2).join(', ')}.`,
    `Has solid experience matching the required ${job.experience} criteria.`,
    'Strong communication skills and detailed project portfolio.'
  ];

  const weaknesses = [
    'Could benefit from more cloud architecture exposures.',
    'Slightly shorter longevity in some past roles.'
  ];

  const missingSkills = job.requiredSkills.filter(s => !cand.skills.includes(s));

  return {
    _id: `app_${index + 1}`,
    jobId: job._id,
    candidateId: cand._id,
    resumeId: `res_${index + 1}`,
    matchScore,
    status,
    recruiterNotes: index % 3 === 0 ? 'Excellent resume, candidate possesses strong technical background. Worth interviewing.' : '',
    aiAnalysis: {
      strengths,
      weaknesses,
      missingSkills,
      summary: `${cand.name} demonstrates a match score of ${matchScore}% for the ${job.title} role. They possess ${overlap} matching core skills, with missing elements such as: ${missingSkills.join(', ') || 'None'}.`
    },
    createdAt: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(), // Distributed dates
  };
});
