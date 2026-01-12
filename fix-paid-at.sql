-- Fix paid_at timestamps for orders that have progressed past pending
-- This updates orders where paid_at is NULL but status indicates payment was made

-- Set paid_at for all orders that are paid, preparing, ready, dispatched, or delivered
UPDATE public.orders
SET paid_at = COALESCE(
  (SELECT MIN(created_at) FROM public.order_timeline 
   WHERE order_timeline.order_id = orders.id 
   AND event_type = 'paid'),
  created_at + INTERVAL '5 minutes'
)
WHERE paid_at IS NULL
AND status IN ('paid', 'preparing', 'ready', 'dispatched', 'delivered');

-- Set delivered_at for delivered orders
UPDATE public.orders
SET delivered_at = COALESCE(
  (SELECT MAX(created_at) FROM public.order_timeline 
   WHERE order_timeline.order_id = orders.id 
   AND event_type = 'delivered'),
  created_at + INTERVAL '45 minutes'
)
WHERE delivered_at IS NULL
AND status = 'delivered';

-- Set ready_at for orders that reached ready status
UPDATE public.orders
SET ready_at = COALESCE(
  (SELECT MIN(created_at) FROM public.order_timeline 
   WHERE order_timeline.order_id = orders.id 
   AND event_type = 'ready'),
  created_at + INTERVAL '25 minutes'
)
WHERE ready_at IS NULL
AND status IN ('ready', 'dispatched', 'delivered');

-- Set dispatched_at for orders that were dispatched
UPDATE public.orders
SET dispatched_at = COALESCE(
  (SELECT MIN(created_at) FROM public.order_timeline 
   WHERE order_timeline.order_id = orders.id 
   AND event_type = 'dispatched'),
  created_at + INTERVAL '30 minutes'
)
WHERE dispatched_at IS NULL
AND status IN ('dispatched', 'delivered');

-- Verify the update
SELECT order_number, status, paid_at, ready_at, dispatched_at, delivered_at 
FROM public.orders 
ORDER BY created_at DESC;
