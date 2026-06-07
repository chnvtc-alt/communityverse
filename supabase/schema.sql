create table if not exists profiles (
  id text primary key,
  player_name text not null,
  restaurant_name text not null,
  restaurant_slug text not null,
  is_guest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload_json jsonb not null
);

create index if not exists idx_profiles_updated_at on profiles (updated_at desc);
create index if not exists idx_profiles_restaurant_slug on profiles (restaurant_slug);

create table if not exists sessions (
  id text primary key,
  profile_id text not null references profiles (id) on delete cascade,
  restaurant_slug text not null,
  completed_at timestamptz not null default now(),
  payload_json jsonb not null
);

create index if not exists idx_sessions_profile_id on sessions (profile_id);
create index if not exists idx_sessions_completed_at on sessions (completed_at desc);

create table if not exists questions (
  id text primary key,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload_json jsonb not null
);

create index if not exists idx_questions_active_sort on questions (active, sort_order, updated_at desc);
