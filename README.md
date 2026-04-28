# EventMap Germany (Next.js)

A Next.js starter for an interactive Germany event map using:

- **Leaflet** for map rendering
- **Supabase** for database and authentication

## Setup

1. Create a Supabase project.
2. Run SQL from `supabase/schema.sql` in the Supabase SQL editor.
3. Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. Install dependencies and start dev server:

```bash
npm install
npm run dev
```

5. Open `http://localhost:3000`.

## Features

- Germany-centered Leaflet map.
- Click map to fill event latitude/longitude.
- Sign up, sign in, sign out via Supabase Auth.
- Save events to Supabase and render marker popups.

## Project structure

- `src/app/page.tsx` – app entry page.
- `src/components/EventMap.tsx` – client map/auth/event logic.
- `src/lib/supabase.ts` – Supabase client.
- `supabase/schema.sql` – table + RLS policies.
