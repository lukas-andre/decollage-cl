# VirtualStaging.cl - AI-Powered Virtual Staging Platform

## Project Overview

VirtualStaging.cl is a comprehensive SaaS platform that transforms empty room photographs into professionally staged interiors using AI technology. Built with Next.js 15, Supabase, and integrated with Chilean payment systems, it provides a complete solution for real estate professionals and homeowners in Chile.

## Tech Stack

### Core Framework
- **Next.js 15.5.2** with App Router
- **TypeScript 5** for type safety
- **React 19** with Server Components

### Database & Authentication
- **Supabase** (PostgreSQL + Auth + Real-time)
- **Row Level Security (RLS)** for data protection
- **JWT-based authentication**

### UI & Styling
- **Shadcn/ui** component library
- **Tailwind CSS v4** for styling
- **Radix UI** primitives
- **Lucide React** icons

### Image Management & Storage
- **Cloudflare Images** for storage, CDN, and image optimization
- **NO Supabase Storage** - All images stored in Cloudflare
- Automatic image compression and variant generation
- Direct upload support with metadata

### AI Integration
- **Runware API** for virtual staging generation
- **Model:** bytedance:4@1 for optimal results
- **Virtual Staging Service** (`/lib/ai/virtual-staging.ts`)
- Cost tracking and rate limiting built-in
- No room analysis for MVP - direct staging generation

### Payment Integration
- **Flow Chile** for local payment processing
- **Token-based economy** system
- WebPay and Mercado Pago support

### Testing & Deployment
- **Playwright** for E2E testing
- **Railway** for deployment
- **Nixpacks** for build process

## Current Implementation Status (Mission 2 Complete)

### ✅ Project Workspace System
The application now features a sophisticated project and variant management system:

#### Database Schema Updates
- **projects** - Main container for user projects
- **project_images** (base images) - Multiple room photos per project
- **staging_generations** (variants) - AI-generated designs per base image
- **room_types** - Predefined room categories (Living Room, Bedroom, etc.)
- **color_schemes** - Color palettes with hex values
- **staging_styles** - Design styles (Modern, Scandinavian, etc.)

#### Project Management Flow
1. **Projects Dashboard** (`/dashboard/projects`)
   - Grid view of all projects with quick stats
   - Click anywhere on card for instant access
   - Action menu for edit/archive/delete
   - Real-time token and image counts

2. **Project Workspace** (`/dashboard/projects/[id]`)
   - **Two-column layout:**
     - Left: Base image gallery, active image preview, generation controls
     - Right: Dynamic variant gallery for selected base image
   - **Project Switcher:** Dropdown for quick project navigation
   - **Multiple Base Images:** Upload and manage multiple room photos
   - **Variant Generation:** Style, room type, and color scheme selectors
   - **Real-time Updates:** Polling system for generation status

### API Endpoints

#### Project Management
- `GET /api/projects` - List all user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details with base images
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

#### Image & Variant Management
- `POST /api/projects/[id]/upload-image` - Upload base image (uses Cloudflare)
- `GET /api/base-images/[baseImageId]/variants` - Get all variants
- `POST /api/base-images/[baseImageId]/generate-variant` - Generate new design

#### Design Data
- `GET /api/design-data` - Get styles, room types, and color schemes

#### Existing Endpoints
- `POST /api/images/upload` - General image upload to Cloudflare
- `GET /api/images/upload` - Get direct upload URL for client-side uploads

## Database Schema

### Core Tables

#### profiles
- id: uuid (PK, FK to auth.users)
- email: text
- full_name: text
- avatar_url: text
- tokens_available: integer (current balance)
- tokens_total_purchased: integer
- tokens_total_used: integer
- role: text (user, admin)
- created_at: timestamp
- updated_at: timestamp

#### projects
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- name: varchar
- description: text
- status: varchar (active, completed, archived)
- total_images: integer
- total_tokens_used: integer
- is_public: boolean
- share_token: varchar
- metadata: jsonb
- created_at: timestamp
- updated_at: timestamp

#### project_images (Base Images)
- id: uuid (PK)
- project_id: uuid (FK to projects)
- name: text (user-friendly name)
- image_name: varchar (filename)
- original_image_url: text (Cloudflare URL)
- original_cloudflare_id: text
- upload_order: integer
- status: varchar
- tags: jsonb
- notes: text
- created_at: timestamp

#### staging_generations (Variants)
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- project_id: uuid (FK to projects)
- project_image_id: uuid (FK to project_images)
- style_id: uuid (FK to staging_styles)
- room_type_id: uuid (FK to room_types, nullable)
- color_scheme_id: uuid (FK to color_schemes, nullable)
- original_image_url: text
- original_cloudflare_id: text
- processed_image_url: text (generated image URL)
- processed_cloudflare_id: text
- prompt_used: text
- generation_params: jsonb
- status: text (pending, processing, completed, failed)
- tokens_consumed: integer
- processing_time_ms: integer
- is_favorite: boolean
- metadata: jsonb (includes costs, prompts, etc.)
- started_at: timestamp
- completed_at: timestamp
- created_at: timestamp

#### staging_styles
- id: uuid (PK)
- code: text (unique)
- name: text
- description: text
- base_prompt: text
- category: text
- token_cost: integer
- sort_order: integer
- is_active: boolean

#### room_types
- id: uuid (PK)
- code: text (unique)
- name: text
- description: text
- sort_order: integer
- is_active: boolean

#### color_schemes
- id: uuid (PK)
- code: text (unique)
- name: text
- description: text
- hex_colors: jsonb (array of hex color codes)
- sort_order: integer
- is_active: boolean

#### token_packages
- id: uuid (PK)
- name: text
- token_amount: integer
- price: decimal
- currency: text (CLP)
- is_featured: boolean
- is_active: boolean

#### token_transactions
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- type: text (purchase, consumption, bonus, refund)
- amount: integer
- balance_before: integer
- balance_after: integer
- generation_id: uuid (FK to staging_generations, nullable)
- package_id: uuid (FK to token_packages, nullable)
- description: text
- created_at: timestamp

#### payment_transactions
- id: uuid (PK)
- user_id: uuid (FK to profiles)
- package_id: uuid (FK to token_packages)
- flow_order_id: text
- amount: decimal
- currency: text
- status: text
- tokens_granted: integer
- created_at: timestamp
- completed_at: timestamp

## Image Processing Pipeline

### Upload Flow
1. User selects image → Validated (type, size)
2. Image compressed if > 5MB using Sharp
3. Uploaded to Cloudflare Images
4. Multiple variants created (thumbnail, gallery, original)
5. Cloudflare ID and URLs stored in database

### Generation Flow
1. User selects style, room type, color scheme
2. System builds enhanced prompt
3. Tokens deducted from user balance
4. Background process initiated:
   - Download original from Cloudflare
   - Send to Runware API with prompt
   - Receive staged image
   - Upload result to Cloudflare
   - Update database with URLs
5. Frontend polls for completion
6. Display staged image when ready

## Key Services & Libraries

### Virtual Staging Service (`/lib/ai/virtual-staging.ts`)
- Main orchestrator for AI generation
- Integrates with Runware API
- Handles cost tracking
- Progress callbacks
- Room analysis disabled for MVP
- Direct staging generation

### Cloudflare Images Service (`/lib/cloudflare-images.ts`)
- Image upload and management
- Compression using Sharp
- Variant URL generation
- Direct upload URL creation
- Metadata management
- Image validation

### AI Client (`/lib/ai/client.ts`)
- Multiple provider support (Runware primary)
- Retry logic with circuit breaker
- Rate limiting
- Cost tracking

### Runware Provider (`/lib/ai/providers/runware.ts`)
- Image-to-image generation
- Upload original image
- Generate staged version
- Model: bytedance:4@1
- CFG Scale: 7 for better adherence

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Cloudflare Images
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_IMAGES_API_TOKEN=
NEXT_PUBLIC_CLOUDFLARE_IMAGES_URL=

# AI Services
RUNWARE_API_KEY=           # Primary AI provider
OPENROUTER_API_KEY=         # Backup provider
GOOGLE_AI_API_KEY=          # For Gemini (optional)

# Flow Chile Payment
FLOW_API_KEY=
FLOW_SECRET_KEY=
FLOW_WEBHOOK_SECRET=
NEXT_PUBLIC_FLOW_ENVIRONMENT=

# Application
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_SITE_NAME=

# Admin
ADMIN_EMAIL=
```

## Development Workflow

### Initial Setup
```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm dev
```

### Available Scripts
```bash
pnpm dev          # Start development server (port 3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run Playwright tests
pnpm test:ui      # Run tests with UI
pnpm test:headed  # Run tests in browser
pnpm test:debug   # Debug tests
```

## User Experience Flow

### Project Creation & Management
1. **Create Project** → Name it (e.g., "Casa Providencia")
2. **Upload Base Images** → Multiple rooms per project
3. **Generate Variants** → Select style + optional room/colors
4. **Compare Designs** → All variants displayed in gallery
5. **Download Results** → High-quality staged images

### Key UX Improvements
- **Direct Access:** Click project card to enter
- **Quick Switching:** Project dropdown in workspace
- **Visual Feedback:** Loading states, progress indicators
- **Context-Aware:** Empty states with helpful guidance
- **Responsive:** Works on desktop and tablet

## Security Considerations

### Authentication
- Secure session management with HttpOnly cookies
- CSRF protection via SameSite cookies
- Rate limiting on auth endpoints
- Password strength requirements

### Data Protection
- Row Level Security (RLS) on all tables
- Environment variable validation
- Input sanitization and validation
- SQL injection prevention via parameterized queries
- Project ownership verification on all operations

### API Security
- API route protection with middleware
- Admin route authorization checks
- Webhook signature verification for payments
- Token balance verification before operations

## Performance Optimizations

### Image Handling
- Cloudflare CDN for fast delivery
- Multiple image variants for different contexts
- Automatic compression for large files
- Lazy loading in galleries

### Database
- Indexed foreign keys for fast lookups
- Efficient query patterns with minimal joins
- Pagination support for large datasets

### Frontend
- Server Components by default
- Dynamic imports for code splitting
- Optimistic UI updates
- Polling with exponential backoff

## Testing Strategy

### E2E Tests (Playwright)
- Project creation and management
- Image upload flow
- Variant generation
- Token purchase and consumption

### Integration Tests
- Cloudflare Images upload
- Runware API generation
- Supabase operations
- Payment processing

## Deployment

### Railway Configuration
- Automated deployments from main branch
- Health checks at `/api/health`
- Environment variable management
- Horizontal scaling support

### Production Checklist
- [x] Database schema with RLS policies
- [x] Cloudflare Images integration
- [x] Runware API integration
- [ ] Flow Chile production credentials
- [ ] SSL certificates configured
- [ ] Monitoring setup
- [ ] Error tracking (Sentry)

## Known Issues & Limitations

### Current Limitations
- Room analysis disabled for faster MVP
- Single image generation at a time
- No batch processing yet
- Limited to predefined styles

### Planned Improvements
- Batch processing for multiple images
- Custom style creation
- Advanced prompt engineering
- Real-time generation status via WebSockets
- Mobile app development

## Cost Structure

### Token Economy
- Users purchase token packages
- Each generation consumes tokens (typically 1-2)
- Token cost varies by style complexity

### AI Costs (Runware)
- ~$0.04 USD per image generation
- Tracked in metadata for reporting
- Cost optimization through caching

## Support & Maintenance

### Monitoring Points
- Generation success rate
- Average processing time
- Token consumption patterns
- Error rates by type

### Common Issues
- Large image uploads → Auto-compression handles this
- Generation timeouts → 60-second polling window
- Token deduction failures → Transaction rollback

---

**Version:** 0.2.0  
**Last Updated:** December 2024  
**Recent Changes:** Mission 2 - Complete UI/UX overhaul with project workspace system  
**Maintained by:** VirtualStaging.cl Development Team