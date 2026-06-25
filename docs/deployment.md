# Deployment & Release Process

## Branching model

| Branch | Role | Deploys to |
| --- | --- | --- |
| `main` | Always-releasable. Protected. | nothing directly |
| `develop` | Integration branch | **Dev** (auto) |
| `feature/*` | Work branches → PR into `develop` | — |
| `vX.Y.Z` tag | A release, cut from `main` | **Prod** (gated) |

Flow: `feature/*` → PR → `develop` (Dev deploy) → PR `develop` → `main` →
tag `vX.Y.Z` → Prod deploy + Release.

## Dev deployment (automatic)

On every push to `develop`, [`deploy-dev.yml`](../.github/workflows/deploy-dev.yml):
1. `supabase link` + `supabase db push` — applies any new migrations to the Dev project.
2. `supabase functions deploy on-new-post` — ships edge functions.
3. Builds and pushes `ghcr.io/<repo>:dev`.

No approval required — Dev is meant to move fast.

## Production deployment (gated)

Cut a release from `main`:

```bash
git checkout main && git pull
# bump version in package.json, commit
git tag v1.3.0
git push origin v1.3.0
```

The tag triggers [`deploy-prod.yml`](../.github/workflows/deploy-prod.yml), which
**pauses for approval** (the `production` GitHub Environment has required
reviewers). After approval it:
1. Pushes migrations to the Prod Supabase project.
2. Deploys edge functions.
3. Builds and pushes `:v1.3.0`, `:prod`, and `:latest` images.

In parallel, [`release.yml`](../.github/workflows/release.yml) publishes a GitHub
Release with notes generated from the commits since the last tag.

## Versioning

Semantic Versioning (`vMAJOR.MINOR.PATCH`):
- **MAJOR** — breaking change (e.g. a migration that drops/renames columns)
- **MINOR** — backwards-compatible feature
- **PATCH** — fix

The git tag is the single source of truth and names the production image.

## Rollback

### Application (fast — seconds)
Because every release publishes an immutable version-tagged image, rollback is a
re-tag. Run [`rollback.yml`](../.github/workflows/rollback.yml) (manual dispatch)
with the known-good tag, e.g. `v1.2.0`. It re-points `:prod`/`:latest` at that
image. No rebuild, deterministic.

### Database (deliberate)
Migrations roll *forward*. To undo a schema change, write a new migration that
reverses it and ship it through the normal flow. **Therefore: make migrations
backwards-compatible** (add columns/tables before relying on them; remove only
after the old image is gone) so an app rollback never collides with the live
schema. This expand/contract discipline is what makes the fast app rollback safe.

## Migrations: the rules
- One change = one new file in `supabase/migrations/` (timestamp/sequence prefix).
- **Never edit a migration that has been applied** to any shared environment.
- Test locally first: `supabase db reset` rebuilds from scratch + seed.
- The pipeline applies them — nobody runs DDL by hand in the dashboard.

## Monitoring & logging hooks
- Supabase dashboard exposes Postgres, Auth, and Edge Function logs per project.
- The nginx image has a `HEALTHCHECK`; wire it to your orchestrator's probes.
- Deploy events surface in the GitHub Actions run summary (`$GITHUB_STEP_SUMMARY`).
- Optional: forward logs/metrics to an observability stack (e.g. Dynatrace) from
  whatever runs the container.
