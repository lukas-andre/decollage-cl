-- =============================================
-- REACTIONS INFRASTRUCTURE FOR CONTENT ENGAGEMENT
-- =============================================
-- Creates the content_reactions table to persist "aplausos" and
-- other reaction types for both authenticated users and anonymous sessions.
-- Also adds supporting indexes, RLS policies, realtime publication, and
-- utility function for aggregated counts.

-- The table may exist already in remote environments. IF NOT EXISTS guards
-- keep the migration idempotent for local development.

CREATE TABLE IF NOT EXISTS content_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reaction_type TEXT NOT NULL DEFAULT 'aplausos',
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT content_reactions_owner_check CHECK (
    (user_id IS NOT NULL AND session_id IS NULL)
    OR (user_id IS NULL AND session_id IS NOT NULL)
  )
);

-- Helpful indexes for lookup and uniqueness constraints.
CREATE INDEX IF NOT EXISTS content_reactions_content_idx
  ON content_reactions (content_type, content_id);

CREATE INDEX IF NOT EXISTS content_reactions_created_at_idx
  ON content_reactions (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS content_reactions_unique_user
  ON content_reactions (content_type, content_id, reaction_type, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS content_reactions_unique_session
  ON content_reactions (content_type, content_id, reaction_type, session_id)
  WHERE session_id IS NOT NULL;

-- Row Level Security configuration
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can manage their own reactions
CREATE POLICY IF NOT EXISTS "Users manage own reactions"
ON content_reactions
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow anonymous inserts so we can store pre-auth reactions linked to a session
CREATE POLICY IF NOT EXISTS "Anonymous can insert reactions"
ON content_reactions
FOR INSERT
TO anon
WITH CHECK (session_id IS NOT NULL AND user_id IS NULL);

-- Utility function to aggregate counts by reaction type for a given content target
CREATE OR REPLACE FUNCTION get_reaction_counts(
  p_content_type TEXT,
  p_content_id TEXT
) RETURNS TABLE (
  reaction_type TEXT,
  reaction_count BIGINT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT reaction_type, COUNT(*)::BIGINT
  FROM content_reactions
  WHERE content_type = p_content_type
    AND content_id = p_content_id
  GROUP BY reaction_type;
$$;

GRANT EXECUTE ON FUNCTION get_reaction_counts TO anon, authenticated;

-- Ensure the table participates in Supabase realtime replication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'content_reactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE content_reactions;
  END IF;
END$$;

-- Add converted_at column to viewer_sessions if it doesn't exist
ALTER TABLE viewer_sessions ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- Create analytics_events table for tracking conversion analytics
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx
  ON analytics_events (event_type);

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx
  ON analytics_events (user_id);

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
  ON analytics_events (created_at DESC);

-- Enable RLS on analytics_events
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own analytics events
CREATE POLICY IF NOT EXISTS "Users view own analytics"
ON analytics_events
FOR SELECT
USING (user_id = auth.uid());
