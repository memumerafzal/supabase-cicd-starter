-- 0003_grants.sql — table-level privileges for the PostgREST API roles.
--
-- RLS (migration 0002) governs WHICH rows each role may see/modify; these GRANTs
-- govern table-level access in the first place. BOTH are required — without a
-- grant, the API returns "permission denied for table ...". Done explicitly so
-- the schema is self-contained and doesn't depend on Supabase's implicit
-- default-privilege configuration.

grant usage on schema public to anon, authenticated;

-- Public board: anyone (including logged-out visitors) can read.
grant select on posts to anon, authenticated;
grant select on votes to anon, authenticated;
grant select on comments to anon, authenticated;
grant select on profiles to anon, authenticated;
grant select on posts_with_votes to anon, authenticated;

-- Logged-in users can write; RLS scopes every write to their own rows.
grant insert, update, delete on posts to authenticated;
grant insert, delete on votes to authenticated;
grant insert, delete on comments to authenticated;
grant insert, update on profiles to authenticated;
