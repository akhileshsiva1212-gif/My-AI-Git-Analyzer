# MY Git Analyzer 🔎

Analyze any **public GitHub repository**: paste a URL and get its folder
structure, detected tech stack, project intelligence (database / auth / API
routes), code metrics, and an **AI chat** you can ask anything about the code.

The backend extracts **facts** (all rule-based, no AI). The AI layer only
*explains* those facts — it never guesses repo structure — and is fully
**provider-agnostic** (configured entirely through environment variables).

---

## Stack

- **client/** — React 19 + Vite + Tailwind CSS v4 + React Router + TanStack Query
- **server/** — Node + Express 5, Prisma + PostgreSQL, JWT auth, provider-agnostic AI service

## Features (by roadmap phase)

| Phase | Feature | Status |
|------|---------|--------|
| 0 | Backend skeleton, health check, frontend wiring | ✅ |
| 1 | Analyze pipeline: shallow clone → walk tree → cleanup | ✅ |
| 2 | Tech-stack detection (languages, package manager, frameworks, build tools) | ✅ |
| 3 | Project intelligence (database, auth, API routes) | ✅ |
| 4 | Metrics + visualization (totals, LOC, language distribution, largest files) | ✅ |
| 5 | AI Repository Chat via the single `aiService` | ✅ |
| 6 | Auth (JWT) + Database (PostgreSQL/Prisma): save & revisit analyses | ✅ |

---

## Getting started

### 1. Server

```bash
cd server
cp .env.example .env        # then fill in your values
npm install
npm run prisma:generate     # generate the Prisma client
npm run prisma:migrate      # create the DB tables (needs PostgreSQL running)
npm run dev                 # http://localhost:5000
```

`server/.env` (git-ignored) — the AI layer is provider-agnostic:

```
PORT=5000
AI_BASE_URL=https://your-freemodel-endpoint/v1
AI_API_KEY=your-key-here
MODEL=auto
DATABASE_URL=postgresql://user:password@localhost:5432/git_analyzer
JWT_SECRET=change-me-to-a-long-random-string
```

### 2. Client

```bash
cd client
npm install
npm run dev                 # http://localhost:5173 (proxies /api -> :5000)
```

---

## How it works

```
client  ──HTTP(JSON)+JWT──▶  server
                              ├─ analyze      validate URL → shallow clone → walk → extract facts → delete temp
                              ├─ detect       languages, package manager, frameworks, build tools   (rule-based)
                              ├─ intelligence database, auth, API routes                             (rule-based)
                              ├─ metrics      totals, LOC, language distribution, largest files
                              ├─ chat         builds a prompt from the extracted facts, calls aiService
                              ├─ services/aiService.js   the ONLY place that talks to the AI provider
                              └─ Prisma → PostgreSQL: User, Analysis
```

**Key principle:** the backend extracts facts; the AI only explains them and
answers questions. Swapping AI providers later = change the `.env` values (and,
at most, the single `aiService.js` adapter).

## Safety

- Secrets only in `server/.env` (git-ignored); `.env.example` documents the shape.
- Cloned repos go to an OS temp dir and are **always** deleted after analysis.
- Clone depth 1 + timeout + file-count guards so a huge repo can't hang the server.
- Input validation on every route; clear error messages returned as JSON.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full design.
