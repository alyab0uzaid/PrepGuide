-- PrepGuide Supabase Migration
-- Run this in your Supabase SQL Editor

-- Topics table (math topics with lesson content)
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  main_area TEXT,
  order_num INTEGER,
  lesson TEXT,
  video TEXT,
  practice_problems_sheet TEXT,
  answer_key_sheet TEXT,
  easy TEXT,
  medium TEXT,
  hard TEXT,
  image TEXT,
  number_subtopics INTEGER,
  created_at TIMESTAMPTZ
);

-- Subtopics table
CREATE TABLE IF NOT EXISTS subtopics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_topic_slug TEXT
);

-- QB Practices table (question bank with Easy/Medium/Hard worksheets)
CREATE TABLE IF NOT EXISTS qb_practices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  order_num INTEGER,
  easy TEXT,
  easy_key TEXT,
  medium TEXT,
  medium_key TEXT,
  hard TEXT,
  hard_key TEXT
);

-- Math Intros table (intro guides e.g. Desmos)
CREATE TABLE IF NOT EXISTS math_intros (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  order_num INTEGER,
  main_area TEXT,
  lesson TEXT,
  video TEXT,
  practice_problems_sheet TEXT,
  answer_key_sheet TEXT
);

-- Enable Row Level Security (optional, enable if you add auth later)
-- ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE subtopics ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE qb_practices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE math_intros ENABLE ROW LEVEL SECURITY;

-- Public read policies (uncomment when RLS is enabled)
-- CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
-- CREATE POLICY "Public read subtopics" ON subtopics FOR SELECT USING (true);
-- CREATE POLICY "Public read qb_practices" ON qb_practices FOR SELECT USING (true);
-- CREATE POLICY "Public read math_intros" ON math_intros FOR SELECT USING (true);
