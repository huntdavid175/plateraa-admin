"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBranch } from "@/app/providers/BranchProvider";

// Menu item type for order creation
type MenuItemForOrder = {
  id: string;
  name: string;
  price: number;
  category: string;
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
};

// Cart item type
type CartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variantName?: string;
  notes?: string;
  addons?: { name: string; price: number; quantity: number }[];
};

// Order type definition
type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

type TimelineEvent = {
  time: string;
  event: string;
  completed: boolean;
};

type Order = {
  id: string;
  dbId: string; // Database UUID for updates
  time: string;
  timeAgo: string;
  customer: string;
  phone: string;
  channel: string;
  amount: number;
  status: string;
  rawStatus: string; // Database status value (pending, paid, etc.)
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  paymentMethod: string | null;
  paymentRef: string | null;
  paymentLinkSent: string | null;
  paidAt: string | null;
  address: string | null;
  notes: string;
  timeline: TimelineEvent[];
  createdAt: Date;
};

// Helper functions for formatting
function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    paid: "Paid",
    preparing: "Preparing",
    ready: "Ready",
    dispatched: "Dispatched",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return statusMap[status] || status;
}

function formatChannel(channel: string): string {
  const channelMap: Record<string, string> = {
    phone: "Phone",
    website: "Website",
    social: "Social",
    bolt_food: "Bolt Food",
    chowdeck: "Chowdeck",
    glovo: "Glovo",
    walk_in: "Walk-in",
    pos: "POS",
  };
  return channelMap[channel] || channel;
}

function formatPaymentMethod(method: string | null): string | null {
  if (!method) return null;
  const methodMap: Record<string, string> = {
    mobile_money: "Mobile Money",
    card: "Card",
    cash: "Cash",
    bank_transfer: "Bank Transfer",
  };
  return methodMap[method] || method;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> =
  {
    Pending: {
      bg: "bg-red-100 dark:bg-red-900/30",
      text: "text-red-700 dark:text-red-400",
      dot: "bg-red-500",
    },
    Paid: {
      bg: "bg-blue-100 dark:bg-blue-900/30",
      text: "text-blue-700 dark:text-blue-400",
      dot: "bg-blue-500",
    },
    Preparing: {
      bg: "bg-purple-100 dark:bg-purple-900/30",
      text: "text-purple-700 dark:text-purple-400",
      dot: "bg-purple-500",
    },
    Ready: {
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
      text: "text-emerald-700 dark:text-emerald-400",
      dot: "bg-emerald-500",
    },
    Dispatched: {
      bg: "bg-indigo-100 dark:bg-indigo-900/30",
      text: "text-indigo-700 dark:text-indigo-400",
      dot: "bg-indigo-500",
    },
    Delivered: {
      bg: "bg-gray-100 dark:bg-gray-800",
      text: "text-gray-600 dark:text-gray-400",
      dot: "bg-gray-500",
    },
};

const channelIcons: Record<string, { icon: string; color: string }> = {
  Phone: { icon: "📱", color: "text-blue-600" },
  Website: { icon: "🌐", color: "text-green-600" },
  Social: { icon: "💬", color: "text-purple-600" },
  "Bolt Food": { icon: "🥡", color: "text-orange-600" },
  Chowdeck: { icon: "🍽️", color: "text-red-600" },
};

function StatusBadge({
  status,
  timeAgo,
}: {
  status: string;
  timeAgo?: string;
}) {
  const colors = statusColors[status] || statusColors.Pending;
  const statusText: Record<string, string> = {
    Pending: `⏱️ Pending ${timeAgo?.split(" ")[0] || ""}m`,
    Paid: "✅ Paid",
    Preparing: "👨‍🍳 Preparing...",
    Ready: "✅ Ready",
    Dispatched: "🚚 Out for delivery",
    Delivered: "✓ Delivered",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${
          status === "Preparing" ? "animate-pulse" : ""
        }`}
      />
      {statusText[status] || status}
    </span>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
}: {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<boolean>;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusFlow = [
    { value: "pending", label: "⏱️ Pending", next: "paid" },
    { value: "paid", label: "✅ Paid", next: "preparing" },
    { value: "preparing", label: "👨‍🍳 Preparing", next: "ready" },
    { value: "ready", label: "✓ Ready", next: "dispatched" },
    { value: "dispatched", label: "🚚 Dispatched", next: "delivered" },
    { value: "delivered", label: "✅ Delivered", next: null },
    { value: "cancelled", label: "❌ Cancelled", next: null },
  ];

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    await onStatusUpdate(order.dbId, newStatus);
    setIsUpdating(false);
    setShowStatusMenu(false);
  };

  const getNextStatus = () => {
    const current = statusFlow.find((s) => s.value === order.rawStatus);
    return current?.next || null;
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--card)] z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              {order.id}
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Created: {order.time}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Customer Information */}
          <div className="bg-[var(--muted)] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Customer Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Name
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {order.customer}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Phone
                </span>
                <a
                  href={`tel:${order.phone}`}
                  className="text-sm font-medium text-[var(--primary)] hover:underline"
                >
                  {order.phone}
                </a>
              </div>
              {order.address && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Address
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)] text-right max-w-[200px]">
                    {order.address}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Order Items
            </h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]">
                    {item.qty}x {item.name}
                  </span>
                  <span className="text-[var(--muted-foreground)]">
                    ₵{item.price.toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t border-[var(--border)] pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    Subtotal
                  </span>
                  <span className="text-[var(--foreground)]">
                    ₵{order.subtotal.toFixed(2)}
                  </span>
                </div>
                {order.delivery > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Delivery
                    </span>
                    <span className="text-[var(--foreground)]">
                      ₵{order.delivery.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold mt-1">
                  <span className="text-[var(--foreground)]">Total</span>
                  <span className="text-[var(--foreground)]">
                    ₵{order.amount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[var(--muted)] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Payment Information
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Method
                </span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {order.paymentMethod || "Pending"}
                </span>
              </div>
              {order.paymentRef && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Reference
                  </span>
                  <span className="text-sm font-mono text-[var(--foreground)]">
                    {order.paymentRef}
                  </span>
                </div>
              )}
              {order.paymentLinkSent && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Link Sent
                  </span>
                  <span className="text-sm text-[var(--foreground)]">
                    {order.paymentLinkSent}
                  </span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">
                    Paid At
                  </span>
                  <span className="text-sm text-emerald-600 font-medium">
                    {order.paidAt}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">
                  Status
                </span>
                <span
                  className={`text-sm font-medium ${
                    order.paidAt ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {order.paidAt ? "✅ Confirmed" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
              Order Timeline
            </h3>
            <div className="space-y-3">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      event.completed ? "bg-emerald-500" : "bg-[var(--border)]"
                    }`}
                  >
                    {event.completed && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        event.completed
                          ? "text-[var(--foreground)]"
                          : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {event.event}
                    </p>
                    {event.time && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {event.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
                Special Instructions
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] p-4">
          <div className="flex gap-2 mb-3">
          <button className="flex-1 px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors">
            🖨️ Print
          </button>
          <button className="flex-1 px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors">
            📞 Call
          </button>
          </div>
          
          {/* Status Update Section */}
          <div className="relative">
            {getNextStatus() && order.rawStatus !== "cancelled" ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(getNextStatus()!)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {isUpdating ? "Updating..." : `→ Mark as ${statusFlow.find((s) => s.value === getNextStatus())?.label.split(" ").slice(1).join(" ")}`}
                </button>
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="px-3 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors"
                >
                  ▼
          </button>
              </div>
            ) : (
              <div className="text-center py-2 text-sm text-[var(--muted-foreground)]">
                {order.rawStatus === "cancelled" ? "❌ Order Cancelled" : "✅ Order Complete"}
              </div>
            )}

            {/* Status Dropdown */}
            {showStatusMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowStatusMenu(false)}
                />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                    Change Status
                  </div>
                  {statusFlow.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={status.value === order.rawStatus || isUpdating}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed ${
                        status.value === order.rawStatus ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--foreground)]"
                      }`}
                    >
                      {status.label}
                      {status.value === order.rawStatus && " (current)"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Create Order Modal Component
function CreateOrderModal({
  onClose,
  branchId,
  institutionId,
  onSuccess,
}: {
  onClose: () => void;
  branchId: string;
  institutionId: string;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState(1); // 1: Customer & Channel, 2: Items, 3: Review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");

  // Order settings
  const [channel, setChannel] = useState<string>("phone");
  const [deliveryType, setDeliveryType] = useState<string>("delivery");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // Menu items
  const [menuItems, setMenuItems] = useState<MenuItemForOrder[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Fetch menu items
  useEffect(() => {
    const fetchMenu = async () => {
      const supabase = createClient();
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select(
            `
            id, name, price, is_available,
            menu_categories (name),
            menu_item_variants (name, price, sort_order),
            menu_item_addons (name, price, sort_order)
          `
          )
          .eq("is_available", true)
          .order("name");

        if (error) {
          console.error("Error fetching menu:", error);
          return;
        }

        if (data) {
          const items: MenuItemForOrder[] = data.map((item) => {
            // Handle menu_categories - could be object or array depending on query
            const categoryData = item.menu_categories as { name: string } | { name: string }[] | null;
            let categoryName = "Uncategorized";
            if (categoryData) {
              if (Array.isArray(categoryData)) {
                categoryName = categoryData[0]?.name || "Uncategorized";
              } else {
                categoryName = categoryData.name || "Uncategorized";
              }
            }

            return {
              id: item.id,
              name: item.name,
              price: Number(item.price),
              category: categoryName,
              variants: (
                (item.menu_item_variants as {
                  name: string;
                  price: number;
                  sort_order: number;
                }[]) || []
              )
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((v) => ({ name: v.name, price: Number(v.price) })),
              addons: (
                (item.menu_item_addons as {
                  name: string;
                  price: number;
                  sort_order: number;
                }[]) || []
              )
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((a) => ({ name: a.name, price: Number(a.price) })),
            };
          });
          setMenuItems(items);

          const uniqueCategories = [...new Set(items.map((i) => i.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setMenuLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Add item to cart
  const addToCart = (item: MenuItemForOrder, variantName?: string) => {
    const price = variantName
      ? item.variants?.find((v) => v.name === variantName)?.price || item.price
      : item.price;

    const existingIndex = cart.findIndex(
      (c) => c.menuItemId === item.id && c.variantName === variantName
    );

    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalPrice =
        updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setCart(updated);
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          name: item.name,
          quantity: 1,
          unitPrice: price,
          totalPrice: price,
          variantName,
        },
      ]);
    }
  };

  // Update cart item quantity
  const updateQuantity = (index: number, delta: number) => {
    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    } else {
      updated[index].totalPrice =
        updated[index].quantity * updated[index].unitPrice;
    }
    setCart(updated);
  };

  // Remove from cart
  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal + deliveryFee;

  // Validate step
  const canProceed = () => {
    if (step === 1) {
      return customerName.trim() !== "" && customerPhone.trim() !== "";
    }
    if (step === 2) {
      return cart.length > 0;
    }
    return true;
  };

  // Submit order
  const handleSubmit = async () => {
    if (!canProceed()) return;

    setIsSubmitting(true);
    setError("");

    const supabase = createClient();

    try {
      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          institution_id: institutionId,
          branch_id: branchId,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          delivery_address:
            deliveryType === "delivery" ? deliveryAddress : null,
          channel: channel,
          delivery_type: deliveryType,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          total_amount: total,
          payment_method: paymentMethod || null,
          notes: notes || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        item_name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        variant_name: item.variantName || null,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error creating order:", err);
      setError("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const channels = [
    { value: "phone", label: "📱 Phone", desc: "Phone call order" },
    { value: "website", label: "🌐 Website", desc: "Online order" },
    { value: "social", label: "💬 Social", desc: "Social media" },
    { value: "walk_in", label: "🚶 Walk-in", desc: "In-person order" },
    { value: "pos", label: "💳 POS", desc: "Point of sale" },
  ];

  const deliveryTypes = [
    { value: "delivery", label: "🚚 Delivery", desc: "Deliver to customer" },
    { value: "pickup", label: "🏃 Pickup", desc: "Customer picks up" },
    { value: "dine_in", label: "🍽️ Dine-in", desc: "Eat at restaurant" },
  ];

  const paymentMethods = [
    { value: "", label: "⏳ Pay Later" },
    { value: "mobile_money", label: "📱 Mobile Money" },
    { value: "card", label: "💳 Card" },
    { value: "cash", label: "💵 Cash" },
    { value: "bank_transfer", label: "🏦 Bank Transfer" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-4 lg:inset-y-4 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-4xl bg-[var(--card)] z-50 rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Create New Order
            </h2>
            <p className="text-sm text-[var(--muted-foreground)]">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2 bg-[var(--muted)]">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s <= step ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {step === 1 && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                      placeholder="080XXXXXXXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                      placeholder="customer@email.com (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Order Channel */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Order Channel
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {channels.map((ch) => (
                    <button
                      key={ch.value}
                      onClick={() => setChannel(ch.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        channel === ch.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className="text-lg">{ch.label.split(" ")[0]}</span>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {ch.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Type */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Delivery Type
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {deliveryTypes.map((dt) => (
                    <button
                      key={dt.value}
                      onClick={() => setDeliveryType(dt.value)}
                      className={`p-4 rounded-lg border text-center transition-colors ${
                        deliveryType === dt.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className="text-2xl block mb-1">
                        {dt.label.split(" ")[0]}
                      </span>
                      <p className="text-sm font-medium">
                        {dt.label.split(" ").slice(1).join(" ")}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {dt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {deliveryType === "delivery" && (
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] resize-none"
                    rows={3}
                    placeholder="Enter full delivery address"
                  />
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                      Delivery Fee
                    </label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                      placeholder="0"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex gap-4 h-full">
              {/* Menu Items */}
              <div className="flex-1 flex flex-col">
                <div className="mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                    placeholder="🔍 Search menu items..."
                  />
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  <button
                    onClick={() => setSelectedCategory("All")}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedCategory === "All"
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)]"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        selectedCategory === cat
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[var(--muted)]"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex-1 overflow-y-auto">
                  {menuLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {filteredMenuItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 bg-[var(--muted)] rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-[var(--foreground)] truncate">
                              {item.name}
                            </p>
                            <p className="text-sm text-[var(--muted-foreground)]">
                              ₵{item.price.toFixed(2)}
                            </p>
                            {item.variants && item.variants.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {item.variants.map((v) => (
                                  <button
                                    key={v.name}
                                    onClick={() => addToCart(item, v.name)}
                                    className="px-2 py-0.5 text-xs bg-[var(--background)] rounded border border-[var(--border)] hover:border-[var(--primary)]"
                                  >
                                    {v.name} (₵{v.price})
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => addToCart(item)}
                            className="ml-2 px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Cart */}
              <div className="w-80 bg-[var(--muted)] rounded-lg p-4 flex flex-col">
                <h3 className="font-semibold text-[var(--foreground)] mb-4">
                  🛒 Cart ({cart.length} items)
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-[var(--muted-foreground)] py-8">
                      No items in cart.
                      <br />
                      Add items from the menu.
                    </p>
                  ) : (
                    cart.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-[var(--card)] rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--foreground)] truncate">
                              {item.name}
                              {item.variantName && (
                                <span className="text-[var(--muted-foreground)]">
                                  {" "}
                                  ({item.variantName})
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              ₵{item.unitPrice.toFixed(2)} × {item.quantity} = ₵
                              {item.totalPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="w-6 h-6 rounded bg-[var(--muted)] flex items-center justify-center text-sm"
                            >
                              −
                            </button>
                            <span className="w-6 text-center text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="w-6 h-6 rounded bg-[var(--muted)] flex items-center justify-center text-sm"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(index)}
                              className="ml-1 w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-[var(--border)] pt-3 mt-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">
                      Subtotal
                    </span>
                    <span className="text-[var(--foreground)]">
                      ₵{subtotal.toFixed(2)}
                    </span>
                  </div>
                  {deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--muted-foreground)]">
                        Delivery
                      </span>
                      <span className="text-[var(--foreground)]">
                        ₵{deliveryFee.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[var(--primary)]">
                      ₵{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                    Customer Details
                  </h3>
                  <div className="bg-[var(--muted)] rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Name
                      </span>
                      <span className="font-medium">{customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Phone
                      </span>
                      <span className="font-medium">{customerPhone}</span>
                    </div>
                    {customerEmail && (
                      <div className="flex justify-between">
                        <span className="text-[var(--muted-foreground)]">
                          Email
                        </span>
                        <span className="font-medium">{customerEmail}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Channel
                      </span>
                      <span className="font-medium">
                        {channels.find((c) => c.value === channel)?.label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        Type
                      </span>
                      <span className="font-medium">
                        {
                          deliveryTypes.find((d) => d.value === deliveryType)
                            ?.label
                        }
                      </span>
                    </div>
                    {deliveryAddress && (
                      <div className="pt-2 border-t border-[var(--border)]">
                        <span className="text-[var(--muted-foreground)] text-sm">
                          Delivery Address
                        </span>
                        <p className="font-medium mt-1">{deliveryAddress}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                    Order Items
                  </h3>
                  <div className="bg-[var(--muted)] rounded-lg p-4">
                    <div className="space-y-2 mb-4">
                      {cart.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}× {item.name}
                            {item.variantName && ` (${item.variantName})`}
                          </span>
                          <span>₵{item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-[var(--border)] pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--muted-foreground)]">
                          Subtotal
                        </span>
                        <span>₵{subtotal.toFixed(2)}</span>
                      </div>
                      {deliveryFee > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[var(--muted-foreground)]">
                            Delivery Fee
                          </span>
                          <span>₵{deliveryFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg pt-1">
                        <span>Total</span>
                        <span className="text-[var(--primary)]">
                          ₵{total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
                  Payment Method
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.value}
                      onClick={() => setPaymentMethod(pm.value)}
                      className={`p-3 rounded-lg border text-center transition-colors ${
                        paymentMethod === pm.value
                          ? "border-[var(--primary)] bg-[var(--primary)]/10"
                          : "border-[var(--border)] hover:bg-[var(--muted)]"
                      }`}
                    >
                      <span className="text-sm font-medium">{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Special Instructions / Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--foreground)] resize-none"
                  rows={3}
                  placeholder="Any special requests or notes for this order..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : onClose())}
            className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]"
          >
            {step > 1 ? "← Back" : "Cancel"}
          </button>
          <div className="flex gap-2">
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || cart.length === 0}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "✓ Create Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("Today");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  // Get current branch from context
  const { currentBranch, isLoading: branchLoading } = useBranch();

  // Data from Supabase
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch orders from Supabase
  const fetchOrders = useCallback(async () => {
    if (!currentBranch) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Get institution_id from the branch
      const { data: branchData } = await supabase
        .from("branches")
        .select("institution_id")
        .eq("id", currentBranch.id)
        .single();

      if (branchData) {
        setInstitutionId(branchData.institution_id);
      }

      // Fetch orders with their items and timeline, filtered by current branch
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            item_name,
            quantity,
            unit_price,
            total_price,
            variant_name,
            notes,
            order_item_addons (
              addon_name,
              addon_price,
              quantity
            )
          ),
          order_timeline (
            event_type,
            event_description,
            created_at
          )
        `
        )
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      if (ordersData) {
        // Transform orders to match the UI type
        const transformedOrders: Order[] = ordersData.map((order) => {
          const createdAt = new Date(order.created_at);

          // Transform order items
          const items: OrderItem[] = (order.order_items || []).map(
            (item: {
              item_name: string;
              quantity: number;
              total_price: number;
            }) => ({
              name: item.item_name,
              qty: item.quantity,
              price: Number(item.total_price),
            })
          );

          // Transform timeline
          const timeline: TimelineEvent[] = (order.order_timeline || []).map(
            (event: {
              created_at: string;
              event_description: string;
              event_type: string;
            }) => ({
              time: formatTime(new Date(event.created_at)),
              event: event.event_description,
              completed: true,
            })
          );

          // Add pending events based on status
          const statusOrder = [
            "pending",
            "paid",
            "preparing",
            "ready",
            "dispatched",
            "delivered",
          ];
          const currentStatusIndex = statusOrder.indexOf(order.status);
          const pendingEvents = [
            { status: "paid", event: "Payment confirmed" },
            { status: "preparing", event: "Sent to kitchen" },
            { status: "ready", event: "Marked as ready" },
            { status: "dispatched", event: "Dispatched" },
            { status: "delivered", event: "Delivered" },
          ];

          pendingEvents.forEach((pe) => {
            const eventIndex = statusOrder.indexOf(pe.status);
            if (eventIndex > currentStatusIndex) {
              const existingEvent = timeline.find((t) =>
                t.event.includes(pe.event.split(" ")[0])
              );
              if (!existingEvent) {
                timeline.push({
                  time: "",
                  event: pe.event,
                  completed: false,
                });
              }
            }
          });

          return {
            id: order.order_number,
            dbId: order.id,
            time: formatTime(createdAt),
            timeAgo: getTimeAgo(createdAt),
            customer: order.customer_name,
            phone: order.customer_phone,
            channel: formatChannel(order.channel),
            amount: Number(order.total_amount),
            status: formatStatus(order.status),
            rawStatus: order.status,
            items,
            subtotal: Number(order.subtotal),
            delivery: Number(order.delivery_fee),
            paymentMethod: formatPaymentMethod(order.payment_method),
            paymentRef: order.payment_reference,
            paymentLinkSent: order.payment_link_sent_at
              ? formatTime(new Date(order.payment_link_sent_at))
              : null,
            paidAt: order.paid_at ? formatTime(new Date(order.paid_at)) : null,
            address: order.delivery_address,
            notes: order.notes || "",
            timeline,
            createdAt,
          };
        });

        setOrders(transformedOrders);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch]);

  // Update order status
  const updateOrderStatus = useCallback(
    async (orderId: string, newStatus: string) => {
      const supabase = createClient();

      try {
        // Build the update object based on new status
        const updateData: Record<string, unknown> = {
          status: newStatus,
          updated_at: new Date().toISOString(),
        };

        // Set timestamp fields based on status
        if (newStatus === "paid") {
          updateData.paid_at = new Date().toISOString();
        } else if (newStatus === "ready") {
          updateData.ready_at = new Date().toISOString();
        } else if (newStatus === "dispatched") {
          updateData.dispatched_at = new Date().toISOString();
        } else if (newStatus === "delivered") {
          updateData.delivered_at = new Date().toISOString();
        }

        const { error } = await supabase
          .from("orders")
          .update(updateData)
          .eq("id", orderId);

        if (error) {
          console.error("Error updating order status:", error);
          return false;
        }

        // Refresh orders to show updated data
        await fetchOrders();
        return true;
      } catch (err) {
        console.error("Error updating order:", err);
        return false;
      }
    },
    [fetchOrders]
  );

  useEffect(() => {
    if (!branchLoading && currentBranch) {
      fetchOrders();
    }
  }, [currentBranch, branchLoading, fetchOrders]);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesStatus =
      statusFilter === "All" || order.status === statusFilter;
    const matchesChannel =
      channelFilter === "All" || order.channel === channelFilter;
    const matchesPayment =
      paymentFilter === "All" || order.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesChannel && matchesPayment;
  });

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    totalAmount: filteredOrders.reduce((sum, o) => sum + o.amount, 0),
    avgAmount:
      filteredOrders.length > 0
        ? filteredOrders.reduce((sum, o) => sum + o.amount, 0) /
          filteredOrders.length
        : 0,
    pending: filteredOrders.filter((o) => o.status === "Pending").length,
    preparing: filteredOrders.filter((o) => o.status === "Preparing").length,
    ready: filteredOrders.filter((o) => o.status === "Ready").length,
    delivered: filteredOrders.filter((o) => o.status === "Delivered").length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === paginatedOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((o) => o.id));
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("All");
    setChannelFilter("All");
    setPaymentFilter("All");
    setDateFilter("Today");
  };

  const maskPhone = (phone: string) => {
    return phone.slice(0, 3) + "***" + phone.slice(-4);
  };

  if (isLoading || branchLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--muted-foreground)]">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!currentBranch) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🏪</div>
          <h3 className="text-lg font-medium text-[var(--foreground)]">
            No branch selected
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">
            Please select a branch to view orders
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">
              Orders
            </h1>
            {orders.length > 0 && (
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                {orders.length} total
            </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)]">
            Manage and track all orders
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Order
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 space-y-4">
        {/* Search and Quick Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="Today">📅 Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Custom">Custom range</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="All">📊 All Status</option>
            <option value="Pending">🔴 Pending Payment</option>
            <option value="Paid">🔵 Paid</option>
            <option value="Preparing">👨‍🍳 Preparing</option>
            <option value="Ready">✅ Ready</option>
            <option value="Dispatched">🚚 Dispatched</option>
            <option value="Delivered">✓ Delivered</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="All">📱 All Channels</option>
            <option value="Phone">📱 Phone</option>
            <option value="Website">🌐 Website</option>
            <option value="Social">💬 Social</option>
            <option value="Bolt Food">🥡 Bolt Food</option>
            <option value="Chowdeck">🍽️ Chowdeck</option>
          </select>

          {/* Toggle Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] hover:bg-[var(--border)] transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            More Filters
          </button>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="px-4 py-2.5 text-[var(--primary)] text-sm font-medium hover:underline"
          >
            🔄 Reset
          </button>
        </div>

        {/* Advanced Filters (Expandable) */}
        {showFilters && (
          <div className="pt-4 border-t border-[var(--border)] grid grid-cols-2 md:grid-cols-4 gap-4">
            <select className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
              <option value="All">💳 All Payment Methods</option>
              <option value="Mobile Money">Mobile Money</option>
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
            </select>
            <select className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]">
              <option value="All">🚚 Delivery Type</option>
              <option value="Pickup">Pickup</option>
              <option value="Delivery">Delivery</option>
            </select>
            <input
              type="number"
              placeholder="Min Amount"
              className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]"
            />
            <input
              type="number"
              placeholder="Max Amount"
              className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]"
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
          <button className="px-3 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors flex items-center gap-2">
            📥 Export
          </button>
          <button className="px-3 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors flex items-center gap-2">
            📧 Bulk SMS
          </button>
          <button className="px-3 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors flex items-center gap-2">
            🖨️ Print
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1 bg-[var(--muted)] rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded text-sm ${
                viewMode === "table" ? "bg-[var(--card)] shadow-sm" : ""
              }`}
            >
              📋 Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded text-sm ${
                viewMode === "card" ? "bg-[var(--card)] shadow-sm" : ""
              }`}
            >
              🎴 Cards
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-[var(--muted)] rounded-lg px-4 py-3 flex flex-wrap gap-4 text-sm">
        <span className="text-[var(--foreground)]">
          Showing <strong>{filteredOrders.length}</strong> orders
        </span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-[var(--foreground)]">
          Total: <strong>₵{stats.totalAmount.toFixed(2)}</strong>
        </span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-[var(--foreground)]">
          Avg: <strong>₵{stats.avgAmount.toFixed(2)}</strong>
        </span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-red-600">Pending: {stats.pending}</span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-purple-600">Preparing: {stats.preparing}</span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-emerald-600">Ready: {stats.ready}</span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-gray-600">Delivered: {stats.delivered}</span>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div className="bg-[var(--primary)] text-white rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedOrders.length} orders selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Mark as Paid
            </button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Send to Kitchen
            </button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Export
            </button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Print
            </button>
            <button
              onClick={() => setSelectedOrders([])}
              className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {viewMode === "table" ? (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.length === paginatedOrders.length &&
                        paginatedOrders.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl mb-4">📭</span>
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
                          No orders found
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">
                          Try adjusting your filters or create a new order
                          manually.
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]"
                          >
                            Reset Filters
                          </button>
                          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
                            Create Order
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--muted)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleSelectOrder(order.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-sm font-medium text-[var(--primary)] hover:underline"
                        >
                          {order.id}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm text-[var(--foreground)]">
                            {order.time}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {order.timeAgo}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                        {order.customer}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] font-mono">
                        {maskPhone(order.phone)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-sm ${
                            channelIcons[order.channel]?.color
                          }`}
                        >
                          {channelIcons[order.channel]?.icon} {order.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                        ₵{order.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={order.status}
                          timeAgo={order.timeAgo}
                        />
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() =>
                            setShowActionsMenu(
                              showActionsMenu === order.id ? null : order.id
                            )
                          }
                          className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {showActionsMenu === order.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowActionsMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 py-1">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                              >
                                👁️ View Details
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                📝 Edit Order
                              </button>
                              {order.status === "Pending" && (
                                <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                  💰 Resend Payment Link
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.dbId, "paid");
                                  setShowActionsMenu(null);
                                }}
                                disabled={order.rawStatus === "paid" || order.rawStatus === "preparing" || order.rawStatus === "ready" || order.rawStatus === "dispatched" || order.rawStatus === "delivered"}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ✅ Mark as Paid
                              </button>
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.dbId, "preparing");
                                  setShowActionsMenu(null);
                                }}
                                disabled={order.rawStatus !== "paid"}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                🍳 Send to Kitchen
                              </button>
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.dbId, "ready");
                                  setShowActionsMenu(null);
                                }}
                                disabled={order.rawStatus !== "preparing"}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ✓ Mark as Ready
                              </button>
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.dbId, "dispatched");
                                  setShowActionsMenu(null);
                                }}
                                disabled={order.rawStatus !== "ready"}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                🚚 Mark as Dispatched
                              </button>
                              <button
                                onClick={() => {
                                  updateOrderStatus(order.dbId, "delivered");
                                  setShowActionsMenu(null);
                                }}
                                disabled={order.rawStatus !== "dispatched"}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ✅ Mark as Delivered
                              </button>
                              <div className="border-t border-[var(--border)] my-1" />
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                📞 Call Customer
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                💬 Send SMS
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                🖨️ Print Receipt
                              </button>
                              <div className="border-t border-[var(--border)] my-1" />
                              <button
                                onClick={() => {
                                  if (confirm("Are you sure you want to cancel this order?")) {
                                    updateOrderStatus(order.dbId, "cancelled");
                                    setShowActionsMenu(null);
                                  }
                                }}
                                disabled={order.rawStatus === "delivered" || order.rawStatus === "cancelled"}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ❌ Cancel Order
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedOrders.length === 0 ? (
            <div className="col-span-full bg-[var(--card)] rounded-xl border border-[var(--border)] p-16 text-center">
              <span className="text-5xl mb-4 block">📭</span>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
                No orders found
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Try adjusting your filters or create a new order manually.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]"
                >
                  Reset Filters
                </button>
                <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
                  Create Order
                </button>
              </div>
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-sm font-bold text-[var(--primary)] hover:underline"
                  >
                    {order.id}
                  </button>
                  <StatusBadge status={order.status} timeAgo={order.timeAgo} />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  {order.time} • {order.timeAgo}
                </p>
                <p className="text-sm font-medium text-[var(--foreground)] mb-1">
                  {order.customer}
                </p>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  {channelIcons[order.channel]?.icon} {order.channel} •{" "}
                  <span className="font-medium text-[var(--foreground)]">
                    ₵{order.amount.toFixed(2)}
                  </span>
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mb-4 line-clamp-1">
                  {order.items.map((i) => `${i.qty}x ${i.name}`).join(", ")}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
                  >
                    View Details
                  </button>
                  <button className="px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]">
                    ⋮
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--muted-foreground)]">
              Rows per page:
            </span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded text-sm text-[var(--foreground)]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--muted-foreground)]">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                ← Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1.5 rounded text-sm ${
                      currentPage === page
                        ? "bg-[var(--primary)] text-white"
                        : "bg-[var(--muted)] border border-[var(--border)]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
          <span className="text-sm text-[var(--muted-foreground)]">
            Total: {filteredOrders.length} orders
          </span>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center">
        <span className="text-xs text-[var(--muted-foreground)]">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-[var(--muted)] rounded text-[var(--foreground)]">
            ?
          </kbd>{" "}
          for keyboard shortcuts
        </span>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={async (orderId, newStatus) => {
            const success = await updateOrderStatus(orderId, newStatus);
            if (success) {
              // Update the selected order to reflect new status
              setSelectedOrder(null);
            }
            return success;
          }}
        />
      )}

      {/* Create Order Modal */}
      {showCreateModal && currentBranch && institutionId && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          branchId={currentBranch.id}
          institutionId={institutionId}
          onSuccess={() => {
            fetchOrders();
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}
