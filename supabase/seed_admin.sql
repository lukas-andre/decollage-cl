-- Admin Seed Script for VirtualStaging.cl
-- ============================================
-- IMPORTANT: First create the admin user via Supabase Dashboard Auth section
-- Then run this script to grant admin privileges

-- Step 1: Create admin user via Supabase Dashboard:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Invite User"
-- 3. Enter email: admin@virtualstaging.cl (or your preferred admin email)
-- 4. Set a secure password
-- 5. After user is created, copy the user ID and replace below

-- Step 2: Run this query to grant admin role and bonus tokens
-- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID from step 1

-- Option A: If you know the admin user ID
/*
UPDATE public.profiles
SET 
  role = 'admin',
  tokens_available = 1000,
  full_name = 'Administrator',
  user_type = 'other'
WHERE id = 'YOUR_ADMIN_USER_ID';
*/

-- Option B: Update by email (after creating user in Dashboard)
UPDATE public.profiles
SET 
  role = 'admin',
  tokens_available = 1000,
  full_name = 'Lucas Henry (Admin)',
  user_type = 'other'
WHERE email = 'lucas.henrydz@gmail.com';

-- Verify admin was created/updated
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.tokens_available,
  p.created_at
FROM public.profiles p
WHERE p.role = 'admin';

-- Grant some initial token transactions for testing (optional)
INSERT INTO public.token_transactions (user_id, type, amount, description)
SELECT 
  id,
  'bonus',
  1000,
  'Initial admin bonus tokens'
FROM public.profiles
WHERE email = 'lucas.henrydz@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.token_transactions
  WHERE user_id = profiles.id
  AND type = 'bonus'
  AND amount = 1000
);