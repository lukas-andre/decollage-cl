-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staging_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- =====================================================
-- STAGING STYLES POLICIES
-- =====================================================

-- Everyone can view active styles
CREATE POLICY "Anyone can view active styles"
  ON public.staging_styles FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Admins can manage all styles
CREATE POLICY "Admins can manage styles"
  ON public.staging_styles FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- =====================================================
-- TOKEN PACKAGES POLICIES
-- =====================================================

-- Everyone can view active packages
CREATE POLICY "Anyone can view active packages"
  ON public.token_packages FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Admins can manage all packages
CREATE POLICY "Admins can manage packages"
  ON public.token_packages FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- =====================================================
-- STAGING GENERATIONS POLICIES
-- =====================================================

-- Users can view their own generations
CREATE POLICY "Users can view own generations"
  ON public.staging_generations FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can create their own generations (through functions)
CREATE POLICY "Users can create own generations"
  ON public.staging_generations FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own generations (for cancellation)
CREATE POLICY "Users can update own generations"
  ON public.staging_generations FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id AND status IN ('pending', 'processing'))
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can view all generations
CREATE POLICY "Admins can view all generations"
  ON public.staging_generations FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())));

-- Admins can manage all generations
CREATE POLICY "Admins can manage generations"
  ON public.staging_generations FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- =====================================================
-- TOKEN TRANSACTIONS POLICIES
-- =====================================================

-- Users can view their own transactions
CREATE POLICY "Users can view own token transactions"
  ON public.token_transactions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Only functions can insert transactions (security definer)
-- No direct insert policy for users

-- Admins can view all transactions
CREATE POLICY "Admins can view all token transactions"
  ON public.token_transactions FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())));

-- Admins can create adjustment transactions
CREATE POLICY "Admins can create adjustment transactions"
  ON public.token_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin(auth.uid())) 
    AND type IN ('bonus', 'admin_adjustment')
    AND created_by = (SELECT auth.uid())
  );

-- =====================================================
-- PAYMENT TRANSACTIONS POLICIES
-- =====================================================

-- Users can view their own payment transactions
CREATE POLICY "Users can view own payment transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- Users can create payment transactions
CREATE POLICY "Users can create payment transactions"
  ON public.payment_transactions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Admins can view all payment transactions
CREATE POLICY "Admins can view all payment transactions"
  ON public.payment_transactions FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())));

-- Admins can update payment transactions
CREATE POLICY "Admins can update payment transactions"
  ON public.payment_transactions FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())))
  WITH CHECK ((SELECT public.is_admin(auth.uid())));

-- =====================================================
-- ADMIN LOGS POLICIES
-- =====================================================

-- Only admins can view admin logs
CREATE POLICY "Admins can view admin logs"
  ON public.admin_logs FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin(auth.uid())));

-- Admin logs are created through functions only
-- No direct insert/update/delete policies

-- =====================================================
-- GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on schemas
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant SELECT on public tables for anon
GRANT SELECT ON public.staging_styles TO anon;
GRANT SELECT ON public.token_packages TO anon;

-- Grant appropriate permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.staging_styles TO authenticated;
GRANT SELECT ON public.token_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.staging_generations TO authenticated;
GRANT SELECT ON public.token_transactions TO authenticated;
GRANT SELECT, INSERT ON public.payment_transactions TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.consume_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_tokens TO authenticated;
GRANT EXECUTE ON FUNCTION public.start_generation TO authenticated;
GRANT EXECUTE ON FUNCTION public.complete_generation TO authenticated;
GRANT EXECUTE ON FUNCTION public.fail_generation TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_payment_success TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_platform_statistics TO authenticated;

-- Special permissions for auth admin
GRANT INSERT ON TABLE public.profiles TO supabase_auth_admin;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;

COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Users can only see their own profile data';
COMMENT ON POLICY "Users can view own generations" ON public.staging_generations IS 'Users can only see their own generation history';
COMMENT ON POLICY "Users can view own token transactions" ON public.token_transactions IS 'Users can only see their own token transaction history';
COMMENT ON POLICY "Anyone can view active styles" ON public.staging_styles IS 'Public can view available staging styles';
COMMENT ON POLICY "Anyone can view active packages" ON public.token_packages IS 'Public can view available token packages';