-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- =====================================================
-- 1. PROFILE MANAGEMENT
-- =====================================================

-- Function to create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staging_styles_updated_at BEFORE UPDATE ON public.staging_styles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_token_packages_updated_at BEFORE UPDATE ON public.token_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 2. TOKEN MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to consume tokens (atomic operation)
CREATE OR REPLACE FUNCTION public.consume_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_generation_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the user profile row to prevent race conditions
  SELECT tokens_available INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user has enough tokens
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update user balance
  UPDATE public.profiles
  SET 
    tokens_available = v_new_balance,
    tokens_total_used = tokens_total_used + p_amount,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Record the transaction
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    generation_id,
    description
  ) VALUES (
    p_user_id,
    'consumption',
    -p_amount,
    v_current_balance,
    v_new_balance,
    p_generation_id,
    COALESCE(p_description, 'Token consumption for generation')
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add tokens (for purchases, bonuses, etc)
CREATE OR REPLACE FUNCTION public.add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_package_id UUID DEFAULT NULL,
  p_payment_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Lock the user profile row
  SELECT tokens_available INTO v_current_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update user balance
  UPDATE public.profiles
  SET 
    tokens_available = v_new_balance,
    tokens_total_purchased = CASE 
      WHEN p_type = 'purchase' THEN tokens_total_purchased + p_amount
      ELSE tokens_total_purchased
    END,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- Record the transaction
  INSERT INTO public.token_transactions (
    user_id,
    type,
    amount,
    balance_before,
    balance_after,
    package_id,
    payment_transaction_id,
    description
  ) VALUES (
    p_user_id,
    p_type,
    p_amount,
    v_current_balance,
    v_new_balance,
    p_package_id,
    p_payment_id,
    p_description
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. GENERATION MANAGEMENT
-- =====================================================

-- Function to start a generation
CREATE OR REPLACE FUNCTION public.start_generation(
  p_user_id UUID,
  p_style_id UUID,
  p_original_image_url TEXT,
  p_user_prompt TEXT DEFAULT NULL,
  p_params JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_generation_id UUID;
  v_token_cost INTEGER;
  v_tokens_consumed BOOLEAN;
BEGIN
  -- Get token cost for the style
  SELECT token_cost INTO v_token_cost
  FROM public.staging_styles
  WHERE id = p_style_id;

  -- If style not found, default to 1 token
  IF v_token_cost IS NULL THEN
    v_token_cost := 1;
  END IF;

  -- Try to consume tokens
  v_tokens_consumed := public.consume_tokens(
    p_user_id,
    v_token_cost,
    NULL,
    'Virtual staging generation'
  );

  -- If not enough tokens, raise exception
  IF NOT v_tokens_consumed THEN
    RAISE EXCEPTION 'Insufficient tokens';
  END IF;

  -- Create generation record
  INSERT INTO public.staging_generations (
    user_id,
    style_id,
    original_image_url,
    user_prompt,
    generation_params,
    status,
    tokens_consumed,
    started_at
  ) VALUES (
    p_user_id,
    p_style_id,
    p_original_image_url,
    p_user_prompt,
    p_params,
    'processing',
    v_token_cost,
    NOW()
  ) RETURNING id INTO v_generation_id;

  -- Update token transaction with generation_id
  UPDATE public.token_transactions
  SET generation_id = v_generation_id
  WHERE user_id = p_user_id
    AND generation_id IS NULL
    AND created_at >= NOW() - INTERVAL '1 second'
  ORDER BY created_at DESC
  LIMIT 1;

  RETURN v_generation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete a generation
CREATE OR REPLACE FUNCTION public.complete_generation(
  p_generation_id UUID,
  p_processed_image_url TEXT,
  p_cloudflare_id TEXT,
  p_prompt_used TEXT,
  p_processing_time_ms INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.staging_generations
  SET 
    processed_image_url = p_processed_image_url,
    processed_cloudflare_id = p_cloudflare_id,
    prompt_used = p_prompt_used,
    processing_time_ms = p_processing_time_ms,
    status = 'completed',
    completed_at = NOW()
  WHERE id = p_generation_id
    AND status = 'processing';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to fail a generation and refund tokens
CREATE OR REPLACE FUNCTION public.fail_generation(
  p_generation_id UUID,
  p_error_message TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_tokens_consumed INTEGER;
BEGIN
  -- Get generation details
  SELECT user_id, tokens_consumed INTO v_user_id, v_tokens_consumed
  FROM public.staging_generations
  WHERE id = p_generation_id
    AND status IN ('pending', 'processing');

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Update generation status
  UPDATE public.staging_generations
  SET 
    status = 'failed',
    error_message = p_error_message,
    completed_at = NOW()
  WHERE id = p_generation_id;

  -- Refund tokens
  PERFORM public.add_tokens(
    v_user_id,
    v_tokens_consumed,
    'refund',
    NULL,
    NULL,
    'Refund for failed generation: ' || p_generation_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. PAYMENT PROCESSING
-- =====================================================

-- Function to process successful payment
CREATE OR REPLACE FUNCTION public.process_payment_success(
  p_flow_order_id TEXT,
  p_response_data JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
  v_payment_id UUID;
  v_user_id UUID;
  v_package_id UUID;
  v_token_amount INTEGER;
BEGIN
  -- Get payment details
  SELECT id, user_id, package_id INTO v_payment_id, v_user_id, v_package_id
  FROM public.payment_transactions
  WHERE flow_order_id = p_flow_order_id
    AND status IN ('pending', 'processing');

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Get token amount from package
  SELECT token_amount INTO v_token_amount
  FROM public.token_packages
  WHERE id = v_package_id;

  -- Update payment status
  UPDATE public.payment_transactions
  SET 
    status = 'approved',
    response_data = p_response_data,
    tokens_granted = v_token_amount,
    completed_at = NOW()
  WHERE id = v_payment_id;

  -- Add tokens to user
  PERFORM public.add_tokens(
    v_user_id,
    v_token_amount,
    'purchase',
    v_package_id,
    v_payment_id,
    'Token package purchase'
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ADMIN FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id
      AND role = 'admin'
      AND is_active = true
  );
END;
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_admin_id UUID,
  p_action TEXT,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.admin_logs (
    admin_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    metadata
  ) VALUES (
    p_admin_id,
    p_action,
    p_entity_type,
    p_entity_id,
    p_old_data,
    p_new_data,
    p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. STATISTICS FUNCTIONS
-- =====================================================

-- Function to refresh platform statistics
CREATE OR REPLACE FUNCTION public.refresh_platform_statistics()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.platform_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION public.get_user_statistics(p_user_id UUID)
RETURNS TABLE (
  total_generations BIGINT,
  successful_generations BIGINT,
  failed_generations BIGINT,
  total_tokens_purchased INTEGER,
  total_tokens_used INTEGER,
  total_spent DECIMAL,
  joined_days_ago INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(g.id)::BIGINT as total_generations,
    COUNT(g.id) FILTER (WHERE g.status = 'completed')::BIGINT as successful_generations,
    COUNT(g.id) FILTER (WHERE g.status = 'failed')::BIGINT as failed_generations,
    p.tokens_total_purchased,
    p.tokens_total_used,
    COALESCE(SUM(pt.amount), 0)::DECIMAL as total_spent,
    EXTRACT(DAY FROM NOW() - p.created_at)::INTEGER as joined_days_ago
  FROM public.profiles p
  LEFT JOIN public.staging_generations g ON p.id = g.user_id
  LEFT JOIN public.payment_transactions pt ON p.id = pt.user_id AND pt.status = 'approved'
  WHERE p.id = p_user_id
  GROUP BY p.id, p.tokens_total_purchased, p.tokens_total_used, p.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. CLEANUP FUNCTIONS
-- =====================================================

-- Function to clean up old pending generations
CREATE OR REPLACE FUNCTION public.cleanup_old_pending_generations()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  WITH failed_generations AS (
    UPDATE public.staging_generations
    SET 
      status = 'failed',
      error_message = 'Timeout - generation took too long',
      completed_at = NOW()
    WHERE status IN ('pending', 'processing')
      AND created_at < NOW() - INTERVAL '10 minutes'
    RETURNING id, user_id, tokens_consumed
  )
  SELECT COUNT(*) INTO v_count FROM failed_generations;

  -- Refund tokens for failed generations
  INSERT INTO public.token_transactions (user_id, type, amount, description)
  SELECT 
    user_id, 
    'refund', 
    tokens_consumed,
    'Automatic refund for timed-out generation'
  FROM (
    UPDATE public.staging_generations
    SET status = 'failed'
    WHERE status IN ('pending', 'processing')
      AND created_at < NOW() - INTERVAL '10 minutes'
    RETURNING user_id, tokens_consumed
  ) AS timed_out;

  -- Update user balances
  UPDATE public.profiles p
  SET tokens_available = tokens_available + refund.total_refund
  FROM (
    SELECT user_id, SUM(tokens_consumed) as total_refund
    FROM public.staging_generations
    WHERE status = 'failed'
      AND error_message = 'Timeout - generation took too long'
      AND completed_at >= NOW() - INTERVAL '1 minute'
    GROUP BY user_id
  ) AS refund
  WHERE p.id = refund.user_id;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user IS 'Creates profile for new auth users';
COMMENT ON FUNCTION public.consume_tokens IS 'Atomically consumes tokens from user balance';
COMMENT ON FUNCTION public.add_tokens IS 'Adds tokens to user balance';
COMMENT ON FUNCTION public.start_generation IS 'Starts a new staging generation';
COMMENT ON FUNCTION public.complete_generation IS 'Marks generation as completed';
COMMENT ON FUNCTION public.fail_generation IS 'Marks generation as failed and refunds tokens';
COMMENT ON FUNCTION public.process_payment_success IS 'Processes successful Flow payment';
COMMENT ON FUNCTION public.is_admin IS 'Checks if user has admin role';
COMMENT ON FUNCTION public.get_user_statistics IS 'Gets comprehensive user statistics';
COMMENT ON FUNCTION public.cleanup_old_pending_generations IS 'Cleans up timed-out generations';