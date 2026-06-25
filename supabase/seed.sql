-- seed.sql — sample data for local dev (`supabase start` loads this).
-- Not run against dev/prod by the pipeline; demo data only.
-- Note: posts need a real author_id; locally, sign up a user first, then
-- run this with that user's uuid, or rely on the app to create posts.

insert into posts (title, description, status)
values
  ('Dark mode for the dashboard', 'A proper dark theme that respects system settings.', 'planned'),
  ('CSV export of reports', 'Let me export any report table to CSV.', 'open'),
  ('Slack notifications', 'Ping a Slack channel when a build finishes.', 'in_progress'),
  ('Single sign-on (SSO)', 'SAML / OIDC login for enterprise teams.', 'open')
on conflict do nothing;
