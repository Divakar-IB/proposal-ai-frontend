# Proposal AI — Frontend

Internal SaaS tool built by **InnoBoon Technologies** that enables the sales and pre-sales team to generate client-facing business proposals using AI. Users upload a client RFP, the system retrieves relevant content from an internal Knowledge Base via RAG, and an LLM drafts the proposal sections automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State | Zustand v5 |
| Server state | TanStack Query v5 |
| Table | TanStack Table v8 |
| HTTP | Axios |
| Auth | JWT (stored in localStorage) |
| LLM streaming | Server-Sent Events (SSE) |

**Backend** (separate repo): FastAPI · PostgreSQL + pgvector · Claude (primary LLM) · Puppeteer (PDF) · python-docx (DOCX)

---

## Features

### Proposal Workflow (5 steps)
1. **Upload** — upload client RFP (PDF / DOCX / TXT) and fill project details
2. **Tag Capabilities** — AI analyses the RFP and suggests capability tags; user confirms scope, compliance frameworks, and proposal focus (Concise / Standard / Detailed / Executive)
3. **Configure & Generate** — review AI-planned sections, add or remove sections, trigger generation with live SSE progress
4. **Review & Refine** — expandable section cards with full generated content, inline editing, regenerate with natural language instruction, KB source references, flagged issues
5. **Export** — visual template picker (5 layouts), PDF / DOCX / PPTX download, send via email

### Knowledge Base
Internal document library. Documents are chunked, embedded, and stored in pgvector. Organised by categories and compliance tags. Used as RAG context during generation.

### Settings
Organisation profile: company name, logo, default signee, contact email. Logo is embedded on all generated proposal cover pages.

---

## Getting Started

### Prerequisites
- Node.js 20+
- Backend API running (see backend repo)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (pages)/                # Authenticated route group
│   │   └── all-proposals/
│   ├── auth/                   # Auth route group
│   │   ├── login/
│   │   └── reset-password/
│   ├── layout.tsx              # Root layout with providers
│   ├── providers.tsx           # TanStack Query provider
│   ├── error.tsx               # Global error boundary
│   └── not-found.tsx           # 404 page
│
├── components/
│   ├── layout/                 # Sidebar, Header
│   ├── pages/                  # Page-level components
│   │   ├── all-proposals/
│   │   └── auth/
│   ├── shared/                 # Shared cross-page components
│   └── ui/                     # Base UI primitives (shadcn + custom)
│       └── data-table/         # Generic TanStack Table wrapper
│
├── constants/                  # App-wide constants
├── hooks/                      # Custom React hooks
├── lib/
│   ├── axios.ts                # Axios instance with JWT interceptor
│   └── utils.ts                # cn() and shared utilities
├── services/                   # API service functions (per feature)
├── store/                      # Zustand stores
│   └── use-sidebar-store.ts
├── styles/                     # Global styles
└── types/                      # Shared TypeScript types
```

---

## API Integration

All HTTP calls go through the shared Axios instance at `src/lib/axios.ts`:

- Automatically attaches `Authorization: Bearer <token>` from `localStorage`
- On `401` response — clears the token and redirects to `/auth/login`
- Base URL configured via `NEXT_PUBLIC_API_URL`

Service functions live in `src/services/` and are consumed by TanStack Query hooks inside components.

---

## Authentication

JWT-based. On successful login the access token is stored in `localStorage` under the key `access_token`. All subsequent API requests carry it as a Bearer token. On token expiry or invalid token the response interceptor handles the redirect automatically.

---

## Team

| Role | Contact |
|---|---|
| Frontend Developer | adhiththiyan.s@innoboon.com |
| Backend Developer | InnoBoon Technologies |
| Backend Developer | InnoBoon Technologies |

**Organisation:** InnoBoon Technologies
