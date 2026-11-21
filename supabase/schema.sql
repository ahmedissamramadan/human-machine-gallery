-- ============================================================
--  إنسانٌ وآلة · Human × Machine — Supabase schema
--  شغّل هذا الملف مرة واحدة في: Supabase → SQL Editor → Run
--  Run once in the Supabase SQL editor. It is safe to run again.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- 1. profiles  (public profile for every account)
-- ------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         text not null default 'visitor' check (role in ('visitor','artist')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- nobody can promote themselves to artist through the API
create or replace function public.protect_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_artist() then
    new.role := old.role;
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_role();

-- create a profile row automatically for every new account
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: is the current user the gallery owner?
create or replace function public.is_artist()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'artist');
$$;
revoke all on function public.is_artist() from public;
grant execute on function public.is_artist() to anon, authenticated;

-- ------------------------------------------------------------
-- 2. works  (the plates)
-- ------------------------------------------------------------
create table if not exists public.works (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  title_ar   text not null,
  title_en   text not null,
  cat        text not null,                       -- edit | eng | sur | photo
  tags       text[] not null default '{}',
  thumb_url  text not null,
  full_url   text not null,
  year       int,
  sort       int not null default 0,
  published  boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists works_sort_idx on public.works (published, cat, sort);

alter table public.works enable row level security;

drop policy if exists works_read on public.works;
create policy works_read on public.works
  for select using (published or public.is_artist());

drop policy if exists works_write on public.works;
create policy works_write on public.works
  for all using (public.is_artist()) with check (public.is_artist());

-- ------------------------------------------------------------
-- 3. likes / favorites
-- ------------------------------------------------------------
create table if not exists public.likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  work_id    uuid not null references public.works(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, work_id)
);

create table if not exists public.favorites (
  user_id    uuid not null references auth.users(id) on delete cascade,
  work_id    uuid not null references public.works(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, work_id)
);

alter table public.likes     enable row level security;
alter table public.favorites enable row level security;

drop policy if exists likes_read on public.likes;
create policy likes_read on public.likes
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists likes_insert on public.likes;
create policy likes_insert on public.likes
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists likes_delete on public.likes;
create policy likes_delete on public.likes
  for delete to authenticated using (auth.uid() = user_id);

drop policy if exists favorites_read on public.favorites;
create policy favorites_read on public.favorites
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists favorites_insert on public.favorites;
create policy favorites_insert on public.favorites
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists favorites_delete on public.favorites;
create policy favorites_delete on public.favorites
  for delete to authenticated using (auth.uid() = user_id);

-- aggregate counts (no user ids leak to the public)
create or replace function public.work_stats()
returns table (work_id uuid, likes int, favorites int, comments int)
language sql
stable
security definer
set search_path = public
as $$
  select w.id,
         (select count(*)::int from public.likes     l where l.work_id = w.id),
         (select count(*)::int from public.favorites f where f.work_id = w.id),
         (select count(*)::int from public.comments  c where c.work_id = w.id)
  from public.works w
  where w.published;
$$;
revoke all on function public.work_stats() from public;
grant execute on function public.work_stats() to anon, authenticated;

-- ------------------------------------------------------------
-- 4. comments
-- ------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  work_id    uuid not null references public.works(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1200),
  created_at timestamptz not null default now()
);

create index if not exists comments_work_idx on public.comments (work_id, created_at);

alter table public.comments enable row level security;

drop policy if exists comments_read on public.comments;
create policy comments_read on public.comments
  for select using (true);

drop policy if exists comments_insert on public.comments;
create policy comments_insert on public.comments
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists comments_delete on public.comments;
create policy comments_delete on public.comments
  for delete using (auth.uid() = user_id or public.is_artist());

-- comments joined with the author's display name (public view)
create or replace function public.work_comments(p_work uuid)
returns table (id uuid, user_id uuid, display_name text, body text, created_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.user_id, coalesce(p.display_name, 'Anonymous'), c.body, c.created_at
  from public.comments c
  left join public.profiles p on p.id = c.user_id
  where c.work_id = p_work
  order by c.created_at asc
  limit 500;
$$;
revoke all on function public.work_comments(uuid) from public;
grant execute on function public.work_comments(uuid) to anon, authenticated;

-- ------------------------------------------------------------
-- 5. messages  (one private thread per visitor, with the artist)
-- ------------------------------------------------------------
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade, -- owner of the thread
  sender_id  uuid not null references auth.users(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 2000),
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_thread_idx on public.messages (user_id, created_at);

alter table public.messages enable row level security;

drop policy if exists messages_read on public.messages;
create policy messages_read on public.messages
  for select to authenticated using (auth.uid() = user_id or public.is_artist());

drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and (auth.uid() = user_id or public.is_artist()));

drop policy if exists messages_update on public.messages;
create policy messages_update on public.messages
  for update to authenticated
  using (auth.uid() = user_id or public.is_artist())
  with check (auth.uid() = user_id or public.is_artist());

drop policy if exists messages_delete on public.messages;
create policy messages_delete on public.messages
  for delete to authenticated using (auth.uid() = user_id or public.is_artist());

-- artist inbox: one row per visitor
create or replace function public.inbox()
returns table (user_id uuid, display_name text, last_body text, last_at timestamptz, unread int)
language sql
stable
security definer
set search_path = public
as $$
  select m.user_id,
         coalesce(p.display_name, 'Anonymous') as display_name,
         (array_agg(m.body order by m.created_at desc))[1] as last_body,
         max(m.created_at) as last_at,
         count(*) filter (where m.read_at is null and m.sender_id <> auth.uid())::int as unread
  from public.messages m
  left join public.profiles p on p.id = m.user_id
  where public.is_artist()
  group by m.user_id, p.display_name
  order by max(m.created_at) desc;
$$;
revoke all on function public.inbox() from public;
grant execute on function public.inbox() to authenticated;

-- ------------------------------------------------------------
-- 6. storage bucket for uploaded photography
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do update set public = true;

drop policy if exists gallery_public_read on storage.objects;
create policy gallery_public_read on storage.objects
  for select using (bucket_id = 'gallery');

drop policy if exists gallery_artist_write on storage.objects;
create policy gallery_artist_write on storage.objects
  for all using (bucket_id = 'gallery' and public.is_artist())
  with check (bucket_id = 'gallery' and public.is_artist());

-- ------------------------------------------------------------
-- 7. done
--    بعد إنشاء حسابك، ارفع صلاحيتك إلى artist:
--    update public.profiles set role = 'artist' where id = (
--      select id from auth.users where email = 'YOUR_EMAIL'
--    );
-- ------------------------------------------------------------
