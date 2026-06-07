# CommunityVerse Database And Question Admin

Restaurant Challenge uses Supabase for shared player, leaderboard, session, and question data.
The JSON question bank in `Website/shared/restaurant-question-bank.json` remains the emergency fallback.

## Question Admin

After deployment, open:

```text
https://communityversegames.com/admin/questions
```

The admin lets you:

- Add and edit questions
- Activate or deactivate questions
- Permanently delete questions
- Filter by restaurant, area, global/customer scope, customer, tag, difficulty, and status
- Search prompts, answers, IDs, tags, and targets

The same page also has a `Customers` tab for editing customer records and swapping photos.
In the customer editor, `Restaurant` means either `shared` or a specific restaurant like `americana`, and `Character type` describes what kind of customer they are.

Deactivating is safer than deleting. An inactive question remains in Supabase but is not sent to the game.

## One-Time Supabase Setup

1. Open the Supabase dashboard.
2. Open the SQL Editor.
3. Run the full contents of `supabase/schema.sql`.

It is safe to run this schema again. The `alter table ... if not exists` statements add the admin filtering columns to an existing questions table, and the update statement fills those columns from existing `payload_json`.

## Vercel Environment Variables

In the Vercel project settings, add:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `QUESTIONS_ADMIN_KEY`
- `OPENAI_API_KEY`

Make `QUESTIONS_ADMIN_KEY` a long private password. It is only used to unlock the question admin and must not be placed in frontend code or committed to Git.

`OPENAI_API_KEY` powers the optional question-writing helper. The key stays inside the server and is never sent to the browser. The helper uses `gpt-5.4-mini` by default; you can optionally override it with `OPENAI_QUESTION_MODEL`.

Customer photos should be uploaded as JPGs at exactly `512 x 512`. The customer editor shows that label next to the upload field.

After adding or changing an environment variable, redeploy the Vercel project.

## How Question Loading Works

1. The game requests `GET /api/questions`.
2. The API reads active questions from Supabase.
3. If Supabase is configured but the questions table is empty, the API seeds it from the repo JSON file.
4. If the browser cannot reach the API, the game loads the repo JSON file directly.

This means Supabase is the main source while the game still has a deployable fallback.

## Local Development

```bash
cd "/Users/timcollins/Documents/New project 2/CommunityVerse"
node server.mjs
```

The local SQLite server runs on `http://127.0.0.1:3000` by default. The production admin API is implemented as Vercel serverless functions and writes to Supabase.

## API Endpoints

- Public game questions: `GET /api/questions`
- Admin list and create: `GET|POST /api/admin/questions`
- Admin update and delete: `PUT|DELETE /api/admin/questions/:id`
- Profiles: `GET|POST /api/profiles`
- Profile update: `PUT /api/profiles/:id`
- Sessions: `GET|POST /api/sessions`
- Leaderboard: `GET /api/leaderboard`
