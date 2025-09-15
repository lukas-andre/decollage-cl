# Technical Backlog - VirtualStaging.cl Refactor

## ✅ UPDATE (January 2025)
Dashboard updates and new features have been completed as requested:
- Professional sidebar navigation with enterprise styling
- Complete dashboard overhaul with stats and quick start wizard
- Enhanced projects page with filtering and bulk actions
- New styles management page with marketplace
- Batch processing page with multi-image support
- Updated components with environment badges and quick actions
- All labels in Spanish as requested

## Overview
Complete refactor to focus on pure virtual staging for B2B/B2C markets, removing custom staging features and streamlining the application.

## 🔴 REMOVE - Files & Features to Delete

### Custom Staging Components & Pages
- [x] `/src/components/custom-staging/` - Entire directory ✅
  - `BaseImagesGallery.tsx`
  - `ItemsGallery.tsx`
  - `GenerationPanel.tsx`
  - `GenerationsGallery.tsx`
  - `index.ts`
- [x] `/src/app/(dashboard)/dashboard/custom-staging/` - Entire directory ✅
- [x] `/src/app/api/custom-staging/` - Entire directory with all routes ✅
- [x] `/src/config/custom-staging.ts` ✅

### Unnecessary AI Providers
- [x] `/src/lib/ai/providers/openrouter.ts` ✅
- [x] `/src/lib/ai/providers/openrouter-custom.ts` ✅
- [x] `/src/lib/ai/providers/gemini.ts` (keep gemini-direct.ts) ✅

### Database Migrations (Custom Staging)
- [x] `20240201000002_custom_staging.sql` ✅
- [x] `20241230000001_custom_staging_mvp_refactor.sql` ✅

### Deprecated Pages
- [x] `/src/app/(dashboard)/generate/page.tsx` (old generation page) ✅
- [x] `/src/app/(dashboard)/gallery/page.tsx` (replaced by projects) ✅

## 🟡 MODIFY - Files Requiring Updates

### Core AI System
- [x] **`/src/lib/ai/client.ts`** ✅
  - Remove OpenRouter imports and references ✅
  - Remove old Gemini provider ✅
  - Keep only Runware and Gemini-direct (rename to Gemini) ✅
  - Add style persistence methods ✅
  - Simplify provider selection logic ✅

- [x] **`/src/lib/ai/providers/gemini-direct.ts`** ✅
  - Rename to `gemini.ts` ✅
  - Add custom style prompt injection ✅
  - Optimize for interior/exterior staging ✅
  - Add batch processing support ✅

- [x] **`/src/lib/ai/providers/runware.ts`** ✅
  - Add custom style support ✅
  - Optimize prompts for staging ✅
  - Add room type detection ✅
  - Improve error handling ✅

- [x] **`/src/lib/ai/virtual-staging.ts`** ✅
  - Remove room analysis code ✅
  - Add custom style management ✅
  - Add batch generation support ✅
  - Simplify generation flow ✅

### Database Schema Updates
- [x] **New Migration: `add_custom_styles_and_refactor`** ✅
  - Created `custom_styles` table with all fields ✅
  - Added RLS policies for custom_styles ✅
  - Added `custom_style_id` to staging_generations (conditional) ✅
  - Added `environment_type` to room_types (conditional) ✅
  - Dropped all custom staging tables ✅
  - Added 5 default public custom styles ✅
  - Created update triggers for timestamps ✅

### Landing Page
- [x] **`/src/app/page.tsx`** ✅
  - Complete redesign for B2B/B2C focus ✅
  - Hero section with before/after slider ✅
  - Pricing packages display ✅
  - Feature comparison table ✅
  - Customer testimonials ✅
  - CTA for free trial ✅
  - B2B section with enterprise benefits ✅

### Dashboard Updates
- [x] **`/src/app/(dashboard)/dashboard/page.tsx`** ✅
  - Simplify to show projects overview
  - Quick stats (tokens, generations, projects)
  - Recent generations gallery
  - Quick start wizard for new users

- [x] **`/src/app/(dashboard)/dashboard/projects/page.tsx`** ✅
  - Improve grid layout
  - Add filtering by environment type
  - Bulk actions for B2B users
  - Template projects feature

- [x] **`/src/app/(dashboard)/dashboard/projects/[id]/page.tsx`** ✅
  - Add custom style selector
  - Batch upload for multiple images
  - Generation queue display
  - Export all feature

### New Pages to Create
- [x] **`/src/app/(dashboard)/dashboard/styles/page.tsx`** ✅
  - Custom style manager
  - Create/edit/delete styles
  - Style gallery with examples
  - Public style marketplace

- [x] **`/src/app/(dashboard)/dashboard/batch/page.tsx`** ✅
  - Batch processing interface
  - Upload multiple images
  - Apply same style to all
  - Download all as ZIP

### API Routes Updates
- [x] **`/src/app/api/generate/route.ts`** ✅
  - Add custom style support
  - Batch generation endpoint
  - Queue management
  - Progress webhooks

- [x] **`/src/app/api/styles/route.ts`** (NEW) ✅
  - CRUD for custom styles
  - Style sharing endpoints
  - Popular styles endpoint

- [x] **`/src/app/api/batch/route.ts`** (NEW) ✅
  - Batch upload handler
  - Batch generation orchestrator
  - Progress tracking

### Components Updates
- [x] **`/src/components/projects/ProjectCard.tsx`** ✅
  - Add environment type badge
  - Show style used
  - Quick regenerate button

- [x] **`/src/components/projects/ProjectGallery.tsx`** ✅
  - Add style filter
  - Comparison view
  - Batch select for download

## 🟢 KEEP - Core Features to Maintain

### Authentication & User Management
- ✅ All auth pages and components
- ✅ User profile management
- ✅ Token system and transactions
- ✅ Supabase integration

### Project Management
- ✅ Projects CRUD
- ✅ Project images (base images)
- ✅ Staging generations (variants)
- ✅ Image viewer modal
- ✅ Before/after slider

### Infrastructure
- ✅ Cloudflare Images integration
- ✅ Supabase setup
- ✅ Middleware and security
- ✅ Health check endpoints

### UI Components
- ✅ All Shadcn components
- ✅ Layout components
- ✅ Alert and notification system

## 🆕 NEW - Features to Implement

### Phase 1 (MVP - Week 1)
1. **Custom Styles System**
   - [ ] Database schema for custom styles
   - [ ] CRUD API for styles
   - [ ] UI for style management
   - [ ] Style templates library

2. **Enhanced Generation**
   - [ ] Environment type selection (interior/exterior/commercial)
   - [ ] Batch generation support
   - [ ] Generation queue system
   - [ ] Progress indicators

3. **Landing Page Overhaul**
   - [ ] B2B/B2C targeted sections
   - [ ] Interactive demos
   - [ ] Pricing calculator
   - [ ] Lead capture forms

### Phase 2 (Week 2-3)
1. **B2B Features**
   - [ ] Team workspaces
   - [ ] Bulk credits purchase
   - [ ] White-label options
   - [ ] API access

2. **Export & Sharing**
   - [ ] Batch download ZIP
   - [ ] Branded PDFs
   - [ ] Public gallery links
   - [ ] Social media integration

3. **Analytics Dashboard**
   - [ ] Usage statistics
   - [ ] Popular styles tracking
   - [ ] Generation success rates
   - [ ] Cost analysis

### Phase 3 (Week 4)
1. **Marketplace**
   - [ ] Public style sharing
   - [ ] Style ratings/reviews
   - [ ] Featured styles
   - [ ] Designer profiles

2. **Advanced AI**
   - [ ] Auto-style suggestions
   - [ ] Room type detection
   - [ ] Quality scoring
   - [ ] Failure recovery

## Implementation Order

### Week 1: Core Cleanup
1. Remove all custom staging code
2. Rename and refactor AI providers
3. Update database schema
4. Fix broken references

### Week 2: Essential Features
1. Implement custom styles system
2. Update project workspace
3. Add batch generation
4. Redesign landing page

### Week 3: B2B Focus
1. Add package management
2. Implement team features
3. Create API documentation
4. Add bulk operations

### Week 4: Polish & Launch
1. Complete UI/UX improvements
2. Add analytics and monitoring
3. Performance optimization
4. Launch preparation

## Testing Requirements

### Unit Tests
- [ ] Custom styles CRUD
- [ ] Batch generation logic
- [ ] Token calculations
- [ ] API endpoints

### Integration Tests
- [ ] Full generation pipeline
- [ ] Payment flow
- [ ] Export features
- [ ] Style application

### E2E Tests
- [ ] Complete user journey
- [ ] B2B workflow
- [ ] Batch processing
- [ ] Error recovery

## Performance Targets

- Generation time: < 30 seconds
- Batch processing: 10 images parallel
- Page load: < 2 seconds
- API response: < 500ms
- Uptime: 99.9%

## Migration Checklist

### Pre-deployment
- [ ] Backup current database
- [ ] Export all custom staging data
- [ ] Notify users of changes
- [ ] Prepare migration scripts

### Deployment
- [ ] Run database migrations
- [ ] Deploy new codebase
- [ ] Verify all endpoints
- [ ] Monitor for errors

### Post-deployment
- [ ] User communication
- [ ] Support documentation
- [ ] Performance monitoring
- [ ] Feedback collection

---

**Priority Legend:**
- 🔴 High Priority - Do immediately
- 🟡 Medium Priority - Do this week
- 🟢 Low Priority - Can wait

**Effort Estimates:**
- S (Small): < 2 hours
- M (Medium): 2-8 hours
- L (Large): 1-3 days
- XL (Extra Large): 3+ days