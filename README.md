# CommunityVerse Database Setup

This project now includes a small SQLite-backed server for Restaurant Challenge.

## Run it

```bash
cd "/Users/timcollins/Documents/New project 2/CommunityVerse"
node server.mjs
```

The server runs on `http://127.0.0.1:3000` by default.

## What it provides

- SQLite database file at `data/restaurant-challenge.sqlite`
- Static hosting for the `Website/` folder
- API endpoints for profiles, sessions, health checks, and leaderboard reads

## Useful endpoints

- `GET /api/health`
- `GET /api/profiles`
- `PUT /api/profiles/:id`
- `POST /api/profiles`
- `GET /api/sessions`
- `POST /api/sessions`
- `GET /api/leaderboard`

## Important note

The game UI still uses local browser storage for save/load right now.
This server is the shared database foundation we will wire into next.

## Going online

When you are ready to publish the game:

1. Create a Supabase project and run [`supabase/schema.sql`](/Users/timcollins/Documents/New%20project%202/CommunityVerse/supabase/schema.sql) in the SQL editor.
2. Create a Vercel project with the root directory set to [`Website/`](/Users/timcollins/Documents/New%20project%202/CommunityVerse/Website).
3. Add these environment variables in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy the site.

The browser game will keep calling `/api/...`, and those routes will use Supabase instead of the SQLite file on your computer.
