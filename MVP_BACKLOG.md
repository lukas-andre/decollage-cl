# 🎨 Decollage.cl - MVP Backlog (Clean)

> **MVP Focus**: Chilean B2C home design transformation platform
> **Target**: Launch-ready features for Chilean women 30-55
> **Timeline**: 4-6 weeks to MVP launch

---

## 📊 MVP Foundation (Already Built) ✅

- Next.js 15 + App Router with TypeScript
- Supabase (Auth + Database + Storage)
- Gemini AI Integration (Image Generation)
- Cloudflare Images (CDN)
- Token Economy System
- Basic Projects CRUD
- Chilean Design System Database
- Furniture Preservation Controls
- shadcn/ui Component Library

---

## 🔴 MVP CRITICAL FEATURES

### NEW - M1: Children's Rooms & Decoration 🔴 **TOP PRIORITY**
**Status**: CRITICAL - Market Expansion (Family Segment)
- **Kids Categories**: Add "Pieza Niño", "Pieza Niña", "Pieza Bebé" room types
- **Age-Appropriate Designs**: Safe, educational, and fun decorative elements
- **Soft Color Palettes**: Gentle, child-friendly color schemes
- **Safety First**: Child-safe furniture and decor suggestions
- **Chilean Family Values**: Reflect Chilean parenting culture and aesthetics
- **Growth Adaptable**: Designs that can evolve as children grow

### NEW - M2: Image Preview System ✅ **COMPLETED**
**Status**: COMPLETED - Basic UX Issue Fixed
- ✅ **Fullscreen Preview**: View uploaded base images in modal - **DONE**
- ✅ **Base Image Expansion**: Click to expand base image preview in wizard - **DONE**
- ✅ **Mobile Optimized**: Touch-friendly image viewer - **DONE**
- ✅ **Quick Access**: Preview from project gallery thumbnails - **DONE**

### M3: User Freedom in Design Creation ✅ **COMPLETED**
**Status**: ✅ COMPLETED - Context-First Wizard Fully Implemented
- ✅ **4-Step Wizard Flow**: Context → Inspiration → Details → Generate workflow - **DONE**
- ✅ **Style + Custom Prompt Tabs**: Clear choice between guided styles and custom vision - **DONE**
- ✅ **Progressive Disclosure**: Optional advanced settings in accordion - **DONE**
- ✅ **Chilean UX**: Room categorization with cultural design options - **DONE**
- ✅ **Style + Prompt Combination**: Users can select style AND add custom prompt - **DONE**
- ✅ **Auto-advance on Room Selection**: Wizard auto-progresses after room selection - **DONE**
- ✅ **Dimensions as "Inferidas por Decollage ✨"**: Replaced specific measurements - **DONE**
- ✅ **Replaced all AI/IA references with "Decollage"**: Brand consistency - **DONE**

### M5: Pricing & Business Strategy 🔴
**Status**: PENDING - Business Critical
- Validate Chilean market pricing (CLP packages)
- Define token consumption ratios
- Create pricing psychology strategy
- Launch discount strategy

### M4: Content Sharing & Viral Growth 🔴
**Status**: 🟡 **90% COMPLETED** - Growth Engine Ready 🚀
- ✅ **Favorites Widget**: Quick-access panel in project workspace with drag & drop - **INTEGRATED**
- ✅ **Share Preview**: Live preview of shareable content as you select favorites - **FUNCTIONAL**
- ✅ **One-Click Sharing**: Generate beautiful project showcases with ISR - **OPERATIONAL**
- ✅ **Social Templates**: Basic templates seeded, OG image generation - **WORKING**
- ✅ **Public Project Pages**: Shareable URLs with dynamic OG meta tags - **LIVE**
- ✅ **Privacy Controls**: Public/unlisted/private sharing with password protection - **COMPLETE**
- ✅ **Analytics Infrastructure**: Complete tracking (views, clicks, conversions) - **ACTIVE**
- ✅ **Real-time Engagement**: "Aplausos" reaction system with real-time updates - **REAL-TIME**
- ✅ **Frontend Integration**: ShareModal, share buttons, complete user workflow - **INTEGRATED**
- ✅ **Build & Deploy Ready**: All TypeScript errors resolved, production ready - **VERIFIED**
- 🔄 **Login Gate Strategy**: Quick shares public but require login for interactions (likes, downloads, "crear mi diseño") - **NEEDED**
- 🔄 **Share Management**: CRUD interface for users to manage their shared projects (edit, delete, update privacy settings) - **NEEDED**

**🎉 90% COMPLETE - Growth engine operational, needs login gates & management UI**

### M9: Saved Content System 🔴
**Status**: 🟡 PARTIALLY COMPLETED - User Retention
- ✅ **Project Favorites**: Save best generations within projects (COMPLETED)
- ✅ **Quick Gallery**: Thumbnail view of saved favorites (COMPLETED)
- ✅ **Collections Infrastructure**: Database tables and types ready (COMPLETED)
- 🔄 **Cross-Project Saved**: Unified favorites across all projects (IN PROGRESS)
- 🔄 **Collections UI**: Frontend for organizing saved content into themed boards
- 🔄 **Export Options**: PDF/image downloads of collections (NOT NEED IT)

### M10: Basic Analytics 🔴
**Status**: 🟡 PARTIALLY COMPLETED - Data Foundation
- ✅ **Usage Tracking**: Views, likes, saves, shares per content (COMPLETED)
- ✅ **Share Analytics**: Track viral coefficient and referral success (COMPLETED)
- ✅ **Conversion Tracking**: Share-to-signup funnel analysis (COMPLETED)
- ✅ **Analytics Infrastructure**: Database tables and service layer (COMPLETED)
- 🔄 **User Journey**: Track onboarding and feature adoption (PENDING)
- 🔄 **Basic Metrics**: Token consumption, project completion rates (PENDING)
- 🔄 **Analytics Dashboard**: Frontend for viewing metrics (PENDING)

---

## 🟡 MVP CORE FEATURES

### NEW - Facades & Exteriors Module 🟡
**Status**: IMPORTANT - Market Expansion
- **Fachadas Category**: Add exterior house design transformations ✅
- **Exteriores/Jardines**: Landscaping and outdoor space design ✅
- **Architectural Elements**: Windows, doors, roof, materials 
- **Chilean Architecture**: Traditional and modern Chilean home styles 
- **Seasonal Gardens**: Native Chilean plants and outdoor aesthetics 

### NEW - Save Custom Styles 🟡
**Status**: IMPORTANT - User Personalization
- **"Guardar Estilo" Button**: Save successful generations as templates
- **Personal Style Library**: User's saved custom prompts and preferences
- **Reusable Templates**: Apply saved styles to new projects
- **Style Naming**: Custom names for personal design preferences
- **Style Sharing**: Option to share custom styles with community

### NEW - Quick Iterate Feature 🟡
**Status**: ENHANCEMENT - Design Workflow
- **"Quick Add" Button**: Rapid iteration on generated images
- **Smart Defaults**: Pre-fill with "conservar todo" + clear prompt
- **Additive Design**: Add elements to existing designs without starting over
- **Context Preservation**: Maintain room context while adding new elements
- **Iteration History**: Track changes made in quick iterations

### NEW - Project Style Selection 🟡
**Status**: ENHANCEMENT - Project Organization
- **Project-Level Styles**: Optional style assignment per project
- **Style Consistency**: Maintain design coherence across generations
- **Default Project Style**: Pre-select style for all new generations
- **Style Override**: Allow per-generation style changes when needed
- **Style History**: Track style evolution within projects

### Mobile Experience 🟡
**Status**: PENDING - User Experience
- **Responsive Design**: Mobile-first project workspace
- **Touch Optimization**: Larger touch targets, swipe gestures
- **Mobile Image Viewer**: Full-screen gallery with pinch-zoom
- **Bottom Actions**: Thumb-friendly control placement
- **Pull-to-Refresh**: Native gesture support

### Moodboard System 🟡
**Status**: PENDING - Core Differentiator
- **Multi-Image Upload**: Drag-and-drop composition
- **AI Style Synthesis**: Extract inspiration from multiple images
- **Weight Controls**: Adjust influence of each inspiration image
- **Moodboard Gallery**: Save and reuse inspiration boards

### Design Iterations 🟡
**Status**: PENDING - User Value
- **Variation History**: Track all transformation attempts
- **Refinement UI**: Iterate on existing designs
- **Comparison Tools**: Side-by-side variant comparison
- **Version Control**: Save multiple design directions

### Public Gallery 🟡
**Status**: PENDING - Social Discovery
- **Featured Transformations**: Showcase best community designs
- **Like & Save**: Social engagement on public content
- **Search & Filter**: Discover by style, room type, color

### User Onboarding 🟡
**Status**: PENDING - Conversion
- **Email Verification Flow**: Complete signup experience
- **Welcome Tutorial**: First project guided creation
- **Style Quiz**: Personalized Chilean aesthetic preferences

---

## 🟢 MVP NICE-TO-HAVE

### Enhanced UI/UX 🟢
- Keyboard shortcuts for power users
- Drag-and-drop image reordering
- Bulk selection with checkboxes
- Advanced filtering options

### Basic Security 🟢
- Rate limiting per user/IP
- Content moderation (NSFW detection)
- Basic audit logging
- GDPR compliance tools

---

## 🚫 NOT FOR MVP

### Excluded Features (Post-MVP)
- **Community Features**: Follow/follower system, messaging, profiles
- **Advanced Analytics**: Heatmaps, demographics, trending algorithms
- **Creator Economy**: Monetization, tips, marketplace
- **AI Personalization**: ML recommendations, user profiling
- **Advanced Collaboration**: Real-time editing, team workspaces
- **Pinterest Integration**: OAuth, board imports, auto-sync
- **Enterprise Features**: White-label, API access, bulk processing
- **Advanced Infrastructure**: Microservices, queue systems, GraphQL

---

## 🎯 MVP Success Metrics

### User Engagement
- **Onboarding Completion**: >70%
- **First Transformation**: <10 minutes
- **Favorites Usage**: >60% of users
- **Share Rate**: >30% of projects

### Business Metrics
- **User Retention (30 days)**: >60%
- **Token Consumption**: +40% vs current
- **Referral Rate**: >20% through shares
- **Chilean Style Adoption**: >60%

### Technical Metrics
- **Mobile Bounce Rate**: <20%
- **Page Load Time**: <3 seconds
- **Uptime**: >99.5%

---

## 🚀 Updated Implementation Priority (Post-Sharing Success)

### Phase 1 (Week 1): Critical UX Blockers 🔴 **IMMEDIATE**
1. 🔄 **Children's Room Categories** - Add "Pieza Niño/Niña/Bebé" room types (M1)
2. ✅ **Image Preview Modal** - Fullscreen image viewer for uploads (M2) - **COMPLETED**
3. ✅ **Custom Style Option** - Add "Personalizado" category for free prompting (M3) - **COMPLETED**
4. ✅ **Wizard UX Improvements** - Auto-advance, clickable preview, Decollage branding - **COMPLETED**
5. 🔄 **Login Gate for Shares** - Public viewing, login required for interactions (M4)

### Phase 2 (Week 2): Growth & Retention Features 🟡
1. 🔄 **Share Management Dashboard** - CRUD interface for user shares (M4)
2. 🔄 **Facades & Exteriors Module** - New room categories for exteriors
3. 🔄 **Basic Mobile Optimizations** - Touch improvements, responsive fixes

### Phase 3 (Week 3): Enhanced Features 🟢
1. 🔄 **Save Custom Styles** - Personal style library system
2. 🔄 **Quick Iterate Feature** - Rapid iteration on generated images
3. 🔄 **Project Style Selection** - Optional style assignment per project

### COMPLETED ✅
**Phase 0: Core Sharing Infrastructure (September 2024)**
1. ✅ Favorites widget in project workspace with drag & drop - **INTEGRATED & FUNCTIONAL**
2. ✅ Share preview system with live updates - **WORKING IN SHAREMODAL**
3. ✅ Public project pages with dynamic OG images and ISR - **DEPLOYED & WORKING**
4. ✅ Analytics infrastructure and real-time engagement - **TRACKING ACTIVE**
5. ✅ Frontend UI integration and user workflow - **COMPLETE & TESTED**
6. ✅ Build system and TypeScript fixes - **PRODUCTION READY**

### Future Roadmap (Post-Current Development)
**Social & Discovery Phase**:
1. Public gallery with featured content
2. Advanced moodboard system
3. User onboarding flow improvements
4. Community features

**Seasonal & Cultural Expansion**:
1. Seasonal themes (18 Sept, Navidad Chilena, Día de la Madre)
2. Advanced children's categories (age-specific designs)
3. Chilean cultural celebrations integration
4. Regional aesthetic variations

---

## 🎨 Chilean Cultural Focus

All MVP features must maintain strong Chilean cultural identity:
- **Design Styles**: Mediterráneo Chileno, Boho Valparaíso, etc.
- **Color Palettes**: Atardecer en Valparaíso, Verde Cordillera
- **Language**: Chilean Spanish terminology throughout
- **Seasonal Themes**: Fiestas Patrias, Navidad Chilena
- **Local Aesthetics**: Reflect Chilean home design preferences

---

## 🎉 **MAJOR MILESTONE ACHIEVED - September 16, 2025**

### **M8: Content Sharing & Viral Growth - FULLY OPERATIONAL** ✅

**🚀 Critical MVP Component Complete**: The viral growth engine that will drive user acquisition and retention is now **100% functional** and ready for user testing.

**What This Means for Business**:
- **Viral Growth Ready**: Users can share beautiful project showcases that convert viewers to signups
- **Social Media Optimized**: WhatsApp, Twitter, Facebook sharing with dynamic OG images
- **SEO Benefits**: Public share pages will rank in search results
- **User Retention**: Favorites and collections systems encourage return visits
- **Analytics Foundation**: Track viral coefficient, conversion rates, and sharing behavior

**Technical Achievement**:
- **7 Database Tables**: Complete sharing infrastructure
- **Frontend Integration**: ShareModal, FavoritesWidget, share buttons throughout UI
- **Performance**: ISR for fast loading, real-time updates for engagement
- **Type Safety**: 100% TypeScript coverage, production-ready build

**Next Priority**: Focus on M5 (Pricing Strategy) and M11 (Seasonal Content) to complete MVP for Chilean market launch.

---

---

## 🎉 **MAJOR UPDATE - January 19, 2025**

### **NEW COMPLETIONS** ✅:

#### **Image Editing & Refinement System** ✅ **COMPLETED**
1. ✅ **Unified Modal Experience** - Single ImageViewerModal for both viewing and editing
2. ✅ **Prompt-Based Refinement** - Simplified editing with prompt-only approach (removed canvas/masking)
3. ✅ **Edit Mode Toggle** - Brush icon opens in edit mode, card/expand opens in view mode
4. ✅ **Variation Generation** - Generate multiple refinement options from prompts
5. ✅ **Use as Base Image** - Ability to use refined images as new base images for projects
6. ✅ **Variations Sidebar** - Preview and select from generated variations

#### **Wizard UX Improvements** ✅ **COMPLETED**
1. ✅ **Clickable Base Image Preview** - Expand base image from wizard "Imagen Activa" preview
2. ✅ **Auto-advance on Room Selection** - Automatic progression after selecting room type
3. ✅ **Prompt Always Present** - Prompt step always available with conditional style requirement
4. ✅ **Dimensions Display** - Shows "Inferidas por Decollage ✨" instead of specific measurements
5. ✅ **Remove AI References** - All "IA"/"inteligencia artificial" replaced with "Decollage"
6. ✅ **Style Optional with Prompt** - When prompt exists, style selection becomes optional

### **BUG FIXES PENDING** 🔧:
1. **Cloudflare Import Error** - Fixed `uploadToCloudflareImages` import (changed to use `getCloudflareImages` class method)

---

## 🎉 **MAJOR UPDATE - September 19, 2025**

### **COMPLETED FEATURES** ✅:
1. ✅ **Two-Column Gallery + Inspector Layout** - Modern project workspace implemented
2. ✅ **Context-First 4-Step Wizard** - Intuitive design flow (Define Space → Choose Inspiration → Details → Generate)
3. ✅ **Progressive Disclosure UI** - Accordion-based optional settings to reduce cognitive overload
4. ✅ **Room Categorization** - Interior/Infantil/Exterior tabs for better organization
5. ✅ **Style Categorization** - Grouped by macrocategory with recommended styles per room type

### **CRITICAL NEW REQUIREMENTS** 🔴 **IMMEDIATE**:

#### **M1A: Wizard UX Improvements** ✅ 
- ✅ **Furniture Accordion Open by Default** - Show furniture options expanded initially
- ✅ **Tab Navigation Support** - Enable keyboard navigation between tabs
- ✅ **Style + Prompt Combination** - Allow users to select style AND add custom prompt for ultimate flexibility
- ✅ **Remove "Otro" and "Personalizado"** from Step 3 accordion - clean up interface
- ✅ **Smart Navigation Flow**:
  - If user selects "Personalizado" → jump directly to prompt step
  - If user selects style → allow optional prompt addition → continue to summary
- ✅ **Step 4 Streamlined Summary** - Combine final review with essential details only

#### **M1B: Room Categories & Style Recommendations** ✅ **CRITICAL**
- ✅ **Missing Room Categories** - Only seeing "Living Comedor" and "Dormitorio Infantil", need full range
- ✅ **Macrocategory Restoration** - Bring back all style macrocategories (Moderno, Clásico, Lujo, etc.)
- ✅ **Smart Style Recommendations** - When selecting "Dormitorio Infantil" → show child-friendly styles
- ✅ **Complete Room Types** - Add all missing interior/exterior room categories
- ✅ **Interior/Exterior Structure** - Consider reorganizing as main Interior/Exterior categories

#### **M1C: Project Layout Improvements** ✅ **UX CRITICAL**
- ✅ **Center Generations List** - Main screen should focus on generated designs, not base image preview
- ✅ **Active Image Highlight** - Visual frame/border to clearly show which image is being edited
- ✅ **Quick Image Expansion** - Click/tap any image to expand instantly (remove eye button requirement)
- ✅ **Fullscreen Image Viewer** - Restore capability to view current editing image in fullscreen
- ✅ **Base Image Size Reduction** - Reduce preview size to give more space to generations

#### **M1D: Advanced Generation Controls** ✅ **FUNCTIONALITY**
- ✅ **Room Dimension Auto-Detection** - Add note that dimensions can be auto-detected (optional user input)
- ✅ **Remove Color Palette Section** - Mark as "En Desarrollo" and temporarily remove
- ✅ **Enhanced Furniture Modes** - Improve furniture handling options and descriptions

### **Previously Identified Priorities**: ✅
3. ✅ **Image Preview UX** - Basic missing functionality for uploaded images
4. ✅ **Facade Module** - Exterior design capabilities for complete home transformation
5. **Login Gates** - Strategic conversion points in sharing flow

### **Development Status**:
- ✅ **Modern Layout & Wizard**: Context-First wizard with two-column layout **COMPLETED**
- ✅ **Current Focus**: Wizard UX improvements + room categories + layout refinements
- ✅ **Next Milestone**: Perfect the generation workflow user experience

---

**🎯 MVP Goal**: Launch a culturally-relevant, mobile-optimized Chilean home design platform that enables viral growth through beautiful content sharing while maintaining premium positioning through advanced AI and furniture preservation controls.