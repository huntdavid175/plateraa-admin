-- =============================================
-- CUSTOMERS TABLE AND RELATED SCHEMA
-- =============================================
-- This script is idempotent - safe to run multiple times

-- =============================================
-- HELPER FUNCTION: update_updated_at (if not exists)
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Customer segment enum (only create if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_segment') THEN
    CREATE TYPE public.customer_segment AS ENUM ('new', 'regular', 'vip', 'inactive', 'at_risk');
  END IF;
END $$;

-- Preferred order channel enum (reusing from orders if exists, otherwise create)
-- CREATE TYPE public.order_channel AS ENUM ('phone', 'website', 'social', 'bolt_food', 'chowdeck', 'glovo', 'walk_in', 'pos');

-- Preferred payment method enum (reusing from orders if exists)
-- CREATE TYPE public.payment_method AS ENUM ('mobile_money', 'card', 'cash', 'bank_transfer');

-- Preferred delivery type enum (reusing from orders if exists)
-- CREATE TYPE public.delivery_type AS ENUM ('pickup', 'delivery', 'dine_in');

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL, -- Primary branch, can be NULL
  
  -- Core Information
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Address Information
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'Nigeria',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- Personal Details
  birthday DATE, -- Just day and month, store as DATE with dummy year
  birthday_month INTEGER, -- 1-12 for easy querying
  birthday_day INTEGER, -- 1-31 for easy querying
  
  -- Segmentation (NOTE: Use computed_segment from customer_with_stats view instead)
  -- This column is kept for manual overrides only (e.g., admin marks someone as VIP)
  segment public.customer_segment DEFAULT 'new',
  
  -- Preferences
  preferred_channel public.order_channel,
  preferred_payment public.payment_method,
  preferred_delivery_type public.delivery_type,
  usual_order_time TEXT, -- e.g., "12-2 PM", "Evening"
  
  -- Loyalty
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  
  -- Notes
  notes TEXT,
  
  -- Status
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  blocked_at TIMESTAMPTZ,
  
  -- Timestamps
  -- NOTE: first_order_at and last_order_at are computed in customer_with_stats view
  -- These columns are deprecated but kept for backward compatibility
  first_order_at TIMESTAMPTZ,
  last_order_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE (institution_id, phone) -- Phone must be unique per institution
);

-- Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_customers_institution ON public.customers(institution_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch ON public.customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_segment ON public.customers(segment);
CREATE INDEX IF NOT EXISTS idx_customers_birthday_month ON public.customers(birthday_month);
CREATE INDEX IF NOT EXISTS idx_customers_last_order ON public.customers(last_order_at DESC);
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON public.customers(created_at DESC);

-- =============================================
-- CUSTOMER TAGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.customer_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1', -- Hex color for display
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (institution_id, name)
);

CREATE INDEX IF NOT EXISTS idx_customer_tags_institution ON public.customer_tags(institution_id);

-- =============================================
-- CUSTOMER TAG ASSIGNMENTS (Many-to-Many)
-- =============================================
CREATE TABLE IF NOT EXISTS public.customer_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.customer_tags(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (customer_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_customer ON public.customer_tag_assignments(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_tag_assignments_tag ON public.customer_tag_assignments(tag_id);

-- =============================================
-- CUSTOMER TIMELINE/ACTIVITY LOG
-- =============================================
CREATE TABLE IF NOT EXISTS public.customer_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'order_placed', 'segment_upgraded', 'tag_added', 'note_added', 'loyalty_earned', etc.
  event_description TEXT NOT NULL,
  metadata JSONB, -- Additional data about the event
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_timeline_customer ON public.customer_timeline(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_timeline_created_at ON public.customer_timeline(created_at DESC);

-- =============================================
-- CUSTOMER FAVORITE ITEMS (Computed/Cached)
-- Can be updated via trigger or background job
-- =============================================
CREATE TABLE IF NOT EXISTS public.customer_favorite_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL, -- Cached name for when item is deleted
  order_count INTEGER DEFAULT 0,
  last_ordered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE (customer_id, menu_item_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_favorite_items_customer ON public.customer_favorite_items(customer_id);

-- =============================================
-- UPDATE TRIGGER FOR updated_at
-- =============================================
DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_favorite_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their institution's customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage their institution's customers" ON public.customers;
DROP POLICY IF EXISTS "Users can view their institution's customer tags" ON public.customer_tags;
DROP POLICY IF EXISTS "Admins can manage their institution's customer tags" ON public.customer_tags;
DROP POLICY IF EXISTS "Users can view customer tag assignments" ON public.customer_tag_assignments;
DROP POLICY IF EXISTS "Admins can manage customer tag assignments" ON public.customer_tag_assignments;
DROP POLICY IF EXISTS "Users can view customer timeline" ON public.customer_timeline;
DROP POLICY IF EXISTS "System can insert customer timeline" ON public.customer_timeline;
DROP POLICY IF EXISTS "Users can view customer favorites" ON public.customer_favorite_items;

-- Customers policies
CREATE POLICY "Users can view their institution's customers" ON public.customers
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can manage their institution's customers" ON public.customers
  FOR ALL USING (
    institution_id IN (
      SELECT institution_id FROM public.users 
      WHERE auth_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Customer tags policies
CREATE POLICY "Users can view their institution's customer tags" ON public.customer_tags
  FOR SELECT USING (
    institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can manage their institution's customer tags" ON public.customer_tags
  FOR ALL USING (
    institution_id IN (
      SELECT institution_id FROM public.users 
      WHERE auth_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
    )
  );

-- Customer tag assignments policies
CREATE POLICY "Users can view customer tag assignments" ON public.customer_tag_assignments
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "Admins can manage customer tag assignments" ON public.customer_tag_assignments
  FOR ALL USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- Customer timeline policies
CREATE POLICY "Users can view customer timeline" ON public.customer_timeline
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

CREATE POLICY "System can insert customer timeline" ON public.customer_timeline
  FOR INSERT WITH CHECK (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- Customer favorite items policies
CREATE POLICY "Users can view customer favorites" ON public.customer_favorite_items
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers
      WHERE institution_id IN (SELECT institution_id FROM public.users WHERE auth_id = auth.uid())
    )
  );

-- =============================================
-- ADD CUSTOMER_ID TO ORDERS TABLE
-- =============================================
-- Add customer_id column to orders table to link orders to customers
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- =============================================
-- FUNCTION: Find or Create Customer and Link to Order
-- =============================================
-- This trigger runs BEFORE INSERT on orders to:
-- 1. Find existing customer by phone number, or create a new one
-- 2. Set the customer_id on the order for analytics
-- 
-- NOTE: Customer stats (total_orders, total_spent, segment, last_order_at)
-- are computed via query, NOT stored/updated here. This keeps data fresh
-- and avoids sync issues.

-- Drop old triggers if they exist (for clean migration)
DROP TRIGGER IF EXISTS on_order_update_customer ON public.orders;
DROP TRIGGER IF EXISTS on_order_link_customer ON public.orders;

CREATE OR REPLACE FUNCTION public.link_order_to_customer()
RETURNS TRIGGER AS $$
DECLARE
  existing_customer_id UUID;
BEGIN
  -- Skip if no phone number provided
  IF NEW.customer_phone IS NULL OR NEW.customer_phone = '' THEN
    RETURN NEW;
  END IF;

  -- Check if customer exists by phone number within the same institution
  SELECT id INTO existing_customer_id
  FROM public.customers
  WHERE phone = NEW.customer_phone
    AND institution_id = NEW.institution_id
  LIMIT 1;

  -- If customer doesn't exist, create one
  IF existing_customer_id IS NULL THEN
    INSERT INTO public.customers (
      institution_id,
      name,
      phone,
      email,
      address
    ) VALUES (
      NEW.institution_id,
      COALESCE(NULLIF(NEW.customer_name, ''), 'Customer'),
      NEW.customer_phone,
      NULLIF(NEW.customer_email, ''),
      NULLIF(NEW.delivery_address, '')
    )
    RETURNING id INTO existing_customer_id;
  END IF;

  -- Link the order to the customer
  NEW.customer_id := existing_customer_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that runs BEFORE INSERT to set customer_id
CREATE TRIGGER on_order_link_customer
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.link_order_to_customer();

-- =============================================
-- VIEW: Customer Stats (computed from orders)
-- =============================================
-- Use this view to get customer data with computed stats
-- Stats are always fresh because they're calculated on query

CREATE OR REPLACE VIEW public.customer_with_stats AS
SELECT 
  c.id,
  c.institution_id,
  c.branch_id,
  c.name,
  c.email,
  c.phone,
  c.address,
  c.city,
  c.state,
  c.country,
  c.birthday,
  c.birthday_month,
  c.birthday_day,
  c.preferred_channel,
  c.preferred_payment,
  c.preferred_delivery_type,
  c.usual_order_time,
  c.loyalty_points,
  c.loyalty_tier,
  c.notes,
  c.is_blocked,
  c.blocked_reason,
  c.created_at,
  c.updated_at,
  -- Computed stats from orders
  COALESCE(stats.total_orders, 0) AS total_orders,
  COALESCE(stats.total_spent, 0) AS total_spent,
  COALESCE(stats.avg_order_value, 0) AS avg_order_value,
  stats.first_order_at,
  stats.last_order_at,
  -- Computed segment based on order history
  CASE
    WHEN COALESCE(stats.total_orders, 0) = 0 THEN 'new'
    WHEN stats.last_order_at < NOW() - INTERVAL '45 days' THEN 'inactive'
    WHEN stats.last_order_at < NOW() - INTERVAL '30 days' AND COALESCE(stats.total_orders, 0) >= 3 THEN 'at_risk'
    WHEN COALESCE(stats.total_orders, 0) >= 10 OR COALESCE(stats.total_spent, 0) >= 100000 THEN 'vip'
    WHEN COALESCE(stats.total_orders, 0) >= 3 THEN 'regular'
    ELSE 'new'
  END AS computed_segment
FROM public.customers c
LEFT JOIN (
  SELECT 
    customer_id,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_spent,
    AVG(total_amount) AS avg_order_value,
    MIN(created_at) AS first_order_at,
    MAX(created_at) AS last_order_at
  FROM public.orders
  WHERE status != 'cancelled'
  GROUP BY customer_id
) stats ON c.id = stats.customer_id;

-- =============================================
-- HELPER FUNCTION: Add loyalty points
-- =============================================
CREATE OR REPLACE FUNCTION public.add_customer_loyalty_points(
  p_customer_id UUID,
  p_points INTEGER,
  p_reason TEXT DEFAULT 'Order'
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.customers
  SET 
    loyalty_points = loyalty_points + p_points,
    updated_at = NOW()
  WHERE id = p_customer_id;

  -- Log to timeline
  INSERT INTO public.customer_timeline (customer_id, event_type, event_description)
  VALUES (p_customer_id, 'loyalty_earned', 'Earned ' || p_points || ' points: ' || p_reason);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
