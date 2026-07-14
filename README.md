# 🔎 MY Git Analyzer

Paste any **public GitHub repository URL** and instantly get its folder
structure, detected tech stack, project intelligence (database / auth / API
routes), a full code metrics breakdown, an **AI-generated architecture
diagram**, a **repository health score**, **README quality analysis**, and an
**AI chat** you can ask anything about the code.

The backend extracts **facts** — all rule-based, no AI involved. The AI layer
only *explains* those facts and answers questions about them; it never
guesses at repo structure. The AI layer is fully **provider-agnostic**,
configured entirely through environment variables.

## ✨ Features

| Feature | Description |
|---|---|
| 🏗️ **AI Architecture Diagram** | An automatically generated diagram showing how the project's modules (backend, controllers, lib, auth, etc.) connect to each other. Tap a node to highlight what it connects to. |
| 📊 **Repository Health Score** | An overall 0–100 score broken down into Architecture, Documentation, Maintainability, and Security sub-scores. |
| 📖 **README Quality Analysis** | Scans the repo's own README and scores it out of 100, checking for an installation guide, usage instructions, API documentation, license, and contributing guide. |
| 🤖 **AI Folder Explanation** | Click any folder to get an AI-generated explanation of its purpose, contents, most important files, responsibilities, and how it interacts with the rest of the project. |
| 💬 **AI Repository Chat** | Ask anything about the repo — answers are grounded in the extracted facts, not guesses. |
| 🧰 **Tech Stack Detection** | Languages, package manager, frameworks, and build tools — all rule-based. |
| 🧠 **Project Intelligence** | Detects database usage, authentication method, and API routes. |
| 📈 **Code Metrics** | Total files, folders, lines of code, language distribution, and largest files. |
| 📅 **Repository Timeline** | A timeline view of the repository's development history. |
| 🗂️ **Folder Structure Explorer** | Full interactive tree view of the cloned repository. |
| 🔐 **Auth & Saved Analyses** | JWT-based auth so you can save and revisit past analyses. |

---

## 🧱 Stack

- **client/** — React 19 + Vite + Tailwind CSS v4 + React Router + TanStack Query
- **server/** — Node + Express 5, Prisma + PostgreSQL, JWT auth, provider-agnostic AI service

## 🗺️ Features by roadmap phase

| Phase | Feature | Status |
|------|---------|--------|
| 0 | Backend skeleton, health check, frontend wiring | ✅ |
| 1 | Analyze pipeline: shallow clone → walk tree → cleanup | ✅ |
| 2 | Tech-stack detection (languages, package manager, frameworks, build tools) | ✅ |
| 3 | Project intelligence (database, auth, API routes) | ✅ |
| 4 | Metrics + visualization (totals, LOC, language distribution, largest files) | ✅ |
| 5 | AI Repository Chat via the single `aiService` | ✅ |
| 6 | Auth (JWT) + Database (PostgreSQL/Prisma): save & revisit analyses | ✅ |
| 7 | AI Architecture Diagram | ✅ |
| 8 | Repository Health Score | ✅ |
| 9 | README Quality Analysis | ✅ |
| 10 | AI Folder Explanation | ✅ |
| 11 | Repository Timeline | ✅ |

---

## 🚀 Getting started

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

## ⚙️ How it works

```
client  ──HTTP(JSON)+JWT──▶  server
                              ├─ analyze        validate URL → shallow clone → walk → extract facts → delete temp
                              ├─ detect         languages, package manager, frameworks, build tools   (rule-based)
                              ├─ intelligence   database, auth, API routes                             (rule-based)
                              ├─ metrics        totals, LOC, language distribution, largest files
                              ├─ health         architecture / documentation / maintainability / security score
                              ├─ readme-quality scores the repo's own README against key sections
                              ├─ timeline       builds a development timeline from repo history
                              ├─ chat           builds a prompt from the extracted facts, calls aiService
                              ├─ folder-explain builds a prompt scoped to a single folder, calls aiService
                              ├─ services/aiService.js   the ONLY place that talks to the AI provider
                              └─ Prisma → PostgreSQL: User, Analysis
```

**Key principle:** the backend extracts facts; the AI only explains them and
answers questions. Swapping AI providers later = change the `.env` values
(and, at most, the single `aiService.js` adapter).

---

## 🛡️ Safety

- Secrets only in `server/.env` (git-ignored); `.env.example` documents the shape.
- Cloned repos go to an OS temp dir and are **always** deleted after analysis.
- Clone depth 1 + timeout + file-count guards so a huge repo can't hang the server.
- Input validation on every route; clear error messages returned as JSON.

See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the full design.

