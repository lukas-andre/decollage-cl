# 🎨 Decollage.cl - Claude Code Guide

## 🏗️ **Project Overview**
**Decollage.cl** - Chilean B2C home design transformation platform using AI virtual staging. Transforms user-uploaded room photos into professionally designed spaces with Chilean cultural aesthetics.

**Brand Archetypes**: The Magician (transformation) + The Lover (beauty & community)
**Target**: Chilean women 30-55, ABC1/C2, Pinterest users seeking home design confidence

## 🛠️ **Tech Stack**
- **Frontend**: Next.js 15, App Router, TypeScript, TailwindCSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: Google Gemini 2.5 Flash (image generation), Cloudflare Images
- **UI**: shadcn/ui components (Button, Card, Dialog, etc.), Cormorant + Lato fonts
- **Styling**: Chilean-inspired design system (#A3B1A1, #C4886F, #333333, #F8F8F8)

## 📂 **Key Directories**
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main app interface
│   └── api/               # API routes
├── components/            # Reusable UI components
├── lib/                   # Utilities & services
│   ├── ai/               # Gemini integration
│   ├── supabase/         # Database client
│   └── cloudflare-images.ts
├── types/                # TypeScript types
└── hooks/                # React hooks
```

## 🗄️ **Database Schema Status**
**CRITICAL**: Currently migrating from B2B schema to comprehensive B2C schema
- **Current**: Basic staging_generations, profiles, token_packages
- **Target**: 23-table schema with social features, moodboards, Chilean cultural data
- **Migration files**: `supabase/migrations/001_decollage_core_schema.sql`

## 🔧 **Development Commands**
```bash
# Development
pnpm dev                   # Start dev server (with Turbopack)
pnpm build                 # Production build
pnpm lint                  # ESLint check

# Database
ALL DB INTERACTIONS SHOULD BE DO WITH SUPABASE MCP.

# Testing
npx playwright test        # Run tests
```

## 🌐 **Available MCP Tools**
- **Filesystem**: `read_text_file`, `write_file`, `edit_file`, `create_directory`
- **Supabase**: `execute_sql`, `apply_migration`, `list_tables`, `get_logs`
- **GitHub**: `create_repository`, `push_files`, `create_pull_request`
- **Memory**: `create_entities`, `search_nodes` (for context tracking)

## 🎨 **Design System**
**Colors**:
- Sage Green: `#A3B1A1` (trust, nature)
- Warm Terracotta: `#C4886F` (warmth, femininity)
- Deep Charcoal: `#333333` (elegance)
- Soft Canvas: `#F8F8F8` (breathing space)

**Typography**:
- Display: Cormorant (light, elegant)
- Body: Lato (readable, friendly)

**Chilean Elements**: Mediterráneo Chileno, Boho Valparaíso, Atardecer en Valparaíso palettes

## 🚀 **Current Priority Tasks**
1. **Schema Migration**: Migrate from current B2B to comprehensive B2C schema
2. **Chilean Cultural Data**: Implement local styles, colors, seasonal themes
3. **Moodboard System**: Multi-image inspiration synthesis
4. **Social Features**: Gallery, likes, comments, following
5. **Database-driven Styles**: Move from hardcoded to DB-managed design options

## 🔑 **Key Features**
- **Token Economy**: CLP-based packages (Pack Prueba: 5 tokens/$2,990 CLP)
- **AI Generation**: Gemini-powered room transformation with Chilean aesthetics
- **Project Management**: Organize by property/client
- **Iterative Design**: Multiple variations, refinement history
- **Social Discovery**: Public gallery, community inspiration

## 🧩 **UI Components (shadcn/ui)**
**Available Components**: Button, Card, Dialog, Input, Textarea, Select, Badge, Tabs, Progress, Dropdown, Alert, Skeleton, etc.

**Usage**:
```bash
npx shadcn@latest add button card dialog  # Add components
```
**Philosophy**: Use shadcn/ui for consistency, copy-paste approach for customization

## 🐛 **Common Issues & Solutions**
- **Schema Mismatch**: Current DB ≠ target schema - requires migration
- **Hardcoded Styles**: Move `lib/ai/prompts.ts` to database
- **Missing Cultural Data**: Need Chilean styles/palettes in DB
- **B2B References**: Clean up business-related code for B2C focus
- **New Components**: Always check existing shadcn/ui components before building custom

## 📦 **Key Dependencies**
```json
{
  "@google/genai": "^1.16.0",        // Gemini AI
  "@supabase/ssr": "^0.7.0",        // Supabase client
  "next": "15.5.2",                  // Next.js framework
  "tailwindcss": "^4",               // Styling
  "lucide-react": "^0.542.0"        // Icons
}
```

## 🌎 **Environment Setup**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
CLOUDFLARE_ACCOUNT_ID=your_cf_account
CLOUDFLARE_API_TOKEN=your_cf_token
CLOUDFLARE_IMAGES_HASH=your_cf_hash
```

## 📝 **Notes**
- Focus on Chilean market & cultural identity
- Feminine-friendly UX (inspired by The Lover archetype)
- Premium positioning through elegant design
- Community-driven social features
- Moodboard-based inspiration synthesis (core differentiator)

---
*Last updated: 2025-01-15 | Version: 0.2.0 (B2C Migration)*