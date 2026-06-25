# Client Demo Script

A tight, ~60-second walkthrough to narrate when showing this repo to a client.
The goal: prove you build *production-grade pipelines*, not just apps. Lead with
the engineering, treat the app as the vehicle.

---

## The 60-second pitch

> "This is a reference CI/CD setup I built on GitHub Actions. The app itself —
> a feature-request board on Supabase — is deliberately small, so the focus is
> the engineering *around* it. Let me show you the pipeline."

**1. Open a PR (10s)** — "Every pull request runs the full gate: lint, type
checks, unit tests, a production build, and Playwright end-to-end tests against
a *real* Supabase instance spun up in CI. Nothing merges unless it's green."
→ *show the CI checks on a PR, and the branch-protection rule blocking merge.*

**2. Merge to `develop` (10s)** — "Merging to develop auto-deploys to the Dev
environment: it pushes database migrations, deploys the edge functions, and
ships a Docker image — no manual steps."
→ *show `deploy-dev.yml` running and the `:dev` image on GHCR.*

**3. Cut a release (15s)** — "Production is gated. I tag a version, and the
deploy pauses for a human approval before anything touches prod. On approval it
migrates the prod database and ships an immutable, version-tagged image. A
GitHub Release with notes is generated automatically."
→ *show the `production` environment approval prompt + the auto-generated Release.*

**4. Rollback (10s)** — "Because every release is an immutable image, rollback
is a single click — re-tag a known-good version to prod. Seconds, no rebuild."
→ *show `rollback.yml` manual dispatch.*

**5. Close (15s)** — "Everything's documented — architecture, deployment,
secrets, onboarding — and secrets are scoped per environment with least
privilege, which lines up with SOC 2 expectations. Database changes are code,
reviewed in PRs, never clicked in a dashboard. This is the spine I'd set up for
your team, adapted to your stack."

---

## Talking points by client concern

| If they ask about… | Say |
| --- | --- |
| **Security / SOC 2** | Per-environment secrets, least-privilege, approval-gated prod, audit trail in Actions logs, branch protection + CODEOWNERS. |
| **Their stack (Laravel/PHP, React)** | The pipeline shape is stack-agnostic — swap the build/test steps; the environment, secrets, release, and rollback design carries over. |
| **AI-driven workflows** | Edge function hook + release-note automation today; easy to add AI-generated test/PR summaries and Cursor integration into the same flow. |
| **Reliability** | Required green CI before merge, E2E against a real backend, immutable images, deterministic rollback. |
| **Onboarding cost** | `docs/onboarding.md` gets a new dev productive in ~15 minutes; everything is reproducible locally with Docker + Supabase CLI. |

## Setup before a live demo (optional)
To demo against real deployments, have two Supabase projects + the secrets from
`docs/secrets.md` wired into the `dev` and `production` GitHub Environments.
Without that, the repo, pipelines, branch protection, and approval gate are all
still fully inspectable on GitHub — which is enough for most conversations.
