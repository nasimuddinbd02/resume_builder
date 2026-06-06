import { ResumeData } from '@/types/resume';

export function getParseResumePrompt(extractedText: string): string {
  return `You are a professional resume parser. Given the following raw text extracted from a resume document, and the optional file attachment if provided, parse it into the exact JSON structure below.
Be thorough — extract every detail. If a field is not present, use null.
For achievements in work experience, extract each bullet point as a separate string in the array.
For technologies in projects, extract each technology as a separate string.

If the file is a PDF/DOCX and you can analyze its visual styling, also detect the layout properties to match the original style as closely as possible. Provide a JSON-string representing the custom styles in the "template" field of the JSON structure, or default to "modern" if you cannot analyze styling.

The "template" string field should be a serialized JSON object like this:
'{"name":"custom","accentColor":"#7c3aed","fontFamily":"Inter","fontSize":"0.85rem","padding":"0.5in 0.6in"}'

Where:
- name: must be "custom"
- accentColor: hex code of the headings/accent color (detect from the document, e.g. '#2563eb', '#1f2937', '#0d9488')
- fontFamily: choose the closest matching font: 'Inter', 'Georgia', 'Arial', 'Times New Roman', 'Courier' (detect if the PDF has a Serif, Sans-Serif, or Monospace font family)
- fontSize: choose the closest body font size: '0.75rem', '0.8rem', '0.85rem', '0.9rem'
- padding: choose the closest margins: '0.4in 0.5in' (Narrow), '0.5in 0.6in' (Default), '0.7in 0.8in' (Wide)

Required JSON structure (respond ONLY with valid JSON, no extra text):
{
  "template": "string (the serialized custom style JSON object, or 'modern')",
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
  return `You are an expert career coach and resume optimizer. Given a candidate's base resume data (JSON) and a target job description, optimize the work experience achievements (job responsibilities/bullet points) to maximize relevance and ATS compatibility.

Instructions:
1. ONLY rewrite and optimize the work experience achievements (bullet points) under each job. Emphasize relevant skills, tools, and accomplishments for the target job. Use strong action verbs and quantified metrics where possible.
2. Do NOT modify any other sections of the resume. Keep the professional summary, education, skills, projects, name, and contact details exactly the same as in the input JSON.
3. Keep all facts truthful — only rephrase and optimize achievements. Never fabricate experiences or achievements.
4. Optimize the achievements for ATS keyword matching.

Respond ONLY with valid JSON matching this structure:
{
  "tailoredResume": {
    "fullName": "...", // keep exactly as in input
    "email": "...", // keep exactly as in input
    "phone": "...", // keep exactly as in input
    "location": "...", // keep exactly as in input
    "website": "...", // keep exactly as in input
    "linkedin": "...", // keep exactly as in input
    "github": "...", // keep exactly as in input
    "summary": "...", // keep exactly as in input
    "experiences": [
      {
        "jobTitle": "...", // keep exactly as in input
        "company": "...", // keep exactly as in input
        "achievements": ["tailored bullet point 1", "tailored bullet point 2"] // ONLY optimize these bullet points
      }
    ],
    "education": [...], // keep exactly as in input
    "skills": [...], // keep exactly as in input
    "projects": [...] // keep exactly as in input
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
- Closing paragraph: Express eagerness to discuss further.
- Do NOT repeat the resume verbatim — complement and expand on it.
- Do NOT include any closing sign-off or signature block (such as "Sincerely,", "Warm regards,", your name, email, phone, or LinkedIn URL) at the end of the letter. The application will append these details automatically.
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

