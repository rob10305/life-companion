# Life Companion — Setup Guide

## Quick Start (works immediately, data stays on one device)

```bash
cd life-companion
npm install
npm run dev
```
Open http://localhost:3000 — you're live. Data is saved in browser localStorage.

---

## Cross-Device Sync with Supabase (free)

To sync your data across your phone, laptops, and any device, add Supabase as a backend.

### 1. Create a Supabase project

1. Go to https://supabase.com and sign up (free)
2. Create a new project (any region close to you)
3. Wait for it to initialize (~1 min)

### 2. Run the database schema

In your Supabase dashboard, go to **SQL Editor** → click **New query** → paste the contents of `supabase-schema.sql` from this project → click **Run**.

This creates 5 tables: projects, tasks, categories, bookmarks, bookmark_categories — with RLS and auto-update triggers.

### 3. Add your API keys

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** and **anon/public key**
3. For **local dev**: create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. For **Vercel**: add the same env vars in Vercel → Project Settings → Environment Variables
5. Redeploy — the app will automatically detect Supabase and use it!

### How it works

- **With Supabase configured**: data loads from Supabase on page load. All changes write to Supabase and localStorage (cache).
- **Without Supabase**: data uses localStorage only (single device).
- **First load with empty DB**: automatically seeds Supabase with the default data.
- **Offline fallback**: localStorage always has a copy, so the app works even if Supabase is unreachable.

---

## Deploy to Vercel (for access from any device via URL)

```bash
npx vercel
```

Or connect your GitHub repo at https://vercel.com/new and it deploys automatically.

Add your Supabase env vars in Vercel → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GITHUB_TOKEN` (for Import from GitHub feature)

## Deploy to Netlify

```bash
npm run build
npx netlify-cli deploy
```

---

## Future ideas
- Air Canada Aeroplan status widget (needs their API / web scraping)
- Travel itinerary view
- Calendar integration
- Password-protect the app (add Supabase Auth)
