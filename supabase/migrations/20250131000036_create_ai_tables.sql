-- Create AI configuration and usage tracking tables
-- supabase/migrations/20250131000036_create_ai_tables.sql

-- AI Configuration Table
CREATE TABLE IF NOT EXISTS ai_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id uuid REFERENCES classrooms(id) ON DELETE CASCADE,
  active_model text DEFAULT 'gemini-1.5-flash',
  max_requests_per_day integer DEFAULT 50,
  is_enabled boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- AI Usage Tracking
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id uuid REFERENCES towers(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  response_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  estimated_cost numeric(10,6) DEFAULT 0,
  message text,
  sources_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tower_id uuid REFERENCES towers(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  started_at timestamp with time zone DEFAULT now(),
  ended_at timestamp with time zone,
  message_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_config
CREATE POLICY "Teachers can view AI config for their classrooms" ON ai_config
  FOR SELECT USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can update AI config for their classrooms" ON ai_config
  FOR UPDATE USING (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can insert AI config for their classrooms" ON ai_config
  FOR INSERT WITH CHECK (
    classroom_id IN (
      SELECT id FROM classrooms WHERE teacher_id = auth.uid()
    )
  );

-- RLS Policies for ai_usage_logs
CREATE POLICY "Teachers can view AI usage for their towers" ON ai_usage_logs
  FOR SELECT USING (
    tower_id IN (
      SELECT id FROM towers WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "AI function can insert usage logs" ON ai_usage_logs
  FOR INSERT WITH CHECK (true);

-- RLS Policies for chat_sessions
CREATE POLICY "Teachers can view chat sessions for their towers" ON chat_sessions
  FOR SELECT USING (
    tower_id IN (
      SELECT id FROM towers WHERE teacher_id = auth.uid()
    )
  );

CREATE POLICY "AI function can insert chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "AI function can update chat sessions" ON chat_sessions
  FOR UPDATE USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_config_classroom_id ON ai_config(classroom_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_tower_id ON ai_usage_logs(tower_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_created_at ON ai_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_tower_id ON chat_sessions(tower_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_started_at ON chat_sessions(started_at);

-- Function to get AI config for a classroom
CREATE OR REPLACE FUNCTION get_ai_config(p_classroom_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'id', id,
    'classroom_id', classroom_id,
    'active_model', active_model,
    'max_requests_per_day', max_requests_per_day,
    'is_enabled', is_enabled,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result
  FROM ai_config
  WHERE classroom_id = p_classroom_id;
  
  RETURN COALESCE(result, '{"is_enabled": false, "active_model": "gemini-1.5-flash", "max_requests_per_day": 50}'::jsonb);
END;
$$;

-- Function to check if AI is enabled for a classroom
CREATE OR REPLACE FUNCTION is_ai_enabled(p_classroom_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  enabled boolean;
BEGIN
  SELECT is_enabled INTO enabled
  FROM ai_config
  WHERE classroom_id = p_classroom_id;
  
  RETURN COALESCE(enabled, false);
END;
$$;
