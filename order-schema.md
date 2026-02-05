# Order Creation Schema Documentation

This document describes the complete data structure for creating orders in the system.

## **1. Main Order Table (`orders`)**

### **Required Fields:**
- `institution_id` (UUID) - The institution the order belongs to
- `branch_id` (UUID) - The branch where the order is placed
- `customer_name` (TEXT) - Customer's name
- `customer_phone` (TEXT) - Customer's phone number
- `delivery_type` (TEXT) - Options: `'delivery'`, `'pickup'`, `'dine_in'`
- `channel` (TEXT) - Order source: `'phone'`, `'website'`, `'social'`, `'bolt_food'`, `'chowdeck'`, `'glovo'`, `'walk_in'`, `'pos'`
- `subtotal` (NUMERIC/DECIMAL) - Subtotal before delivery fee
- `delivery_fee` (NUMERIC/DECIMAL) - Delivery fee (0 for pickup)
- `total_amount` (NUMERIC/DECIMAL) - Total amount (subtotal + delivery_fee)
- `status` (TEXT) - Order status: `'pending'`, `'paid'`, `'preparing'`, `'ready'`, `'delivered'`, `'cancelled'`

### **Optional Fields:**
- `customer_email` (TEXT, nullable) - Customer's email
- `delivery_address` (TEXT, nullable) - Required if `delivery_type` is `'delivery'`, null for pickup
- `payment_method` (TEXT, nullable) - `'cash'`, `'card'`, `'mobile_money'`, `'bank_transfer'`
- `notes` (TEXT, nullable) - Order notes
- `customer_id` (UUID, nullable) - Auto-linked by trigger if customer exists or is created

### **Auto-generated Fields (don't send):**
- `id` (UUID) - Auto-generated
- `created_at` (TIMESTAMPTZ) - Auto-generated
- `updated_at` (TIMESTAMPTZ) - Auto-generated

---

## **2. Order Items Table (`order_items`)**

### **Required Fields:**
- `order_id` (UUID) - The order ID (returned after creating the order)
- `menu_item_id` (UUID) - Reference to the menu item (optional, can be null)
- `item_name` (TEXT) - Name of the item
- `quantity` (INTEGER) - Quantity ordered
- `unit_price` (NUMERIC/DECIMAL) - Price per unit
- `total_price` (NUMERIC/DECIMAL) - Total price for this item (quantity × unit_price)

### **Optional Fields:**
- `variant_name` (TEXT, nullable) - Variant name (e.g., "Regular", "Large", "Full")
- `notes` (TEXT, nullable) - Item-specific notes

---

## **3. Order Item Addons Table (`order_item_addons`)**

### **Required Fields:**
- `order_item_id` (UUID) - The order_item ID (returned after creating order items)
- `addon_name` (TEXT) - Name of the addon
- `addon_price` (NUMERIC/DECIMAL) - Price of the addon
- `quantity` (INTEGER) - Quantity of the addon

---

## **4. Order Timeline Table (`order_timeline`)**

### **Required Fields:**
- `order_id` (UUID) - The order ID
- `event_type` (TEXT) - Event type matching status: `'pending'`, `'paid'`, `'preparing'`, `'ready'`, `'delivered'`, `'cancelled'`
- `event_description` (TEXT) - Description like "Order created", "Payment confirmed", etc.

### **Auto-generated:**
- `created_at` (TIMESTAMPTZ) - Auto-generated

---

## **Complete Order Creation Flow**

1. Create the order in `orders` table
2. Get the returned `order.id`
3. Create all `order_items` with `order_id`
4. Get the returned `order_item.id` for each item
5. Create `order_item_addons` (if any) with `order_item_id`
6. Create initial timeline entry (optional, can be done by trigger)

---

## **Example Request Structure**

### **Step 1: Create Order**
```json
{
  "institution_id": "uuid",
  "branch_id": "uuid",
  "customer_name": "John Doe",
  "customer_phone": "0801111111",
  "customer_email": "john@example.com",
  "delivery_address": "123 Main St",
  "delivery_type": "delivery",
  "channel": "phone",
  "subtotal": 5000,
  "delivery_fee": 500,
  "total_amount": 5500,
  "payment_method": "cash",
  "notes": "Extra spicy",
  "status": "pending"
}
```

### **Step 2: Create Order Items (array)**
```json
[
  {
    "order_id": "returned-order-id",
    "menu_item_id": "uuid",
    "item_name": "Jollof Rice",
    "quantity": 2,
    "unit_price": 2000,
    "total_price": 4000,
    "variant_name": "Regular",
    "notes": "Extra spicy"
  }
]
```

### **Step 3: Create Order Item Addons (array, optional)**
```json
[
  {
    "order_item_id": "returned-order-item-id",
    "addon_name": "Extra Chicken",
    "addon_price": 500,
    "quantity": 1
  }
]
```

---

## **TypeScript Interface Example**

```typescript
interface CreateOrderRequest {
  institution_id: string;
  branch_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  delivery_address?: string | null;
  delivery_type: 'delivery' | 'pickup' | 'dine_in';
  channel: 'phone' | 'website' | 'social' | 'bolt_food' | 'chowdeck' | 'glovo' | 'walk_in' | 'pos';
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method?: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | null;
  notes?: string | null;
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
}

interface CreateOrderItemRequest {
  order_id: string;
  menu_item_id?: string | null;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_name?: string | null;
  notes?: string | null;
}

interface CreateOrderItemAddonRequest {
  order_item_id: string;
  addon_name: string;
  addon_price: number;
  quantity: number;
}
```

---

## **Important Notes:**

1. **Customer Auto-linking**: `customer_id` is auto-linked by a database trigger when you provide `customer_phone` - it will find or create a customer record automatically.

2. **Status Field**: The `status` field determines the order state - start with `"pending"` for new orders.

3. **Delivery Fee**: `delivery_fee` should be `0` for `pickup` orders.

4. **Delivery Address**: `delivery_address` can be `null` for `pickup` orders.

5. **Currency**: All monetary values should be in the smallest currency unit (e.g., kobo for Naira).

6. **Channel Options**: 
   - `'phone'` - Phone call order
   - `'website'` - Website order
   - `'social'` - Social media order
   - `'bolt_food'` - Bolt Food
   - `'chowdeck'` - Chowdeck
   - `'glovo'` - Glovo
   - `'walk_in'` - Walk-in customer
   - `'pos'` - POS system

7. **Delivery Type Options**:
   - `'delivery'` - Delivery to customer
   - `'pickup'` - Customer picks up
   - `'dine_in'` - Customer dines in

8. **Payment Method Options**:
   - `'cash'` - Cash payment
   - `'card'` - Card payment
   - `'mobile_money'` - Mobile money payment
   - `'bank_transfer'` - Bank transfer

---

## **Reference Implementation**

See `app/dashboard/orders/page.tsx` (lines 760-801) for the current implementation example.
