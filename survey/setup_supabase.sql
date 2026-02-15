-- Mini Survey Tables

-- 1. サーベイ本体
CREATE TABLE IF NOT EXISTS mini_surveys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 設問
CREATE TABLE IF NOT EXISTS mini_survey_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES mini_surveys(id) ON DELETE CASCADE,
  question_no INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'multiple', 'open')),
  title TEXT NOT NULL,
  options JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 回答
CREATE TABLE IF NOT EXISTS mini_survey_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id UUID REFERENCES mini_surveys(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_questions_survey_id ON mini_survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_survey_id ON mini_survey_responses(survey_id);

-- RLS (Row Level Security) を無効化（シンプル版のため）
ALTER TABLE mini_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mini_survey_responses ENABLE ROW LEVEL SECURITY;

-- 全員がアクセス可能なポリシー
CREATE POLICY "Allow all access to mini_surveys" ON mini_surveys FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to mini_survey_questions" ON mini_survey_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to mini_survey_responses" ON mini_survey_responses FOR ALL USING (true) WITH CHECK (true);
