-- =============================================
-- INSTITUTION CODES TABLE
-- =============================================
-- Simple code-based signup for staff members
-- Staff enters a code during signup to join an institution

-- Create the institution_codes table
CREATE TABLE IF NOT EXISTS public.institution_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  name TEXT, -- Optional label like "Main Code", "Kitchen Staff Code"
  is_active BOOLEAN DEFAULT true,
  uses_count INTEGER DEFAULT 0, -- Track how many times it's been used
  max_uses INTEGER, -- Optional limit (NULL = unlimited)
  expires_at TIMESTAMPTZ, -- Optional expiration
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_institution_codes_institution ON public.institution_codes(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_codes_code ON public.institution_codes(code);
CREATE INDEX IF NOT EXISTS idx_institution_codes_active ON public.institution_codes(is_active);

-- Enable RLS
ALTER TABLE public.institution_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their institution codes" ON public.institution_codes;
DROP POLICY IF EXISTS "Owners and managers can manage codes" ON public.institution_codes;
DROP POLICY IF EXISTS "Anyone can validate a code" ON public.institution_codes;

-- Policy: Users can view codes for their institution
CREATE POLICY "Users can view their institution codes" ON public.institution_codes
  FOR SELECT
  USING (
    institution_id IN (SELECT user_institution_id FROM public.get_current_user_info())
  );

-- Policy: Owners and managers can manage codes
CREATE POLICY "Owners and managers can manage codes" ON public.institution_codes
  FOR ALL
  USING (
    institution_id IN (
      SELECT user_institution_id FROM public.get_current_user_info()
      WHERE user_role IN ('owner', 'manager')
    )
  );

-- =============================================
-- FUNCTION: Validate institution code (public)
-- =============================================
-- This function can be called without auth to validate a code during signup
CREATE OR REPLACE FUNCTION public.validate_institution_code(p_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  institution_id UUID,
  institution_name TEXT,
  error_message TEXT
)
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code_record RECORD;
BEGIN
  -- Find the code
  SELECT ic.*, i.name as inst_name
  INTO v_code_record
  FROM public.institution_codes ic
  JOIN public.institutions i ON i.id = ic.institution_id
  WHERE ic.code = UPPER(TRIM(p_code))
  LIMIT 1;

  -- Code not found
  IF v_code_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'Invalid institution code';
    RETURN;
  END IF;

  -- Code is inactive
  IF NOT v_code_record.is_active THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'This code is no longer active';
    RETURN;
  END IF;

  -- Code has expired
  IF v_code_record.expires_at IS NOT NULL AND v_code_record.expires_at < NOW() THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'This code has expired';
    RETURN;
  END IF;

  -- Code has reached max uses
  IF v_code_record.max_uses IS NOT NULL AND v_code_record.uses_count >= v_code_record.max_uses THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 'This code has reached its usage limit';
    RETURN;
  END IF;

  -- Code is valid
  RETURN QUERY SELECT true, v_code_record.institution_id, v_code_record.inst_name, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: Use institution code (increment counter)
-- =============================================
CREATE OR REPLACE FUNCTION public.use_institution_code(p_code TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.institution_codes
  SET uses_count = uses_count + 1,
      updated_at = NOW()
  WHERE code = UPPER(TRIM(p_code));
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- CREATE DEFAULT CODE FOR EXISTING INSTITUTIONS
-- =============================================
-- Run this to create a code for your existing institution
-- Replace the UUID with your actual institution_id

/*
INSERT INTO public.institution_codes (institution_id, code, name)
VALUES (
  '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', -- Your institution_id
  'PLAT-2024', -- Your custom code (will be stored uppercase)
  'Default Code'
);
*/

-- Or generate a random code:
/*
INSERT INTO public.institution_codes (institution_id, code, name)
SELECT 
  id,
  UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8)),
  'Default Code'
FROM public.institutions
WHERE id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84';
*/
