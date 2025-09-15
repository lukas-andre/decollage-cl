# VirtualStaging.cl - Development Backlog

## Overview
This backlog prioritizes functional improvements to create a polished user experience before implementing monetization features. Each item includes specific implementation details and acceptance criteria.

---

## 🚀 Phase 1: Core UX Improvements (Immediate Priority)

### 1.1 Token Visibility Enhancement
**Priority: HIGH**
**Goal:** Users should always know their token balance and understand the cost of actions

#### Implementation:
- [x] Add persistent token counter in dashboard header next to user avatar
  - Display format: "🪙 {tokens} tokens"
  - Update in real-time after each generation
  - Add subtle pulse animation when tokens change
- [x] Show token cost on generation button
  - Update button text: "Generate (1 token)" or "Generate (2 tokens)" based on style
  - Disable button with clear message when insufficient tokens
- [x] Add token balance to project workspace header
  - Position: Top right corner, always visible
  - Include refresh icon to manually check balance
- [x] Implement token consumption preview
  - Before generation: "This will use 1 token. You have 10 remaining"
  - After generation: "Success! 9 tokens remaining"

**Files to modify:**
- `/src/components/dashboard/DashboardHeader.tsx` (create if needed)
- `/src/app/(dashboard)/projects/[id]/page.tsx`
- `/src/components/projects/GenerationControls.tsx`

---

### 1.2 Image Upload Feedback System
**Priority: HIGH**
**Goal:** Provide clear visual feedback during image upload process

#### Implementation:
- [x] Add skeleton loader during upload
  ```tsx
  // Components needed:
  - ImageUploadSkeleton: Animated placeholder matching image card dimensions
  - ProgressBar: Show upload percentage
  - StatusMessage: "Uploading...", "Processing...", "Ready!"
  ```
- [x] Implement upload states:
  1. **Selecting**: File picker open
  2. **Validating**: Check file size/type (show errors inline)
  3. **Compressing**: If > 5MB, show "Optimizing image..."
  4. **Uploading**: Progress bar 0-100%
  5. **Processing**: "Preparing your image..."
  6. **Complete**: Smooth transition to actual image
- [x] Add error recovery UI
  - Retry button on failure
  - Clear error messages (file too large, wrong format, network error)
  - Preserve other uploaded images on single failure

**Files to modify:**
- `/src/components/projects/ImageUploadZone.tsx`
- `/src/components/ui/skeleton.tsx` (enhance existing)
- Create: `/src/components/projects/UploadProgress.tsx`

---

### 1.3 No Tokens Feedback
**Priority: HIGH**
**Goal:** Guide users when they're out of tokens (without purchase flow yet)

#### Implementation:
- [x] Create `NoTokensDialog` component
  ```tsx
  // Show when user tries to generate with 0 tokens:
  - Title: "No Tokens Available"
  - Message: "You need tokens to generate designs. Token purchases coming soon!"
  - Actions: "OK" button (for now)
  - Future: Will link to purchase flow
  ```
- [x] Add inline warnings
  - When tokens < 5: Yellow badge "Low on tokens"
  - When tokens = 0: Red badge "No tokens"
  - Tooltip explaining token system
- [x] Implement token check before generation
  - Frontend validation before API call
  - Backend double-check in route handler
  - Return specific error code for no tokens

**Files to modify:**
- Create: `/src/components/tokens/NoTokensDialog.tsx`
- `/src/app/api/base-images/[baseImageId]/generate-variant/route.ts`
- `/src/hooks/useTokenBalance.ts` (create)

---

## 🎨 Phase 2: Gallery & Visual Features

### 2.1 Gallery Functionality
**Priority: MEDIUM**
**Goal:** Create a smooth, responsive gallery experience

#### Implementation:
- [x] Fix variant gallery grid layout
  ```tsx
  // Current issues to fix:
  - Images not loading properly
  - Click to expand not working
  - Missing loading states
  ```
- [x] Implement gallery features:
  - **Lightbox view**: Click image to open full-screen
  - **Zoom controls**: +/- buttons, pinch to zoom on mobile
  - **Navigation**: Arrow keys, swipe gestures
  - **Download button**: Per image in gallery
  - **Comparison mode**: Select 2 images to compare side-by-side
- [x] Add gallery filtering
  - By style (Modern, Scandinavian, etc.)
  - By room type
  - By date generated
  - By favorite status
- [x] Optimize performance
  - Lazy load images outside viewport
  - Use Cloudflare variant URLs (thumbnail for grid, full for lightbox)
  - Implement virtual scrolling for 50+ images

**Files to modify:**
- `/src/components/projects/VariantGallery.tsx`
- Create: `/src/components/gallery/Lightbox.tsx`
- Create: `/src/components/gallery/ImageComparison.tsx`

---

### 2.2 Landing Page Hero Image
**Priority: MEDIUM**
**Goal:** Use the specific staged image example on homepage

#### Implementation:
- [x] Replace current hero image with:
  ```
  URL: https://imagedelivery.net/EFgJYG7S6MAeNW67qxT6BQ/6af6e2b2-59af-4672-5426-8455c049a200/public
  ```
- [x] Create before/after slider component
  - Original empty room on left
  - Staged room on right
  - Draggable slider to reveal transformation
- [x] Add image preloading
  - Use Next.js Image priority prop
  - Implement blur placeholder
- [x] Mobile optimization
  - Stack images vertically on small screens
  - Touch-friendly slider control

**Files to modify:**
- `/src/app/(marketing)/page.tsx`
- `/src/components/landing/HeroSection.tsx`
- Create: `/src/components/landing/BeforeAfterSlider.tsx`

---

### 2.3 Favorites System
**Priority: MEDIUM**
**Goal:** Let users mark and filter favorite designs

#### Implementation:
- [x] Add favorite toggle to variant cards
  ```tsx
  // Heart icon in corner of each variant
  - Outlined when not favorited
  - Filled when favorited
  - Animate on click (scale + color)
  ```
- [x] Backend implementation:
  - Add `is_favorite` column to `staging_generations` (already exists)
  - Create API endpoint: `PATCH /api/variants/[id]/favorite`
  - Update via optimistic UI pattern
- [x] Create favorites view
  - Filter button: "Show favorites only"
  - Favorites count in project stats
  - Quick access from dashboard
- [ ] Bulk actions
  - Select multiple → Mark as favorites
  - Download all favorites as ZIP

**Files to modify:**
- `/src/components/projects/VariantCard.tsx`
- Create: `/src/app/api/variants/[id]/favorite/route.ts`
- `/src/components/projects/VariantGallery.tsx` (add filter)

---

## ⚙️ Phase 3: User Settings & Preferences

### 3.1 Basic Settings Panel
**Priority: MEDIUM**
**Goal:** Give users control over their experience

#### Implementation:
- [ ] Create settings page structure
  ```
  /dashboard/settings
  ├── Profile (name, email, avatar)
  ├── Preferences (default style, notifications)
  ├── Account (password, delete account)
  └── Billing (token history - view only for now)
  ```
- [ ] Profile settings:
  - Edit name
  - Upload avatar (to Cloudflare)
  - Change email (with verification)
- [ ] Generation preferences:
  - Default style selection
  - Default room type
  - Auto-save to favorites threshold
  - Image quality preference (balanced/quality)
- [ ] Notification settings:
  - Email when generation completes
  - Weekly usage summary
  - Product updates opt-in

**Files to create:**
- `/src/app/(dashboard)/settings/page.tsx`
- `/src/app/(dashboard)/settings/profile/page.tsx`
- `/src/app/(dashboard)/settings/preferences/page.tsx`
- `/src/app/(dashboard)/settings/account/page.tsx`
- `/src/app/(dashboard)/settings/billing/page.tsx`

---

## 🧹 Phase 4: Cleanup & Polish

### 4.1 Remove Unused Templates
**Priority: LOW**
**Goal:** Clean up codebase from MVP experiments

#### Implementation:
- [ ] Audit and remove:
  - Unused style templates in database
  - Old component files from testing
  - Deprecated API routes
  - Unused npm packages
- [ ] Database cleanup:
  ```sql
  -- Remove inactive styles
  DELETE FROM staging_styles WHERE is_active = false;
  -- Remove test data
  DELETE FROM staging_generations WHERE status = 'test';
  ```
- [ ] Code cleanup:
  - Remove commented code blocks
  - Delete unused imports
  - Clean up console.logs

**Files to review:**
- All files in `/src/components/` (remove unused)
- `/src/app/api/` (remove test endpoints)
- `package.json` (run npm-check-unused)

---

## 💰 Phase 5: Monetization (Future)

### 5.1 Token Package Display
**Priority: DEFERRED**
**Goal:** Show available packages without purchase capability

#### Implementation:
- [ ] Create pricing page
  - Display token packages from database
  - "Coming Soon" badges on purchase buttons
  - Email capture for launch notification

### 5.2 Token Purchase Flow
**Priority: DEFERRED**
**Goal:** Complete Flow Chile integration

#### Implementation:
- [ ] Payment flow components
- [ ] Flow Chile API integration
- [ ] Webhook handling
- [ ] Payment confirmation emails
- [ ] Invoice generation

### 5.3 Usage Analytics
**Priority: DEFERRED**
**Goal:** Track token usage patterns

#### Implementation:
- [ ] Usage dashboard
- [ ] Monthly reports
- [ ] Cost per project tracking

---

## 📊 Success Metrics

### Phase 1 Completion Criteria:
- [x] Users can always see token balance
- [x] Image upload has clear feedback at every step
- [x] Users understand when they're out of tokens
- [x] Zero confusion about generation costs

### Phase 2 Completion Criteria:
- [x] Gallery works smoothly with 50+ images
- [x] Landing page showcases real staging example
- [x] Users can mark and find favorites easily

### Phase 3 Completion Criteria:
- [ ] Users can customize their experience
- [ ] Settings are persisted and applied
- [ ] Profile management is functional

### Phase 4 Completion Criteria:
- [ ] Codebase is clean and maintainable
- [ ] No unused code or dependencies
- [ ] Database has no test data

---

## 🔄 Development Workflow

### For each task:
1. Create feature branch: `feature/[phase]-[task-name]`
2. Implement with tests
3. Update relevant documentation
4. Create PR with screenshots/video
5. Deploy to staging for review
6. Merge to main after approval

### Daily Standup Questions:
- What did you complete yesterday?
- What are you working on today?
- Any blockers or questions?

### Weekly Review:
- Demo completed features
- Review metrics and user feedback
- Adjust priorities if needed
- Plan next week's tasks

---

## 🚦 Current Status

**Active Phase:** Phase 3 - User Settings & Preferences
**Current Sprint:** Basic Settings Panel & User Profile
**Target Completion:** End of week
**Next Up:** Cleanup & Polish

### ✅ Phase 1 COMPLETED
- [x] Token Visibility Enhancement
- [x] Image Upload Feedback System  
- [x] No Tokens Feedback Dialog

### ✅ Phase 2 COMPLETED
- [x] Gallery Functionality (lightbox, filtering, navigation)
- [x] Landing Page Hero Image (real example showcase)
- [x] Favorites System (toggle, filter, API)

---

**Remember:** Focus on making the product delightful to use BEFORE monetizing. A great free experience builds trust for future paid features.