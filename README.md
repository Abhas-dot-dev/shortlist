# 🚀 AI Resume Shortlister SaaS

> An AI-powered Resume Screening & Resume Review SaaS built with **Next.js**, **Supabase**, **Google Gemini AI**, and **TypeScript**.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)
![Gemini](https://img.shields.io/badge/Google-Gemini_AI-4285F4?logo=google)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📖 Overview

AI Resume Shortlister is a modern AI-powered recruitment platform that automates resume analysis, candidate ranking, ATS scoring, and recruiter workflows.

The platform enables recruiters to shortlist the best candidates using AI while helping candidates improve their resumes through an intelligent AI Resume Review system.

---

# ✨ Features

## 👨‍💼 Recruiter Features

- Secure Authentication
- Recruiter Dashboard
- Job Management
- Create/Edit/Delete Jobs
- Candidate Management
- AI Resume Matching
- Candidate Ranking
- Recruiter Notes
- Candidate Search & Filters
- Analytics Dashboard
- Hiring Pipeline

---

## 👨‍🎓 Candidate Features

- Secure Authentication
- Resume Upload (PDF/DOCX)
- AI Resume Review
- ATS Score
- Resume Quality Score
- AI Generated Resume Summary
- Career Suggestions
- Resume Version History
- Interview Preparation Questions
- Application Status Tracking

---

## 🤖 AI Features

Powered by **Google Gemini AI**

### Resume Extraction

Automatically extracts:

- Name
- Email
- Phone
- Skills
- Education
- Experience
- Projects
- Certifications
- Languages
- Achievements

---

### AI Resume Review

Generates:

- Resume Score
- ATS Score
- Formatting Score
- Grammar Score
- Professionalism Score

Also provides:

- Strengths
- Weaknesses
- Missing Keywords
- Resume Improvements
- Improved Professional Summary
- Career Suggestions
- Recruiter Feedback
- Interview Probability
- Shortlist Probability

---

### AI Job Matching

Compares:

Resume

↓

Job Description

Returns:

- Overall Match Score
- Skill Match
- Experience Match
- Education Match
- Missing Skills
- Strengths
- Weaknesses
- Recruiter Recommendation

---

# 🏗 Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts

---

## Backend

- Next.js API Routes
- Node.js Runtime

---

## Database

- Supabase PostgreSQL
- Supabase Authentication
- Row Level Security (RLS)

---

## AI

- Google Gemini API
- Zod Validation

---

## Resume Parsing

- unpdf
- mammoth

---

## Storage

- Cloudinary

---

# 📂 Project Structure

```
src
│
├── app
│   ├── api
│   ├── recruiter
│   ├── candidate
│   ├── login
│   └── register
│
├── components
│
├── features
│
├── lib
│   ├── ai
│   ├── parser
│   ├── storage
│   ├── supabase
│   └── services
│
├── models
│
└── utils
```

---

# 🔄 Application Workflow

```
Candidate Uploads Resume

        │

        ▼

Resume Parsing

        │

        ▼

AI Resume Extraction

        │

        ▼

AI Resume Review

        │

        ▼

Store Resume

        │

        ▼

Match Against Jobs

        │

        ▼

Generate Match Score

        │

        ▼

Recruiter Dashboard
```

---

# 📊 AI Resume Review

Each uploaded resume receives:

✅ ATS Score

✅ Resume Quality Score

✅ Formatting Analysis

✅ Grammar Review

✅ Skills Analysis

✅ Project Analysis

✅ Career Suggestions

✅ Recruiter Perspective

✅ Improved Summary

✅ Interview Questions

---

# 📈 Dashboard

Recruiters can monitor:

- Applications
- Active Jobs
- Candidate Rankings
- Hiring Funnel
- Top Skills
- Match Score Distribution
- Experience Distribution
- Monthly Applications

---

# 🔐 Authentication

Authentication is powered by **Supabase Auth**.

Supports:

- Register
- Login
- Logout
- Session Persistence
- Protected Routes
- Recruiter Roles
- Candidate Roles

---

# 🗄 Database

Main Tables

- users
- jobs
- resumes
- applications
- resume_reviews

---

# 🌐 Environment Variables

Create a `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/yourusername/your-repo.git
```

Install dependencies

```bash
npm install
```

Run development server

```bash
npm run dev
```

Open

```
http://localhost:3000
```

---

# 🚀 Deployment

Deployed using **Vercel**

Database hosted on **Supabase**

Storage powered by **Cloudinary**

AI powered by **Google Gemini**

---

# 📌 Future Roadmap

- Bulk Resume Upload
- Resume Preview
- Candidate Comparison
- AI Recruiter Assistant
- CSV Export
- PDF Export
- Email Notifications
- Team Collaboration
- Organization Accounts
- AI Interview Copilot

---

# 📸 Screenshots

> Add screenshots of:

- Landing Page
- Recruiter Dashboard
- Candidate Dashboard
- AI Resume Review
- Resume Upload
- Analytics Dashboard

---

# 🤝 Contributing

Contributions, feature requests, and suggestions are welcome.

Fork the repository and submit a Pull Request.

---

# 👨‍💻 Author

**Abhas Srivastava**

B.Tech Electronics & Communication Engineering

Full Stack Developer • AI Enthusiast • SaaS Builder

GitHub: https://github.com/Abhas-dot-dev

LinkedIn: _(Add your LinkedIn profile here)_

---

# ⭐ Support

If you found this project useful,

⭐ Star the repository

🍴 Fork it

📢 Share it

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Inspiration

Built to demonstrate how modern AI can transform the recruitment process by helping recruiters identify top talent faster while giving candidates actionable, AI-driven feedback to improve their resumes.
