import { ResumeData } from '@/types/resume';

export function getParseResumePrompt(extractedText: string): string {
  return `You are a professional resume parser. Given the following raw text extracted from a resume document, parse it into the exact JSON structure below.
Be thorough — extract every detail. If a field is not present, use null.
For achievements in work experience, extract each bullet point as a separate string in the array.
For technologies in projects, extract each technology as a separate string.

Required JSON structure (respond ONLY with valid JSON, no extra text):
{
  "fullName": "string",
  "email": "string",
  "phone": "string or null",
  "location": "string or null",
  "website": "string or null",
  "linkedin": "string or null",
  "github": "string or null",
  "summary": "string or null",
  "experiences": [
    {
      "jobTitle": "string",
      "company": "string",
      "location": "string or null",
      "startDate": "string (e.g. Jan 2023)",
      "endDate": "string or null (e.g. Present)",
      "isCurrent": false,
      "achievements": ["bullet point 1", "bullet point 2"]
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "field": "string or null",
      "location": "string or null",
      "startDate": "string or null",
      "endDate": "string",
      "gpa": "string or null"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string or null (e.g. Languages, Frameworks, Tools, Soft Skills)"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string or null"
    }
  ]
}

Raw resume text:
"""
${extractedText}
"""`;
}

export function getTailorResumePrompt(
  resumeData: ResumeData,
  jobDescription: string,
  jobTitle: string,
  companyName: string
): string {
  return `You are an expert career coach and resume optimizer. Given a candidate's base resume data (JSON) and a target job description, rewrite the resume to maximize relevance and ATS compatibility.

Instructions:
1. Rewrite the professional summary to directly align with the job requirements.
2. Reorder and rewrite work experience bullet points to emphasize relevant skills, tools, and accomplishments. Use strong action verbs and quantified metrics where possible.
3. Highlight and prioritize matching skills. Suggest adding missing relevant skills the candidate likely has based on their experience.
4. Keep all facts truthful — only rephrase, reorder, and emphasize. Never fabricate experiences or achievements.
5. Optimize for ATS keyword matching.

Respond ONLY with valid JSON matching this structure:
{
  "tailoredResume": {
    "fullName": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "website": "...",
    "linkedin": "...",
    "github": "...",
    "summary": "rewritten summary",
    "experiences": [...],
    "education": [...],
    "skills": [...],
    "projects": [...]
  },
  "atsScore": 85,
  "keywordsMatched": ["keyword1", "keyword2"],
  "keywordsMissing": ["keyword3"]
}

Base Resume JSON:
${JSON.stringify(resumeData, null, 2)}

Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
"""
${jobDescription}
"""`;
}

export function getCoverLetterPrompt(
  resumeData: ResumeData,
  jobDescription: string,
  jobTitle: string,
  companyName: string
): string {
  return `You are a professional cover letter writer. Using the candidate's resume data and the target job details below, write a compelling, professional cover letter.

Requirements:
- 3-4 paragraphs, professional but personable tone
- Opening paragraph: Express genuine enthusiasm for the specific role at ${companyName}. Mention how you discovered the role or why the company appeals to you.
- Body paragraph(s): Connect 2-3 of the candidate's strongest experiences and achievements directly to the job requirements. Use specific examples and metrics.
- Closing paragraph: Express eagerness to discuss further, include a professional sign-off.
- Do NOT repeat the resume verbatim — complement and expand on it.
- Address it to "Dear Hiring Manager" unless a specific name is available.
- Keep the total length under 400 words.

Respond with ONLY the cover letter text (no JSON, no markdown code blocks). Use proper paragraph breaks.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Title: ${jobTitle}
Company: ${companyName}
Job Description:
"""
${jobDescription}
"""`;
}

export function getRoleTailorPrompt(
  resumeData: ResumeData,
  jobDescription: string,
  jobTitle: string,
  companyName: string,
  role: string
): string {
  // Incorporate role into the tailoring prompt
  const basePrompt = getTailorResumePrompt(resumeData, jobDescription, jobTitle, companyName);
  return `Role: ${role}\n${basePrompt}`;
}

