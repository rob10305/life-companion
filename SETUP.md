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

In your Supabase dashboard, go to **SQL Editor** and run this:

```sql
-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  color TEXT DEFAULT '#3B82F6',
  emoji TEXT DEFAULT '📁',
  status TEXT DEFAULT 'active',
  links JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'personal',
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  emoji TEXT DEFAULT '📌',
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security (allows public access for personal use)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON categories FOR ALL USING (true) WITH CHECK (true);
```

### 3. Add your API keys

1. In Supabase, go to **Settings → API**
2. Copy your **Project URL** and **anon/public key**
3. Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Restart the dev server — the app will automatically use Supabase!

---

## Deploy to Vercel (for access from any device via URL)

```bash
npx vercel
```

Or connect your GitHub repo at https://vercel.com/new and it deploys automatically.

Add your Supabase env vars in Vercel → Project Settings → Environment Variables.

## Deploy to Netlify

```bash
npm run build
# then drag the .next folder to Netlify, or use:
npx netlify-cli deploy
```

---

## Future ideas
- Air Canada Aeroplan status widget (needs their API / web scraping)
- Travel itinerary view
- Calendar integration
- Password-protect the app (add Supabase Auth)
