# Secrets Management

## Principles
- **Nothing sensitive in git.** `.env*` is gitignored; only `.env.example` (placeholders) is committed.
- **Scoped per environment.** Dev and Prod secrets live in separate GitHub
  Environments, so a Dev credential can never deploy to Prod.
- **Least privilege.** Each credential does one job. The browser only ever sees
  the anon key; the service-role key never leaves the server side.
- **Keyless where possible.** Image push to GHCR uses the built-in
  `GITHUB_TOKEN` — no long-lived registry credential to manage.

## What goes where

### GitHub Environment secrets (`dev` and `production`)
| Name | Type | Used by |
| --- | --- | --- |
| `SUPABASE_ACCESS_TOKEN` | secret | CLI auth for `db push` / `functions deploy` |
| `SUPABASE_DB_PASSWORD` | secret | DB connection for migrations |
| `SUPABASE_ANON_KEY` | secret | injected into the image build (public, but kept out of git) |

### GitHub Environment variables (non-secret config)
| Name | Example |
| --- | --- |
| `SUPABASE_PROJECT_REF` | `abcdefghijklmno` |
| `SUPABASE_URL` | `https://abcdefghijklmno.supabase.co` |

### Local development (`.env.local`, never committed)
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Supabase Function secrets (set with `supabase secrets set`)
| Name | Used by |
| --- | --- |
| `SLACK_WEBHOOK_URL` | `on-new-post` edge function |

## The two Supabase keys — know the difference
- **anon (public) key** — safe in the browser. Access is still enforced by Row
  Level Security. This is the only key the frontend gets.
- **service-role key** — bypasses RLS. **Never** ship it to the client or commit
  it. Only use it server-side (e.g. inside an edge function) if truly needed.

## Rotation
- Rotate keys from the Supabase dashboard, then update the matching GitHub
  Environment secret. The next deploy picks them up.
- Rotate `SUPABASE_ACCESS_TOKEN` from your Supabase account tokens page.
- No rotation needed for `GITHUB_TOKEN` — GitHub mints it per-run.

## Auditing
- GitHub logs every secret-consuming workflow run and who approved prod deploys.
- Restrict who can edit Environment secrets via repo/org settings.
- Enable secret scanning + push protection on the repo to catch accidental commits.
