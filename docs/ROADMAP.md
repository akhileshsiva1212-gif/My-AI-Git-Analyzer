# MY Git Analyzer 🔎 — Implementation Plan

**Decisions locked in**
- AI layer: **provider-agnostic**, configured entirely via environment variables.
  Uses the **FreeModel API** with automatic model selection (`MODEL=auto`).
  **No hard-coded provider or model anywhere.**
- Repo ingestion: **shallow `git clone`** into a temp folder, analyze, then delete.
- Build: **one full-app plan**, implemented in small reviewable commits.

---

## AI Layer Design (provider-agnostic)

**Environment variables** (`server/.env`, git-ignored):
```
AI_BASE_URL=https://your-freemodel-endpoint/v1
AI_API_KEY=your-key-here
MODEL=auto
```

**Single service layer** — `server/src/services/aiService.js`:
- Reads `AI_BASE_URL`, `AI_API_KEY`, `MODEL` from env — nothing hard-coded.
- Exposes ONE function the whole app uses: `askAI({ system, messages })`.
- Sends the common chat request shape `{ model, messages }` to `AI_BASE_URL`;
  `MODEL=auto` is passed through so FreeModel selects the model.
- Every AI feature (chat, explanations) goes through this file. Swapping
  providers later = change env values (and at most this one adapter file).

---

## Architecture Overview

```
client/  (React 19 + Vite + Tailwind + React Router + TanStack Query)
   │  HTTP (JSON) + JWT in Authorization header
   ▼
server/  (Node + Express)
   ├── auth        → register / login, JWT issue + verify
   ├── analyze     → validate URL → shallow clone → walk files → extract facts
   ├── detect      → languages, frameworks, deps, package manager, build tools,
   │                 database, auth, API routes  (all rule-based, NO AI)
   ├── metrics     → totals, LOC, language distribution, largest files
   ├── chat        → sends extracted facts + relevant snippets through aiService
   ├── services/aiService.js → the ONLY place that talks to the AI provider
   └── db (Prisma) → PostgreSQL: User, Analysis
```

**Key principle from the spec:** the backend extracts *facts*; the AI only
*explains* those facts and answers questions. The AI never guesses repo structure.

---

## Phase-by-phase build (each = its own commit)

### Phase 0 — Backend skeleton + tooling
- `server/`: `npm init`, Express, `nodemon`, `dotenv`, `cors`, folder structure
  (`src/routes`, `src/controllers`, `src/services`, `src/middleware`, `src/lib`).
- `.env.example` (documents `AI_BASE_URL`, `AI_API_KEY`, `MODEL`, DB, JWT — no real secrets).
- Health-check route `GET /api/health`.
- Frontend: add **Tailwind**, **React Router**, **TanStack Query**; Vite dev proxy to server.

### Phase 1 — Analyze pipeline (no AI yet)
- `POST /api/analyze` → validate GitHub URL → shallow `git clone --depth 1` to a
  temp dir → walk the tree (ignore `.git`, `node_modules`) → return folder tree +
  important files → delete temp dir.
- Frontend: URL input on Home → results **Dashboard** page showing the folder tree.

### Phase 2 — Tech stack detection
- Rule-based readers: languages (by extension), package manager (lockfiles),
  dependencies/frameworks (`package.json`, `requirements.txt`, `pom.xml`, …),
  build tools (config files). Render as cards on the dashboard.

### Phase 3 — Project intelligence
- Detect database (Prisma/Sequelize/env hints), auth (jwt/passport/bcrypt deps),
  API routes (scan Express/Fastify/Next route patterns).

### Phase 4 — Metrics + visualization
- Total files/folders, total LOC, language distribution (%), largest files.
- Simple charts + folder-tree view and a basic architecture diagram.

### Phase 5 — AI Repository Chat (via aiService)
- `POST /api/chat`: backend builds a prompt from the **already-extracted facts** +
  relevant file snippets, then calls `askAI(...)` from the single AI service.
- Chat UI on the dashboard. Provider/model come only from env (`MODEL=auto`).

### Phase 6 — Auth (JWT) + Database (PostgreSQL/Prisma)
- Prisma schema: `User`, `Analysis`. Register/login with bcrypt-hashed passwords + JWT.
- Protect routes; **Save Analyses** and **View Previous Analyses** in a user dashboard.

---

## Prerequisites you'll need
- **PostgreSQL** running locally (or a free cloud DB) — needed at Phase 6.
- **FreeModel API** base URL + API key in `server/.env` — needed at Phase 5.
- **git** on PATH (used by the analyze pipeline).

## Safety / good habits baked in
- Secrets only in `server/.env` (git-ignored); `.env.example` documents the shape.
- Cloned repos go to a temp dir and are always cleaned up.
- Clone depth 1 + size/timeout guards so a huge repo can't hang the server.
- Input validation on every route; clear error messages to the UI.
- All AI access isolated to one module → provider changes stay contained.

## Out of scope for now (can add later)
- Background job queue for very large repos
- Rate limiting / multi-user quotas
- Deployment config (Docker, CI)
