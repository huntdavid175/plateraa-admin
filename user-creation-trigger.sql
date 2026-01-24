-- =============================================
-- USER CREATION TRIGGER
-- =============================================
-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- =============================================
-- FUNCTION: Handle new user creation
-- =============================================
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_institution_id UUID;
  v_first_name TEXT;
  v_last_name TEXT;
  v_full_name TEXT;
BEGIN
  -- Get institution_id from metadata
  v_institution_id := (NEW.raw_user_meta_data ->> 'institution_id')::UUID;
  
  -- Only insert if we have institution_id
  IF v_institution_id IS NOT NULL THEN
    -- Get name from metadata
    v_full_name := NEW.raw_user_meta_data ->> 'name';
    
    -- Split name into first and last
    IF v_full_name IS NOT NULL AND v_full_name != '' THEN
      v_first_name := SPLIT_PART(v_full_name, ' ', 1);
      v_last_name := NULLIF(TRIM(SUBSTRING(v_full_name FROM LENGTH(v_first_name) + 2)), '');
    ELSE
      v_first_name := SPLIT_PART(NEW.email, '@', 1);
      v_last_name := NULL;
    END IF;

    INSERT INTO public.users (
      auth_id,
      institution_id,
      branch_id,
      first_name,
      last_name,
      email,
      phone,
      role
    ) VALUES (
      NEW.id,
      v_institution_id,
      (NEW.raw_user_meta_data ->> 'branch_id')::UUID,
      v_first_name,
      v_last_name,
      NEW.email,
      NEW.raw_user_meta_data ->> 'phone',
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'cashier')
    )
    ON CONFLICT (auth_id) DO UPDATE SET
      institution_id = EXCLUDED.institution_id,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      email = EXCLUDED.email,
      phone = COALESCE(EXCLUDED.phone, public.users.phone),
      branch_id = COALESCE(EXCLUDED.branch_id, public.users.branch_id);
  END IF;

  RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGER: Run on new auth user creation
-- =============================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
