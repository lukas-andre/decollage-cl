-- =====================================================
-- VIRTUAL STAGING PLATFORM - INITIAL SCHEMA
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  user_type TEXT CHECK (user_type IN ('individual', 'real_estate', 'architect', 'other')) DEFAULT 'individual',
  role TEXT CHECK (role IN ('user', 'admin')) DEFAULT 'user',
  tokens_available INTEGER DEFAULT 10 CHECK (tokens_available >= 0),
  tokens_total_purchased INTEGER DEFAULT 0,
  tokens_total_used INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- =====================================================
-- STAGING STYLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.staging_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_prompt TEXT NOT NULL, -- Base prompt for AI
  example_image TEXT,
  category TEXT CHECK (category IN ('modern', 'classic', 'minimalist', 'rustic', 'industrial', 'scandinavian', 'other')),
  ai_config JSONB DEFAULT '{}'::jsonb, -- AI specific parameters
  token_cost INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert base styles
INSERT INTO public.staging_styles (code, name, description, base_prompt, category, token_cost) VALUES
  ('modern', 'Modern', 'Contemporary design with clean lines', 'modern interior design, clean lines, contemporary furniture', 'modern', 1),
  ('scandinavian', 'Scandinavian', 'Minimalist and cozy with neutral tones', 'scandinavian interior design, cozy, neutral colors, minimalist', 'scandinavian', 1),
  ('industrial', 'Industrial', 'Urban style with metal and wood elements', 'industrial interior design, exposed brick, metal elements, urban loft', 'industrial', 1),
  ('classic', 'Classic', 'Elegant and timeless with traditional details', 'classic interior design, elegant, timeless, traditional furniture', 'classic', 1),
  ('minimalist', 'Minimalist', 'Clean and functional spaces', 'minimalist interior design, simple, functional, clean space', 'minimalist', 1);

-- =====================================================
-- TOKEN PACKAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.token_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  token_amount INTEGER NOT NULL CHECK (token_amount > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_price DECIMAL(10,2),
  currency TEXT DEFAULT 'CLP' CHECK (currency IN ('CLP', 'USD')),
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert base packages
INSERT INTO public.token_packages (name, description, token_amount, price, is_featured, sort_order) VALUES
  ('Starter', '10 tokens to try', 10, 5990, false, 1),
  ('Basic', '25 tokens', 25, 12990, false, 2),
  ('Popular', '60 tokens + 10 free', 60, 29990, true, 3),
  ('Professional', '150 tokens + 30 free', 150, 69990, false, 4),
  ('Enterprise', '500 tokens + 100 free', 500, 199990, false, 5);

-- =====================================================
-- STAGING GENERATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.staging_generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  style_id UUID REFERENCES public.staging_styles(id),
  
  -- Images
  original_image_url TEXT NOT NULL,
  original_cloudflare_id TEXT,
  processed_image_url TEXT,
  processed_cloudflare_id TEXT,
  
  -- Generation details
  prompt_used TEXT,
  user_prompt TEXT, -- What the user wrote
  generation_params JSONB DEFAULT '{}'::jsonb,
  
  -- Status and costs
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  tokens_consumed INTEGER DEFAULT 1,
  processing_time_ms INTEGER,
  
  -- Metadata
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for frequent queries
CREATE INDEX idx_generations_user ON public.staging_generations(user_id);
CREATE INDEX idx_generations_status ON public.staging_generations(status);
CREATE INDEX idx_generations_created ON public.staging_generations(created_at DESC);

-- =====================================================
-- TOKEN TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('purchase', 'consumption', 'bonus', 'refund', 'admin_adjustment')) NOT NULL,
  amount INTEGER NOT NULL, -- Positive for credit, negative for debit
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  
  -- References
  package_id UUID REFERENCES public.token_packages(id),
  generation_id UUID REFERENCES public.staging_generations(id),
  payment_transaction_id UUID, -- Will be linked later
  
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_token_transactions_user ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON public.token_transactions(type);
CREATE INDEX idx_token_transactions_created ON public.token_transactions(created_at DESC);

-- =====================================================
-- PAYMENT TRANSACTIONS (FLOW CHILE)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.token_packages(id),
  
  -- Flow Chile
  flow_order_id TEXT UNIQUE,
  flow_commerce_id TEXT,
  flow_session_id TEXT,
  
  -- Amounts
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'CLP',
  
  -- Status
  status TEXT CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'refunded', 'cancelled')) DEFAULT 'pending',
  payment_method TEXT, -- webpay, mercadopago, etc
  
  -- Tokens
  tokens_granted INTEGER,
  
  -- Additional data
  response_data JSONB DEFAULT '{}'::jsonb,
  error_data JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  initiated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_user ON public.payment_transactions(user_id);
CREATE INDEX idx_payments_status ON public.payment_transactions(status);
CREATE INDEX idx_payments_flow_order ON public.payment_transactions(flow_order_id);

-- =====================================================
-- ADMIN LOGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT, -- 'user', 'package', 'generation', etc
  entity_id UUID,
  old_data JSONB DEFAULT '{}'::jsonb,
  new_data JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_admin_logs_admin ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_entity ON public.admin_logs(entity_type, entity_id);
CREATE INDEX idx_admin_logs_created ON public.admin_logs(created_at DESC);

-- =====================================================
-- PLATFORM STATISTICS (Materialized View)
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.platform_statistics AS
SELECT 
  -- Users
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN p.id END) as new_users_30d,
  COUNT(DISTINCT CASE WHEN p.created_at >= NOW() - INTERVAL '7 days' THEN p.id END) as new_users_7d,
  
  -- Generations
  COUNT(DISTINCT g.id) as total_generations,
  COUNT(DISTINCT CASE WHEN g.created_at >= NOW() - INTERVAL '30 days' THEN g.id END) as generations_30d,
  COUNT(DISTINCT CASE WHEN g.created_at >= NOW() - INTERVAL '7 days' THEN g.id END) as generations_7d,
  
  -- Tokens
  SUM(tt.amount) FILTER (WHERE tt.type = 'purchase') as tokens_sold_total,
  SUM(tt.amount) FILTER (WHERE tt.type = 'consumption') * -1 as tokens_consumed_total,
  
  -- Revenue
  SUM(tp.amount) FILTER (WHERE tp.status = 'approved') as total_revenue,
  SUM(tp.amount) FILTER (WHERE tp.status = 'approved' AND tp.created_at >= NOW() - INTERVAL '30 days') as revenue_30d,
  
  -- Last update
  NOW() as updated_at
FROM public.profiles p
LEFT JOIN public.staging_generations g ON p.id = g.user_id
LEFT JOIN public.token_transactions tt ON p.id = tt.user_id
LEFT JOIN public.payment_transactions tp ON p.id = tp.user_id;

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_platform_statistics ON public.platform_statistics(updated_at);

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE public.staging_styles IS 'Available styles for virtual staging';
COMMENT ON TABLE public.token_packages IS 'Token packages available for purchase';
COMMENT ON TABLE public.staging_generations IS 'History of virtual staging generations';
COMMENT ON TABLE public.token_transactions IS 'Token movement history';
COMMENT ON TABLE public.payment_transactions IS 'Payment transactions with Flow Chile';
COMMENT ON TABLE public.admin_logs IS 'Administrative action logs';
COMMENT ON MATERIALIZED VIEW public.platform_statistics IS 'Aggregated platform statistics';