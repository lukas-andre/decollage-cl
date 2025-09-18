-- =============================================
-- CONTENT SHARING ENHANCEMENTS
-- =============================================
-- Enhances the existing sharing infrastructure to support
-- two-tier sharing (quick & story) with viral growth features

-- Enhance project_shares for dual-mode sharing
ALTER TABLE project_shares 
ADD COLUMN IF NOT EXISTS share_format VARCHAR(50) DEFAULT 'quick' CHECK (share_format IN ('quick', 'story')),
ADD COLUMN IF NOT EXISTS story_data JSONB,
ADD COLUMN IF NOT EXISTS author_display JSONB,
ADD COLUMN IF NOT EXISTS whatsapp_message TEXT,
ADD COLUMN IF NOT EXISTS pinterest_data JSONB,
ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_analytics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS engagement_metrics JSONB DEFAULT '{"slider_uses": 0, "saves": 0, "shares": 0}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_share_format ON project_shares(share_format);
CREATE INDEX IF NOT EXISTS idx_share_visibility ON project_shares(visibility);
CREATE INDEX IF NOT EXISTS idx_share_token ON project_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_share_created_at ON project_shares(created_at DESC);

-- Track conversion events from shares
CREATE TABLE IF NOT EXISTS share_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID REFERENCES project_shares(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  conversion_type VARCHAR(50) NOT NULL, -- 'signup', 'project_created', 'tokens_purchased'
  referrer_platform VARCHAR(50),
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Story sections for rich content
CREATE TABLE IF NOT EXISTS story_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID REFERENCES project_shares(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'comparison', 'gallery', 'palette', 'details', 'author'
  position INTEGER NOT NULL,
  content JSONB NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced share analytics with platform tracking
CREATE TABLE IF NOT EXISTS share_engagement_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID REFERENCES project_shares(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES profiles(id),
  event_type VARCHAR(50) NOT NULL, -- 'view', 'slider_use', 'save', 'share', 'conversion_prompt_shown', 'conversion_prompt_dismissed'
  event_data JSONB,
  platform VARCHAR(50), -- 'whatsapp', 'instagram', 'pinterest', 'facebook', 'direct'
  device_type VARCHAR(50), -- 'mobile', 'tablet', 'desktop'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Share templates for quick creation
CREATE TABLE IF NOT EXISTS share_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL, -- 'quick', 'story'
  platform VARCHAR(50), -- 'whatsapp', 'instagram', 'pinterest'
  message_template TEXT,
  layout_config JSONB,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Viewer sessions for tracking anonymous users
CREATE TABLE IF NOT EXISTS viewer_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) UNIQUE NOT NULL,
  share_id UUID REFERENCES project_shares(id),
  ip_address INET,
  user_agent TEXT,
  first_seen TIMESTAMP DEFAULT NOW(),
  last_seen TIMESTAMP DEFAULT NOW(),
  page_views INTEGER DEFAULT 1,
  total_time_seconds INTEGER DEFAULT 0,
  interactions JSONB DEFAULT '{}',
  converted_to_user_id UUID REFERENCES profiles(id)
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_share_conversions_share_id ON share_conversions(share_id);
CREATE INDEX IF NOT EXISTS idx_share_conversions_created_at ON share_conversions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_sections_share_id ON story_sections(share_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_share_id ON share_engagement_events(share_id);
CREATE INDEX IF NOT EXISTS idx_engagement_events_session_id ON share_engagement_events(session_id);
CREATE INDEX IF NOT EXISTS idx_viewer_sessions_token ON viewer_sessions(session_token);

-- Add default share templates for Chilean market
INSERT INTO share_templates (name, template_type, platform, message_template, layout_config) VALUES
('WhatsApp Rápido', 'quick', 'whatsapp', '✨ Mira cómo transformé mi {room_type} con Decollage.cl! 🏠 {share_url}', '{"show_logo": true, "image_ratio": "1:1"}'),
('Instagram Historia', 'quick', 'instagram', '🎨 Nueva transformación con #DecollageChile\n\n{description}\n\n#DiseñoChileno #Hogar #Transformación', '{"show_logo": true, "image_ratio": "1:1", "hashtags": ["DecollageChile", "DiseñoChileno", "Hogar"]}'),
('Pinterest Board', 'story', 'pinterest', '{title} | Decollage.cl', '{"show_logo": true, "image_ratio": "2:3", "rich_pins": true}'),
('Blog Completo', 'story', null, null, '{"sections": ["hero", "journey", "palette", "author"], "show_comments": false}')
ON CONFLICT DO NOTHING;

-- Function to track share views with analytics
CREATE OR REPLACE FUNCTION track_share_view(
  p_share_token VARCHAR,
  p_session_id VARCHAR,
  p_platform VARCHAR DEFAULT NULL,
  p_device_type VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_share_id UUID;
BEGIN
  -- Get share ID and increment view count
  UPDATE project_shares 
  SET current_views = current_views + 1,
      last_viewed_at = NOW()
  WHERE share_token = p_share_token
  RETURNING id INTO v_share_id;

  -- Record engagement event
  INSERT INTO share_engagement_events (share_id, session_id, event_type, platform, device_type)
  VALUES (v_share_id, p_session_id, 'view', p_platform, p_device_type);

  -- Update or create viewer session
  INSERT INTO viewer_sessions (session_token, share_id, last_seen, page_views)
  VALUES (p_session_id, v_share_id, NOW(), 1)
  ON CONFLICT (session_token) 
  DO UPDATE SET 
    last_seen = NOW(),
    page_views = viewer_sessions.page_views + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to track conversions
CREATE OR REPLACE FUNCTION track_share_conversion(
  p_share_id UUID,
  p_user_id UUID,
  p_conversion_type VARCHAR,
  p_platform VARCHAR DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- Record conversion
  INSERT INTO share_conversions (share_id, user_id, conversion_type, referrer_platform)
  VALUES (p_share_id, p_user_id, p_conversion_type, p_platform);

  -- Update share conversion count
  UPDATE project_shares 
  SET conversion_count = conversion_count + 1
  WHERE id = p_share_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies
ALTER TABLE share_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewer_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own share conversions
CREATE POLICY "Users can view own share conversions" ON share_conversions
  FOR SELECT USING (
    share_id IN (
      SELECT id FROM project_shares WHERE created_by = auth.uid()
    )
  );

-- Users can manage their own story sections
CREATE POLICY "Users can manage own story sections" ON story_sections
  FOR ALL USING (
    share_id IN (
      SELECT id FROM project_shares WHERE created_by = auth.uid()
    )
  );

-- Users can view their own engagement events
CREATE POLICY "Users can view own engagement events" ON share_engagement_events
  FOR SELECT USING (
    share_id IN (
      SELECT id FROM project_shares WHERE created_by = auth.uid()
    )
  );

-- Everyone can view active templates
CREATE POLICY "Everyone can view active templates" ON share_templates
  FOR SELECT USING (is_active = true);

-- Analytics views for dashboard
CREATE OR REPLACE VIEW share_performance AS
SELECT 
  ps.id,
  ps.share_token,
  ps.title,
  ps.share_format,
  ps.created_by,
  ps.created_at,
  ps.current_views,
  ps.conversion_count,
  COALESCE(ps.conversion_count::FLOAT / NULLIF(ps.current_views, 0) * 100, 0) as conversion_rate,
  COUNT(DISTINCT see.session_id) as unique_viewers,
  COUNT(DISTINCT CASE WHEN see.platform = 'whatsapp' THEN see.session_id END) as whatsapp_views,
  COUNT(DISTINCT CASE WHEN see.platform = 'instagram' THEN see.session_id END) as instagram_views,
  COUNT(DISTINCT CASE WHEN see.platform = 'pinterest' THEN see.session_id END) as pinterest_views,
  AVG(CASE WHEN see.event_type = 'slider_use' THEN 1 ELSE 0 END) * 100 as slider_usage_rate
FROM project_shares ps
LEFT JOIN share_engagement_events see ON ps.id = see.share_id
GROUP BY ps.id;

-- Grant permissions
GRANT SELECT ON share_performance TO authenticated;
GRANT EXECUTE ON FUNCTION track_share_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION track_share_conversion TO authenticated;