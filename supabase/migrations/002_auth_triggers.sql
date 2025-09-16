-- =============================================
-- AUTH TRIGGERS & FUNCTIONS
-- =============================================
-- Handles user profile creation and management
-- Version: 1.0.0
-- =============================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_avatar TEXT;
BEGIN
    -- Generate a default avatar URL using UI Avatars or similar service
    default_avatar := 'https://ui-avatars.com/api/?name=' ||
                     COALESCE(NEW.raw_user_meta_data->>'full_name', 'User') ||
                     '&background=E91E63&color=fff&size=256';

    -- Create profile entry for new user
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        username,
        avatar_url,
        tokens_available,
        tokens_total_purchased,
        tokens_total_used,
        style_personality,
        color_preferences,
        design_goals,
        home_type,
        onboarding_completed,
        onboarding_step,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NULL),
        LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)), ' ', '_')),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', default_avatar),
        5, -- Start with 5 free tokens
        0,
        0,
        '{}',
        '[]',
        NULL,
        NULL,
        false,
        0,
        NOW(),
        NOW()
    );

    -- Create welcome event for analytics
    INSERT INTO public.user_events (
        user_id,
        session_id,
        event_type,
        event_category,
        event_data,
        created_at
    ) VALUES (
        NEW.id,
        gen_random_uuid()::text,
        'user_signup',
        'onboarding',
        jsonb_build_object(
            'email', NEW.email,
            'provider', NEW.raw_user_meta_data->>'provider',
            'referred_by', NEW.raw_user_meta_data->>'referral_code'
        ),
        NOW()
    );

    -- Grant initial bonus tokens if referred
    IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
        -- Give bonus tokens to new user
        UPDATE public.profiles
        SET tokens_available = tokens_available + 3
        WHERE id = NEW.id;

        -- Record bonus transaction
        INSERT INTO public.token_transactions (
            user_id,
            type,
            amount,
            balance_before,
            balance_after,
            description,
            metadata
        ) VALUES (
            NEW.id,
            'bonus',
            3,
            5,
            8,
            'Bonus por código de referido',
            jsonb_build_object('referral_code', NEW.raw_user_meta_data->>'referral_code')
        );

        -- TODO: Give bonus to referrer (need to look up by referral code)
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user deletion (cleanup)
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Archive user content before deletion (optional)
    -- This could move data to an archive table instead of hard delete

    -- Delete user's images from Cloudflare (mark for deletion)
    UPDATE public.images
    SET metadata = jsonb_set(
        COALESCE(metadata, '{}'::jsonb),
        '{marked_for_deletion}',
        'true'::jsonb
    )
    WHERE user_id = OLD.id;

    -- The actual deletion cascades through foreign keys
    -- due to ON DELETE CASCADE constraints

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle user email update
CREATE OR REPLACE FUNCTION public.handle_user_email_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update email in profiles table
    UPDATE public.profiles
    SET
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;

    -- Log email change event
    INSERT INTO public.user_events (
        user_id,
        session_id,
        event_type,
        event_category,
        event_data
    ) VALUES (
        NEW.id,
        gen_random_uuid()::text,
        'email_changed',
        'account',
        jsonb_build_object(
            'old_email', OLD.email,
            'new_email', NEW.email
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique username
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_name TEXT)
RETURNS TEXT AS $$
DECLARE
    new_username TEXT;
    counter INTEGER := 0;
BEGIN
    -- Clean the base name
    base_name := LOWER(REGEXP_REPLACE(base_name, '[^a-zA-Z0-9]', '_', 'g'));
    base_name := REGEXP_REPLACE(base_name, '_+', '_', 'g');
    base_name := TRIM(BOTH '_' FROM base_name);

    -- If empty, use 'user'
    IF base_name = '' OR base_name IS NULL THEN
        base_name := 'user';
    END IF;

    new_username := base_name;

    -- Check uniqueness and add number if needed
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) LOOP
        counter := counter + 1;
        new_username := base_name || counter;
    END LOOP;

    RETURN new_username;
END;
$$ LANGUAGE plpgsql;

-- Function to handle profile updates
CREATE OR REPLACE FUNCTION public.handle_profile_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure username is unique if changed
    IF NEW.username != OLD.username THEN
        IF EXISTS (SELECT 1 FROM public.profiles WHERE username = NEW.username AND id != NEW.id) THEN
            RAISE EXCEPTION 'Username already taken';
        END IF;
    END IF;

    -- Update last_active_at
    NEW.last_active_at := NOW();
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE TRIGGERS
-- =============================================

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
    BEFORE DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_user_deletion();

-- Trigger for email updates
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
    AFTER UPDATE OF email ON auth.users
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION public.handle_user_email_update();

-- Trigger for profile updates
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_profile_update();

-- =============================================
-- ADDITIONAL HELPER FUNCTIONS
-- =============================================

-- Function to check if username is available
CREATE OR REPLACE FUNCTION public.is_username_available(username_to_check TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE username = LOWER(username_to_check)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's total token balance
CREATE OR REPLACE FUNCTION public.get_user_token_balance(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT tokens_available INTO balance
    FROM public.profiles
    WHERE id = user_id;

    RETURN COALESCE(balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to grant bonus tokens
CREATE OR REPLACE FUNCTION public.grant_bonus_tokens(
    p_user_id UUID,
    p_amount INTEGER,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current balance with lock
    SELECT tokens_available INTO v_current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Calculate new balance
    v_new_balance := v_current_balance + p_amount;

    -- Update profile
    UPDATE public.profiles
    SET
        tokens_available = v_new_balance,
        tokens_total_purchased = tokens_total_purchased + p_amount
    WHERE id = p_user_id;

    -- Record transaction
    INSERT INTO public.token_transactions (
        user_id,
        type,
        amount,
        balance_before,
        balance_after,
        description
    ) VALUES (
        p_user_id,
        'bonus',
        p_amount,
        v_current_balance,
        v_new_balance,
        p_reason
    );

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RLS POLICIES FOR NEW FUNCTIONS
-- =============================================

-- Allow users to check username availability
CREATE POLICY "Anyone can check username availability"
    ON profiles FOR SELECT
    USING (true);

-- =============================================
-- GRANTS
-- =============================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.is_username_available TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_token_balance TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_unique_username TO authenticated;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION public.handle_new_user IS 'Creates profile and initial data for new auth users';
COMMENT ON FUNCTION public.handle_user_deletion IS 'Cleanup when user account is deleted';
COMMENT ON FUNCTION public.handle_user_email_update IS 'Syncs email changes to profile';
COMMENT ON FUNCTION public.generate_unique_username IS 'Generates unique username from base name';
COMMENT ON FUNCTION public.is_username_available IS 'Checks if username is available';
COMMENT ON FUNCTION public.get_user_token_balance IS 'Gets current token balance for user';
COMMENT ON FUNCTION public.grant_bonus_tokens IS 'Grants bonus tokens to user with transaction record';