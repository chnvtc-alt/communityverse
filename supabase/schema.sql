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

create table if not exists multiplayer_rooms (
  id text primary key,
  room_code text not null unique,
  restaurant_slug text not null,
  customer_id text not null,
  question_ids text[] not null default '{}',
  status text not null default 'open',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  payload_json jsonb not null
);

create index if not exists idx_multiplayer_rooms_code on multiplayer_rooms (room_code);
create index if not exists idx_multiplayer_rooms_restaurant_slug on multiplayer_rooms (restaurant_slug);
create index if not exists idx_multiplayer_rooms_expires_at on multiplayer_rooms (expires_at desc);

create table if not exists multiplayer_room_players (
  id text primary key,
  room_id text not null references multiplayer_rooms (id) on delete cascade,
  profile_id text,
  session_id text,
  display_name text not null default '',
  score integer not null default 0,
  total_questions integer not null default 10,
  result text not null default '',
  status text not null default 'in_progress',
  joined_at timestamptz not null default now(),
  completed_at timestamptz,
  payload_json jsonb not null
);

create index if not exists idx_multiplayer_room_players_room_id on multiplayer_room_players (room_id);
create index if not exists idx_multiplayer_room_players_status on multiplayer_room_players (status);

create table if not exists feedback_responses (
  id text primary key,
  restaurant_slug text not null,
  profile_id text,
  reward_customer_id text not null default '',
  submitted_at timestamptz not null default now(),
  payload_json jsonb not null
);

create index if not exists idx_feedback_responses_restaurant_slug on feedback_responses (restaurant_slug, submitted_at desc);
create index if not exists idx_feedback_responses_profile_id on feedback_responses (profile_id);
create index if not exists idx_feedback_responses_submitted_at on feedback_responses (submitted_at desc);

create table if not exists page_visits (
  id uuid primary key,
  page_path text not null,
  visitor_key text not null,
  visit_date date not null,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_page_visits_unique_daily_visitor on page_visits (page_path, visitor_key, visit_date);
create index if not exists idx_page_visits_path_date on page_visits (page_path, visit_date desc);

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

create table if not exists restaurants (
  id text primary key,
  active boolean not null default true,
  playable boolean not null default true,
  visible_in_list boolean not null default true,
  sort_order integer not null default 0,
  slug text not null unique,
  name text not null,
  public_game_name text not null default '',
  location text not null default '',
  area_slug text not null default '',
  description text not null default '',
  hero_image text not null default '',
  logo_square text not null default '',
  logo_horizontal text not null default '',
  primary_color text not null default '',
  secondary_color text not null default '',
  accent_color text not null default '',
  opening_copy text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payload_json jsonb not null
);

alter table restaurants add column if not exists active boolean not null default true;
alter table restaurants add column if not exists playable boolean not null default true;
alter table restaurants add column if not exists visible_in_list boolean not null default true;
alter table restaurants add column if not exists sort_order integer not null default 0;
alter table restaurants add column if not exists slug text not null default '';
alter table restaurants add column if not exists name text not null default '';
alter table restaurants add column if not exists public_game_name text not null default '';
alter table restaurants add column if not exists location text not null default '';
alter table restaurants add column if not exists area_slug text not null default '';
alter table restaurants add column if not exists description text not null default '';
alter table restaurants add column if not exists hero_image text not null default '';
alter table restaurants add column if not exists logo_square text not null default '';
alter table restaurants add column if not exists logo_horizontal text not null default '';
alter table restaurants add column if not exists primary_color text not null default '';
alter table restaurants add column if not exists secondary_color text not null default '';
alter table restaurants add column if not exists accent_color text not null default '';
alter table restaurants add column if not exists opening_copy text not null default '';

update restaurants
set
  active = coalesce(payload_json->>'active', 'true')::boolean,
  playable = coalesce(payload_json->>'playable', 'true')::boolean,
  visible_in_list = coalesce(payload_json->>'visibleInList', 'true')::boolean,
  sort_order = coalesce(nullif(payload_json->>'sortOrder', '')::integer, sort_order),
  slug = coalesce(nullif(payload_json->>'slug', ''), slug),
  name = coalesce(nullif(payload_json->>'name', ''), name),
  public_game_name = coalesce(nullif(payload_json->>'publicGameName', ''), public_game_name),
  location = coalesce(nullif(payload_json->>'location', ''), location),
  area_slug = coalesce(nullif(payload_json->>'areaSlug', ''), area_slug),
  description = coalesce(nullif(payload_json->>'description', ''), description),
  hero_image = coalesce(nullif(payload_json->>'heroImage', ''), hero_image),
  logo_square = coalesce(nullif(payload_json->>'logoSquare', ''), logo_square),
  logo_horizontal = coalesce(nullif(payload_json->>'logoHorizontal', ''), logo_horizontal),
  primary_color = coalesce(nullif(payload_json->>'primaryColor', ''), primary_color),
  secondary_color = coalesce(nullif(payload_json->>'secondaryColor', ''), secondary_color),
  accent_color = coalesce(nullif(payload_json->>'accentColor', ''), accent_color),
  opening_copy = coalesce(nullif(payload_json->>'openingCopy', ''), opening_copy);

create index if not exists idx_restaurants_active_sort on restaurants (active, sort_order, updated_at desc);
create index if not exists idx_restaurants_playable on restaurants (playable);
create index if not exists idx_restaurants_visible_in_list on restaurants (visible_in_list);
create index if not exists idx_restaurants_area_slug on restaurants (area_slug);

insert into restaurants (
  id,
  active,
  playable,
  visible_in_list,
  sort_order,
  slug,
  name,
  public_game_name,
  location,
  area_slug,
  description,
  hero_image,
  logo_square,
  logo_horizontal,
  primary_color,
  secondary_color,
  accent_color,
  opening_copy,
  payload_json
)
values (
  'americana',
  true,
  true,
  true,
  0,
  'americana',
  'Americana Diner',
  'The Americana Diner Game',
  'Pepperville',
  'pepperville',
  'Classic comfort food in Pepperville. Answer 10 questions to win a customer for your own restaurant.',
  '/assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg',
  '/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg',
  '/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg',
  '#b84c38',
  '#1f4e44',
  '#f2c06b',
  'Play a quick game of trivia, win a customer, and progress on the leaderboard!',
  jsonb_build_object(
    'id', 'americana',
    'slug', 'americana',
    'name', 'Americana Diner',
    'publicGameName', 'The Americana Diner Game',
    'location', 'Pepperville',
    'areaSlug', 'pepperville',
    'includeAreaQuestions', false,
    'description', 'Classic comfort food in Pepperville. Answer 10 questions to win a customer for your own restaurant.',
    'heroImage', '/assets/restaurant-challenge/restaurants/americana/americana-diner-hero.jpg',
    'logoSquare', '/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg',
    'logoHorizontal', '/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg',
    'squareImage', '/assets/restaurant-challenge/restaurants/americana/americana-diner-logo.jpg',
    'primaryColor', '#b84c38',
    'secondaryColor', '#1f4e44',
    'accentColor', '#f2c06b',
    'openingCopy', 'Play a quick game of trivia, win a customer, and progress on the leaderboard!',
    'active', true,
    'playable', true,
    'visibleInList', true,
    'sortOrder', 0
  )
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('customer-photos', 'customer-photos', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do update set public = excluded.public;

insert into storage.buckets (id, name, public)
values ('restaurant-images', 'restaurant-images', true)
on conflict (id) do update set public = excluded.public;
