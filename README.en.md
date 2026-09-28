# JurisFlow

**🇧🇷 [Português](README.md) · 🇺🇸 [English](README.en.md) · 🇪🇸 [Español](README.es.md)**

[![JurisFlow](guia/assets/banner.jpg)](https://inematds.github.io/jurisflow/guia/en/)

## 📖 User Guide

Complete guide (landing page + step-by-step instructions): **https://inematds.github.io/jurisflow/guia/en/**

Management system for law firms — legal ERP/CRM with an AI assistant.

## Modules

| Module | What it does |
| --- | --- |
| Overview Dashboard | Indicators for clients, active cases, deadlines, hearings, revenue, expenses, and balance |
| Clients | Individual/business registration, CPF/CNPJ, contacts, address, profession, marital status, notes, and status |
| Cases | CNJ number, court, division, county, area of law, stage, opposing party, claim amount, and status |
| Case Updates | Activity within cases, with important updates marked |
| Consultations | Intake of new clients via WhatsApp, in person, video, phone, and email |
| Calendar & Deadlines | Critical deadlines, hearings, meetings, expert examinations, and due diligence |
| Tasks | Internal management: priority, assignee, deadline, and status |
| Finance | Revenue, expenses, fees, court costs, due dates, payments, and cash flow |
| Documents | Legal templates: petitions, powers of attorney, contracts, notices |
| AI Legal Assistant | Generation and analysis of legal content via LLM |

Case stages: **Initial → Discovery → Decision → Appeal → Enforcement → Archived**
Status: **Active / Suspended / Settled / Won / Lost / Archived**

## AI Legal Assistant

Works with Brazilian law (CPC, CPP, CLT, Federal Constitution, Civil Code, CDC, STF, STJ, TST) and supports six operations: drafting petitions, case law analysis, deadline calculation, case update summaries, extrajudicial notices, and fee agreements.

> ⚠️ Currently, no legal verification source is connected to the model. Any legal or case law citations produced by AI **must be verified** before use.

## Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind, Radix UI, Lucide, TanStack Query, tRPC
- **Backend:** Node.js, Express, tRPC, Zod
- **Database:** MySQL + Drizzle ORM
- **Files:** Structure prepared for S3
- **Auth:** OAuth + JWT

Tables: `users`, `clients`, `consultations`, `lawsuits`, `lawsuit_movements`, `calendar_events`, `tasks`, `financial_transactions`, `legal_documents`.

## Running locally

```bash
pnpm install
cp .env.example .env     # fill in DATABASE_URL, JWT_SECRET, and the LLM keys
pnpm db:push             # generates and applies the migrations
pnpm dev                 # http://localhost:3000
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm check` (typecheck), `pnpm test` (vitest), `pnpm format`.

## Demo mode

The **"Generate Sample Data"** button in the menu populates the system with clients, cases, hearings, tasks, financial entries, and documents — useful for commercial demos without entering anything manually.

## Current stage

Functional MVP. Not yet implemented: integration with courts, automatic capture of CNJ case updates, Official Gazette publications, real-time case law, RAG with the firm's documents, digital signatures, DOCX/PDF export, WhatsApp/Gmail/Google Calendar integrations, OCR, advanced team permissions, detailed auditing, multi-firm support, PIX/boleto billing, and deadline automation.

## License

MIT
