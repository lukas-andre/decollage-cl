-- =============================================
-- DECOLLAGE.CL - Core Database Schema
-- =============================================
-- Magical home transformation platform for Chilean women
-- Version: 1.0.0
-- Created: 2025-01-15
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector"; -- For AI embeddings (future moodboard matching)

-- =============================================
-- SECTION 1: USER MANAGEMENT & PROFILES
-- =============================================

-- Enhanced user profiles with style preferences
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE, -- For social features
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,

    -- Token economy
    tokens_available INTEGER DEFAULT 5, -- Start with 5 free tokens
    tokens_total_purchased INTEGER DEFAULT 0,
    tokens_total_used INTEGER DEFAULT 0,

    -- User preferences & personality
    style_personality JSONB DEFAULT '{}', -- Quiz results, preferred styles
    color_preferences JSONB DEFAULT '[]', -- Favorite colors
    design_goals TEXT[], -- ['acogedor', 'minimalista', 'bohemio']
    home_type TEXT, -- 'casa', 'departamento', 'oficina'

    -- Social features
    is_public BOOLEAN DEFAULT false,
    instagram_handle TEXT,
    pinterest_connected BOOLEAN DEFAULT false,
    pinterest_user_id TEXT,

    -- Metadata
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User following for social features
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(follower_id, following_id)
);

-- =============================================
-- SECTION 2: PROJECTS & SPACES
-- =============================================

-- Projects are containers for transformation journeys
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Basic info
    name VARCHAR(255) NOT NULL, -- "Mi Living Soñado", "Dormitorio Romántico"
    slug TEXT UNIQUE, -- URL-friendly version
    description TEXT,
    cover_image_url TEXT,

    -- Project type
    project_type TEXT DEFAULT 'transformation', -- 'transformation', 'moodboard', 'seasonal'
    space_type TEXT, -- 'living', 'dormitorio', 'cocina', 'terraza'

    -- Status & progress
    status TEXT DEFAULT 'active', -- 'draft', 'active', 'completed', 'archived'
    completion_percentage INTEGER DEFAULT 0,

    -- Sharing & visibility
    is_public BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    share_token VARCHAR(32) UNIQUE,

    -- Stats
    total_transformations INTEGER DEFAULT 0,
    total_inspirations INTEGER DEFAULT 0,
    total_views INTEGER DEFAULT 0,
    total_likes INTEGER DEFAULT 0,

    -- Metadata
    tags TEXT[], -- ['boho', 'mediterraneo', 'bajo-presupuesto']
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 3: IMAGES & MEDIA
-- =============================================

-- All uploaded images (rooms, inspirations, pinterest)
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Image details
    url TEXT NOT NULL,
    cloudflare_id TEXT,
    thumbnail_url TEXT,

    -- Image type & source
    image_type TEXT NOT NULL, -- 'room', 'inspiration', 'pinterest', 'generated'
    source TEXT, -- 'upload', 'pinterest', 'ai', 'gallery'
    pinterest_pin_id TEXT,
    pinterest_board_id TEXT,

    -- Metadata
    name TEXT,
    description TEXT,
    tags TEXT[],
    colors JSONB, -- Extracted dominant colors
    style_tags TEXT[], -- AI-detected styles
    room_type TEXT, -- AI-detected or user-specified

    -- Analysis (for moodboards)
    embedding vector(1536), -- For similarity search
    analysis_data JSONB, -- Style analysis, objects detected

    -- Status
    is_primary BOOLEAN DEFAULT false, -- Main image for transformations
    upload_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 4: MOODBOARDS & INSPIRATION
-- =============================================

-- Moodboards - collections of inspiration images
CREATE TABLE IF NOT EXISTS moodboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Basic info
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Style synthesis
    synthesized_style JSONB, -- AI-generated style from all images
    color_palette JSONB, -- Extracted palette from moodboard
    style_keywords TEXT[], -- Keywords describing the mood

    -- Sharing
    is_public BOOLEAN DEFAULT false,
    share_url TEXT,

    -- Stats
    images_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for moodboard images
CREATE TABLE IF NOT EXISTS moodboard_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(moodboard_id, image_id)
);

-- =============================================
-- SECTION 5: DESIGN SYSTEM (MOVED UP)
-- =============================================

-- Design styles (Chilean-inspired)
CREATE TABLE IF NOT EXISTS design_styles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL, -- "Mediterráneo Chileno", "Boho Santiago"
    name_en TEXT,
    description TEXT,
    category TEXT, -- 'clasico', 'moderno', 'rustico', 'bohemio', 'minimalista'

    -- AI prompts
    base_prompt TEXT NOT NULL,
    negative_prompt TEXT,

    -- Visual examples
    example_images JSONB DEFAULT '[]',
    inspiration_keywords TEXT[],

    -- Popularity & featuring
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    is_seasonal BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,

    -- Ordering
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Color palettes (Chilean landscapes & culture)
CREATE TABLE IF NOT EXISTS color_palettes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL, -- "Atardecer en Valparaíso", "Desierto Florido"
    name_en TEXT,
    description TEXT,

    -- Colors
    primary_colors JSONB NOT NULL, -- Main palette colors with hex values
    accent_colors JSONB, -- Optional accent colors
    neutral_colors JSONB, -- Whites, grays, beiges

    -- Mood & season
    mood TEXT, -- 'calido', 'fresco', 'acogedor', 'energetico', 'romantico'
    season TEXT, -- 'verano', 'otoño', 'invierno', 'primavera', 'todo-el-año'

    -- Visual
    preview_image_url TEXT,
    example_rooms JSONB DEFAULT '[]',

    -- Featuring
    is_featured BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room types
CREATE TABLE IF NOT EXISTS room_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_en TEXT,
    description TEXT,
    icon_name TEXT, -- Lucide icon name
    typical_dimensions JSONB,
    suggested_styles TEXT[], -- Style codes that work well
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seasonal themes (Chilean holidays)
CREATE TABLE IF NOT EXISTS seasonal_themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL, -- "Fiestas Patrias", "Navidad Chilena"
    description TEXT,
    start_date DATE,
    end_date DATE,

    -- Theme elements
    theme_colors JSONB,
    decoration_elements JSONB, -- Specific decorations to add
    special_prompts JSONB, -- Additional prompts for this season

    -- Visual
    banner_image_url TEXT,
    icon_url TEXT,

    is_active BOOLEAN DEFAULT true,
    is_current BOOLEAN DEFAULT false, -- Auto-updated based on dates
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 6: TRANSFORMATIONS & GENERATIONS
-- =============================================

-- AI-generated transformations
CREATE TABLE IF NOT EXISTS transformations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Source
    base_image_id UUID REFERENCES images(id) ON DELETE SET NULL,
    moodboard_id UUID REFERENCES moodboards(id) ON DELETE SET NULL,

    -- Style inputs
    style_id UUID REFERENCES design_styles(id),
    palette_id UUID REFERENCES color_palettes(id),
    season_id UUID REFERENCES seasonal_themes(id),

    -- Generation details
    prompt_used TEXT,
    custom_instructions TEXT,
    inspiration_weight DECIMAL(3,2), -- How much moodboard influences (0-1)

    -- Results
    result_image_url TEXT,
    result_cloudflare_id TEXT,
    variations JSONB, -- Array of variation URLs if generated

    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    error_message TEXT,

    -- Performance
    tokens_consumed INTEGER DEFAULT 1,
    processing_time_ms INTEGER,

    -- User interaction
    is_favorite BOOLEAN DEFAULT false,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    user_notes TEXT,

    -- Sharing
    is_shared BOOLEAN DEFAULT false,
    share_count INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Transformation iterations (user refinements)
CREATE TABLE IF NOT EXISTS transformation_iterations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transformation_id UUID NOT NULL REFERENCES transformations(id) ON DELETE CASCADE,
    parent_iteration_id UUID REFERENCES transformation_iterations(id),

    -- Changes from parent
    refinement_prompt TEXT,
    changes_applied JSONB,

    -- Result
    result_image_url TEXT,
    result_cloudflare_id TEXT,

    -- Metadata
    iteration_number INTEGER NOT NULL,
    tokens_consumed INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 7: SOCIAL & DISCOVERY
-- =============================================

-- Public gallery of transformations
CREATE TABLE IF NOT EXISTS gallery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transformation_id UUID REFERENCES transformations(id) ON DELETE CASCADE,
    moodboard_id UUID REFERENCES moodboards(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Display info
    title TEXT NOT NULL,
    description TEXT,
    before_image_url TEXT,
    after_image_url TEXT,

    -- Categorization
    tags TEXT[],
    style_tags TEXT[],
    room_type TEXT,
    budget_range TEXT, -- 'economico', 'medio', 'premium'

    -- Stats
    views_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,

    -- Featuring
    is_featured BOOLEAN DEFAULT false,
    is_editors_pick BOOLEAN DEFAULT false,
    featured_order INTEGER,
    featured_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT true,
    moderation_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'

    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ
);

-- User interactions with gallery
CREATE TABLE IF NOT EXISTS gallery_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL, -- 'like', 'save', 'view'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, gallery_item_id, interaction_type)
);

-- Comments on gallery items
CREATE TABLE IF NOT EXISTS gallery_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gallery_item_id UUID NOT NULL REFERENCES gallery_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES gallery_comments(id) ON DELETE CASCADE,

    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,

    -- Moderation
    is_hidden BOOLEAN DEFAULT false,
    moderation_reason TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 8: TOKEN ECONOMY
-- =============================================

-- Token packages for purchase
CREATE TABLE IF NOT EXISTS token_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- "Pack Inicio", "Pack Diseñadora"
    description TEXT,
    token_amount INTEGER NOT NULL,
    price_clp DECIMAL(10,2) NOT NULL,
    original_price_clp DECIMAL(10,2),

    -- Bonuses
    bonus_tokens INTEGER DEFAULT 0,
    bonus_percentage INTEGER,

    -- Display
    icon_name TEXT,
    color_theme TEXT, -- 'pink', 'purple', 'gold'
    is_featured BOOLEAN DEFAULT false,
    is_limited_offer BOOLEAN DEFAULT false,
    offer_ends_at TIMESTAMPTZ,

    -- Targeting
    min_purchase_count INTEGER, -- Show only after X purchases
    max_purchase_count INTEGER, -- Limit purchases per user

    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token transactions
CREATE TABLE IF NOT EXISTS token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    type TEXT NOT NULL, -- 'purchase', 'consumption', 'bonus', 'refund', 'gift'
    amount INTEGER NOT NULL, -- Positive for additions, negative for consumption
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,

    -- Related entities
    transformation_id UUID REFERENCES transformations(id),
    package_id UUID REFERENCES token_packages(id),

    -- Details
    description TEXT,
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 9: ANALYTICS & ENGAGEMENT
-- =============================================

-- User journey events
CREATE TABLE IF NOT EXISTS user_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,

    event_type TEXT NOT NULL, -- 'onboarding_start', 'first_upload', 'first_transformation', etc.
    event_category TEXT, -- 'onboarding', 'creation', 'social', 'purchase'
    event_data JSONB DEFAULT '{}',

    -- Context
    project_id UUID REFERENCES projects(id),
    page_path TEXT,
    referrer TEXT,

    -- Device info
    device_type TEXT, -- 'mobile', 'tablet', 'desktop'
    browser TEXT,
    os TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist for launch
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,

    -- Interest
    interest_type TEXT, -- 'personal', 'profesional', 'curiosidad'
    home_type TEXT, -- 'casa', 'departamento', 'oficina'
    biggest_challenge TEXT, -- What's their main decoration challenge

    -- Source
    referral_source TEXT, -- 'instagram', 'facebook', 'amiga', 'google'
    referral_code TEXT,

    -- Status
    status TEXT DEFAULT 'pending', -- 'pending', 'invited', 'converted'
    invited_at TIMESTAMPTZ,
    converted_at TIMESTAMPTZ,

    -- Engagement
    email_opens INTEGER DEFAULT 0,
    email_clicks INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SECTION 10: PINTEREST INTEGRATION
-- =============================================

-- Pinterest boards synced by users
CREATE TABLE IF NOT EXISTS pinterest_boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pinterest_board_id TEXT NOT NULL,

    -- Board info
    name TEXT NOT NULL,
    description TEXT,
    url TEXT,

    -- Sync settings
    auto_sync BOOLEAN DEFAULT false,
    sync_to_project_id UUID REFERENCES projects(id),
    last_synced_at TIMESTAMPTZ,

    -- Stats
    pins_count INTEGER DEFAULT 0,
    synced_pins_count INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, pinterest_board_id)
);

-- Pinterest pins imported
CREATE TABLE IF NOT EXISTS pinterest_pins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    board_id UUID REFERENCES pinterest_boards(id) ON DELETE CASCADE,
    image_id UUID REFERENCES images(id), -- Linked to our images table

    -- Pin data
    pinterest_pin_id TEXT UNIQUE NOT NULL,
    title TEXT,
    description TEXT,
    url TEXT,
    image_url TEXT,

    -- Analysis
    detected_style TEXT[],
    detected_colors JSONB,

    -- Import status
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    is_processed BOOLEAN DEFAULT false
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User queries
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_slug ON projects(slug);

-- Image queries
CREATE INDEX idx_images_user_id ON images(user_id);
CREATE INDEX idx_images_project_id ON images(project_id);
CREATE INDEX idx_images_type ON images(image_type);
CREATE INDEX idx_images_source ON images(source);

-- Transformation queries
CREATE INDEX idx_transformations_user_id ON transformations(user_id);
CREATE INDEX idx_transformations_project_id ON transformations(project_id);
CREATE INDEX idx_transformations_status ON transformations(status);
CREATE INDEX idx_transformations_created_at ON transformations(created_at DESC);

-- Gallery queries
CREATE INDEX idx_gallery_items_user_id ON gallery_items(user_id);
CREATE INDEX idx_gallery_items_featured ON gallery_items(is_featured, featured_order);
CREATE INDEX idx_gallery_items_tags ON gallery_items USING gin(tags);
CREATE INDEX idx_gallery_items_created_at ON gallery_items(created_at DESC);

-- Social features
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON user_follows(following_id);
CREATE INDEX idx_gallery_interactions_user ON gallery_interactions(user_id);
CREATE INDEX idx_gallery_interactions_item ON gallery_interactions(gallery_item_id);

-- Full text search
CREATE INDEX idx_projects_search ON projects USING gin(
    to_tsvector('spanish', name || ' ' || COALESCE(description, ''))
);
CREATE INDEX idx_gallery_search ON gallery_items USING gin(
    to_tsvector('spanish', title || ' ' || COALESCE(description, ''))
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view their own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Add similar policies for other tables...

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_moodboards_updated_at BEFORE UPDATE ON moodboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to generate unique project slug
CREATE OR REPLACE FUNCTION generate_project_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug from name
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);

    final_slug := base_slug;

    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM projects WHERE slug = final_slug AND id != NEW.id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_project_slug_trigger
    BEFORE INSERT OR UPDATE OF name ON projects
    FOR EACH ROW
    EXECUTE FUNCTION generate_project_slug();

-- Function to update project stats
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'transformations' THEN
        UPDATE projects
        SET total_transformations = (
            SELECT COUNT(*) FROM transformations
            WHERE project_id = NEW.project_id AND status = 'completed'
        )
        WHERE id = NEW.project_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_project_transformation_count
    AFTER INSERT OR UPDATE ON transformations
    FOR EACH ROW
    EXECUTE FUNCTION update_project_stats();

-- Function to handle token consumption
CREATE OR REPLACE FUNCTION consume_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_transformation_id UUID DEFAULT NULL,
    p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current balance with lock
    SELECT tokens_available INTO v_current_balance
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Check if enough tokens
    IF v_current_balance < p_amount THEN
        RETURN FALSE;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance - p_amount;

    -- Update profile
    UPDATE profiles
    SET tokens_available = v_new_balance,
        tokens_total_used = tokens_total_used + p_amount
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO token_transactions (
        user_id, type, amount, balance_before, balance_after,
        transformation_id, description
    ) VALUES (
        p_user_id, 'consumption', -p_amount, v_current_balance, v_new_balance,
        p_transformation_id, p_description
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA SEEDING
-- =============================================

-- Insert room types
INSERT INTO room_types (code, name, name_en, description, sort_order) VALUES
('living', 'Living/Comedor', 'Living Room', 'Espacio principal de reunión familiar', 1),
('dormitorio', 'Dormitorio', 'Bedroom', 'Espacio de descanso personal', 2),
('dormitorio_ninos', 'Dormitorio Infantil', 'Kids Room', 'Espacio para los más pequeños', 3),
('cocina', 'Cocina', 'Kitchen', 'Corazón del hogar', 4),
('bano', 'Baño', 'Bathroom', 'Espacio de cuidado personal', 5),
('terraza', 'Terraza/Balcón', 'Terrace', 'Conexión con el exterior', 6),
('jardin', 'Jardín', 'Garden', 'Oasis verde', 7),
('home_office', 'Home Office', 'Home Office', 'Espacio de trabajo en casa', 8),
('entrada', 'Entrada/Recibidor', 'Entrance', 'Primera impresión del hogar', 9)
ON CONFLICT (code) DO NOTHING;

-- Insert design styles
INSERT INTO design_styles (code, name, name_en, category, base_prompt, sort_order) VALUES
('mediterraneo_chileno', 'Mediterráneo Chileno', 'Chilean Mediterranean', 'clasico',
 'Mediterranean style with Chilean coastal influence, terracotta, white walls, natural materials', 1),
('minimalista_santiago', 'Minimalista Santiago', 'Santiago Minimalist', 'moderno',
 'Clean minimalist design with urban Santiago sophistication, neutral palette, functional furniture', 2),
('boho_valparaiso', 'Boho Valparaíso', 'Valparaiso Bohemian', 'bohemio',
 'Bohemian eclectic style inspired by Valparaiso colorful houses, vintage pieces, artistic touches', 3),
('rustico_sur', 'Rústico del Sur', 'Southern Rustic', 'rustico',
 'Rustic style from Chilean south, wood elements, warm textiles, cozy fireplace atmosphere', 4),
('moderno_costero', 'Moderno Costero', 'Modern Coastal', 'moderno',
 'Modern coastal design, light colors, natural textures, ocean-inspired elements', 5),
('industrial_urbano', 'Industrial Urbano', 'Urban Industrial', 'moderno',
 'Industrial loft style, exposed elements, metal and wood combination, urban feel', 6),
('romantico_frances', 'Romántico Francés', 'French Romantic', 'clasico',
 'Romantic French-inspired design, soft pastels, delicate details, feminine touches', 7),
('nordico_adaptado', 'Nórdico Adaptado', 'Adapted Nordic', 'moderno',
 'Scandinavian style adapted to Chilean climate, hygge elements, warm woods', 8)
ON CONFLICT (code) DO NOTHING;

-- Insert color palettes
INSERT INTO color_palettes (code, name, name_en, mood, season, primary_colors, accent_colors, sort_order) VALUES
('atardecer_valparaiso', 'Atardecer en Valparaíso', 'Valparaiso Sunset', 'calido', 'verano',
 '["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"]'::jsonb,
 '["#FFA07A", "#98D8C8"]'::jsonb, 1),
('verde_cordillera', 'Verde Cordillera', 'Mountain Green', 'fresco', 'primavera',
 '["#2E7D32", "#66BB6A", "#A5D6A7", "#E8F5E9"]'::jsonb,
 '["#8BC34A", "#CDDC39"]'::jsonb, 2),
('desierto_florido', 'Desierto Florido', 'Blooming Desert', 'energetico', 'primavera',
 '["#E91E63", "#9C27B0", "#FF9800", "#FFEB3B"]'::jsonb,
 '["#F06292", "#BA68C8"]'::jsonb, 3),
('invierno_austral', 'Invierno Austral', 'Southern Winter', 'acogedor', 'invierno',
 '["#37474F", "#607D8B", "#90A4AE", "#ECEFF1"]'::jsonb,
 '["#FF5722", "#795548"]'::jsonb, 4),
('rosado_romantico', 'Rosado Romántico', 'Romantic Pink', 'romantico', 'todo-el-año',
 '["#FCE4EC", "#F8BBD0", "#F06292", "#E91E63"]'::jsonb,
 '["#AD1457", "#FFD1DC"]'::jsonb, 5)
ON CONFLICT (code) DO NOTHING;

-- Insert seasonal themes
INSERT INTO seasonal_themes (code, name, start_date, end_date, theme_colors, decoration_elements) VALUES
('fiestas_patrias', 'Fiestas Patrias', '2024-09-01', '2024-09-30',
 '{"primary": ["#D52B1E", "#FFFFFF", "#0039A6"], "accent": ["#FFD700"]}'::jsonb,
 '["banderas chilenas", "copihues", "empanadas decorativas", "guirnaldas tricolor"]'::jsonb),
('navidad_chilena', 'Navidad Chilena', '2024-12-01', '2024-12-31',
 '{"primary": ["#C41E3A", "#165B33", "#FFD700"], "accent": ["#FFFFFF", "#C0C0C0"]}'::jsonb,
 '["viejo pascuero", "copihues navideños", "araucarias decoradas"]'::jsonb),
('verano_chileno', 'Verano Chileno', '2024-12-21', '2025-03-20',
 '{"primary": ["#00CED1", "#FFE4B5", "#FF6347"], "accent": ["#FFFFFF"]}'::jsonb,
 '["elementos costeros", "conchas", "palmeras", "colores frescos"]'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Insert token packages
INSERT INTO token_packages (name, description, token_amount, price_clp, bonus_tokens, color_theme, sort_order) VALUES
('Pack Prueba', 'Perfecto para empezar', 5, 2990, 0, 'pink', 1),
('Pack Hogar', 'Transforma múltiples espacios', 15, 7990, 2, 'purple', 2),
('Pack Diseñadora', 'Para las más creativas', 30, 14990, 5, 'gold', 3),
('Pack Influencer', 'Contenido ilimitado', 60, 24990, 15, 'platinum', 4)
ON CONFLICT DO NOTHING;

-- =============================================
-- COMMENTS FOR DOCUMENTATION
-- =============================================

COMMENT ON TABLE profiles IS 'User profiles with style preferences and token balance';
COMMENT ON TABLE projects IS 'User transformation projects for their spaces';
COMMENT ON TABLE images IS 'All uploaded and generated images including Pinterest imports';
COMMENT ON TABLE moodboards IS 'Collections of inspiration images for style synthesis';
COMMENT ON TABLE transformations IS 'AI-generated room transformations';
COMMENT ON TABLE gallery_items IS 'Public showcase of best transformations';
COMMENT ON TABLE pinterest_boards IS 'Pinterest boards synced by users for inspiration';

COMMENT ON COLUMN profiles.style_personality IS 'JSON object with style quiz results and preferences';
COMMENT ON COLUMN images.embedding IS 'Vector embedding for similarity search in moodboards';
COMMENT ON COLUMN transformations.inspiration_weight IS 'How much the moodboard influences generation (0-1)';