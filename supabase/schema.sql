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
  scope text not null default 'global',
  restaurant_slug text,
  area_slug text,
  difficulty text not null default 'medium',
  tags text[] not null default '{}',
  customer_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload_json jsonb not null
);

alter table questions add column if not exists scope text not null default 'global';
alter table questions add column if not exists restaurant_slug text;
alter table questions add column if not exists area_slug text;
alter table questions add column if not exists difficulty text not null default 'medium';
alter table questions add column if not exists tags text[] not null default '{}';
alter table questions add column if not exists customer_ids text[] not null default '{}';

update questions
set
  scope = coalesce(nullif(payload_json->>'scope', ''), 'global'),
  restaurant_slug = nullif(payload_json->>'restaurantSlug', ''),
  area_slug = nullif(payload_json->>'areaSlug', ''),
  difficulty = coalesce(nullif(payload_json->>'difficulty', ''), 'medium'),
  tags = coalesce(
    array(select jsonb_array_elements_text(coalesce(payload_json->'tags', '[]'::jsonb))),
    '{}'::text[]
  ),
  customer_ids = coalesce(
    array(select jsonb_array_elements_text(coalesce(payload_json->'customerIds', '[]'::jsonb))),
    '{}'::text[]
  );

create index if not exists idx_questions_active_sort on questions (active, sort_order, updated_at desc);
create index if not exists idx_questions_scope on questions (scope);
create index if not exists idx_questions_restaurant_slug on questions (restaurant_slug);
create index if not exists idx_questions_area_slug on questions (area_slug);
create index if not exists idx_questions_difficulty on questions (difficulty);
create index if not exists idx_questions_tags on questions using gin (tags);
create index if not exists idx_questions_customer_ids on questions using gin (customer_ids);

create table if not exists customers (
  id text primary key,
  active boolean not null default true,
  sort_order integer not null default 0,
  name text not null,
  group_name text not null default '',
  rarity text not null default '',
  regular_value integer not null default 0,
  occasional_value integer not null default 0,
  focus_tag text not null default '',
  image text not null default '',
  bio text not null default '',
  question_place text not null default '',
  question_fact text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload_json jsonb not null
);

alter table customers add column if not exists active boolean not null default true;
alter table customers add column if not exists sort_order integer not null default 0;
alter table customers add column if not exists name text not null default '';
alter table customers add column if not exists group_name text not null default '';
alter table customers add column if not exists rarity text not null default '';
alter table customers add column if not exists regular_value integer not null default 0;
alter table customers add column if not exists occasional_value integer not null default 0;
alter table customers add column if not exists focus_tag text not null default '';
alter table customers add column if not exists image text not null default '';
alter table customers add column if not exists bio text not null default '';
alter table customers add column if not exists question_place text not null default '';
alter table customers add column if not exists question_fact text not null default '';

update customers
set
  active = coalesce(payload_json->>'active', 'true')::boolean,
  sort_order = coalesce(nullif(payload_json->>'sortOrder', '')::integer, sort_order),
  name = coalesce(nullif(payload_json->>'name', ''), name),
  group_name = coalesce(nullif(payload_json->>'group', ''), nullif(payload_json->>'groupName', ''), group_name),
  rarity = coalesce(nullif(payload_json->>'rarity', ''), rarity),
  regular_value = coalesce(nullif(payload_json->>'regularValue', '')::integer, regular_value),
  occasional_value = coalesce(nullif(payload_json->>'occasionalValue', '')::integer, occasional_value),
  focus_tag = coalesce(nullif(payload_json->>'focusTag', ''), focus_tag),
  image = coalesce(nullif(payload_json->>'image', ''), image),
  bio = coalesce(nullif(payload_json->>'bio', ''), bio),
  question_place = coalesce(nullif(payload_json->>'questionPlace', ''), question_place),
  question_fact = coalesce(nullif(payload_json->>'questionFact', ''), question_fact);

create index if not exists idx_customers_active_sort on customers (active, sort_order, updated_at desc);
create index if not exists idx_customers_name on customers (name);
create index if not exists idx_customers_group_name on customers (group_name);
create index if not exists idx_customers_focus_tag on customers (focus_tag);

insert into storage.buckets (id, name, public)
values ('customer-photos', 'customer-photos', true)
on conflict (id) do update set public = excluded.public;
