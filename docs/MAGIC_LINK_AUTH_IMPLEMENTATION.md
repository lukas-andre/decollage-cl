# 🔐 Magic Link Authentication Implementation Plan

## Overview
Implement frictionless passwordless login for guest users interacting with shared content on Decollage.cl. Users can sign up/sign in with just their email when they try to like, comment, or save designs.

## Architecture

### User Flow
```mermaid
graph TD
    A[Guest User Views Share] --> B[Clicks Like/Comment]
    B --> C[Auth Modal Opens]
    C --> D[User Enters Email]
    D --> E[signInWithOtp Called]
    E --> F{User Exists?}
    F -->|No| G[Create New User]
    F -->|Yes| H[Send Magic Link]
    G --> H
    H --> I[User Checks Email]
    I --> J[Clicks Magic Link]
    J --> K[/auth/confirm Page]
    K --> L[Session Created]
    L --> M[Return to Original Page]
    M --> N[Auto-complete Action]
```

### Database Schema Changes
```sql
-- content_reactions table already exists with proper structure:
-- - Supports both authenticated (user_id) and anonymous (session_id) reactions
-- - reaction_type field allows different reaction types (aplausos, etc.)

-- viewer_sessions table tracks anonymous users
-- - session_token for identifying returning visitors
-- - converted_to_user_id links to authenticated user after signup
```

## Implementation Tasks (Priority Order)

### 1. Create Magic Link Auth Modal Component
**File:** `src/components/auth/MagicLinkModal.tsx`
```typescript
interface MagicLinkModalProps {
  isOpen: boolean
  onClose: () => void
  actionType: 'like' | 'comment' | 'save' | 'follow'
  onSuccess: () => void
  shareToken?: string
}
```
**Features:**
- Single email input field
- Clear messaging: "Ingresa tu email para continuar"
- Loading states during email send
- Success message: "¡Revisa tu correo!"
- Error handling for rate limits

### 2. Update Supabase Auth Configuration
**Location:** Supabase Dashboard → Authentication → Email Templates
- Customize Magic Link template with Chilean branding
- Set redirect URL to `/auth/confirm`
- Configure rate limits (60 seconds between requests)
- Enable automatic user creation

### 3. Create Auth Confirmation Page
**File:** `src/app/auth/confirm/page.tsx`
```typescript
// Handle magic link token verification
// Close modal on parent page using postMessage
// Redirect to original page with preserved action
```

### 4. Add Social Interaction Components
**File:** `src/components/share/InteractionBar.tsx`
```typescript
interface InteractionBarProps {
  shareId: string
  initialLikes: number
  initialComments: number
  userReaction?: string
  isAuthenticated: boolean
}
```
**Features:**
- Like button with animated heart
- Comment button with count
- Save to collection button
- Share button (existing)

### 5. Implement Anonymous Session Tracking
**File:** `src/lib/services/session.service.ts`
```typescript
class SessionService {
  getOrCreateSession(): string
  trackConversion(sessionToken: string, userId: string): void
  getSessionReactions(sessionToken: string): Reaction[]
}
```

### 6. Create API Endpoints
**Files:**
- `src/app/api/reactions/route.ts` - Handle likes/reactions
- `src/app/api/auth/magic-link/route.ts` - Send magic link
- `src/app/api/auth/check-email/route.ts` - Check if email exists

### 7. Update Share Views with Interactions
**Files to Update:**
- `src/components/share/QuickShareView.tsx`
- `src/components/share/PublicShareView.tsx`

**Add:**
```tsx
<InteractionBar
  shareId={share.id}
  initialLikes={share.engagement_metrics?.likes || 0}
  initialComments={commentsCount}
  userReaction={userReaction}
  isAuthenticated={!!user}
/>
```

### 8. Implement Progressive Password Enhancement
**File:** `src/app/(dashboard)/dashboard/profile/page.tsx`
**Add Section:**
```tsx
{!hasPassword && (
  <Card className="border-[#A3B1A1]/20 bg-[#A3B1A1]/5">
    <CardHeader>
      <CardTitle>Asegura tu cuenta</CardTitle>
      <CardDescription>
        Agrega una contraseña para acceder más rápido
      </CardDescription>
    </CardHeader>
    <CardContent>
      <SetPasswordForm />
    </CardContent>
  </Card>
)}
```

### 9. Update Middleware for Passwordless Users
**File:** `src/middleware.ts`
**Changes:**
- Allow passwordless users to access dashboard
- Don't force password creation
- Track auth method in user metadata

### 10. Create Comment System
**File:** `src/components/share/CommentsSection.tsx`
```typescript
interface CommentsSectionProps {
  shareId: string
  isAuthenticated: boolean
}
```
**Features:**
- Nested comments support
- Real-time updates via Supabase
- Guest prompt for unauthenticated users

## Edge Cases to Handle

### 1. Rate Limiting
- User requests multiple magic links rapidly
- **Solution:** Show countdown timer, store last request timestamp

### 2. Email Delivery Failures
- Magic link doesn't arrive
- **Solution:** Resend button after 60 seconds, alternative auth methods

### 3. Session Persistence
- User starts action, gets distracted, returns later
- **Solution:** Store pending action in localStorage with 24hr expiry

### 4. Multiple Tabs
- User has share open in multiple tabs
- **Solution:** Use BroadcastChannel API to sync auth state

### 5. Existing User with Password
- User who signed up traditionally uses magic link
- **Solution:** Allow both methods, don't override password

### 6. Anonymous → Authenticated Conversion
- Guest user has interactions, then signs up
- **Solution:** Merge anonymous reactions using session_token

## Implementation Code Snippets

### Magic Link Send Function
```typescript
async function sendMagicLink(email: string, redirectTo?: string) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm${
        redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ''
      }`,
      shouldCreateUser: true,
      data: {
        utm_source: 'share_interaction',
        signup_method: 'magic_link'
      }
    }
  })

  if (error) {
    if (error.message.includes('rate limit')) {
      throw new Error('Por favor espera 60 segundos antes de solicitar otro enlace')
    }
    throw error
  }

  return data
}
```

### Reaction Handler
```typescript
async function handleReaction(
  shareId: string,
  reactionType: string,
  userId?: string,
  sessionId?: string
) {
  const supabase = createClient()

  // Check if reaction exists
  const existingQuery = userId
    ? supabase
        .from('content_reactions')
        .select('*')
        .eq('content_id', shareId)
        .eq('user_id', userId)
        .single()
    : supabase
        .from('content_reactions')
        .select('*')
        .eq('content_id', shareId)
        .eq('session_id', sessionId)
        .single()

  const { data: existing } = await existingQuery

  if (existing) {
    // Remove reaction
    await supabase
      .from('content_reactions')
      .delete()
      .eq('id', existing.id)
  } else {
    // Add reaction
    await supabase
      .from('content_reactions')
      .insert({
        content_type: 'share',
        content_id: shareId,
        user_id: userId,
        session_id: sessionId,
        reaction_type: reactionType
      })
  }
}
```

### Auth State Listener
```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check for pending action
        const pendingAction = localStorage.getItem('pendingAction')
        if (pendingAction) {
          const action = JSON.parse(pendingAction)
          await completePendingAction(action)
          localStorage.removeItem('pendingAction')
        }

        // Convert anonymous session
        const sessionToken = getSessionToken()
        if (sessionToken) {
          await convertAnonymousSession(sessionToken, session.user.id)
        }
      }
    }
  )

  return () => subscription.unsubscribe()
}, [])
```

## Testing Plan

### Unit Tests
- [ ] Magic link email validation
- [ ] Session token generation
- [ ] Reaction toggle logic
- [ ] Rate limit handling

### Integration Tests
- [ ] Complete auth flow
- [ ] Anonymous → authenticated conversion
- [ ] Multi-tab synchronization
- [ ] Email delivery (use Supabase test mode)

### E2E Tests (Playwright)
```typescript
test('guest user can sign up via magic link when liking', async ({ page }) => {
  await page.goto('/share/test-token')
  await page.click('[data-testid="like-button"]')
  await expect(page.locator('[role="dialog"]')).toBeVisible()
  await page.fill('input[type="email"]', 'test@example.com')
  await page.click('button:has-text("Enviar enlace")')
  // ... continue test
})
```

## Monitoring & Analytics

### Track Events
```typescript
// Mixpanel/Segment events
track('magic_link_requested', {
  source: 'share_interaction',
  action_type: 'like',
  share_id: shareId
})

track('magic_link_completed', {
  time_to_complete: Date.now() - startTime,
  converted_from_anonymous: !!sessionToken
})
```

### Success Metrics
- Conversion rate: Anonymous → Registered
- Time to complete authentication
- Drop-off rate at each step
- Engagement increase post-registration

## Rollout Strategy

### Phase 1: Internal Testing (Week 1)
- Deploy to staging
- Test with team members
- Fix critical bugs

### Phase 2: Beta Users (Week 2)
- Enable for 10% of share views
- Monitor conversion metrics
- Gather feedback

### Phase 3: Full Launch (Week 3)
- Enable for all users
- A/B test different modal copy
- Optimize based on data

## Security Considerations

1. **Token Security**
   - Magic links expire after 1 hour
   - Single use only
   - Include CSRF protection

2. **Rate Limiting**
   - Max 5 magic link requests per hour per email
   - Implement CAPTCHA after 3 failed attempts

3. **Session Security**
   - HttpOnly cookies for session tokens
   - Secure flag in production
   - SameSite=Lax

4. **Data Privacy**
   - Anonymous sessions expire after 30 days
   - GDPR compliance for email collection
   - Clear privacy policy link in modal

## Maintenance Notes

- Monitor Supabase Auth logs for delivery issues
- Set up alerts for high bounce rates
- Regular review of abandoned sign-up flows
- A/B test email templates for better open rates

---

**Last Updated:** 2025-01-22
**Owner:** Development Team
**Status:** Ready for Implementation