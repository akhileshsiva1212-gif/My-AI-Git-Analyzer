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
- Every AI feature — **chat** and **AI folder explanation** — goes through
  this file (the architecture diagram's node graph is rule-based; only its
  display labels pass through `aiService`). Swapping providers later = change
  env values (and at most this one adapter file).

---

## Architecture Overview

```
client/  (React 19 + Vite + Tailwind + React Router + TanStack Query)
   │  HTTP (JSON) + JWT in Authorization header
   ▼
server/  (Node + Express)
   ├── auth            → register / login, JWT issue + verify
   ├── analyze         → validate URL → shallow clone → walk files → extract facts
   ├── detect          → languages, frameworks, deps, package manager, build tools,
   │                     database, auth, API routes  (all rule-based, NO AI)
   ├── metrics         → totals, LOC, language distribution, largest files
   ├── health          → architecture / documentation / maintainability / security
   │                     score, computed from the extracted facts  (rule-based)
   ├── readme-quality  → scores the repo's own README against key sections
   │                     (install guide, usage, API docs, license, contributing)
   ├── timeline        → builds a development timeline from commit/repo history
   ├── chat            → sends extracted facts + relevant snippets through aiService
   ├── folder-explain  → sends one folder's facts through aiService for an
   │                     AI-generated purpose / contents / responsibilities summary
   ├── services/aiService.js → the ONLY place that talks to the AI provider
   └── db (Prisma)     → PostgreSQL: User, Analysis
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
- Simple charts + folder-tree view.

### Phase 5 — AI Repository Chat (via aiService)
- `POST /api/chat`: backend builds a prompt from the **already-extracted facts** +
  relevant file snippets, then calls `askAI(...)` from the single AI service.
- Chat UI on the dashboard. Provider/model come only from env (`MODEL=auto`).

### Phase 6 — Auth (JWT) + Database (PostgreSQL/Prisma)
- Prisma schema: `User`, `Analysis`. Register/login with bcrypt-hashed passwords + JWT.
- Protect routes; **Save Analyses** and **View Previous Analyses** in a user dashboard.

### Phase 7 — 🏗️ AI Architecture Diagram
- Backend derives a module graph from the already-extracted facts (folders,
  detected frameworks, route files, auth/database usage) — **rule-based**, no
  guessing.
- `aiService` turns that graph into short labels/groupings for display; the
  graph shape itself always comes from facts, never from the AI.
- Frontend: interactive diagram component on the dashboard — tapping a node
  highlights everything it connects to.

### Phase 8 — 📊 Repository Health Score
- `GET /api/analyses/:id/health`: computes four rule-based sub-scores —
  **Architecture**, **Documentation**, **Maintainability**, **Security** — each
  0–100, plus a combined overall score.
- Scoring inputs come from Phases 1–4 facts (folder depth/organization, README
  presence, dependency freshness, secret-handling patterns, etc.) — no AI.
- Frontend: health score ring + sub-score bars on the dashboard.

### Phase 9 — 📖 README Quality Analysis
- `GET /api/analyses/:id/readme-quality`: parses the analyzed repo's own
  README and checks for key sections — Installation Guide, Usage Instructions,
  API Documentation, License, Contributing Guide — **rule-based** section
  detection, scored out of 100.
- Frontend: checklist card showing which sections were found.

### Phase 10 — 🤖 AI Folder Explanation
- `POST /api/analyses/:id/folders/:path/explain`: backend gathers the facts
  already known about that folder (file list, sizes, detected role) and sends
  them through `aiService` for a natural-language explanation (purpose,
  contents, most important files, responsibilities, interactions).
- Frontend: clicking a folder in the tree opens an "AI Explanation" modal.
- Same rule as chat: the AI explains facts, it never invents folder contents.

### Phase 11 — 📅 Repository Timeline
- Backend builds a timeline from repo metadata gathered during the shallow
  clone/analysis step (e.g. commit dates available from `git log` within the
  cloned depth, file-creation ordering) — rule-based, no AI.
- Frontend: timeline view showing the repo's development history at a glance.

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
- Health score, README quality, and timeline are all rule-based (no AI) —
  only chat and folder explanation call `aiService`, and both are grounded
  strictly in already-extracted facts.

## Out of scope for now (can add later)
- Background job queue for very large repos
- Rate limiting / multi-user quotas
- Deployment config (Docker, CI)
