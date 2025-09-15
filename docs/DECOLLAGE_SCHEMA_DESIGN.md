# Decollage.cl Database Schema Design

## 🎨 Vision Alignment

This schema is designed to create a **magical, feminine, and culturally-relevant** home transformation platform that aligns perfectly with our brand archetypes:

- **The Magician**: Instant transformation through AI-powered visualization
- **The Lover**: Beautiful, emotionally-connected spaces that reflect personality

## 🌟 Key Features & User Journey

### 1. **Moodboard Creation System** 🖼️
Users can create inspiration collections that capture their desired aesthetic:

```
User Journey:
1. Upload inspiration images (from camera, gallery, or Pinterest)
2. AI analyzes style, colors, and patterns
3. System synthesizes a unique style profile
4. Generate transformations based on the moodboard aesthetic
```

**Tables involved:**
- `moodboards` - Collections of inspiration
- `moodboard_images` - Junction table for images
- `images` - All uploaded/imported images with AI analysis

### 2. **Pinterest Integration** 📌
Direct connection to Pinterest for seamless inspiration gathering:

```
Features:
- Import entire Pinterest boards
- Auto-sync favorite boards
- AI analysis of pinned styles
- Create moodboards from pins
```

**Tables involved:**
- `pinterest_boards` - Synced boards
- `pinterest_pins` - Individual pins with analysis
- Links to `images` table for unified management

### 3. **Iterative Design Process** 🔄
Users can refine and iterate on their transformations:

```
Workflow:
1. Generate initial transformation
2. Request refinements ("más luz", "colores más cálidos")
3. Each iteration saved for comparison
4. Build confidence through experimentation
```

**Tables involved:**
- `transformations` - Main generations
- `transformation_iterations` - Refinement history

### 4. **Social Gallery & Discovery** 💕
Community-driven inspiration and validation:

```
Social Features:
- Public gallery of best transformations
- Like, save, and comment on designs
- Follow favorite creators
- Featured Chilean homes and styles
```

**Tables involved:**
- `gallery_items` - Curated public content
- `gallery_interactions` - Likes and saves
- `gallery_comments` - Community discussion
- `user_follows` - Social connections

## 🇨🇱 Chilean Cultural Integration

### Localized Design Styles
Pre-populated styles that resonate with Chilean aesthetics:
- **Mediterráneo Chileno** - Coastal vibes from Viña del Mar
- **Boho Valparaíso** - Colorful, artistic, eclectic
- **Rústico del Sur** - Warm woods from Chilean Patagonia
- **Minimalista Santiago** - Urban sophistication

### Color Palettes from Chilean Landscapes
- **Atardecer en Valparaíso** - Sunset colors over the port
- **Verde Cordillera** - Mountain greens
- **Desierto Florido** - Blooming desert phenomenon
- **Invierno Austral** - Cozy southern winter tones

### Seasonal Themes for Local Festivities
- **Fiestas Patrias** (September) - Red, white, blue with traditional elements
- **Navidad Chilena** - Summer Christmas with local touches
- **Verano Chileno** - Beach and coastal themes

## 💡 Smart Features

### 1. **AI-Powered Style Synthesis**
When users create a moodboard with multiple images:
```sql
-- The system analyzes all images to create a unified style
moodboards.synthesized_style -- AI-generated style profile
moodboards.color_palette -- Extracted common colors
moodboards.style_keywords -- Descriptive keywords
```

### 2. **Inspiration Weight System**
Users control how much their moodboard influences the transformation:
```sql
transformations.inspiration_weight -- 0.0 to 1.0
-- 0.0 = Use only selected style
-- 0.5 = Balanced mix
-- 1.0 = Heavily influenced by moodboard
```

### 3. **Smart Project Organization**
Projects can be different types:
- **Transformation** - Traditional room makeover
- **Moodboard** - Pure inspiration collection
- **Seasonal** - Holiday-specific decorations

## 👩 User Profile & Personalization

### Style Personality Quiz
```sql
profiles.style_personality -- JSON with quiz results
{
  "primary_style": "boho",
  "color_preference": "warm",
  "space_priority": "cozy",
  "budget_conscious": true
}
```

### Progressive Onboarding
```sql
profiles.onboarding_completed -- Track completion
profiles.onboarding_step -- Current step for resume
```

Onboarding flow:
1. Welcome & style quiz
2. First room upload
3. First transformation
4. Connect Pinterest (optional)
5. Join community

## 💎 Token Economy

### Freemium Model
- **5 free tokens** to start (enough for initial experimentation)
- Token packages with feminine branding:
  - Pack Prueba (pink)
  - Pack Hogar (purple)
  - Pack Diseñadora (gold)
  - Pack Influencer (platinum)

### Token Consumption
- Basic transformation: 1 token
- With moodboard synthesis: 2 tokens
- Iterations: 1 token each

## 🔒 Privacy & Security

### Row Level Security (RLS)
- Users only see their own data by default
- Public sharing is opt-in
- Gallery items require moderation approval

### Data Protection
- Pinterest credentials stored securely
- Images owned by users
- Transformation history private by default

## 📊 Analytics & Growth

### User Journey Tracking
```sql
user_events -- Track key moments
- onboarding_start
- first_upload
- first_transformation
- first_share
- first_purchase
```

### Viral Features
- Share transformations with unique URLs
- Before/after comparisons
- Embedded Pinterest integration
- Instagram-ready exports

## 🚀 Technical Advantages

### Performance Optimizations
- Vector embeddings for fast similarity search
- Indexed foreign keys
- Materialized stats where appropriate
- Efficient pagination for galleries

### Scalability
- Cloudflare CDN for images
- Separate tables for different concerns
- Background processing for AI tasks
- Queue system ready

## 🎯 Success Metrics

This schema enables tracking of:
- **Engagement**: iterations per project, moodboard creation
- **Virality**: shares, gallery interactions
- **Retention**: return visits, project completion
- **Monetization**: token consumption patterns, package preferences
- **Community**: follows, comments, likes

## 🌈 The Sofía Experience

Our target user "Sofía" (30-55, professional, style-conscious) will experience:

1. **Discovery** → Browse the gallery, get inspired by Chilean homes
2. **Creation** → Upload her room, create moodboards from Pinterest
3. **Transformation** → See her space transformed instantly with AI magic
4. **Iteration** → Refine until it's perfect, no fear of mistakes
5. **Confidence** → Share her creation, get validation from community
6. **Action** → Use the visualization to guide real decoration decisions

## 💫 What Makes This Special

Unlike generic decoration apps, Decollage.cl offers:

1. **Cultural Relevance** - Chilean styles, colors, and festivities
2. **Moodboard Magic** - Synthesize multiple inspirations into one style
3. **Pinterest Power** - Direct integration with existing inspiration boards
4. **Iteration Freedom** - Keep refining without fear
5. **Community Love** - Get inspired by real Chilean homes
6. **Emotional Connection** - Not just tools, but a journey of self-expression

## 🔮 Future Expansions

The schema is ready for:
- AR visualization (structure supports it)
- Professional designer marketplace
- Brand partnerships for furniture
- Regional style variations (different Chilean cities)
- AI style transfer from any image
- Video transformations

---

This schema creates the foundation for a truly magical, feminine, and Chilean-focused home transformation platform that empowers women to visualize and create their dream spaces with confidence and joy. 🏡✨