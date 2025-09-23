# 🔐 Magic Link Auth - Pending Implementation Tasks

## 📅 Date: January 23, 2025

## 📊 Current Status
- ✅ Basic magic link modal working
- ✅ Email sending functional
- ✅ Auth confirmation page redirects correctly
- ✅ InteractionBar shows aplausos button
- ⚠️ Aplausos are currently dummy (not persisted to DB)
- ⚠️ Login page doesn't handle passwordless users
- ⚠️ No password setup flow for magic link users

## 🎯 Priority 1: Core Functionality Fixes

### 1. **Implement Real Aplausos API** 🔴 CRITICAL
**Problem**: Current aplausos are just UI state, not saved to database

#### Tasks:
- [ ] Create `/src/app/api/reactions/route.ts`
  ```typescript
  // POST: Add/remove reaction
  // GET: Get user's reactions for content
  // Handles both authenticated (user_id) and anonymous (session_id)
  ```
- [ ] Create `/src/app/api/reactions/count/route.ts`
  ```typescript
  // GET: Get real-time reaction counts for content
  // Returns aggregated counts by reaction type
  ```
- [ ] Update `InteractionBar.tsx` to use real API
  ```typescript
  // Replace dummy state with API calls
  // Add optimistic updates
  // Handle loading/error states
  ```
- [ ] Add real-time subscription for reaction updates
  ```typescript
  // Use Supabase realtime to sync reactions across tabs
  ```

### 2. **Fix Login Flow for Passwordless Users** 🔴 CRITICAL
**Problem**: Login page breaks for users without passwords

#### Tasks:
- [ ] Update `/src/app/(auth)/login/page.tsx`
  ```typescript
  // Add email check on blur
  // If user exists without password → show magic link option
  // If user has password → show password field
  ```
- [ ] Create `/src/app/api/auth/check-user/route.ts`
  ```typescript
  // POST: Check if email exists and auth method
  // Returns: { exists: boolean, hasPassword: boolean, authMethod: string }
  ```
- [ ] Design adaptive login UI
  ```typescript
  // State 1: Email only input
  // State 2a: Password field appears (if has password)
  // State 2b: Magic link button appears (if passwordless)
  // State 3: Option to use alternative method
  ```

### 3. **Password Setup Flow for Magic Link Users** 🟡 HIGH
**Problem**: No way for passwordless users to add a password later

#### Tasks:
- [ ] Create `/src/app/(dashboard)/dashboard/security/page.tsx`
  ```typescript
  // Security settings page
  // Show current auth methods
  // Allow adding/changing password
  ```
- [ ] Create password setup component
  ```typescript
  // SetPasswordForm with strength indicator
  // Confirmation field
  // Success message and redirect
  ```
- [ ] Add security section to profile navigation
- [ ] Create API endpoint for password addition
  ```typescript
  // POST /api/auth/set-password
  // Validates current session
  // Updates user auth method
  ```

## 🎯 Priority 2: Complete Social Features

### 4. **Implement Comments System** 🟠 MEDIUM
#### Tasks:
- [ ] Create `CommentsSection.tsx` component
  ```typescript
  interface Comment {
    id: string
    content: string
    user: { name: string; avatar?: string }
    created_at: string
    replies: Comment[]
  }
  ```
- [ ] Create comments API endpoints
  - [ ] GET `/api/comments/[shareId]`
  - [ ] POST `/api/comments`
  - [ ] DELETE `/api/comments/[id]`
  - [ ] POST `/api/comments/[id]/reply`
- [ ] Add real-time updates for comments
- [ ] Implement nested reply UI
- [ ] Add comment count to InteractionBar

### 5. **Save to Collection Feature** 🟠 MEDIUM
#### Tasks:
- [ ] Create collections table migration
  ```sql
  CREATE TABLE user_collections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    name VARCHAR(255),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ
  );

  CREATE TABLE collection_items (
    collection_id UUID REFERENCES user_collections,
    content_id UUID,
    content_type VARCHAR(50),
    added_at TIMESTAMPTZ
  );
  ```
- [ ] Create collection management UI
- [ ] Add "Save" functionality to InteractionBar
- [ ] Create collections page in dashboard

### 6. **Download Functionality** 🟠 MEDIUM
#### Tasks:
- [ ] Add download button to InteractionBar
- [ ] Implement watermark for free downloads
- [ ] Track download analytics
- [ ] Rate limit downloads for non-authenticated users

## 🎯 Priority 3: Data & Analytics

### 7. **Anonymous Session Conversion** 🟡 HIGH
#### Tasks:
- [ ] Complete session conversion logic
  ```typescript
  // When user signs up/logs in:
  // 1. Find all anonymous reactions with session_id
  // 2. Update to use user_id
  // 3. Mark session as converted
  // 4. Merge duplicate reactions
  ```
- [ ] Create conversion tracking
- [ ] Add conversion metrics to analytics

### 8. **Engagement Analytics** 🟢 LOW
#### Tasks:
- [ ] Track all auth gate hits
- [ ] Create conversion funnel dashboard
- [ ] Track time from gate to signup
- [ ] Monitor drop-off points
- [ ] A/B test different modal copy

## 🎯 Priority 4: UX Improvements

### 9. **Multi-tab Synchronization** 🟢 LOW
#### Tasks:
- [ ] Implement BroadcastChannel API
- [ ] Sync auth state across tabs
- [ ] Sync reactions across tabs
- [ ] Handle tab focus events

### 10. **Loading & Error States** 🟡 HIGH
#### Tasks:
- [ ] Add skeleton loaders for InteractionBar
- [ ] Improve error messages
- [ ] Add retry logic for failed API calls
- [ ] Handle network offline scenarios

## 🛠️ Technical Implementation Details

### API Structure
```
/api/
├── auth/
│   ├── check-user/route.ts      # Check if email exists
│   ├── set-password/route.ts    # Add password to account
│   └── convert-session/route.ts # ✅ Done
├── reactions/
│   ├── route.ts                  # CRUD reactions
│   └── count/route.ts           # Get counts
├── comments/
│   ├── route.ts                  # List/create comments
│   └── [id]/
│       ├── route.ts             # Update/delete
│       └── reply/route.ts       # Add reply
└── analytics/
    └── track-gate/route.ts       # ✅ Done
```

### Database Queries Needed

#### Get Reactions for Content
```sql
SELECT
  reaction_type,
  COUNT(*) as count,
  BOOL_OR(user_id = $1 OR session_id = $2) as user_reacted
FROM content_reactions
WHERE content_id = $3
GROUP BY reaction_type;
```

#### Convert Anonymous Session
```sql
UPDATE content_reactions
SET user_id = $1, session_id = NULL
WHERE session_id = $2;

UPDATE viewer_sessions
SET converted_to_user_id = $1, converted_at = NOW()
WHERE session_token = $2;
```

## 🔄 Migration Strategy

### Phase 1: Core Fixes (This Week)
1. Implement real reactions API
2. Fix login page for passwordless users
3. Add password setup flow
4. Test with team

### Phase 2: Social Features (Next Week)
1. Comments system
2. Collections
3. Download tracking
4. Session conversion

### Phase 3: Polish & Analytics (Week 3)
1. Multi-tab sync
2. Analytics dashboard
3. A/B testing
4. Performance optimization

## 🧪 Testing Checklist

### Functional Tests
- [ ] Aplausos persist to database
- [ ] Aplausos survive page refresh
- [ ] Login detects passwordless users
- [ ] Password can be added to passwordless account
- [ ] Comments can be added/deleted
- [ ] Collections can be created/managed
- [ ] Anonymous reactions convert on signup
- [ ] Multi-tab sync works

### Edge Cases
- [ ] User with multiple anonymous sessions
- [ ] Rapid clicking of aplausos button
- [ ] Network failure during API calls
- [ ] User logs out and becomes anonymous
- [ ] Password setup with weak password
- [ ] Rate limiting on all endpoints

### Security Tests
- [ ] SQL injection attempts
- [ ] XSS in comments
- [ ] CSRF protection
- [ ] Rate limiting works
- [ ] Session hijacking prevention

## 📊 Success Metrics

### Key Performance Indicators
- **Conversion Rate**: Anonymous → Registered > 15%
- **Password Addition Rate**: Passwordless → Password > 30%
- **Engagement Rate**: Users who interact after signup > 60%
- **Comment Rate**: Shares with comments > 20%
- **Collection Rate**: Users creating collections > 40%

### Tracking Points
1. Auth gate impressions by type
2. Email submission rate
3. Magic link click rate
4. Password setup completion rate
5. Time to first interaction
6. Session conversion success rate

## 🚨 Known Issues to Fix

1. **Aplausos not persisting** - Currently just UI state
2. **Login page breaks** - For passwordless users
3. **No password setup** - Users can't add passwords
4. **No rate limiting** - On reaction endpoints
5. **No optimistic updates** - UI feels slow
6. **Missing error handling** - API calls fail silently
7. **No offline support** - Breaks without internet
8. **Session cleanup** - Old anonymous sessions accumulate

## 🔗 Related Documents

- [Magic Link Auth Implementation Plan](./MAGIC_LINK_AUTH_IMPLEMENTATION.md)
- [Progress Auth Status](./PROGRESS_AUTH.md)
- [Database Schema](../supabase/migrations/)
- [API Documentation](./API_DOCUMENTATION.md) - TODO

## 📝 Code Snippets for Implementation

### Check User Status API
```typescript
// /api/auth/check-user/route.ts
export async function POST(request: Request) {
  const { email } = await request.json()
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, auth_method, has_password')
    .eq('email', email.toLowerCase())
    .single()

  if (!profile) {
    return Response.json({ exists: false })
  }

  return Response.json({
    exists: true,
    hasPassword: profile.has_password,
    authMethod: profile.auth_method || 'magic_link'
  })
}
```

### Adaptive Login Form
```typescript
// Login page state machine
const [authState, setAuthState] = useState<
  'initial' | 'has_password' | 'magic_link' | 'loading'
>('initial')

const checkUserStatus = async (email: string) => {
  const res = await fetch('/api/auth/check-user', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
  const data = await res.json()

  if (!data.exists) {
    setAuthState('magic_link') // New user, offer signup
  } else if (data.hasPassword) {
    setAuthState('has_password')
  } else {
    setAuthState('magic_link') // Existing passwordless user
  }
}
```

### Real Reactions Handler
```typescript
// /api/reactions/route.ts
export async function POST(request: Request) {
  const { contentId, reactionType } = await request.json()
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const sessionId = !user ? getSessionToken() : null

  // Check existing reaction
  const query = user
    ? { user_id: user.id }
    : { session_id: sessionId }

  const { data: existing } = await supabase
    .from('content_reactions')
    .select('*')
    .eq('content_id', contentId)
    .match(query)
    .single()

  if (existing) {
    // Remove reaction
    await supabase
      .from('content_reactions')
      .delete()
      .eq('id', existing.id)

    return Response.json({ reacted: false })
  } else {
    // Add reaction
    await supabase
      .from('content_reactions')
      .insert({
        content_type: 'share',
        content_id: contentId,
        reaction_type: reactionType,
        ...query
      })

    return Response.json({ reacted: true })
  }
}
```

---

**Status**: 📋 Planning Complete - Ready for Implementation
**Priority**: 🔴 Critical - Core functionality broken
**Timeline**: 3 weeks for full implementation
**Next Step**: Start with Priority 1 tasks immediately