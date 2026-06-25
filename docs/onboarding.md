# Onboarding

Get productive on this project in ~15 minutes.

## Prerequisites
- Node.js 20 (`nvm use` reads `.nvmrc`)
- Docker (for the local Supabase stack)
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)
- A GitHub account with access to this repo

## 1. Clone & install
```bash
git clone https://github.com/<org>/supabase-cicd-starter.git
cd supabase-cicd-starter
nvm use
npm install
```

## 2. Start the backend locally
```bash
supabase start          # Postgres, Auth, Realtime, Studio
supabase db reset       # apply migrations + seed data
```
`supabase status` prints your local API URL and anon key.

## 3. Configure & run the app
```bash
cp .env.example .env.local
# paste the URL + anon key from `supabase status`
npm run dev             # http://localhost:5173
```
Sign up with any email/password (local confirmations are off), post an idea, vote.

## 4. The checks you must pass before pushing
```bash
npm run lint
npm run typecheck
npm test
npm run build
```
These mirror the CI gate. To run E2E like CI does: `npm run build` then `npm run e2e`.

## 5. How to ship a change
1. Branch: `git checkout -b feature/my-change` off `develop`.
2. For DB changes, create a **new** migration:
   `supabase migration new my_change`, edit the SQL, test with `supabase db reset`.
3. Open a PR into `develop`. CI runs; get a review (CODEOWNERS).
4. Merge → it auto-deploys to **Dev**.
5. When `develop` is good, PR into `main`, then tag `vX.Y.Z` to release to **Prod**
   (a maintainer approves the prod gate).

## Project map
```
src/                 React app (components, lib, supabaseClient)
supabase/migrations/ schema as code  ← DB changes go here
supabase/functions/  edge functions
tests/e2e/           Playwright
.github/workflows/   CI/CD pipelines
docs/                this documentation
```

## Where to look when…
- **A deploy failed** → the workflow run logs + `docs/deployment.md`.
- **Auth/RLS denies something** → `supabase/migrations/0002_rls.sql`.
- **You need a secret** → `docs/secrets.md` (do not hardcode).
- **Schema questions** → `supabase/migrations/0001_init.sql` + `docs/architecture.md`.
