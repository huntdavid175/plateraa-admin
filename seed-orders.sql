-- SEED SCRIPT: Test Orders with Items and Timeline
-- Institution: 3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84
-- Branch: 2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad

-- Insert test orders with explicit IDs
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
('d0000001-0001-0001-0001-000000000001', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'John Doe', '0801111111', 'john@example.com', '123 Main Street, Lagos',
 'delivery', 'phone', 5000, 500, 5500, 'cash', 'delivered'),

('d0000001-0001-0001-0001-000000000002', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'John Doe', '0801111111', 'john@example.com', '123 Main Street, Lagos',
 'delivery', 'phone', 7500, 500, 8000, 'mobile_money', 'delivered'),

('d0000001-0001-0001-0001-000000000003', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'John Doe', '0801111111', 'john@example.com', '123 Main Street, Lagos',
 'delivery', 'website', 3200, 500, 3700, 'card', 'delivered'),

('d0000001-0001-0001-0001-000000000004', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Sarah Mitchell', '0802222222', 'sarah@example.com', '45 Victoria Island, Lagos',
 'pickup', 'website', 4500, 0, 4500, 'card', 'delivered'),

('d0000001-0001-0001-0001-000000000005', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Mike Kolade', '0803333333', NULL, '78 Lekki Phase 2, Lagos',
 'delivery', 'social', 2800, 500, 3300, 'cash', 'delivered'),

('d0000001-0001-0001-0001-000000000006', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Mike Kolade', '0803333333', 'mike@example.com', '78 Lekki Phase 2, Lagos',
 'delivery', 'bolt_food', 3500, 0, 3500, 'card', 'pending'),

('d0000001-0001-0001-0001-000000000007', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Emma Williams', '0804444444', 'emma@example.com', '200 Ikoyi, Lagos',
 'delivery', 'bolt_food', 12000, 0, 12000, 'card', 'delivered'),

('d0000001-0001-0001-0001-000000000008', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'Emma Williams', '0804444444', 'emma@example.com', '200 Ikoyi, Lagos',
 'delivery', 'website', 8500, 500, 9000, 'card', 'preparing'),

('d0000001-0001-0001-0001-000000000009', '3d5a4d0c-7086-4aef-88a7-9e8a81e9fd84', '2d3d6b5d-2e16-4ad5-8939-7ed95fe474ad', 
 'David Brown', '0805555555', 'david@example.com', '55 Surulere, Lagos',
 'pickup', 'walk_in', 4800, 0, 4800, 'cash', 'delivered');

-- ORDER ITEMS
INSERT INTO public.order_items (order_id, item_name, quantity, unit_price, total_price, variant_name) VALUES
('d0000001-0001-0001-0001-000000000001', 'Jollof Rice', 2, 2000, 4000, 'Regular'),
('d0000001-0001-0001-0001-000000000001', 'Fried Chicken', 1, 1000, 1000, NULL),
('d0000001-0001-0001-0001-000000000002', 'Jollof Rice', 3, 2000, 6000, 'Large'),
('d0000001-0001-0001-0001-000000000002', 'Chapman', 2, 750, 1500, NULL),
('d0000001-0001-0001-0001-000000000003', 'Fried Rice', 1, 1800, 1800, 'Regular'),
('d0000001-0001-0001-0001-000000000003', 'Grilled Fish', 1, 1400, 1400, NULL),
('d0000001-0001-0001-0001-000000000004', 'Egusi Soup', 1, 3000, 3000, NULL),
('d0000001-0001-0001-0001-000000000004', 'Pounded Yam', 1, 1500, 1500, NULL),
('d0000001-0001-0001-0001-000000000005', 'Pepper Soup', 1, 2800, 2800, NULL),
('d0000001-0001-0001-0001-000000000006', 'Suya Platter', 1, 3500, 3500, 'Full'),
('d0000001-0001-0001-0001-000000000007', 'Party Jollof', 1, 8000, 8000, 'Family Size'),
('d0000001-0001-0001-0001-000000000007', 'Assorted Meat', 2, 2000, 4000, NULL),
('d0000001-0001-0001-0001-000000000008', 'Grilled Chicken', 2, 3000, 6000, NULL),
('d0000001-0001-0001-0001-000000000008', 'Coleslaw', 2, 1250, 2500, NULL),
('d0000001-0001-0001-0001-000000000009', 'Fried Rice', 2, 1800, 3600, 'Regular'),
('d0000001-0001-0001-0001-000000000009', 'Plantain', 2, 600, 1200, NULL);

-- ORDER TIMELINE
INSERT INTO public.order_timeline (order_id, event_type, event_description, created_at) VALUES
('d0000001-0001-0001-0001-000000000001', 'pending', 'Order created', NOW() - INTERVAL '3 days'),
('d0000001-0001-0001-0001-000000000001', 'paid', 'Payment confirmed', NOW() - INTERVAL '3 days' + INTERVAL '5 minutes'),
('d0000001-0001-0001-0001-000000000001', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '3 days' + INTERVAL '10 minutes'),
('d0000001-0001-0001-0001-000000000001', 'ready', 'Marked as ready', NOW() - INTERVAL '3 days' + INTERVAL '25 minutes'),
('d0000001-0001-0001-0001-000000000001', 'dispatched', 'Out for delivery', NOW() - INTERVAL '3 days' + INTERVAL '30 minutes'),
('d0000001-0001-0001-0001-000000000001', 'delivered', 'Order delivered', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes'),
('d0000001-0001-0001-0001-000000000002', 'pending', 'Order created', NOW() - INTERVAL '2 days'),
('d0000001-0001-0001-0001-000000000002', 'paid', 'Payment confirmed', NOW() - INTERVAL '2 days' + INTERVAL '3 minutes'),
('d0000001-0001-0001-0001-000000000002', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '2 days' + INTERVAL '8 minutes'),
('d0000001-0001-0001-0001-000000000002', 'ready', 'Marked as ready', NOW() - INTERVAL '2 days' + INTERVAL '20 minutes'),
('d0000001-0001-0001-0001-000000000002', 'delivered', 'Order delivered', NOW() - INTERVAL '2 days' + INTERVAL '35 minutes'),
('d0000001-0001-0001-0001-000000000003', 'pending', 'Order created', NOW() - INTERVAL '1 day'),
('d0000001-0001-0001-0001-000000000003', 'paid', 'Payment confirmed', NOW() - INTERVAL '1 day' + INTERVAL '2 minutes'),
('d0000001-0001-0001-0001-000000000003', 'delivered', 'Order delivered', NOW() - INTERVAL '1 day' + INTERVAL '40 minutes'),
('d0000001-0001-0001-0001-000000000004', 'pending', 'Order created', NOW() - INTERVAL '12 hours'),
('d0000001-0001-0001-0001-000000000004', 'paid', 'Payment confirmed', NOW() - INTERVAL '12 hours' + INTERVAL '1 minute'),
('d0000001-0001-0001-0001-000000000004', 'delivered', 'Order delivered', NOW() - INTERVAL '12 hours' + INTERVAL '30 minutes'),
('d0000001-0001-0001-0001-000000000005', 'pending', 'Order created', NOW() - INTERVAL '6 hours'),
('d0000001-0001-0001-0001-000000000005', 'paid', 'Payment confirmed', NOW() - INTERVAL '6 hours' + INTERVAL '5 minutes'),
('d0000001-0001-0001-0001-000000000005', 'delivered', 'Order delivered', NOW() - INTERVAL '6 hours' + INTERVAL '45 minutes'),
('d0000001-0001-0001-0001-000000000006', 'pending', 'Order created', NOW() - INTERVAL '30 minutes'),
('d0000001-0001-0001-0001-000000000007', 'pending', 'Order created', NOW() - INTERVAL '4 hours'),
('d0000001-0001-0001-0001-000000000007', 'paid', 'Payment confirmed', NOW() - INTERVAL '4 hours' + INTERVAL '2 minutes'),
('d0000001-0001-0001-0001-000000000007', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '4 hours' + INTERVAL '5 minutes'),
('d0000001-0001-0001-0001-000000000007', 'ready', 'Marked as ready', NOW() - INTERVAL '4 hours' + INTERVAL '25 minutes'),
('d0000001-0001-0001-0001-000000000007', 'delivered', 'Order delivered', NOW() - INTERVAL '4 hours' + INTERVAL '50 minutes'),
('d0000001-0001-0001-0001-000000000008', 'pending', 'Order created', NOW() - INTERVAL '20 minutes'),
('d0000001-0001-0001-0001-000000000008', 'paid', 'Payment confirmed', NOW() - INTERVAL '18 minutes'),
('d0000001-0001-0001-0001-000000000008', 'preparing', 'Sent to kitchen', NOW() - INTERVAL '15 minutes'),
('d0000001-0001-0001-0001-000000000009', 'pending', 'Order created', NOW() - INTERVAL '2 hours'),
('d0000001-0001-0001-0001-000000000009', 'paid', 'Payment confirmed (Cash)', NOW() - INTERVAL '2 hours' + INTERVAL '1 minute'),
('d0000001-0001-0001-0001-000000000009', 'delivered', 'Order picked up', NOW() - INTERVAL '2 hours' + INTERVAL '20 minutes');
