-- =============================================
-- USERS TABLE ROW LEVEL SECURITY POLICIES
-- =============================================
-- This script defines RLS policies for the public.users table
-- Uses a SECURITY DEFINER function to avoid infinite recursion
-- Idempotent - safe to run multiple times

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTION: Get current user's institution and role
-- =============================================
-- This function uses SECURITY DEFINER to bypass RLS and avoid recursion
CREATE OR REPLACE FUNCTION public.get_current_user_info()
RETURNS TABLE (user_institution_id UUID, user_role TEXT) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT institution_id, role::TEXT
  FROM public.users
  WHERE auth_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DROP EXISTING POLICIES (for clean re-run)
-- =============================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Owners and managers can view all users in their institution" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Owners and managers can create users in their institution" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Owners and managers can update users in their institution" ON public.users;
DROP POLICY IF EXISTS "Owners and managers can delete users in their institution" ON public.users;
DROP POLICY IF EXISTS "Users can view users in their institution" ON public.users;
DROP POLICY IF EXISTS "Users can manage users in their institution" ON public.users;

-- =============================================
-- SELECT POLICIES
-- =============================================

-- Policy: Users can view their own profile (simple, no recursion)
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT
  USING (auth_id = auth.uid());

-- Policy: Users can view all users in their institution
-- Uses the helper function to avoid infinite recursion
CREATE POLICY "Users can view users in their institution" ON public.users
  FOR SELECT
  USING (
    institution_id IN (SELECT user_institution_id FROM public.get_current_user_info())
  );

-- =============================================
-- INSERT POLICIES
-- =============================================

-- Policy: Allow trigger/system to insert users (for signup/invite flow)
-- Uses SECURITY DEFINER functions, so we allow inserts where auth_id matches
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT
  WITH CHECK (auth_id = auth.uid());

-- Policy: Owners and managers can create new users in their institution
CREATE POLICY "Owners and managers can create users in their institution" ON public.users
  FOR INSERT
  WITH CHECK (
    institution_id IN (
      SELECT user_institution_id FROM public.get_current_user_info()
      WHERE user_role IN ('owner', 'manager')
    )
  );

-- =============================================
-- UPDATE POLICIES
-- =============================================

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- Policy: Owners and managers can update any user in their institution
CREATE POLICY "Owners and managers can update users in their institution" ON public.users
  FOR UPDATE
  USING (
    institution_id IN (
      SELECT user_institution_id FROM public.get_current_user_info()
      WHERE user_role IN ('owner', 'manager')
    )
  )
  WITH CHECK (
    institution_id IN (
      SELECT user_institution_id FROM public.get_current_user_info()
      WHERE user_role IN ('owner', 'manager')
    )
  );

-- =============================================
-- DELETE POLICIES
-- =============================================

-- Policy: Owners and managers can delete users in their institution
-- Note: Prevents deleting yourself to avoid accidental lockout
CREATE POLICY "Owners and managers can delete users in their institution" ON public.users
  FOR DELETE
  USING (
    -- User must be in the same institution as the actor
    institution_id IN (
      SELECT user_institution_id FROM public.get_current_user_info()
      WHERE user_role IN ('owner', 'manager')
    )
    -- Cannot delete yourself
    AND auth_id != auth.uid()
  );

-- =============================================
-- NOTES
-- =============================================
-- 
-- The key fix here is using get_current_user_info() function with SECURITY DEFINER.
-- This function bypasses RLS when checking the current user's institution/role,
-- which prevents the infinite recursion that occurs when a policy queries
-- the same table it's protecting.
--
-- These policies ensure:
-- 1. Any authenticated user can view their own profile
-- 2. Users can see all users in their institution
-- 3. New users can create their own profile (for signup flow)
-- 4. Owners and managers can create new users (for invites)
-- 5. Users can update their own profile
-- 6. Owners and managers can update any user in their institution
-- 7. Owners and managers can delete users (but not themselves)
--
