-- ============================================
-- Profiles (extends Supabase Auth)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- Life Spheres
-- ============================================
CREATE TABLE spheres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'ellipse-outline',
  color TEXT NOT NULL DEFAULT '#8b5cf6',
  sort_order INT NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  target_level INT NOT NULL DEFAULT 10
    CHECK (target_level >= 1 AND target_level <= 10),
  current_level NUMERIC(4,1) NOT NULL DEFAULT 0
    CHECK (current_level >= 0 AND current_level <= 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE spheres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own spheres"
  ON spheres FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Projects
-- ============================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sphere_id UUID NOT NULL REFERENCES spheres(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  point_a TEXT NOT NULL DEFAULT '',
  point_b TEXT NOT NULL DEFAULT '',
  progress INT NOT NULL DEFAULT 0
    CHECK (progress >= 0 AND progress <= 100),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'paused', 'archived')),
  start_date TIMESTAMPTZ DEFAULT now(),
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects"
  ON projects FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Milestones
-- ============================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own milestones"
  ON milestones FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Progress snapshots (history)
-- ============================================
CREATE TABLE progress_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sphere_id UUID NOT NULL REFERENCES spheres(id) ON DELETE CASCADE,
  level NUMERIC(4,1) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own snapshots"
  ON progress_snapshots FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Seed default spheres function
-- ============================================
CREATE OR REPLACE FUNCTION seed_default_spheres(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO spheres (user_id, name, icon, color, sort_order, is_default) VALUES
    (p_user_id, 'Работа / Бизнес',     'briefcase-outline',  '#3b82f6', 0, true),
    (p_user_id, 'Здоровье / Спорт',    'fitness-outline',    '#22c55e', 1, true),
    (p_user_id, 'Финансы',             'wallet-outline',     '#eab308', 2, true),
    (p_user_id, 'Развитие / Обучение', 'school-outline',     '#a855f7', 3, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
