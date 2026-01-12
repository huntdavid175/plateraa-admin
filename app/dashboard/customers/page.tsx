"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBranch } from "@/app/providers/BranchProvider";

// Customer type from database
type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  segment: string;
  orders: number;
  totalSpent: number;
  avgOrder: number;
  lastOrder: string;
  lastOrderDate: string;
  firstOrder: string;
  frequency: string;
  customerSince: string;
  birthday: string | null;
  birthdayThisMonth: boolean;
  address: string | null;
  preferredChannel: string | null;
  preferredPayment: string | null;
  orderType: string | null;
  usualOrderTime: string | null;
  favoriteItems: { name: string; count: number }[];
  recentOrders: { id: string; date: string; amount: number; status: string }[];
  timeline: { date: string; event: string }[];
  tags: string[];
  notes: string;
  loyaltyPoints: number;
};

// Helper function to format segment from database
function formatSegment(segment: string): string {
  const segmentMap: Record<string, string> = {
    new: "New",
    regular: "Regular",
    vip: "VIP",
    inactive: "Inactive",
    at_risk: "AtRisk",
  };
  return segmentMap[segment] || "New";
}

// Helper function to get time ago string
function getTimeAgo(date: Date | null): string {
  if (!date) return "Never";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
}

// Helper function to format date
function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Helper to format channel
function formatChannel(channel: string | null): string | null {
  if (!channel) return null;
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

// Helper to format payment method
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

// Helper to format delivery type
function formatDeliveryType(type: string | null): string | null {
  if (!type) return null;
  const typeMap: Record<string, string> = {
    pickup: "Pickup",
    delivery: "Delivery",
    dine_in: "Dine-in",
  };
  return typeMap[type] || type;
}

const segmentStyles: Record<
  string,
  { bg: string; text: string; icon: string; label: string }
> = {
  VIP: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    icon: "🌟",
    label: "VIP",
  },
  Regular: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    icon: "🔄",
    label: "Regular",
  },
  New: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    icon: "🆕",
    label: "New",
  },
  Inactive: {
    bg: "bg-gray-100 dark:bg-gray-800",
    text: "text-gray-600 dark:text-gray-400",
    icon: "😴",
    label: "Inactive",
  },
  AtRisk: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    icon: "⚠️",
    label: "At Risk",
  },
};

function SegmentBadge({ segment }: { segment: string }) {
  const style = segmentStyles[segment] || segmentStyles.New;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      {style.icon} {style.label}
    </span>
  );
}

function CustomerProfileModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "timeline"
  >("overview");

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-[var(--card)] z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xl font-bold">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-[var(--foreground)]">
                    {customer.name}
                  </h2>
                  {customer.birthdayThisMonth && (
                    <span className="text-lg">🎂</span>
                  )}
                </div>
                <SegmentBadge segment={customer.segment} />
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Customer since {customer.customerSince}
                </p>
              </div>
            </div>
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

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <a
              href={`tel:${customer.phone}`}
              className="flex-1 px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors text-center"
            >
              📞 Call
            </a>
            <button className="flex-1 px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors">
              💬 SMS
            </button>
            {customer.email && (
              <a
                href={`mailto:${customer.email}`}
                className="flex-1 px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors text-center"
              >
                📧 Email
              </a>
            )}
            <button className="flex-1 px-3 py-2 bg-[var(--primary)] rounded-lg text-sm font-medium text-white hover:bg-[var(--primary-hover)] transition-colors">
              🎁 Send Offer
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 bg-[var(--muted)] rounded-lg p-1">
            {(["overview", "orders", "timeline"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? "bg-[var(--card)] shadow-sm text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Contact Information */}
              <div className="bg-[var(--muted)] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      📞 Phone
                    </span>
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-sm font-medium text-[var(--primary)] hover:underline"
                    >
                      {customer.phone}
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">
                      📧 Email
                    </span>
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {customer.email || "Not provided"}
                    </span>
                  </div>
                  {customer.address && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        📍 Address
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)] text-right max-w-[200px]">
                        {customer.address}
                      </span>
                    </div>
                  )}
                  {customer.birthday && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        🎂 Birthday
                      </span>
                      <span className="text-sm font-medium text-[var(--foreground)]">
                        {customer.birthday}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Stats */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                  Customer Stats
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {customer.orders}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Total Orders
                    </p>
                  </div>
                  <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      ₵{customer.totalSpent}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Total Spent
                    </p>
                  </div>
                  <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      ₵{customer.avgOrder.toFixed(0)}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Avg Order
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {customer.firstOrder}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      First Order
                    </p>
                  </div>
                  <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {customer.lastOrder}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Last Order
                    </p>
                  </div>
                  <div className="bg-[var(--muted)] rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-[var(--foreground)]">
                      {customer.frequency}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Frequency
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Preferences */}
              <div className="bg-[var(--muted)] rounded-lg p-4">
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                  Order Preferences
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>🍽️</span>
                    <span className="text-[var(--muted-foreground)]">
                      Favorites:
                    </span>
                    <span className="text-[var(--foreground)]">
                      {customer.favoriteItems
                        .map((i) => `${i.name} (${i.count}x)`)
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span className="text-[var(--muted-foreground)]">
                      Channel:
                    </span>
                    <span className="text-[var(--foreground)]">
                      {customer.preferredChannel}
                    </span>
                  </div>
                  {customer.preferredPayment && (
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span className="text-[var(--muted-foreground)]">
                        Payment:
                      </span>
                      <span className="text-[var(--foreground)]">
                        {customer.preferredPayment}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span>🚚</span>
                    <span className="text-[var(--muted-foreground)]">
                      Order Type:
                    </span>
                    <span className="text-[var(--foreground)]">
                      {customer.orderType}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>⏰</span>
                    <span className="text-[var(--muted-foreground)]">
                      Usual Time:
                    </span>
                    <span className="text-[var(--foreground)]">
                      {customer.usualOrderTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tags & Notes */}
              <div>
                <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
                  Tags & Notes
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {customer.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-[var(--muted)] rounded text-xs text-[var(--foreground)]"
                    >
                      {tag}
                    </span>
                  ))}
                  <button className="px-2 py-1 border border-dashed border-[var(--border)] rounded text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
                    + Add Tag
                  </button>
                </div>
                {customer.notes ? (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      {customer.notes}
                    </p>
                  </div>
                ) : (
                  <button className="w-full py-2 border border-dashed border-[var(--border)] rounded-lg text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)]">
                    + Add Note
                  </button>
                )}
              </div>

              {/* Loyalty Points */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Loyalty Points</p>
                    <p className="text-3xl font-bold">
                      {customer.loyaltyPoints} pts
                    </p>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
              </div>
            </>
          )}

          {activeTab === "orders" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Recent Orders
              </h3>
              {customer.recentOrders.map((order, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--primary)]">
                      {order.id}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      ₵{order.amount.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs ${
                        order.status === "Delivered"
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }`}
                    >
                      {order.status === "Delivered" ? "✅" : "🔄"}{" "}
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
              <button className="w-full py-2 text-sm text-[var(--primary)] font-medium hover:underline">
                View All Orders →
              </button>
            </div>
          )}

          {activeTab === "timeline" && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--foreground)]">
                Customer Timeline
              </h3>
              {customer.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-3 h-3 rounded-full bg-[var(--primary)]" />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--foreground)]">
                      {event.event}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {event.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function CustomersPage() {
  const { currentBranch, isLoading: branchLoading } = useBranch();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All time");
  const [orderCountFilter, setOrderCountFilter] = useState("All");
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [institutionId, setInstitutionId] = useState<string | null>(null);

  // Fetch customers from database using the customer_with_stats view
  const fetchCustomers = useCallback(async () => {
    if (!currentBranch) {
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      // Get institution_id from branch
      const { data: branchData } = await supabase
        .from("branches")
        .select("institution_id")
        .eq("id", currentBranch.id)
        .single();

      if (branchData) {
        setInstitutionId(branchData.institution_id);
      }

      // Fetch customers from the view (includes computed stats)
      const { data: customersData, error: customersError } = await supabase
        .from("customer_with_stats")
        .select("*")
        .eq("institution_id", branchData?.institution_id)
        .order("created_at", { ascending: false });

      if (customersError) {
        console.error("Error fetching customers:", customersError);
        return;
      }

      // Fetch tags separately (views don't support nested selects)
      const { data: tagsData } = await supabase
        .from("customer_tag_assignments")
        .select(`
          customer_id,
          customer_tags (name)
        `);

      // Group tags by customer_id
      const tagsByCustomer: Record<string, string[]> = {};
      if (tagsData) {
        tagsData.forEach((ta: { customer_id: string; customer_tags: { name: string } | null }) => {
          if (!tagsByCustomer[ta.customer_id]) {
            tagsByCustomer[ta.customer_id] = [];
          }
          if (ta.customer_tags?.name) {
            tagsByCustomer[ta.customer_id].push(ta.customer_tags.name);
          }
        });
      }

      // Fetch recent orders for each customer (for the profile modal)
      const { data: recentOrdersData } = await supabase
        .from("orders")
        .select("customer_id, order_number, total_amount, status, created_at")
        .eq("institution_id", branchData?.institution_id)
        .order("created_at", { ascending: false })
        .limit(100); // Get recent orders

      // Group orders by customer_id
      const ordersByCustomer: Record<string, { id: string; date: string; amount: number; status: string }[]> = {};
      if (recentOrdersData) {
        recentOrdersData.forEach((order) => {
          if (!order.customer_id) return;
          if (!ordersByCustomer[order.customer_id]) {
            ordersByCustomer[order.customer_id] = [];
          }
          if (ordersByCustomer[order.customer_id].length < 5) {
            ordersByCustomer[order.customer_id].push({
              id: order.order_number,
              date: new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              amount: Number(order.total_amount),
              status: order.status.charAt(0).toUpperCase() + order.status.slice(1),
            });
          }
        });
      }

      // Transform customers data
      if (customersData) {
        const currentMonth = new Date().getMonth() + 1;
        
        const transformedCustomers: Customer[] = customersData.map((c) => {
          const lastOrderAt = c.last_order_at ? new Date(c.last_order_at) : null;
          const firstOrderAt = c.first_order_at ? new Date(c.first_order_at) : null;
          const createdAt = new Date(c.created_at);
          const totalOrders = Number(c.total_orders) || 0;

          // Calculate frequency
          let frequency = "No orders";
          if (totalOrders === 1) {
            frequency = "First order";
          } else if (totalOrders > 1 && firstOrderAt && lastOrderAt) {
            const daysBetween = Math.round((lastOrderAt.getTime() - firstOrderAt.getTime()) / (totalOrders - 1) / 86400000);
            frequency = daysBetween > 0 ? `Every ${daysBetween} days` : "Same day";
          }

          return {
            id: c.id,
            name: c.name,
            email: c.email,
            phone: c.phone,
            segment: formatSegment(c.computed_segment), // Use computed_segment from view
            orders: totalOrders,
            totalSpent: Number(c.total_spent) || 0,
            avgOrder: Number(c.avg_order_value) || 0,
            lastOrder: getTimeAgo(lastOrderAt),
            lastOrderDate: formatDate(lastOrderAt),
            firstOrder: getTimeAgo(firstOrderAt),
            frequency,
            customerSince: formatDate(createdAt),
            birthday: c.birthday ? new Date(c.birthday).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : null,
            birthdayThisMonth: c.birthday_month === currentMonth,
            address: c.address,
            preferredChannel: formatChannel(c.preferred_channel),
            preferredPayment: formatPaymentMethod(c.preferred_payment),
            orderType: formatDeliveryType(c.preferred_delivery_type),
            usualOrderTime: c.usual_order_time,
            favoriteItems: [], // Could fetch from customer_favorite_items if needed
            recentOrders: ordersByCustomer[c.id] || [],
            timeline: [], // Could fetch from customer_timeline if needed
            tags: tagsByCustomer[c.id] || [],
            notes: c.notes || "",
            loyaltyPoints: c.loyalty_points || 0,
          };
        });

        setCustomers(transformedCustomers);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setIsLoading(false);
    }
  }, [currentBranch]);

  useEffect(() => {
    if (!branchLoading && currentBranch) {
      fetchCustomers();
    }
  }, [currentBranch, branchLoading, fetchCustomers]);

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSegment =
      segmentFilter === "All" || customer.segment === segmentFilter;
    return matchesSearch && matchesSegment;
  });

  // Calculate stats from actual data
  const stats = {
    total: customers.length,
    newThisMonth: customers.filter((c) => c.segment === "New").length,
    repeatRate: customers.length > 0 
      ? Math.round((customers.filter((c) => c.orders > 1).length / customers.length) * 100) 
      : 0,
    avgLifetimeValue: customers.length > 0
      ? Math.round(customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length)
      : 0,
    vip: customers.filter((c) => c.segment === "VIP").length,
    regular: customers.filter((c) => c.segment === "Regular").length,
    newCustomers: customers.filter((c) => c.segment === "New").length,
    inactive: customers.filter((c) => c.segment === "Inactive").length,
    atRisk: customers.filter((c) => c.segment === "AtRisk").length,
    birthdaysThisMonth: customers.filter((c) => c.birthdayThisMonth).length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId)
        ? prev.filter((id) => id !== customerId)
        : [...prev, customerId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCustomers.length === paginatedCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(paginatedCustomers.map((c) => c.id));
    }
  };

  const maskPhone = (phone: string) => {
    return phone.slice(0, 3) + "****" + phone.slice(-3);
  };

  // Loading state
  if (isLoading || branchLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--muted-foreground)]">Loading customers...</p>
        </div>
      </div>
    );
  }

  // No branch selected
  if (!currentBranch) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🏪</div>
          <h3 className="text-lg font-medium text-[var(--foreground)]">No branch selected</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Please select a branch to view customers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Customers
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Manage your customer relationships
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors flex items-center gap-2">
            📊 Analytics
          </button>
          <button className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
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
            Add Customer
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            Total Customers
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {stats.total.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 mt-1">+12% ↑</p>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            New This Month
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {stats.newThisMonth}
          </p>
          <p className="text-xs text-emerald-600 mt-1">+15% ↑</p>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">Repeat Rate</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            {stats.repeatRate}%
          </p>
          <p className="text-xs text-emerald-600 mt-1">+3% ↑</p>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
          <p className="text-sm text-[var(--muted-foreground)]">
            Avg Lifetime Value
          </p>
          <p className="text-2xl font-bold text-[var(--foreground)]">
            ₵{stats.avgLifetimeValue}
          </p>
          <p className="text-xs text-emerald-600 mt-1">+8% ↑</p>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "All", label: "All Customers", count: stats.total },
          { key: "VIP", label: "🌟 VIP", count: stats.vip },
          { key: "Regular", label: "🔄 Regular", count: stats.regular },
          { key: "New", label: "🆕 New", count: stats.newCustomers },
          { key: "Inactive", label: "😴 Inactive", count: stats.inactive },
          { key: "AtRisk", label: "⚠️ At Risk", count: stats.atRisk },
          {
            key: "Birthday",
            label: "🎂 Birthdays",
            count: stats.birthdaysThisMonth,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() =>
              setSegmentFilter(tab.key === "Birthday" ? "All" : tab.key)
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              segmentFilter === tab.key
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]"
            }`}
          >
            {tab.label} <span className="opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 space-y-4">
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
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          {/* Filters */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]"
          >
            <option value="All time">📅 All Time</option>
            <option value="Last 7 days">Last 7 days</option>
            <option value="Last 30 days">Last 30 days</option>
            <option value="Last 3 months">Last 3 months</option>
          </select>

          <select
            value={orderCountFilter}
            onChange={(e) => setOrderCountFilter(e.target.value)}
            className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)]"
          >
            <option value="All">📊 All Orders</option>
            <option value="1">1 order</option>
            <option value="2-5">2-5 orders</option>
            <option value="6-10">6-10 orders</option>
            <option value="10+">10+ orders</option>
          </select>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
          <button className="px-3 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors">
            📧 Bulk SMS
          </button>
          <button className="px-3 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors">
            📥 Export
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

      {/* Bulk Actions Bar */}
      {selectedCustomers.length > 0 && (
        <div className="bg-[var(--primary)] text-white rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedCustomers.length} customers selected
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Send SMS
            </button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Send Email
            </button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Export
            </button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">
              Add Tag
            </button>
            <button
              onClick={() => setSelectedCustomers([])}
              className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Customers Table */}
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
                        selectedCustomers.length ===
                          paginatedCustomers.length &&
                        paginatedCustomers.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl mb-4">👥</span>
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
                          No customers found
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">
                          Try adjusting your filters or add a customer manually.
                        </p>
                        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
                          Add Customer
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-[var(--muted)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => toggleSelectCustomer(customer.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="text-left hover:underline"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-[var(--foreground)]">
                              {customer.name}
                            </p>
                            {customer.birthdayThisMonth && <span>🎂</span>}
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {customer.email || "No email"}
                          </p>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] font-mono">
                        {maskPhone(customer.phone)}
                      </td>
                      <td className="px-4 py-3">
                        <SegmentBadge segment={customer.segment} />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                        {customer.orders}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          ₵{customer.totalSpent.toFixed(2)}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          ₵{customer.avgOrder.toFixed(0)}/avg
                        </p>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {customer.lastOrder}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() =>
                            setShowActionsMenu(
                              showActionsMenu === customer.id
                                ? null
                                : customer.id
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
                        {showActionsMenu === customer.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowActionsMenu(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 py-1">
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                              >
                                👁️ View Profile
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                📋 View Orders
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                📞 Call
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                💬 Send SMS
                              </button>
                              {customer.email && (
                                <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                  📧 Send Email
                                </button>
                              )}
                              <div className="border-t border-[var(--border)] my-1" />
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                🎁 Send Offer
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                ⭐ Add to VIP
                              </button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">
                                🏷️ Add Tags
                              </button>
                              <div className="border-t border-[var(--border)] my-1" />
                              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                🚫 Block Customer
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
          {paginatedCustomers.length === 0 ? (
            <div className="col-span-full bg-[var(--card)] rounded-xl border border-[var(--border)] p-16 text-center">
              <span className="text-5xl mb-4 block">👥</span>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">
                No customers found
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Try adjusting your filters or add a customer manually.
              </p>
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
                Add Customer
              </button>
            </div>
          ) : (
            paginatedCustomers.map((customer) => (
              <div
                key={customer.id}
                className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                      {customer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-[var(--foreground)]">
                          {customer.name}
                        </p>
                        {customer.birthdayThisMonth && <span>🎂</span>}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {maskPhone(customer.phone)}
                      </p>
                    </div>
                  </div>
                  <SegmentBadge segment={customer.segment} />
                </div>
                <div className="text-sm text-[var(--muted-foreground)] mb-3">
                  {customer.orders} orders • ₵{customer.totalSpent.toFixed(2)}{" "}
                  spent
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mb-4">
                  Last order: {customer.lastOrder}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="flex-1 px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)]"
                  >
                    View Profile
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
      {filteredCustomers.length > 0 && (
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
            Total: {filteredCustomers.length} customers
          </span>
        </div>
      )}

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}
