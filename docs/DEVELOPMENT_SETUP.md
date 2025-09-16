# Decollage.cl Development Setup Guide

## 🚀 Quick Start

### 1. Database Setup

```bash
# Apply the new schema migration
supabase db push

# Or run migration directly
supabase db reset
```

### 2. Environment Variables

Add these new variables to your `.env.local`:

```env
# Pinterest API (for integration)
PINTEREST_CLIENT_ID=your_pinterest_app_id
PINTEREST_CLIENT_SECRET=your_pinterest_secret
NEXT_PUBLIC_PINTEREST_REDIRECT_URI=http://localhost:3000/api/auth/pinterest/callback

# AI Embeddings (for moodboard similarity)
OPENAI_API_KEY=your_openai_key_for_embeddings

# Image Analysis
GOOGLE_VISION_API_KEY=your_google_vision_key
```

### 3. Supabase Configuration

Enable these extensions in Supabase:
```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
```

## 📁 Project Structure

```
/app
  /dashboard
    /projects          # Project management
    /moodboard        # Moodboard creator
    /gallery          # Public gallery
    /profile          # User profile & settings
  /api
    /pinterest        # Pinterest OAuth & sync
    /transformations  # AI generation endpoints
    /moodboard       # Moodboard analysis
    /gallery         # Public content

/lib
  /ai
    /moodboard.ts    # Moodboard style synthesis
    /embeddings.ts   # Vector similarity search
  /pinterest
    /client.ts       # Pinterest API client
    /sync.ts         # Board synchronization
  /gallery
    /moderation.ts   # Content moderation
    /social.ts       # Social features

/components
  /moodboard
    /MoodboardCanvas.tsx
    /ImageUploader.tsx
    /PinterestImporter.tsx
  /gallery
    /GalleryGrid.tsx
    /TransformationCard.tsx
  /transformation
    /IterationPanel.tsx
    /StyleSelector.tsx
```

## 🎨 Key Implementation Points

### 1. Moodboard Creation Flow

```typescript
// Example: Creating a moodboard from multiple sources
async function createMoodboard(userId: string) {
  // 1. Create moodboard entry
  const moodboard = await supabase
    .from('moodboards')
    .insert({
      user_id: userId,
      name: 'Mi Estilo Soñado',
      description: 'Inspiración para mi living'
    })
    .select()
    .single();

  // 2. Add images (from upload, Pinterest, or gallery)
  const images = await Promise.all([
    uploadImage(file),
    importFromPinterest(pinId),
    copyFromGallery(galleryItemId)
  ]);

  // 3. Link images to moodboard
  await supabase
    .from('moodboard_images')
    .insert(
      images.map((img, idx) => ({
        moodboard_id: moodboard.id,
        image_id: img.id,
        position: idx
      }))
    );

  // 4. Synthesize style (AI analysis)
  const style = await synthesizeMoodboardStyle(moodboard.id);

  // 5. Update moodboard with synthesis
  await supabase
    .from('moodboards')
    .update({
      synthesized_style: style.profile,
      color_palette: style.colors,
      style_keywords: style.keywords
    })
    .eq('id', moodboard.id);
}
```

### 2. Pinterest Integration

```typescript
// OAuth flow for Pinterest
app.get('/api/auth/pinterest', (req, res) => {
  const authUrl = `https://www.pinterest.com/oauth/?
    response_type=code&
    client_id=${PINTEREST_CLIENT_ID}&
    redirect_uri=${PINTEREST_REDIRECT_URI}&
    scope=boards:read,pins:read`;

  res.redirect(authUrl);
});

// Sync Pinterest board
async function syncPinterestBoard(boardId: string, userId: string) {
  const pins = await pinterestClient.getBoardPins(boardId);

  for (const pin of pins) {
    // Download image
    const imageUrl = await uploadToCloudflare(pin.image_url);

    // Create image entry with analysis
    await supabase
      .from('images')
      .insert({
        user_id: userId,
        url: imageUrl,
        image_type: 'pinterest',
        source: 'pinterest',
        pinterest_pin_id: pin.id,
        name: pin.title,
        description: pin.description,
        // AI analysis
        colors: await extractColors(imageUrl),
        style_tags: await detectStyle(imageUrl),
        embedding: await generateEmbedding(imageUrl)
      });
  }
}
```

### 3. Transformation with Moodboard Influence

```typescript
async function generateTransformation(params: {
  baseImageId: string,
  styleId: string,
  moodboardId?: string,
  inspirationWeight?: number
}) {
  let prompt = await getStylePrompt(params.styleId);

  if (params.moodboardId) {
    const moodboard = await getMoodboard(params.moodboardId);
    const moodboardPrompt = synthesizePrompt(moodboard);

    // Blend prompts based on weight
    const weight = params.inspirationWeight || 0.5;
    prompt = blendPrompts(prompt, moodboardPrompt, weight);
  }

  // Generate with AI
  const result = await runwareClient.generate({
    prompt,
    image: baseImageUrl,
    model: 'bytedance:4@1'
  });

  // Save transformation
  await supabase
    .from('transformations')
    .insert({
      base_image_id: params.baseImageId,
      style_id: params.styleId,
      moodboard_id: params.moodboardId,
      inspiration_weight: params.inspirationWeight,
      prompt_used: prompt,
      result_image_url: result.url,
      status: 'completed'
    });
}
```

### 4. Gallery & Social Features

```typescript
// Publish to gallery
async function publishToGallery(transformationId: string) {
  const transformation = await getTransformation(transformationId);

  await supabase
    .from('gallery_items')
    .insert({
      transformation_id: transformationId,
      user_id: transformation.user_id,
      title: 'Mi Living Renovado',
      description: 'Transformación estilo mediterráneo',
      before_image_url: transformation.base_image_url,
      after_image_url: transformation.result_image_url,
      tags: ['living', 'mediterraneo', 'luminoso'],
      moderation_status: 'pending'
    });
}

// Social interactions
async function likeGalleryItem(itemId: string, userId: string) {
  await supabase
    .from('gallery_interactions')
    .insert({
      user_id: userId,
      gallery_item_id: itemId,
      interaction_type: 'like'
    });

  // Update count
  await supabase.rpc('increment_likes', { item_id: itemId });
}
```

## 🧪 Testing Strategy

### Test Data Seeds

```typescript
// seed.ts - Create test data
async function seedTestData() {
  // Create test users
  const sofia = await createTestUser({
    email: 'sofia@test.com',
    full_name: 'Sofía González',
    style_personality: {
      primary_style: 'mediterraneo_chileno',
      color_preference: 'warm'
    }
  });

  // Create sample projects
  await createTestProject(sofia.id, {
    name: 'Mi Casa en Providencia',
    project_type: 'transformation'
  });

  // Add sample moodboards
  await createTestMoodboard(sofia.id, {
    name: 'Inspiración Pinterest',
    images: ['url1', 'url2', 'url3']
  });
}
```

## 🎯 Development Priorities

### Phase 1: Core Features (Week 1-2)
- [ ] User authentication & profiles
- [ ] Project creation & management
- [ ] Basic image upload
- [ ] Simple transformation (no moodboard)

### Phase 2: Moodboards (Week 3-4)
- [ ] Moodboard creation UI
- [ ] Multiple image upload
- [ ] Style synthesis algorithm
- [ ] Moodboard-influenced generation

### Phase 3: Pinterest (Week 5)
- [ ] Pinterest OAuth
- [ ] Board import
- [ ] Pin analysis
- [ ] Auto-sync

### Phase 4: Social (Week 6-7)
- [ ] Public gallery
- [ ] Like/save functionality
- [ ] User following
- [ ] Comments

### Phase 5: Polish (Week 8)
- [ ] Chilean styles & palettes
- [ ] Seasonal themes
- [ ] Mobile optimization
- [ ] Performance tuning

## 🔧 Useful Commands

```bash
# Generate TypeScript types from schema
npx supabase gen types typescript --local > lib/database.types.ts

# Reset database with new schema
npx supabase db reset

# Run migrations
npx supabase migration up

# Test Pinterest integration
npm run test:pinterest

# Seed test data
npm run seed

# Start development
npm run dev
```

## 📝 Notes

1. **Image Storage**: Continue using Cloudflare for all images
2. **AI Costs**: Track token usage carefully in `token_transactions`
3. **Moderation**: Implement content moderation for gallery items
4. **Performance**: Use vector indexes for similarity search
5. **Security**: Always check user ownership before operations

---

Ready to build the magical Decollage.cl experience! 🎨✨