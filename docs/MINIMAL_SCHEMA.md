# Minimal B2C Database Schema for Decollage.cl

## Overview
This document outlines a simplified database schema optimized for Decollage.cl's B2C decoration and home transformation platform. The schema removes all B2B complexity and focuses on the core user journey: visualizing and transforming spaces with AI-powered magic.

## Tables to DROP (B2B Legacy)
- ❌ `businesses` - No longer needed for B2C
- ❌ `business_members` - No B2B team management
- ❌ `products` - No product catalog needed
- ❌ `product_showcases` - No B2B showcases
- ❌ `quick_links` - No vendor quick links
- ❌ `staging_sessions` - Replaced by simpler generation tracking
- ❌ `staging_results` - Merged into generations
- ❌ `analytics` - Simplified to user-level metrics

## Core Tables to KEEP (Modified)

### 1. `profiles` (User Management)
```sql
-- Simplified user profile focused on B2C experience
profiles
  - id (uuid, PK)
  - email (text, unique)
  - full_name (text)
  - avatar_url (text)
  - phone (text, optional)
  - tokens_available (integer, default: 3) -- Free trial tokens
  - tokens_total_purchased (integer, default: 0)
  - tokens_total_used (integer, default: 0)
  - preferences (jsonb) -- Style preferences, favorite colors, etc.
  - created_at (timestamp)
  - updated_at (timestamp)
```

### 2. `projects` (User's Transformation Projects)
```sql
-- User's home transformation projects
projects
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - name (varchar) -- "Mi Living", "Dormitorio Principal"
  - description (text)
  - space_type (varchar) -- 'casa', 'departamento', 'oficina'
  - status (varchar) -- 'active', 'completed', 'archived'
  - total_transformations (integer, default: 0)
  - is_favorite (boolean, default: false)
  - share_token (varchar, unique) -- For sharing transformations
  - metadata (jsonb) -- Additional project details
  - created_at (timestamp)
  - updated_at (timestamp)
```

### 3. `space_images` (Original Space Photos)
```sql
-- User's original space photos
space_images
  - id (uuid, PK)
  - project_id (uuid, FK to projects)
  - user_id (uuid, FK to profiles)
  - name (text) -- User-friendly name
  - original_image_url (text) -- Cloudflare URL
  - original_cloudflare_id (text)
  - room_type_id (uuid, FK to room_types)
  - upload_order (integer)
  - notes (text)
  - created_at (timestamp)
```

### 4. `transformations` (AI-Generated Designs)
```sql
-- Simplified from staging_generations
transformations
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - project_id (uuid, FK to projects)
  - space_image_id (uuid, FK to space_images)
  - style_id (uuid, FK to design_styles)
  - palette_id (uuid, FK to color_palettes, optional)
  - season_id (uuid, FK to seasonal_themes, optional)
  - transformed_image_url (text)
  - transformed_cloudflare_id (text)
  - prompt_used (text)
  - custom_instructions (text) -- User's personal touch
  - status (text) -- 'pending', 'processing', 'completed', 'failed'
  - tokens_consumed (integer, default: 1)
  - is_favorite (boolean, default: false)
  - is_shared (boolean, default: false)
  - processing_time_ms (integer)
  - metadata (jsonb)
  - created_at (timestamp)
  - completed_at (timestamp)
```

### 5. `design_styles` (Curated Chilean Styles)
```sql
-- Renamed from staging_styles, more focused on Chilean aesthetics
design_styles
  - id (uuid, PK)
  - code (text, unique)
  - name (text) -- "Mediterráneo Chileno", "Minimalista Santiago"
  - description (text)
  - category (text) -- 'clasico', 'moderno', 'rustico', 'bohemio'
  - base_prompt (text)
  - inspiration_images (jsonb) -- Array of example URLs
  - is_featured (boolean)
  - is_seasonal (boolean) -- For 18 Sept, Navidad, etc.
  - sort_order (integer)
  - is_active (boolean)
  - created_at (timestamp)
```

### 6. `color_palettes` (Chilean-Inspired Palettes)
```sql
-- Enhanced color schemes with local relevance
color_palettes
  - id (uuid, PK)
  - code (text, unique)
  - name (text) -- "Atardecer en Valparaíso", "Verde Cordillera"
  - description (text)
  - primary_colors (jsonb) -- Main hex colors
  - accent_colors (jsonb) -- Accent hex colors
  - mood (text) -- 'calido', 'fresco', 'acogedor', 'energetico'
  - season (text) -- 'verano', 'otoño', 'invierno', 'primavera'
  - is_featured (boolean)
  - sort_order (integer)
  - is_active (boolean)
  - created_at (timestamp)
```

### 7. `room_types` (Keep as-is)
```sql
-- Standard room types
room_types
  - id (uuid, PK)
  - code (text, unique)
  - name (text)
  - description (text)
  - typical_dimensions (jsonb) -- Chilean standard sizes
  - sort_order (integer)
  - is_active (boolean)
```

### 8. `token_packages` (Simplified Pricing)
```sql
-- Simplified token packages
token_packages
  - id (uuid, PK)
  - name (text) -- "Pack Inicio", "Pack Hogar", "Pack Diseñador"
  - token_amount (integer)
  - price_clp (decimal)
  - original_price_clp (decimal) -- For showing discounts
  - savings_percentage (integer)
  - is_featured (boolean)
  - is_limited_offer (boolean)
  - sort_order (integer)
  - is_active (boolean)
  - created_at (timestamp)
```

### 9. `token_transactions` (Keep simplified)
```sql
-- Token usage tracking
token_transactions
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - type (text) -- 'purchase', 'consumption', 'bonus', 'refund'
  - amount (integer)
  - balance_before (integer)
  - balance_after (integer)
  - transformation_id (uuid, FK to transformations, optional)
  - package_id (uuid, FK to token_packages, optional)
  - description (text)
  - created_at (timestamp)
```

## New Tables to ADD

### 10. `seasonal_themes` (Chilean Festivities)
```sql
-- Special themes for Chilean holidays and seasons
seasonal_themes
  - id (uuid, PK)
  - code (text, unique)
  - name (text) -- "Fiestas Patrias", "Navidad Chilena"
  - description (text)
  - start_date (date)
  - end_date (date)
  - theme_prompts (jsonb) -- Special styling instructions
  - color_suggestions (jsonb)
  - decoration_elements (jsonb) -- Specific elements to add
  - is_active (boolean)
  - created_at (timestamp)
```

### 11. `inspiration_gallery` (Community Showcase)
```sql
-- Featured transformations for inspiration
inspiration_gallery
  - id (uuid, PK)
  - transformation_id (uuid, FK to transformations)
  - user_id (uuid, FK to profiles)
  - title (text)
  - description (text)
  - tags (jsonb) -- ['living', 'moderno', 'bajo-presupuesto']
  - likes_count (integer, default: 0)
  - views_count (integer, default: 0)
  - is_featured (boolean)
  - featured_order (integer)
  - is_active (boolean)
  - created_at (timestamp)
```

### 12. `user_favorites` (Saved Inspirations)
```sql
-- Users can save transformations for inspiration
user_favorites
  - id (uuid, PK)
  - user_id (uuid, FK to profiles)
  - transformation_id (uuid, FK to transformations, optional)
  - inspiration_id (uuid, FK to inspiration_gallery, optional)
  - favorited_at (timestamp)
  - UNIQUE(user_id, transformation_id)
  - UNIQUE(user_id, inspiration_id)
```

### 13. `waitlist` (Pre-launch Interest)
```sql
-- Early access and interested users
waitlist
  - id (uuid, PK)
  - email (text, unique)
  - name (text)
  - phone (text)
  - interest_type (text) -- 'personal', 'profesional'
  - space_type (text) -- 'casa', 'departamento', 'oficina'
  - referral_source (text) -- How they heard about us
  - status (text) -- 'pending', 'invited', 'converted'
  - invited_at (timestamp)
  - converted_at (timestamp)
  - created_at (timestamp)
```

### 14. `user_journey_events` (Simplified Analytics)
```sql
-- Track key user journey moments
user_journey_events
  - id (uuid, PK)
  - user_id (uuid, FK to profiles, optional)
  - session_id (text)
  - event_type (text) -- 'first_upload', 'first_transformation', 'share', 'purchase'
  - event_data (jsonb)
  - device_type (text)
  - created_at (timestamp)
```

## Migration Strategy

### Phase 1: Schema Cleanup
1. Drop all B2B tables (businesses, products, etc.)
2. Rename tables for clarity (staging_generations → transformations)
3. Add new B2C-focused tables

### Phase 2: Data Migration
1. Migrate existing user profiles
2. Convert existing projects to new structure
3. Transform staging_generations to transformations

### Phase 3: Add Chilean Context
1. Populate seasonal_themes with Chilean holidays
2. Create curated design_styles with local relevance
3. Design color_palettes inspired by Chilean landscapes

## Key Improvements

### Simplification
- Removed all B2B complexity
- Focused on single user journey
- Clearer, more intuitive naming

### Localization
- Chilean-specific styles and themes
- Seasonal content for local festivities
- Spanish-friendly field names where appropriate

### User Experience
- Inspiration gallery for discovery
- Favorites system for saving ideas
- Simplified token economy
- Social sharing capabilities

### Performance
- Fewer joins needed
- Cleaner relationships
- Optimized for common queries

## Database Indexes (Recommended)

```sql
-- User queries
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_transformations_user_id ON transformations(user_id);
CREATE INDEX idx_transformations_project_id ON transformations(project_id);

-- Gallery and discovery
CREATE INDEX idx_inspiration_gallery_featured ON inspiration_gallery(is_featured, featured_order);
CREATE INDEX idx_transformations_created_at ON transformations(created_at DESC);

-- Performance
CREATE INDEX idx_transformations_status ON transformations(status);
CREATE INDEX idx_space_images_project_id ON space_images(project_id);
```

## Next Steps

1. **Review and Approve Schema** - Ensure alignment with brand vision
2. **Create Migration Scripts** - Safe transition from current schema
3. **Populate Reference Data** - Styles, palettes, themes
4. **Update Application Code** - Adapt to new schema
5. **Test Thoroughly** - Ensure no data loss

---

**Note:** This schema is optimized for Decollage.cl's pivot to B2C, emphasizing simplicity, local relevance, and the magical transformation experience described in the brand documents.