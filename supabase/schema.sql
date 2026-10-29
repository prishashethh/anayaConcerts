-- Run this once in Supabase → SQL Editor → New query

create table concerts (
  id uuid primary key default gen_random_uuid(),
  artist text not null,
  date date not null,
  venue text,
  companions text[] not null default '{}',
  new_songs jsonb not null default '[]',  -- [{ "title": "...", "artist": "..." }]
  fav_songs jsonb not null default '[]',
  notes text,
  cover_path text,
  rank_pos double precision,              -- lower = better; null = not ranked yet
  created_at timestamptz not null default now()
);

create table photos (
  id uuid primary key default gen_random_uuid(),
  concert_id uuid not null references concerts(id) on delete cascade,
  path text not null,
  thumb_path text not null,
  created_at timestamptz not null default now()
);

create table countdowns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date date not null,
  created_at timestamptz not null default now()
);

-- Only signed-in users can see or change anything
grant select, insert, update, delete on concerts, photos, countdowns to authenticated;

alter table concerts enable row level security;
alter table photos enable row level security;
alter table countdowns enable row level security;

create policy "signed in" on concerts for all to authenticated using (true) with check (true);
create policy "signed in" on photos for all to authenticated using (true) with check (true);
create policy "signed in" on countdowns for all to authenticated using (true) with check (true);

-- Private photo bucket
insert into storage.buckets (id, name, public) values ('photos', 'photos', false);

create policy "signed in read" on storage.objects for select to authenticated using (bucket_id = 'photos');
create policy "signed in upload" on storage.objects for insert to authenticated with check (bucket_id = 'photos');
create policy "signed in update" on storage.objects for update to authenticated using (bucket_id = 'photos');
create policy "signed in delete" on storage.objects for delete to authenticated using (bucket_id = 'photos');
