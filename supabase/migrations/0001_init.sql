-- 0001_init.sql — core schema for the feedback board.
-- Migrations are versioned in git and applied by CI (`supabase db push`),
-- never by hand in the dashboard. This is the source of truth for the schema.

create type post_status as enum ('open', 'planned', 'in_progress', 'done');

-- A lightweight profile row mirrors each auth user so we can show display info
-- without exposing auth.users directly.
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  created_at timestamptz not null default now()
);

create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 140),
  description text not null default '',
  status post_status not null default 'open',
  author_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table votes (
  post_id uuid not null references posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id) -- one vote per user per post
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index posts_author_idx on posts (author_id);
create index votes_post_idx on votes (post_id);
create index comments_post_idx on comments (post_id);

-- Aggregated view the frontend reads from, so vote counts come from the DB,
-- not from N+1 client queries.
create view posts_with_votes as
select
  p.id,
  p.title,
  p.description,
  p.status,
  p.author_id,
  p.created_at,
  count(v.user_id)::int as vote_count
from posts p
left join votes v on v.post_id = p.id
group by p.id;

-- Auto-create a profile whenever a new auth user signs up.
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
