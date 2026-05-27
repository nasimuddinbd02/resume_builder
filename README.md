# AI Resume Builder & Tailoring Platform

A feature-rich, Next.js 16 application designed to construct base resumes, parse uploaded files with AI, tailor resumes to matching job descriptions, evaluate ATS scoring, and export professionally formatted documents (PDF and Microsoft Word).

---

## 🏗️ System Architecture

The application is structured into an **N-Tier Architecture**, decoupling client-side user interfaces, server route controllers, business logic service classes, and data access layers. AI interactions are managed by an abstract provider factory supporting multiple models (Gemini, OpenAI, Claude, Groq).

```mermaid
graph TD
    subgraph Client ["Client Side (Next.js Client Components)"]
        UI["UI Views / Forms<br>(Editor, Tailor Dashboard, Settings)"]
        ClientAuth["NextAuth client-side sessions"]
        Exporters["Client Document Exporters<br>(html2pdf.js + html2canvas-pro, docx blobs)"]
    end

    subgraph Server ["Server Side (Next.js App Router API & Services)"]
        API["API Route Handlers<br>(/api/resume, /api/tailor, /api/parse, /api/auth)"]
        Middleware["NextAuth Proxy middleware"]
        ServiceLayer["Service Layer / Data Access<br>(src/services/*, src/data-access/*)"]
        AIProvider["AI Provider Factory<br>(src/lib/ai/ai-provider.ts)"]
    end

    subgraph External ["External Layer & Storage"]
        DB["SQLite Database<br>(Prisma ORM)"]
        GeminiAPI["Google Gemini API"]
        OpenAIAPI["OpenAI API"]
        ClaudeAPI["Anthropic Claude API"]
        GroqAPI["Groq Llama-3 API"]
    end

    UI --> API
    Exporters --> UI
    ClientAuth --> API
    API --> Middleware
    Middleware --> ServiceLayer
    ServiceLayer --> DB
    ServiceLayer --> AIProvider
    AIProvider --> GeminiAPI
    AIProvider --> OpenAIAPI
    AIProvider --> ClaudeAPI
    AIProvider --> GroqAPI
```

---

## 🗄️ Database ER Diagram

The database uses SQLite managed through Prisma ORM. The schema consists of two domains: NextAuth session management models and Resume domain models (supporting tailoring jobs, projects, skills, education, and experiences).

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User ||--o{ Resume : "creates"
    Resume ||--o{ WorkExperience : "contains"
    Resume ||--o{ Education : "contains"
    Resume ||--o{ Skill : "contains"
    Resume ||--o{ Project : "contains"
    Resume ||--|| TailoringJob : "tailored by"

    User {
        String id PK
        String email UK
        String name
        String hashedPassword
        String image
        DateTime createdAt
        DateTime updatedAt
    }

    Account {
        String id PK
        String userId FK
        String type
        String provider
        String providerAccountId UK
        String refresh_token
        String access_token
        Int expires_at
        String token_type
        String scope
        String id_token
        String session_state
    }

    Session {
        String id PK
        String sessionToken UK
        String userId FK
        DateTime expires
    }

    VerificationToken {
        String identifier UK
        String token UK
        DateTime expires
    }

    Resume {
        String id PK
        String userId FK
        String title
        Boolean isBase
        String template
        String fullName
        String email
        String phone
        String location
        String website
        String linkedin
        String github
        String summary
        DateTime createdAt
        DateTime updatedAt
    }

    WorkExperience {
        String id PK
        String resumeId FK
        String jobTitle
        String company
        String location
        String startDate
        String endDate
        Boolean isCurrent
        String achievements "JSON String"
        Int sortOrder
    }

    Education {
        String id PK
        String resumeId FK
        String school
        String degree
        String field
        String location
        String startDate
        String endDate
        String gpa
        Int sortOrder
    }

    Skill {
        String id PK
        String resumeId FK
        String name
        String category
    }

    Project {
        String id PK
        String resumeId FK
        String name
        String description
        String technologies "JSON String"
        String link
        Int sortOrder
    }

    TailoringJob {
        String id PK
        String jobTitle
        String companyName
        String jobDescription
        Int atsScore
        String coverLetterText
        String keywordsMatched "JSON String"
        String tailoredResumeId FK "Unique"
        DateTime createdAt
    }
```

---

## 🚀 Key Features

* **AI Provider Abstraction Layer**: Switch models dynamically between Gemini (`gemini-2.0-flash`), OpenAI (`gpt-4o-mini`), Claude (`claude-3-5-sonnet`), and Groq (`llama-3.3-70b`) using request headers or `.env` configs.
* **Smart PDF Export**: Utilizes a customized postinstall-patched UMD mapping of `html2canvas-pro` loaded inside `html2pdf.js` to correctly render Tailwind CSS v4 color formats (e.g. `oklch()`, `lab()`) without runtime client crashes.
* **MS Word Layout Fidelity**: Dynamically parses the resume preview DOM to reconstruct visual column sidebars and grids into native HTML tables, replacing SVGs with unicode characters (`✉`, `📞`, `📍`, `🌐`, `LinkedIn:`, `GitHub:`) for maximum fidelity inside Microsoft Word.
* **Resilient Prisma Schema Mapping**: Features SQLite-safe schema writes converting arrays into JSON strings, defaulting null-like LLM parameters to compliant fallbacks, and parsing string integers to database fields.

---

## 🛠️ Getting Started

### 1. Prerequisites
* Node.js v20+
* NPM, Yarn, or PNPM

### 2. Environment Configuration
Create a `.env` (or `.env.local` for local development) file in the root folder:

```bash
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_hash"

# AI Provider Configuration
# Options: "gemini" | "openai" | "anthropic" | "groq"
AI_PROVIDER="gemini"

# Provider Keys
GEMINI_API_KEY="your_google_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"
ANTHROPIC_API_KEY="your_anthropic_claude_api_key"
GROQ_API_KEY="your_groq_api_key"
```

### 3. Install & Build
Run install (which runs the automated `html2canvas` module patching hook):
```bash
npm install
```

Generate the local Prisma client and apply schema migrations:
```bash
npx prisma migrate dev
```

### 4. Running Locally
Start the development server:
```bash
npm run dev
```

### 5. Production Build
Verify compilation and launch the optimized build:
```bash
npm run build
npm run start
```
