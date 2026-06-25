-- 0002_rls.sql — Row Level Security. Least-privilege at the data layer:
-- the board is publicly readable, but writes are scoped to the owner.

alter table profiles enable row level security;
alter table posts enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;

-- Profiles: everyone can read; you can only write your own.
create policy "profiles readable" on profiles
  for select using (true);
create policy "insert own profile" on profiles
  for insert with check (auth.uid() = id);
create policy "update own profile" on profiles
  for update using (auth.uid() = id);

-- Posts: public board (readable by all), authenticated users create,
-- authors edit/delete their own.
create policy "posts readable" on posts
  for select using (true);
create policy "authenticated can post" on posts
  for insert with check (auth.uid() = author_id);
create policy "author can update post" on posts
  for update using (auth.uid() = author_id);
create policy "author can delete post" on posts
  for delete using (auth.uid() = author_id);

-- Votes: readable by all; users manage only their own vote.
create policy "votes readable" on votes
  for select using (true);
create policy "user can vote" on votes
  for insert with check (auth.uid() = user_id);
create policy "user can unvote" on votes
  for delete using (auth.uid() = user_id);

-- Comments: readable by all; authors create and delete their own.
create policy "comments readable" on comments
  for select using (true);
create policy "authenticated can comment" on comments
  for insert with check (auth.uid() = author_id);
create policy "author can delete comment" on comments
  for delete using (auth.uid() = author_id);

-- Default author_id / user_id to the caller so the client never has to send it.
alter table posts alter column author_id set default auth.uid();
alter table votes alter column user_id set default auth.uid();
alter table comments alter column author_id set default auth.uid();
