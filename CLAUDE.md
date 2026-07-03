@AGENTS.md
# Proposal AI

## What this project is

Proposal AI is an internal SaaS tool built by InnoBoon Technologies. It helps the sales and
pre-sales team generate client-facing business proposals using AI. Users upload a client's RFP
document, the system retrieves relevant content from an internal Knowledge Base using RAG, and
an LLM drafts the proposal sections automatically. The user reviews and refines the output,
picks a visual layout template, and exports as PDF or DOCX.

## Tech stack

- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL with pgvector for vector embeddings
- **Auth**: JWT with organisation-level data isolation (multi-tenant)
- **LLM**: Claude (primary) — configurable to GPT-4o / Gemini / Llama-3
- **RAG**: Document chunking → embeddings → pgvector similarity search → LLM context injection
- **Streaming**: SSE (Server-Sent Events) for live generation progress
- **Document export**: Puppeteer for PDF, python-docx for DOCX

## Core features

### 1. Proposal workflow (5 steps)
1. **Upload** — user uploads client RFP (PDF/DOCX/TXT) and fills project details
2. **Tag capabilities** — AI analyses the RFP and suggests capability tags; user confirms scope and compliance frameworks; user picks proposal focus (Concise / Standard / Detailed / Executive)
3. **Configure & generate** — user sees AI-planned sections before generation, can remove or add custom sections, then triggers generation with live SSE progress
4. **Review & refine** — expandable section cards with full generated content, inline editing, regenerate with natural language instruction, KB source references per section, flagged issues
5. **Export** — visual template picker (5 layouts), PDF/DOCX/PPTX download, send via email

### 2. Knowledge Base
Internal document library. Documents are chunked, embedded, and stored in pgvector.
Organised by categories and compliance tags. Used as RAG context during generation.

### 3. Settings
Organisation profile: company name, logo, default signee, contact email.
Logo is embedded on all generated proposal cover pages.

## Data model (high level)

- `organisations` — multi-tenant root; org logo, name, contact
- `users` — belong to an org; JWT auth
- `proposals` — linked to org; stores status, client name, RFP reference, selected tags, focus
- `proposal_sections` — child of proposal; stores name, generated content, word count, order, status
- `kb_documents` — linked to org; stores file metadata, category, compliance tags
- `kb_chunks` — child of document; stores text chunk + pgvector embedding
- `templates` — default (shared) and custom (per org) proposal layout configs

## RAG pipeline

1. At KB upload: document → chunked → embedded via embedding model → stored in `kb_chunks`
2. At generation: selected capability tags + compliance scope → vector similarity search on `kb_chunks` → top-k chunks passed as context to LLM → LLM drafts each section in order

## Template system

5 built-in proposal layouts: Modern, Minimal, Corporate, Branded, Executive.
Backend holds server-side render templates (Puppeteer HTML + docx skeletons) per layout ID.
Frontend sends `{ proposalId, templateId, format }` → backend renders → returns S3 signed URL.

## RBAC

Two roles per organisation:

- `org_admin` — full access; manages users, org settings, KB, categories
- `member` — standard user; creates proposals, uploads KB documents, exports

## Organisation

- Company: InnoBoon Technologies
- Contact: adhiththiyan.s@innoboon.com
- Team: 1 frontend developer, 2 backend developers
