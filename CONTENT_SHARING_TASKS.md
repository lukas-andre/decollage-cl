# 🚀 Content Sharing & Viral Growth - Technical Implementation Tasks

> **Feature**: M8 - Content Sharing & Viral Growth
> **Priority**: 🔴 CRITICAL - Growth Engine
> **Timeline**: Phase 1-3 (6 weeks)
> **Architecture**: ISR + Dynamic OG Images + Real-time Engagement

---

## 📊 Current State Analysis

### Existing Infrastructure
- ✅ Basic sharing flags: `projects.is_public`, `transformations.is_shared`
- ✅ Gallery items table for public showcase
- ✅ Share token mechanism on projects
- ✅ Favorites flag on transformations
- ⚠️ Limited share tracking (only count, no analytics)
- ❌ No dedicated sharing system
- ❌ No OG image generation
- ❌ No collections/saved content organization

---

## 🗄️ Database Schema Updates

### Migration 001: Core Sharing Infrastructure
```sql
-- File: supabase/migrations/20250116_001_sharing_infrastructure.sql

-- 1. Project Shares Table (shareable collections)
CREATE TABLE public.project_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  share_token VARCHAR(32) UNIQUE NOT NULL,
  share_type TEXT NOT NULL DEFAULT 'link', -- 'link', 'embed', 'social'
  visibility TEXT NOT NULL DEFAULT 'unlisted', -- 'public', 'unlisted', 'private'
  password_hash TEXT, -- Optional password protection
  expires_at TIMESTAMPTZ,
  max_views INTEGER,
  current_views INTEGER DEFAULT 0,

  -- Customization
  title TEXT, -- Custom share title
  description TEXT, -- Custom description for OG
  featured_items UUID[], -- Array of transformation/moodboard IDs to highlight
  theme_override JSONB, -- Custom theme colors for share page

  -- SEO & OG
  og_image_url TEXT, -- Generated OG image URL
  og_image_generated_at TIMESTAMPTZ,

  -- Analytics
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,

  CONSTRAINT valid_visibility CHECK (visibility IN ('public', 'unlisted', 'private'))
);

-- 2. Share Analytics Table
CREATE TABLE public.share_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_type TEXT NOT NULL, -- 'project', 'transformation', 'moodboard', 'collection'
  share_id UUID NOT NULL, -- References the shared item
  user_id UUID REFERENCES profiles(id), -- NULL for anonymous

  -- Share details
  platform TEXT, -- 'whatsapp', 'instagram', 'pinterest', 'twitter', 'copy_link', 'email'
  action TEXT NOT NULL, -- 'created', 'viewed', 'clicked', 'converted'

  -- Context
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,

  -- Device info
  ip_address INET,
  user_agent TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country_code TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_share_analytics_share (share_type, share_id),
  INDEX idx_share_analytics_user (user_id),
  INDEX idx_share_analytics_created (created_at DESC)
);

-- 3. User Collections (Saved Content Organization)
CREATE TABLE public.user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,

  is_public BOOLEAN DEFAULT false,
  share_token VARCHAR(32) UNIQUE,

  item_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Collection Items (Polymorphic saved content)
CREATE TABLE public.collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,

  -- Polymorphic reference
  item_type TEXT NOT NULL, -- 'transformation', 'moodboard', 'gallery_item'
  item_id UUID NOT NULL,

  -- Item metadata cache (for performance)
  title TEXT,
  thumbnail_url TEXT,
  metadata JSONB,

  notes TEXT, -- User notes about why they saved it
  position INTEGER DEFAULT 0, -- Order in collection

  added_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(collection_id, item_type, item_id),
  INDEX idx_collection_items_collection (collection_id, position)
);

-- 5. Share Templates (Predefined sharing formats)
CREATE TABLE public.share_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'instagram', 'pinterest', 'whatsapp'

  -- Template configuration
  aspect_ratio TEXT, -- '1:1', '16:9', '9:16', '2:3'
  width INTEGER,
  height INTEGER,

  -- Layout configuration
  layout_type TEXT, -- 'single', 'grid', 'slider', 'collage'
  max_images INTEGER DEFAULT 1,
  include_logo BOOLEAN DEFAULT true,
  include_watermark BOOLEAN DEFAULT false,

  -- Text overlays
  title_template TEXT, -- e.g., "Mi transformación con Decollage.cl"
  description_template TEXT,
  hashtags TEXT[],

  -- Styling
  theme JSONB, -- Colors, fonts, spacing

  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quick Favorites (Fast access within projects)
CREATE TABLE public.project_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),

  -- Polymorphic favorite
  item_type TEXT NOT NULL, -- 'transformation', 'moodboard', 'image'
  item_id UUID NOT NULL,

  position INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(project_id, item_type, item_id),
  INDEX idx_project_favorites (project_id, position)
);

-- 7. Engagement/Reactions Table (for public content)
CREATE TABLE public.content_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Polymorphic content reference
  content_type TEXT NOT NULL, -- 'project', 'transformation', 'moodboard', 'gallery_item'
  content_id UUID NOT NULL,

  user_id UUID REFERENCES profiles(id), -- NULL for anonymous
  session_id TEXT, -- For anonymous tracking

  reaction_type TEXT DEFAULT 'aplausos', -- Future: other reactions

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(content_type, content_id, user_id),
  INDEX idx_reactions_content (content_type, content_id)
);

-- Update existing tables
ALTER TABLE transformations
  ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"allow_public": true, "allow_download": false}'::jsonb;

ALTER TABLE moodboards
  ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"allow_public": true, "allow_remix": false}'::jsonb;

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"show_all": false, "featured_only": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS share_analytics JSONB DEFAULT '{}'::jsonb;

-- Create indexes
CREATE INDEX idx_project_shares_token ON project_shares(share_token);
CREATE INDEX idx_project_shares_project ON project_shares(project_id);
CREATE INDEX idx_share_analytics_platform ON share_analytics(platform, created_at DESC);
```

### Migration 002: Realtime & Triggers
```sql
-- File: supabase/migrations/20250116_002_sharing_realtime.sql

-- Enable realtime for engagement
ALTER PUBLICATION supabase_realtime ADD TABLE content_reactions;

-- Trigger for updating reaction counts
CREATE OR REPLACE FUNCTION update_content_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update counts based on content type
  CASE NEW.content_type
    WHEN 'transformation' THEN
      UPDATE transformations
      SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{reactions_count}',
        (COALESCE(metadata->>'reactions_count', '0')::int + 1)::text::jsonb
      )
      WHERE id = NEW.content_id;
    WHEN 'gallery_item' THEN
      UPDATE gallery_items
      SET likes_count = likes_count + 1
      WHERE id = NEW.content_id;
    WHEN 'project' THEN
      UPDATE projects
      SET total_likes = total_likes + 1
      WHERE id = NEW.content_id;
  END CASE;

  -- Broadcast the change
  PERFORM pg_notify(
    'content_reactions_channel',
    json_build_object(
      'type', NEW.content_type,
      'id', NEW.content_id,
      'action', TG_OP
    )::text
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_content_reaction_change
  AFTER INSERT OR DELETE ON content_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_content_reaction_count();

-- Auto-generate share tokens
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating share tokens
CREATE OR REPLACE FUNCTION set_share_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.share_token IS NULL THEN
    NEW.share_token = generate_share_token();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_shares_token
  BEFORE INSERT ON project_shares
  FOR EACH ROW
  EXECUTE FUNCTION set_share_token();
```

### Migration 003: RLS Policies
```sql
-- File: supabase/migrations/20250116_003_sharing_rls.sql

-- Enable RLS
ALTER TABLE project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reactions ENABLE ROW LEVEL SECURITY;

-- Project Shares policies
CREATE POLICY "Users can create shares for own projects"
  ON project_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_shares.project_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Public shares are viewable by all"
  ON project_shares FOR SELECT
  USING (
    visibility = 'public' OR
    visibility = 'unlisted' OR
    created_by = auth.uid()
  );

-- Collections policies
CREATE POLICY "Users can manage own collections"
  ON user_collections FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Public collections viewable by all"
  ON user_collections FOR SELECT
  USING (is_public = true);

-- Reactions policies (anyone can react)
CREATE POLICY "Anyone can add reactions"
  ON content_reactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view reactions"
  ON content_reactions FOR SELECT
  USING (true);
```

---

## 🎯 Implementation Tasks (Prioritized)

### Phase 1: Core Sharing Infrastructure (Week 1-2)

#### Task 1.1: Database Setup & Migration
**Priority**: 🔴 Critical
**Files**:
- `supabase/migrations/20250116_001_sharing_infrastructure.sql`
- `supabase/migrations/20250116_002_sharing_realtime.sql`
- `supabase/migrations/20250116_003_sharing_rls.sql`

**Actions**:
1. Create migration files with schema above
2. Run migrations locally and test
3. Update TypeScript types
4. Create Supabase client hooks

#### Task 1.2: Share Service Layer
**Priority**: 🔴 Critical
**Files**:
- `src/lib/services/share.service.ts`
- `src/lib/services/share-analytics.service.ts`
- `src/types/sharing.ts`

```typescript
// src/types/sharing.ts
export interface ShareConfig {
  type: 'project' | 'transformation' | 'moodboard' | 'collection'
  visibility: 'public' | 'unlisted' | 'private'
  featured?: string[]
  customTitle?: string
  customDescription?: string
  expiresAt?: Date
  password?: string
}

export interface ShareResponse {
  shareUrl: string
  shareToken: string
  ogImageUrl?: string
  embedCode?: string
}
```

#### Task 1.3: Favorites Widget Component
**Priority**: 🔴 Critical
**Files**:
- `src/components/project/FavoritesWidget.tsx`
- `src/components/project/FavoriteButton.tsx`
- `src/hooks/useFavorites.ts`

```typescript
// src/components/project/FavoritesWidget.tsx
export function FavoritesWidget({ projectId }: { projectId: string }) {
  // Quick-access panel with draggable favorites
  // Shows thumbnails of favorited items
  // One-click to add to share preview
}
```

#### Task 1.4: Public Share Pages (ISR)
**Priority**: 🔴 Critical
**Files**:
- `src/app/share/[token]/page.tsx` (ISR with revalidate)
- `src/app/share/[token]/opengraph-image.tsx`
- `src/app/c/[id]/page.tsx` (Public creation page)

```typescript
// src/app/share/[token]/page.tsx
export const revalidate = 3600 // ISR: Revalidate every hour

export async function generateStaticParams() {
  // Pre-render popular shares
}

export default async function SharePage({ params }: { params: { token: string } }) {
  // Fetch share data
  // Apply custom theme
  // Render shared content
}
```

---

### Phase 2: Engagement & Analytics (Week 3-4)

#### Task 2.1: Real-time Reactions System
**Priority**: 🔴 Critical
**Files**:
- `src/components/engagement/ReactionButton.tsx`
- `src/components/engagement/ReactionCounter.tsx`
- `src/hooks/useRealtimeReactions.ts`
- `src/components/auth/LoginPrompt.tsx`

```typescript
// src/hooks/useRealtimeReactions.ts
export function useRealtimeReactions(contentType: string, contentId: string) {
  // Subscribe to Supabase realtime
  // Handle optimistic updates
  // Return current count and add reaction function
}

// src/components/engagement/ReactionButton.tsx
export function ReactionButton({ contentType, contentId }: ReactionProps) {
  // Show login prompt if not authenticated before allowing interaction
  // Redirect back to content after login
}
```

#### Task 2.1b: Authentication-Gated Interactions
**Priority**: 🔴 Critical
**Files**:
- `src/components/auth/LoginPrompt.tsx`
- `src/components/auth/LoginModal.tsx`
- `src/hooks/useAuthGating.ts`
- `src/lib/auth/redirect.ts`

**Requirements**:
- Block interactions (like, save, comment) for anonymous users
- Show elegant login prompt with context: "¡Únete para aplaudir esta creación!"
- Preserve user intent - redirect back to content after login
- Track conversion from shared content to signup
- Remember the action they wanted to perform

```typescript
// src/hooks/useAuthGating.ts
export function useAuthGating() {
  return {
    requireAuth: (action: string, callback: () => void) => {
      if (!user) {
        showLoginPrompt({
          context: action,
          onComplete: callback,
          redirectUrl: currentUrl
        })
      } else {
        callback()
      }
    }
  }
}
```

#### Task 2.2: Share Preview & Builder
**Priority**: 🔴 Critical
**Files**:
- `src/components/share/SharePreview.tsx`
- `src/components/share/ShareBuilder.tsx`
- `src/components/share/ShareModal.tsx`

Features:
- Live preview as you select items
- Customizable title/description
- Privacy controls
- Generate share link

#### Task 2.3: Analytics Dashboard
**Priority**: 🟡 Medium
**Files**:
- `src/components/analytics/ShareAnalytics.tsx`
- `src/app/api/analytics/route.ts`
- `src/lib/services/analytics.service.ts`

Track:
- Views, clicks, conversions
- Platform breakdown
- Geographic data
- Viral coefficient

#### Task 2.4: OG Image Generation
**Priority**: 🔴 Critical
**Files**:
- `src/app/api/og/route.tsx`
- `src/lib/og/templates.tsx`
- `src/lib/og/generator.ts`

```typescript
// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og'

export async function GET(request: Request) {
  // Parse params
  // Fetch content data
  // Generate themed OG image
  // Cache in Cloudflare

  return new ImageResponse(
    <OGTemplate {...data} />,
    { width: 1200, height: 630 }
  )
}
```

---

### Phase 3: Collections & Social Features (Week 5-6)

#### Task 3.1: Collections System
**Priority**: 🟡 Medium
**Files**:
- `src/components/collections/CollectionGrid.tsx`
- `src/components/collections/CreateCollection.tsx`
- `src/components/collections/CollectionManager.tsx`
- `src/app/(dashboard)/collections/page.tsx`

Features:
- Create/manage collections
- Add items from anywhere
- Public/private collections
- Share entire collections

#### Task 3.2: Share Templates (Non-Premium)
**Priority**: 🟢 Nice-to-have
**Files**:
- `src/lib/share/templates/basic.ts`
- `src/components/share/TemplateSelector.tsx`

Basic templates only:
- Simple link share
- Basic embed code
- Email share format

#### Task 3.3: SEO & Meta Tags
**Priority**: 🔴 Critical
**Files**:
- `src/app/share/[token]/layout.tsx`
- `src/lib/seo/metadata.ts`
- `public/sitemap.xml` (auto-generated)

```typescript
// src/lib/seo/metadata.ts
export function generateShareMetadata(share: ShareData): Metadata {
  return {
    title: share.customTitle || `${share.projectName} | Decollage.cl`,
    description: share.customDescription || 'Transformación de espacios con IA',
    openGraph: {
      images: [share.ogImageUrl],
      type: 'website',
      locale: 'es_CL',
    },
    twitter: {
      card: 'summary_large_image',
    }
  }
}
```

#### Task 3.4: Public Gallery Integration
**Priority**: 🟡 Medium
**Files**:
- `src/app/(public)/gallery/page.tsx`
- `src/components/gallery/GalleryCard.tsx`
- `src/components/gallery/FilterBar.tsx`

Connect to existing `gallery_items` table
Add reactions, save, share actions

---

## 🔌 API Endpoints

### Share Management
```typescript
// src/app/api/shares/route.ts
POST   /api/shares                 // Create new share
GET    /api/shares/:token          // Get share data
PUT    /api/shares/:token          // Update share settings
DELETE /api/shares/:token          // Delete share

// src/app/api/shares/analytics/route.ts
POST   /api/shares/analytics       // Track share event
GET    /api/shares/:id/analytics   // Get share analytics
```

### Collections
```typescript
// src/app/api/collections/route.ts
GET    /api/collections            // List user collections
POST   /api/collections            // Create collection
PUT    /api/collections/:id        // Update collection
DELETE /api/collections/:id        // Delete collection

// src/app/api/collections/items/route.ts
POST   /api/collections/:id/items  // Add item to collection
DELETE /api/collections/:id/items/:itemId  // Remove item
```

### Reactions
```typescript
// src/app/api/reactions/route.ts
POST   /api/reactions              // Add reaction
DELETE /api/reactions/:id          // Remove reaction
GET    /api/reactions/:contentType/:contentId  // Get reactions
```

---

## 🎨 Component Library

### Core Components
```typescript
// Favorites
<FavoritesWidget projectId={} />
<FavoriteButton itemType={} itemId={} />

// Sharing
<ShareButton content={} />
<ShareModal content={} onShare={} />
<SharePreview items={} settings={} />
<ShareBuilder onGenerate={} />

// Engagement
<ReactionButton contentType={} contentId={} />
<ReactionCounter count={} animated={} />

// Collections
<CollectionCard collection={} />
<CollectionGrid items={} />
<SaveToCollectionButton item={} />

// Analytics
<ShareStats shareId={} />
<AnalyticsDashboard />
```

---

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run all migrations locally
- [ ] Test RLS policies
- [ ] Generate TypeScript types
- [ ] Update environment variables
- [ ] Test share token generation
- [ ] Verify realtime subscriptions

### Cloudflare Setup
- [ ] Configure ISR caching rules
- [ ] Set up OG image caching
- [ ] Configure geographic routing
- [ ] Enable WAF for share endpoints

### Monitoring
- [ ] Set up share analytics tracking
- [ ] Configure error alerting
- [ ] Monitor realtime connections
- [ ] Track viral coefficient

---

## 🔗 Integration Points

### With Moodboards (Future-Ready)
- Collections support moodboard items
- Share analytics track moodboard shares
- OG generation handles moodboard grids
- Reactions work on moodboards

### With Existing Features
- Integrate with token economy (premium shares?)
- Connect to user profiles (public portfolios)
- Link with projects (share entire projects)
- Sync with gallery items (auto-feature shared content)

---

## 📈 Success Metrics

### Technical KPIs
- Page load time < 2s for share pages
- OG image generation < 500ms
- Realtime latency < 100ms
- Share creation success rate > 99%

### Business KPIs
- Share rate > 30% of projects
- Click-through rate > 10% on shares
- Viral coefficient > 1.2
- User retention +40% for sharers
- **Conversion rate from shared content to signup > 15%**

---

## ⚠️ Risk Mitigation

### Performance
- Implement ISR for all public pages
- Cache OG images in Cloudflare
- Paginate large collections
- Optimize image delivery

### Security
- Rate limit share creation
- Validate share permissions
- Sanitize custom content
- Implement CSRF protection

### Scalability
- Design for horizontal scaling
- Use database indexes efficiently
- Implement connection pooling
- Cache frequently accessed data

---

## 🎯 MVP Definition

### Must Have (Week 1-2)
- ✅ Basic share creation (projects/transformations)
- ✅ Public share pages with ISR
- ✅ Favorites widget in workspace
- ✅ Simple OG image generation
- ✅ Copy link functionality
- ✅ Basic analytics tracking

### Should Have (Week 3-4)
- ✅ Real-time reactions
- ✅ Share preview
- ✅ Collections system
- ✅ Privacy controls
- ✅ Share analytics dashboard

### Nice to Have (Week 5-6)
- ⭕ Advanced OG templates
- ⭕ Email share
- ⭕ Embed codes
- ⭕ Share scheduling
- ⭕ A/B testing for OG images

### Not for MVP (Future)
- ❌ Premium social templates
- ❌ Video generation
- ❌ Multi-user collaboration
- ❌ API access
- ❌ Webhooks

---

## 📝 Notes

1. **Chilean Focus**: All UI copy in Chilean Spanish, celebrate local aesthetics
2. **Mobile First**: Optimize share pages for mobile viewing (60%+ traffic)
3. **Performance**: Use ISR aggressively, cache everything possible
4. **Privacy**: Default to user-friendly privacy, explicit consent for public sharing
5. **Analytics**: Track everything but respect user privacy (GDPR compliant)

---

**Last Updated**: 2025-01-16
**Version**: 1.0.0
**Status**: Ready for Implementation