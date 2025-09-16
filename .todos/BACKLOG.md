🎨 Decollage.cl - Complete Development Plan & Backlog

📊 Current State Analysis

✅ What's Already Built (Strong Foundation)

- Next.js 15 + App Router - Modern React setup
- Supabase Integration - Database and auth working
- Beautiful Landing Page - Aligned with brand (The Magician + The Lover)
- Authentication System - Complete auth flow
- Dashboard Structure - Sidebar, header, navigation
- Basic Projects System - CRUD operations working
- Token Economy - Packages, transactions, balance tracking
- Gemini AI Integration - State-of-the-art image generation
- Cloudflare Images - Professional image handling
- UI Components - Complete shadcn/ui system

❌ Critical Schema Mismatch Issues

- Current DB schema is B2B-focused vs new B2C-focused schema
- Missing 15+ critical tables from new schema
- Hardcoded styles in files vs database-driven design system
- No social features (gallery, likes, comments)
- Missing Chilean cultural elements
- No moodboard/Pinterest integration

---
🎯 MoSCoW Prioritized Backlog

🔴 MUST HAVE (Phase 1: Core Migration - Weeks 1-3)

M1: Database Schema Migration ✅ COMPLETED

- ✅ Create new schema migration scripts to match supabase/migrations/001_decollage_core_schema.sql
- ✅ Create new schema migration scripts to match supabase/migrations/002_auth_triggers.sql
- ✅ Add support for admin role, this role should be able to enter to the admin dashboard
- ⏳ Data migration scripts for existing users/projects to new structure (pending - to run after schema deployment)
- ✅ Update TypeScript types to match new schema

M2: Core Application Adaptation

- Update Projects system to use new schema (projects table)
- Migrate Transformations from staging_generations to transformations table
- Update Images system to use new images table structure
- Fix Authentication to work with enhanced profiles table
- Update API routes to match new schema structure

M3: Design System Database Migration ✅ COMPLETED

- ✅ Create design_styles seeder with Chilean-themed styles from prompts.ts
- ✅ Create color_palettes seeder with Chilean landscapes/culture
- ✅ Create room_types seeder with local terminology
- ✅ Create seasonal_themes seeder with Chilean holidays
- ✅ Create comprehensive global design styles seeder (42 international styles)
- Update AI service to fetch styles from database instead of files

M4: Chilean Cultural Identity Integration ✅ COMPLETED

- ✅ Implement Chilean design styles: Mediterráneo Chileno, Boho Valparaíso, etc.
- ✅ Add Chilean color palettes: Atardecer en Valparaíso, Verde Cordillera, etc.
- ✅ Seasonal themes: Fiestas Patrias, Navidad Chilena, Verano Chileno
- ✅ Create comprehensive documentation for seeded design system
- Update UI copy to Chilean Spanish terminology

M5: Token Pricing & Package Strategy 🔴 CRITICAL

- Review and validate token package pricing for Chilean market
- Research competitor pricing (local and international)
- Define clear feature differentiation between packages
- Validate token-to-generation ratios (currently ~1 token = 1 transformation)
- Consider seasonal promotions and launch discounts
- Define upgrade/downgrade policies between packages
- Establish bulk/enterprise pricing tiers
- Create pricing psychology strategy (anchoring, decoy effect)

---
🟡 SHOULD HAVE (Phase 2: Core Features - Weeks 4-6)

S1: Moodboard System (The Magician's Core Feature)

- Moodboard creation UI with drag-and-drop
- Multi-image upload with composition tools
- AI style synthesis from moodboard images
- Inspiration weight controls (0-100% influence)
- Moodboard sharing and collaboration features

S2: Iterative Design System

- Transformation iterations table implementation
- Refinement UI for iterating on designs
- History tracking of all refinements
- Comparison tools between iterations
- Save multiple variations functionality

S3: Enhanced User Journey

- **MISSING**: Email verification confirmation page/onboarding flow - User receives email, gets redirected, account activates but no confirmation or welcome experience
- Onboarding flow with style personality quiz
- Welcome project creation with Chilean examples
- Progressive feature disclosure
- Tutorial overlays for first-time users
- Achievement system for engagement

---
🟢 COULD HAVE (Phase 3: Social & Discovery - Weeks 7-9)

C1: Social Gallery System

- Public gallery with featured transformations
- Like and save functionality
- Comment system with moderation
- User following and feed system
- Featured content curation by admins

C2: Pinterest Integration

- Pinterest OAuth setup and authentication
- Board import functionality with AI analysis
- Pin synchronization and auto-sync
- Style extraction from Pinterest pins
- Moodboard creation from Pinterest boards

C3: Advanced Analytics

- User events tracking system
- Usage analytics dashboard
- Style popularity metrics
- User journey analysis
- A/B testing framework for features

---
🔵 WON'T HAVE (Phase 4: Polish & Advanced - Weeks 10+)

W1: Back Office Administration

- Admin dashboard for content management
- Style management interface
- Color palette creation tools
- Seasonal theme management
- User moderation tools
- Analytics and reporting interface

W2: Mobile Optimization

- Mobile-first responsive design improvements
- Touch interactions optimization
- Mobile image upload optimization
- Offline capabilities for viewing saved designs
- PWA features for app-like experience

W3: Advanced Features

- AI prompt engineering interface for admins
- Custom style creation for power users
- Batch processing for multiple rooms
- 3D visualization integration
- Export to design tools (Photoshop, etc.)

---
🛠 Technical Implementation Strategy

Database Migration Approach

1. Backup current production data
2. Create migration scripts that preserve existing user data
3. Run migration in staging environment first
4. Gradual rollout with feature flags
5. Rollback plan in case of issues

Code Organization

src/
├── lib/
│   ├── db/
│   │   ├── migrations/     # New schema migrations
│   │   ├── seeders/        # Chilean cultural data
│   │   └── types.ts        # Updated TypeScript types
│   ├── chile/              # Chilean cultural components
│   │   ├── styles.ts       # Chilean design styles
│   │   ├── palettes.ts     # Chilean color palettes
│   │   └── seasons.ts      # Chilean seasonal themes
│   └── moodboards/         # Moodboard system
├── app/(dashboard)/
│   ├── moodboards/         # Moodboard management
│   ├── gallery/            # Social gallery
│   └── onboarding/         # User onboarding
└── components/
    ├── chile/              # Chilean-specific components
    ├── moodboards/         # Moodboard components
    └── social/             # Social feature components

Design System Implementation

- Brand Colors: Use exact colors from docs/LOOK.md (#A3B1A1, #C4886F, #333333, #F8F8F8)
- Typography: Cormorant (display) + Lato (body) as specified
- Component Patterns: Follow magazine-style layouts from LOOK.md
- Chilean Aesthetics: Integrate local cultural elements throughout

Performance Considerations

- Image optimization with Cloudflare variants
- Database indexing for social features queries
- Caching strategy for frequently accessed cultural data
- Progressive loading for moodboard galleries

---
📈 Success Metrics & KPIs

User Engagement (The Magician)

- Onboarding completion rate > 70%
- First transformation within 10 minutes
- Average iterations per project > 3
- Moodboard creation rate > 40%

Social Features (The Lover)

- Gallery interaction rate > 25%
- User-to-user follows > 10% of users
- Public sharing rate > 15%
- Comment engagement > 5%

Cultural Resonance

- Chilean style adoption > 60%
- Seasonal theme engagement during holidays
- Local color palette usage > 70%
- Chilean Spanish terminology adoption

Business Metrics

- Token consumption increase by 40%
- User retention at 30 days > 60%
- Referral rate through social features > 20%
- Premium feature adoption > 30%

---
🚀 Immediate Next Steps

1. Validate and run new schema migrations in development
2. Create data migration scripts for existing users
3. Update TypeScript types to match new schema
4. Begin Chilean cultural data implementation
5. Start moodboard system development

This plan transforms Decollage.cl from a basic virtual staging tool into the definitive Chilean home 
design platform that embodies both The Magician (transformation) and The Lover (beauty & community) 
archetypes while staying true to Chilean cultural identity.

✻ Thinking…

Great! The user has approved my comprehensive plan. Now I need to start implementing it. Looking at the plan,
the most critical first step is the database schema migration since the current schema doesn't match the new
comprehensive B2C-focused schema.

Let me start by using the TodoWrite tool to create a focused todo list for the immediate next steps, and then
begin with the schema migration work.

I should start with:
1. Create the todo list for Phase 1 (MUST HAVE items)
2. Begin with the database schema migration
3. Update TypeScript types
4. Create the Chilean cultural data seeders

Let me start with the TodoWrite tool to track this work.