# supabase-cicd-starter

A **production-grade GitHub Actions CI/CD pipeline**, demonstrated end-to-end on a
small but real Supabase app (a feature-request board). The app is intentionally
simple so the engineering *around* it is the focus: environment separation,
database-as-code, automated testing, secure secrets, and one-click rollback —
all on GitHub Actions.

> Built as a portfolio / client-demo reference for a DevOps engineering practice.

---

## What it demonstrates

| Area | How |
| --- | --- |
| **CI on every PR** | Lint → typecheck → unit tests → build → Playwright E2E against a real local Supabase stack |
| **Dev/Prod separation** | Two Supabase projects + two GitHub Environments with scoped secrets |
| **Database as code** | Versioned SQL migrations applied by the pipeline (`supabase db push`) — never clicked in a dashboard |
| **Secure secrets** | GitHub Environments + repo secrets; keyless GHCR via `GITHUB_TOKEN`; nothing sensitive in git |
| **Release automation** | SemVer tag → auto-generated release notes + immutable versioned Docker image |
| **Rollback** | Re-tag a known-good image to `prod` in seconds — no rebuild |
| **Containerized** | Multi-stage Docker build, nginx-served SPA, `docker-compose` for local |
| **Governance** | Branch protection, CODEOWNERS, PR template, Dependabot |

## The app itself

A feature-request board: sign in, post an idea, upvote others. Vote counts
update **live** across browsers via Supabase Realtime. Built with React + Vite +
TypeScript on a Supabase backend (Postgres + Auth + Realtime + Row Level
Security + an Edge Function).

## Architecture

```
  React (Vite, TS)  ──>  Supabase project (per environment)
  served by nginx        ├─ Postgres + Row Level Security
  in a Docker image      ├─ Auth (email/password)
  on GHCR                ├─ Realtime (live vote updates)
                         └─ Edge Function (on-new-post hook)
        ▲                         ▲
        └──── GitHub Actions ─────┘
       CI · migrations · build/push · release · rollback

  develop ─▶ Dev environment    (auto-deploy)
  v*.*.* tag ─▶ Prod environment (manual approval gate)
```

Full detail in [docs/architecture.md](docs/architecture.md).

## Run it locally

```bash
# 1. Backend: Postgres + Auth + Realtime + Studio (needs Docker + Supabase CLI)
supabase start
supabase db reset            # applies migrations + seed.sql

# 2. Point the app at local Supabase
cp .env.example .env.local   # fill VITE_* from `supabase status`

# 3. Frontend
npm install
npm run dev                  # http://localhost:5173
```

Run the checks the pipeline runs:

```bash
npm run lint && npm run typecheck && npm test    # CI gate
npm run e2e                                      # Playwright (needs supabase start + build)
```

## CI/CD pipelines

| Workflow | Trigger | Does |
| --- | --- | --- |
| [`ci.yml`](.github/workflows/ci.yml) | every PR / push | lint, typecheck, unit, build, Playwright E2E |
| [`deploy-dev.yml`](.github/workflows/deploy-dev.yml) | push to `develop` | migrate Dev DB + deploy functions + push `:dev` image |
| [`deploy-prod.yml`](.github/workflows/deploy-prod.yml) | `v*.*.*` tag | **(approval gate)** migrate Prod DB + push versioned image |
| [`release.yml`](.github/workflows/release.yml) | `v*.*.*` tag | GitHub Release with auto-generated notes |
| [`rollback.yml`](.github/workflows/rollback.yml) | manual | re-tag a known-good image to `prod` |

## Documentation

- [Architecture](docs/architecture.md)
- [Deployment & release process](docs/deployment.md)
- [Secrets management](docs/secrets.md)
- [Onboarding](docs/onboarding.md)

## Tech

React 18 · Vite · TypeScript · Supabase · Playwright · Vitest · Docker · nginx · GitHub Actions · GHCR
