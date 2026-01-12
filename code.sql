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

-- Preferred delivery type enum (reusing from orders if exists).
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

-- =============================================
-- SEED SCRIPT: Test Orders with Items and Timeline
-- =============================================
-- Run this AFTER the trigger is created to test customer auto-creation
-- Institution: 3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84
-- Branch: 2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad

-- Clear existing test data (optional - uncomment if needed)
-- DELETE FROM public.order_timeline WHERE order_id IN (SELECT id FROM public.orders WHERE institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84');
-- DELETE FROM public.order_item_addons WHERE order_item_id IN (SELECT oi.id FROM public.order_items oi JOIN public.orders o ON o.id = oi.order_id WHERE o.institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84');
-- DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84');
-- DELETE FROM public.orders WHERE institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84';
-- DELETE FROM public.customers WHERE institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84';

-- Insert test orders with explicit IDs so we can reference them
INSERT INTO public.orders (
  id,
  institution_id,
  branch_id,
  customer_name,
  customer_phone,
  customer_email,
  delivery_address,
  delivery_type,
  channel,
  subtotal,
  delivery_fee,
  total_amount,
  payment_method,
  status
) VALUES
-- Order 1: John Doe
('d0000001-0001-0001-0001-000000000001', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'John Doe', '0801111111', 'john@example.com', '123 Main Street, Lagos',
 'delivery', 'phone', 5000, 500, 5500, 'cash', 'delivered'),

-- Order 2: John Doe
('d0000001-0001-0001-0001-000000000002', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'John Doe', '0801111111', 'john@example.com', '123 Main Street, Lagos',
 'delivery', 'phone', 7500, 500, 8000, 'mobile_money', 'delivered'),

-- Order 3: John Doe
('d0000001-0001-0001-0001-000000000003', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'John Doe', '0801111111', 'john@example.com', '123 Main Street, Lagos',
 'delivery', 'website', 3200, 500, 3700, 'card', 'delivered'),

-- Order 4: Sarah Mitchell
('d0000001-0001-0001-0001-000000000004', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Sarah Mitchell', '0802222222', 'sarah@example.com', '45 Victoria Island, Lagos',
 'pickup', 'website', 4500, 0, 4500, 'card', 'delivered'),

-- Order 5: Mike Kolade
('d0000001-0001-0001-0001-000000000005', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Mike Kolade', '0803333333', NULL, '78 Lekki Phase 2, Lagos',
 'delivery', 'social', 2800, 500, 3300, 'cash', 'delivered'),

-- Order 6: Mike Kolade (pending - for testing)
('d0000001-0001-0001-0001-000000000006', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Mike Kolade', '0803333333', 'mike@example.com', '78 Lekki Phase 2, Lagos',
 'delivery', 'bolt_food', 3500, 0, 3500, 'card', 'pending'),

-- Order 7: Emma Williams
('d0000001-0001-0001-0001-000000000007', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Emma Williams', '0804444444', 'emma@example.com', '200 Ikoyi, Lagos',
 'delivery', 'bolt_food', 12000, 0, 12000, 'card', 'delivered'),

-- Order 8: Emma Williams (preparing)
('d0000001-0001-0001-0001-000000000008', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Emma Williams', '0804444444', 'emma@example.com', '200 Ikoyi, Lagos',
 'delivery', 'website', 8500, 500, 9000, 'card', 'preparing'),

-- Order 9: David Brown
('d0000001-0001-0001-0001-000000000009', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'David Brown', '0805555555', 'david@example.com', '55 Surulere, Lagos',
 'pickup', 'walk_in', 4800, 0, 4800, 'cash', 'delivered');

-- =============================================
-- ORDER ITEMS
-- =============================================
INSERT INTO public.order_items (order_id, item_name, quantity, unit_price, total_price, variant_name) VALUES
-- Order 1 items (John Doe)
('d0000001-0001-0001-0001-000000000001', 'Jollof Rice', 2, 2000, 4000, 'Regular'),
('d0000001-0001-0001-0001-000000000001', 'Fried Chicken', 1, 1000, 1000, NULL),

-- Order 2 items (John Doe)
('d0000001-0001-0001-0001-000000000002', 'Jollof Rice', 3, 2000, 6000, 'Large'),
('d0000001-0001-0001-0001-000000000002', 'Chapman', 2, 750, 1500, NULL),

-- Order 3 items (John Doe)
('d0000001-0001-0001-0001-000000000003', 'Fried Rice', 1, 1800, 1800, 'Regular'),
('d0000001-0001-0001-0001-000000000003', 'Grilled Fish', 1, 1400, 1400, NULL),

-- Order 4 items (Sarah Mitchell)
('d0000001-0001-0001-0001-000000000004', 'Egusi Soup', 1, 3000, 3000, NULL),
('d0000001-0001-0001-0001-000000000004', 'Pounded Yam', 1, 1500, 1500, NULL),

-- Order 5 items (Mike Kolade)
('d0000001-0001-0001-0001-000000000005', 'Pepper Soup', 1, 2800, 2800, NULL),

-- Order 6 items (Mike Kolade - pending)
('d0000001-0001-0001-0001-000000000006', 'Suya Platter', 1, 3500, 3500, 'Full'),

-- Order 7 items (Emma Williams)
('d0000001-0001-0001-0001-000000000007', 'Party Jollof', 1, 8000, 8000, 'Family Size'),
('d0000001-0001-0001-0001-000000000007', 'Assorted Meat', 2, 2000, 4000, NULL),

-- Order 8 items (Emma Williams - preparing)
('d0000001-0001-0001-0001-000000000008', 'Grilled Chicken', 2, 3000, 6000, NULL),
('d0000001-0001-0001-0001-000000000008', 'Coleslaw', 2, 1250, 2500, NULL),

-- Order 9 items (David Brown)
('d0000001-0001-0001-0001-000000000009', 'Fried Rice', 2, 1800, 3600, 'Regular'),
('d0000001-0001-0001-0001-000000000009', 'Plantain', 2, 600, 1200, NULL);

-- =============================================
-- ORDER ITEM ADDONS (for some items)
-- =============================================
-- Get the first order item ID for order 1 (Jollof Rice)
INSERT INTO public.order_item_addons (order_item_id, addon_name, addon_price, quantity)
SELECT oi.id, 'Extra Chicken', 500, 1
FROM public.order_items oi
WHERE oi.order_id = 'd0000001-0001-0001-0001-000000000001' AND oi.item_name = 'Jollof Rice'
LIMIT 1;

INSERT INTO public.order_item_addons (order_item_id, addon_name, addon_price, quantity)
SELECT oi.id, 'Extra Plantain', 300, 2
FROM public.order_items oi
WHERE oi.order_id = 'd0000001-0001-0001-0001-000000000002' AND oi.item_name = 'Jollof Rice'
LIMIT 1;

-- =============================================
-- ORDER TIMELINE (initial "Order created" entries)
-- =============================================
INSERT INTO public.order_timeline (order_id, event_type, event_description, created_at) VALUES
-- Order 1 timeline
('d0000001-0001-0001-0001-000000000001', 'pending', 'Order created', NOW() - INTERVAL '3 days'),
('d0000001-0001-0001-0001-000000000001', 'paid', 'Payment confirmed', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'),
('d0000001-0001-0001-0001-000000000001', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes'),
('d0000001-0001-0001-0001-000000000001', 'ready', 'Marked as ready', NOW() - INTERVAL '3 days' + INTERVAL '25 minutes'),
('d0000001-0001-0001-0001-000000000001', 'dispatched', 'Out for delivery', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'),
('d0000001-0001-0001-0001-000000000001', 'delivered', 'Order delivered', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes'),

-- Order 2 timeline
('d0000001-0001-0001-0001-000000000002', 'pending', 'Order created', NOW() - INTERVAL '2 days'),
('d0000001-0001-0001-0001-000000000002', 'paid', 'Payment confirmed', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes'),
('d0000001-0001-0001-0001-000000000002', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'),
('d0000001-0001-0001-0001-000000000002', 'ready', 'Marked as ready', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes'),
('d0000001-0001-0001-0001-000000000002', 'delivered', 'Order delivered', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),

-- Order 3 timeline
('d0000001-0001-0001-0001-000000000003', 'pending', 'Order created', NOW() - INTERVAL '1 day'),
('d0000001-0001-0001-0001-000000000003', 'paid', 'Payment confirmed', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
('d0000001-0001-0001-0001-000000000003', 'delivered', 'Order delivered', NOW() - INTERVAL '1 day' + INTERVAL '40 minutes'),

-- Order 4 timeline (Sarah)
('d0000001-0001-0001-0001-000000000004', 'pending', 'Order created', NOW() - INTERVAL '12 hours'),
('d0000001-0001-0001-0001-000000000004', 'paid', 'Payment confirmed', NOW() - INTERVAL '12 hours' + INTERVAL '1 minute'),
('d0000001-0001-0001-0001-000000000004', 'delivered', 'Order delivered', NOW() - INTERVAL '12 hours' + INTERVAL '30 minutes'),

-- Order 5 timeline (Mike - delivered)
('d0000001-0001-0001-0001-000000000005', 'pending', 'Order created', NOW() - INTERVAL '6 hours'),
('d0000001-0001-0001-0001-000000000005', 'paid', 'Payment confirmed', NOW() - INTERVAL '6 hours' + INTERVAL '5 minutes'),
('d0000001-0001-0001-0001-000000000005', 'delivered', 'Order delivered', NOW() - INTERVAL '6 hours' + INTERVAL '45 minutes'),

-- Order 6 timeline (Mike - pending)
('d0000001-0001-0001-0001-000000000006', 'pending', 'Order created', NOW() - INTERVAL '30 minutes'),

-- Order 7 timeline (Emma - delivered)
('d0000001-0001-0001-0001-000000000007', 'pending', 'Order created', NOW() - INTERVAL '4 hours'),
('d0000001-0001-0001-0001-000000000007', 'paid', 'Payment confirmed', NOW() - INTERVAL '4 hours' + INTERVAL '2 minutes'),
('d0000001-0001-0001-0001-000000000007', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '4 hours' + INTERVAL '5 minutes'),
('d0000001-0001-0001-0001-000000000007', 'ready', 'Marked as ready', NOW() - INTERVAL '4 hours' + INTERVAL '25 minutes'),
('d0000001-0001-0001-0001-000000000007', 'delivered', 'Order delivered', NOW() - INTERVAL '4 hours' + INTERVAL '50 minutes'),

-- Order 8 timeline (Emma - preparing)
('d0000001-0001-0001-0001-000000000008', 'pending', 'Order created', NOW() - INTERVAL '20 minutes'),
('d0000001-0001-0001-0001-000000000008', 'paid', 'Payment confirmed', NOW() - INTERVAL '18 minutes'),
('d0000001-0001-0001-0001-000000000008', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '15 minutes'),

-- Order 9 timeline (David - delivered)
('d0000001-0001-0001-0001-000000000009', 'pending', 'Order created', NOW() - INTERVAL '2 hours'),
('d0000001-0001-0001-0001-000000000009', 'paid', 'Payment confirmed (Cash)', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
('d0000001-0001-0001-0001-000000000009', 'delivered', 'Order picked up', NOW() - INTERVAL '2 hours' + INTERVAL '20 minutes');

-- =============================================
-- VERIFY: Check data was created
-- =============================================
-- Run these queries to verify:
-- 
-- Check customers:
-- SELECT name, phone, total_orders, total_spent, computed_segment FROM public.customer_with_stats WHERE institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84';
--
-- Check orders:
-- SELECT order_number, customer_name, total_amount, status FROM public.orders WHERE institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84';
--
-- Check order items:
-- SELECT o.order_number, oi.item_name, oi.quantity, oi.total_price FROM public.order_items oi JOIN public.orders o ON o.id = oi.order_id WHERE o.institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84';
--
-- Check order timeline:
-- SELECT o.order_number, ot.event_type, ot.event_description, ot.created_at FROM public.order_timeline ot JOIN public.orders o ON o.id = ot.order_id WHERE o.institution_id = '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84' ORDER BY o.order_number, ot.created_at;
