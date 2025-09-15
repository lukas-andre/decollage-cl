-- Migration: Project Management Feature
-- Description: Adds tables for organizing virtual staging work into projects

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  client_name VARCHAR(200),
  property_address TEXT,
  project_type VARCHAR(50) DEFAULT 'residential' CHECK (project_type IN ('residential', 'commercial')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  target_date DATE,
  metadata JSONB DEFAULT '{}',
  share_token VARCHAR(100) UNIQUE,
  is_public BOOLEAN DEFAULT false,
  total_images INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for projects
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_share_token ON public.projects(share_token) WHERE share_token IS NOT NULL;

-- Create project_images table
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES public.staging_generations(id) ON DELETE SET NULL,
  original_image_url TEXT NOT NULL,
  original_cloudflare_id TEXT,
  upload_order INTEGER,
  room_name VARCHAR(100),
  room_type VARCHAR(50) CHECK (room_type IN ('living_room', 'bedroom', 'kitchen', 'dining_room', 'bathroom', 'home_office', NULL)),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'queued', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_images
CREATE INDEX idx_project_images_project_id ON public.project_images(project_id);
CREATE INDEX idx_project_images_generation_id ON public.project_images(generation_id);
CREATE INDEX idx_project_images_status ON public.project_images(status);

-- Create project_collaborators table
CREATE TABLE IF NOT EXISTS public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  invited_by UUID REFERENCES public.profiles(id),
  accepted BOOLEAN DEFAULT false,
  invite_token VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(project_id, email)
);

-- Indexes for project_collaborators
CREATE INDEX idx_project_collaborators_project_id ON public.project_collaborators(project_id);
CREATE INDEX idx_project_collaborators_email ON public.project_collaborators(email);
CREATE INDEX idx_project_collaborators_invite_token ON public.project_collaborators(invite_token);

-- Create project_templates table
CREATE TABLE IF NOT EXISTS public.project_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  style_id UUID REFERENCES public.staging_styles(id),
  room_type VARCHAR(50),
  advanced_settings JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_templates
CREATE INDEX idx_project_templates_project_id ON public.project_templates(project_id);

-- Add project support to staging_generations
ALTER TABLE public.staging_generations 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS project_image_id UUID REFERENCES public.project_images(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_staging_generations_project_id ON public.staging_generations(project_id);

-- Create trigger to update project stats
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NOT NULL THEN
    UPDATE projects
    SET 
      total_images = (
        SELECT COUNT(*) 
        FROM project_images 
        WHERE project_id = NEW.project_id 
        AND status = 'completed'
      ),
      total_tokens_used = (
        SELECT COALESCE(SUM(tokens_consumed), 0)
        FROM staging_generations
        WHERE project_id = NEW.project_id
      ),
      updated_at = NOW()
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_stats_trigger
AFTER INSERT OR UPDATE ON staging_generations
FOR EACH ROW
EXECUTE FUNCTION update_project_stats();

-- Row Level Security Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY projects_select ON public.projects
  FOR SELECT USING (
    user_id = auth.uid() OR
    is_public = true OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = projects.id
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND accepted = true
    )
  );

CREATE POLICY projects_insert ON public.projects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update ON public.projects
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.project_collaborators
      WHERE project_id = projects.id
      AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'editor'
      AND accepted = true
    )
  );

CREATE POLICY projects_delete ON public.projects
  FOR DELETE USING (user_id = auth.uid());

-- Project images policies
CREATE POLICY project_images_select ON public.project_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_images.project_id
      AND (
        user_id = auth.uid() OR
        is_public = true OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
          AND accepted = true
        )
      )
    )
  );

CREATE POLICY project_images_insert ON public.project_images
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_images.project_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
          AND role = 'editor'
          AND accepted = true
        )
      )
    )
  );

CREATE POLICY project_images_update ON public.project_images
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_images.project_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
          AND role = 'editor'
          AND accepted = true
        )
      )
    )
  );

CREATE POLICY project_images_delete ON public.project_images
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_images.project_id
      AND user_id = auth.uid()
    )
  );

-- Collaborators policies
CREATE POLICY project_collaborators_select ON public.project_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_collaborators.project_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators pc
          WHERE pc.project_id = projects.id
          AND pc.email = (SELECT email FROM auth.users WHERE id = auth.uid())
          AND pc.accepted = true
        )
      )
    )
  );

CREATE POLICY project_collaborators_insert ON public.project_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_collaborators.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY project_collaborators_update ON public.project_collaborators
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_collaborators.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY project_collaborators_delete ON public.project_collaborators
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_collaborators.project_id
      AND user_id = auth.uid()
    )
  );

-- Templates policies
CREATE POLICY project_templates_select ON public.project_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_templates.project_id
      AND (
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.project_collaborators
          WHERE project_id = projects.id
          AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
          AND accepted = true
        )
      )
    )
  );

CREATE POLICY project_templates_insert ON public.project_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_templates.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY project_templates_update ON public.project_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_templates.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY project_templates_delete ON public.project_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_templates.project_id
      AND user_id = auth.uid()
    )
  );

-- Add comments
COMMENT ON TABLE public.projects IS 'User projects for organizing virtual staging work';
COMMENT ON TABLE public.project_images IS 'Images associated with projects';
COMMENT ON TABLE public.project_collaborators IS 'Project collaboration and sharing';
COMMENT ON TABLE public.project_templates IS 'Reusable templates for project staging';