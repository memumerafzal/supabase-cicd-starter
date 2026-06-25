# Architecture

## Overview

A single-page React app talks directly to a Supabase project. There is no custom
backend server — Supabase provides the database, auth, realtime, and serverless
functions. Each environment (Dev, Prod) is its own isolated Supabase project.

```
┌────────────────────┐        ┌─────────────────────────────────┐
│ React SPA (Vite/TS)│  HTTPS │ Supabase project (per env)      │
│ nginx in Docker    │ ─────▶ │  • Postgres (+ RLS)             │
│ image on GHCR      │        │  • Auth (email/password)        │
│                    │ ◀───── │  • Realtime (vote updates)      │
└────────────────────┘  WSS   │  • Edge Function: on-new-post   │
                               └─────────────────────────────────┘
```

## Components

### Frontend
- **React + Vite + TypeScript**, built to static assets and served by **nginx**.
- Talks to Supabase via `@supabase/supabase-js` using the **anon public key** —
  safe to ship to the browser *because* Row Level Security enforces access on
  the server.
- Realtime subscription on the `votes` and `posts` tables refreshes the board
  live; votes apply optimistically for snappy UX.

### Data model

| Table | Purpose | Key policies |
| --- | --- | --- |
| `profiles` | Display info mirrored from `auth.users` | read all; write own |
| `posts` | Feature requests | read all; author writes |
| `votes` | One row per (post, user) | read all; user manages own |
| `comments` | Discussion (table ready; UI optional) | read all; author writes |

- `posts_with_votes` view aggregates vote counts in the DB (no N+1 from the client).
- A trigger auto-creates a `profiles` row on signup.
- **Row Level Security** is the security boundary — the board is publicly
  readable, every write is scoped to `auth.uid()`.

### Backend (Supabase)
- **Postgres** with schema defined entirely in `supabase/migrations/`.
- **Auth** issues JWTs the client attaches automatically; RLS policies read
  `auth.uid()` from the JWT.
- **Edge Function** `on-new-post` is a serverless hook (e.g. notify Slack),
  deployable per environment.

## Environments

| | Dev | Prod |
| --- | --- | --- |
| Branch / trigger | `develop` | `v*.*.*` tag |
| Supabase project | dev project ref | prod project ref |
| GitHub Environment | `dev` | `production` (approval gate) |
| Image tag | `:dev` | `:vX.Y.Z`, `:prod`, `:latest` |

Each environment's Supabase URL/keys live in that GitHub Environment — code is
identical across environments; only injected config differs.

## Build & artifact flow

1. PR → `ci.yml` validates (lint, types, unit, build, E2E on local Supabase).
2. Merge to `develop` → `deploy-dev.yml` migrates the Dev DB and pushes a `:dev` image.
3. Tag `vX.Y.Z` → `deploy-prod.yml` (after approval) migrates Prod and pushes an
   immutable `:vX.Y.Z` image; `release.yml` cuts the GitHub Release.
4. Images are stored on **GHCR**; immutability is what makes rollback trivial.

## Why these choices
- **Database-as-code** keeps Dev and Prod schemas provably in sync and reviewable in PRs.
- **Anon key + RLS** is the Supabase security model — never ship the service-role key to the client.
- **Immutable image tags** make rollback a re-tag, not a rebuild.
- **Approval-gated prod** keeps a human in the loop for production changes (SOC 2-friendly).
