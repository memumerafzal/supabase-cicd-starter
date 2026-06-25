-- seed.sql — sample data for local dev / CI (`supabase start` / `supabase db reset`).
-- Demo data only; not applied to dev/prod by the pipeline.
--
-- posts.author_id is NOT NULL (FK to auth.users), so we first create a confirmed
-- demo user, then author the sample posts to them. The on_auth_user_created
-- trigger auto-creates the matching profiles row.

insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
)
values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'demo@example.com',
  crypt('demo-password-123', gen_salt('bf')), now(),
  now(), now(),
  '{"provider":"email","providers":["email"]}', '{}'
)
on conflict (id) do nothing;

insert into posts (title, description, status, author_id)
values
  ('Dark mode for the dashboard', 'A proper dark theme that respects system settings.', 'planned', '11111111-1111-1111-1111-111111111111'),
  ('CSV export of reports', 'Let me export any report table to CSV.', 'open', '11111111-1111-1111-1111-111111111111'),
  ('Slack notifications', 'Ping a Slack channel when a build finishes.', 'in_progress', '11111111-1111-1111-1111-111111111111'),
  ('Single sign-on (SSO)', 'SAML / OIDC login for enterprise teams.', 'open', '11111111-1111-1111-1111-111111111111')
on conflict do nothing;
