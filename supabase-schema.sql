-- Life Companion — Supabase Schema
-- Run this in your Supabase Dashboard → SQL Editor → New query → Run

-- ============================================
-- PROJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
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

-- ============================================
-- TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'personal',
  priority TEXT DEFAULT 'medium',
  completed BOOLEAN DEFAULT FALSE,
  due_date DATE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TASK CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  emoji TEXT DEFAULT '📌',
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- BOOKMARKS
-- ============================================
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'uncategorized',
  pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BOOKMARK CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS bookmark_categories (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  emoji TEXT DEFAULT '📌',
  sort_order INTEGER DEFAULT 0
);

-- ============================================
-- ROW LEVEL SECURITY (public access for personal use)
-- ============================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmark_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON bookmarks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON bookmark_categories FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
