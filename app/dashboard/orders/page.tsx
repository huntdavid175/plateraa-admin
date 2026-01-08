"use client";

import { useState } from "react";

// Mock data for orders
const mockOrders = [
  {
    id: "#ORD-1245",
    time: "2:45 PM",
    timeAgo: "2 mins ago",
    customer: "John Doe",
    phone: "0801234567",
    channel: "Phone",
    amount: 45.0,
    status: "Paid",
    items: [
      { name: "Jollof Rice", qty: 2, price: 20.0 },
      { name: "Fried Chicken", qty: 1, price: 15.0 },
      { name: "Coca-Cola", qty: 1, price: 5.0 },
    ],
    subtotal: 40.0,
    delivery: 5.0,
    paymentMethod: "Mobile Money",
    paymentRef: "PAY_ABC123XYZ",
    paymentLinkSent: "2:45 PM",
    paidAt: "2:47 PM",
    address: "123 Main Street, Lagos",
    notes: "Extra spicy, no onions",
    timeline: [
      { time: "2:45 PM", event: "Order created (Phone)", completed: true },
      { time: "2:45 PM", event: "Payment link sent", completed: true },
      { time: "2:47 PM", event: "Payment confirmed", completed: true },
      { time: "2:48 PM", event: "Sent to kitchen", completed: true },
      { time: "3:05 PM", event: "Marked as ready", completed: false },
      { time: "3:10 PM", event: "Dispatched", completed: false },
      { time: "3:30 PM", event: "Delivered", completed: false },
    ],
  },
  {
    id: "#ORD-1244",
    time: "2:32 PM",
    timeAgo: "15 mins ago",
    customer: "Sarah Mitchell",
    phone: "0709876543",
    channel: "Website",
    amount: 67.5,
    status: "Ready",
    items: [
      { name: "Fried Rice Special", qty: 1, price: 35.0 },
      { name: "Grilled Fish", qty: 1, price: 25.0 },
      { name: "Chapman", qty: 1, price: 7.5 },
    ],
    subtotal: 67.5,
    delivery: 0,
    paymentMethod: "Card",
    paymentRef: "PAY_DEF456UVW",
    paymentLinkSent: "2:32 PM",
    paidAt: "2:33 PM",
    address: null,
    notes: "",
    timeline: [
      { time: "2:32 PM", event: "Order created (Website)", completed: true },
      { time: "2:32 PM", event: "Payment link sent", completed: true },
      { time: "2:33 PM", event: "Payment confirmed", completed: true },
      { time: "2:35 PM", event: "Sent to kitchen", completed: true },
      { time: "2:50 PM", event: "Marked as ready", completed: true },
      { time: "", event: "Dispatched", completed: false },
      { time: "", event: "Delivered", completed: false },
    ],
  },
  {
    id: "#ORD-1243",
    time: "2:15 PM",
    timeAgo: "32 mins ago",
    customer: "Mike Kolade",
    phone: "0908765432",
    channel: "Social",
    amount: 32.0,
    status: "Pending",
    items: [
      { name: "Pepper Soup", qty: 2, price: 24.0 },
      { name: "Soft Drink", qty: 2, price: 8.0 },
    ],
    subtotal: 32.0,
    delivery: 0,
    paymentMethod: null,
    paymentRef: null,
    paymentLinkSent: "2:15 PM",
    paidAt: null,
    address: "45 Victoria Island, Lagos",
    notes: "Call before delivery",
    timeline: [
      { time: "2:15 PM", event: "Order created (Social)", completed: true },
      { time: "2:15 PM", event: "Payment link sent", completed: true },
      { time: "", event: "Payment confirmed", completed: false },
      { time: "", event: "Sent to kitchen", completed: false },
      { time: "", event: "Marked as ready", completed: false },
      { time: "", event: "Dispatched", completed: false },
      { time: "", event: "Delivered", completed: false },
    ],
  },
  {
    id: "#ORD-1242",
    time: "2:05 PM",
    timeAgo: "42 mins ago",
    customer: "Emma Williams",
    phone: "0812345678",
    channel: "Bolt Food",
    amount: 89.0,
    status: "Preparing",
    items: [
      { name: "Suya Platter", qty: 2, price: 40.0 },
      { name: "Jollof Rice", qty: 2, price: 20.0 },
      { name: "Grilled Chicken", qty: 1, price: 20.0 },
      { name: "Fresh Juice", qty: 2, price: 9.0 },
    ],
    subtotal: 89.0,
    delivery: 0,
    paymentMethod: "Card",
    paymentRef: "PAY_GHI789RST",
    paymentLinkSent: "2:05 PM",
    paidAt: "2:06 PM",
    address: "Bolt Food Delivery",
    notes: "",
    timeline: [
      { time: "2:05 PM", event: "Order created (Bolt Food)", completed: true },
      { time: "2:05 PM", event: "Payment confirmed", completed: true },
      { time: "2:08 PM", event: "Sent to kitchen", completed: true },
      { time: "", event: "Marked as ready", completed: false },
      { time: "", event: "Dispatched", completed: false },
      { time: "", event: "Delivered", completed: false },
    ],
  },
  {
    id: "#ORD-1241",
    time: "1:45 PM",
    timeAgo: "1 hour ago",
    customer: "David Brown",
    phone: "0703456789",
    channel: "Chowdeck",
    amount: 54.0,
    status: "Dispatched",
    items: [
      { name: "Fried Rice", qty: 2, price: 30.0 },
      { name: "Plantain", qty: 2, price: 8.0 },
      { name: "Meat Pie", qty: 2, price: 8.0 },
      { name: "Zobo", qty: 2, price: 8.0 },
    ],
    subtotal: 54.0,
    delivery: 0,
    paymentMethod: "Mobile Money",
    paymentRef: "PAY_JKL012MNO",
    paymentLinkSent: null,
    paidAt: "1:45 PM",
    address: "Chowdeck Delivery",
    notes: "",
    timeline: [
      { time: "1:45 PM", event: "Order created (Chowdeck)", completed: true },
      { time: "1:45 PM", event: "Payment confirmed", completed: true },
      { time: "1:48 PM", event: "Sent to kitchen", completed: true },
      { time: "2:10 PM", event: "Marked as ready", completed: true },
      { time: "2:15 PM", event: "Dispatched", completed: true },
      { time: "", event: "Delivered", completed: false },
    ],
  },
  {
    id: "#ORD-1240",
    time: "1:30 PM",
    timeAgo: "1 hour ago",
    customer: "Lisa Anderson",
    phone: "0806543210",
    channel: "Phone",
    amount: 125.0,
    status: "Delivered",
    items: [
      { name: "Party Jollof (Family)", qty: 1, price: 80.0 },
      { name: "Assorted Meat", qty: 1, price: 30.0 },
      { name: "Drinks (6 pack)", qty: 1, price: 15.0 },
    ],
    subtotal: 125.0,
    delivery: 0,
    paymentMethod: "Cash",
    paymentRef: null,
    paymentLinkSent: null,
    paidAt: "2:45 PM",
    address: "78 Lekki Phase 1, Lagos",
    notes: "Birthday celebration",
    timeline: [
      { time: "1:30 PM", event: "Order created (Phone)", completed: true },
      { time: "1:35 PM", event: "Sent to kitchen", completed: true },
      { time: "2:00 PM", event: "Marked as ready", completed: true },
      { time: "2:10 PM", event: "Dispatched", completed: true },
      { time: "2:45 PM", event: "Delivered & Paid (Cash)", completed: true },
    ],
  },
  {
    id: "#ORD-1239",
    time: "1:15 PM",
    timeAgo: "1.5 hours ago",
    customer: "James Taylor",
    phone: "0912345678",
    channel: "Website",
    amount: 42.0,
    status: "Delivered",
    items: [
      { name: "Egusi Soup", qty: 1, price: 25.0 },
      { name: "Pounded Yam", qty: 1, price: 12.0 },
      { name: "Water", qty: 1, price: 5.0 },
    ],
    subtotal: 42.0,
    delivery: 0,
    paymentMethod: "Card",
    paymentRef: "PAY_PQR345STU",
    paymentLinkSent: "1:15 PM",
    paidAt: "1:16 PM",
    address: null,
    notes: "",
    timeline: [
      { time: "1:15 PM", event: "Order created (Website)", completed: true },
      { time: "1:15 PM", event: "Payment link sent", completed: true },
      { time: "1:16 PM", event: "Payment confirmed", completed: true },
      { time: "1:20 PM", event: "Sent to kitchen", completed: true },
      { time: "1:40 PM", event: "Marked as ready", completed: true },
      { time: "1:45 PM", event: "Picked up", completed: true },
    ],
  },
  {
    id: "#ORD-1238",
    time: "12:45 PM",
    timeAgo: "2 hours ago",
    customer: "Amy Martinez",
    phone: "0804567890",
    channel: "Bolt Food",
    amount: 78.5,
    status: "Delivered",
    items: [
      { name: "Grilled Fish Combo", qty: 2, price: 70.0 },
      { name: "Coleslaw", qty: 2, price: 8.5 },
    ],
    subtotal: 78.5,
    delivery: 0,
    paymentMethod: "Card",
    paymentRef: "PAY_VWX678YZA",
    paymentLinkSent: null,
    paidAt: "12:45 PM",
    address: "Bolt Food Delivery",
    notes: "",
    timeline: [
      { time: "12:45 PM", event: "Order created (Bolt Food)", completed: true },
      { time: "12:45 PM", event: "Payment confirmed", completed: true },
      { time: "12:50 PM", event: "Sent to kitchen", completed: true },
      { time: "1:10 PM", event: "Marked as ready", completed: true },
      { time: "1:15 PM", event: "Dispatched", completed: true },
      { time: "1:35 PM", event: "Delivered", completed: true },
    ],
  },
];

type Order = (typeof mockOrders)[0];

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  Pending: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
  Paid: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
  Preparing: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
  Ready: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  Dispatched: { bg: "bg-indigo-100 dark:bg-indigo-900/30", text: "text-indigo-700 dark:text-indigo-400", dot: "bg-indigo-500" },
  Delivered: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-500" },
};

const channelIcons: Record<string, { icon: string; color: string }> = {
  Phone: { icon: "📱", color: "text-blue-600" },
  Website: { icon: "🌐", color: "text-green-600" },
  Social: { icon: "💬", color: "text-purple-600" },
  "Bolt Food": { icon: "🥡", color: "text-orange-600" },
  Chowdeck: { icon: "🍽️", color: "text-red-600" },
};

function StatusBadge({ status, timeAgo }: { status: string; timeAgo?: string }) {
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} ${status === "Preparing" ? "animate-pulse" : ""}`} />
      {statusText[status] || status}
    </span>
  );
}

function OrderDetailsModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-[var(--card)] z-50 shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--card)] border-b border-[var(--border)] p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">{order.id}</h2>
            <p className="text-sm text-[var(--muted-foreground)]">Created: {order.time}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Customer Information */}
          <div className="bg-[var(--muted)] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Name</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{order.customer}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--muted-foreground)]">Phone</span>
                <a href={`tel:${order.phone}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                  {order.phone}
                </a>
              </div>
              {order.address && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Address</span>
                  <span className="text-sm font-medium text-[var(--foreground)] text-right max-w-[200px]">{order.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Order Items</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]">{item.qty}x {item.name}</span>
                  <span className="text-[var(--muted-foreground)]">₵${item.price.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-[var(--border)] pt-2 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Subtotal</span>
                  <span className="text-[var(--foreground)]">₵${order.subtotal.toFixed(2)}</span>
                </div>
                {order.delivery > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--muted-foreground)]">Delivery</span>
                    <span className="text-[var(--foreground)]">₵${order.delivery.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold mt-1">
                  <span className="text-[var(--foreground)]">Total</span>
                  <span className="text-[var(--foreground)]">₵${order.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-[var(--muted)] rounded-lg p-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Payment Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Method</span>
                <span className="text-sm font-medium text-[var(--foreground)]">{order.paymentMethod || "Pending"}</span>
              </div>
              {order.paymentRef && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Reference</span>
                  <span className="text-sm font-mono text-[var(--foreground)]">{order.paymentRef}</span>
                </div>
              )}
              {order.paymentLinkSent && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Link Sent</span>
                  <span className="text-sm text-[var(--foreground)]">{order.paymentLinkSent}</span>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--muted-foreground)]">Paid At</span>
                  <span className="text-sm text-emerald-600 font-medium">{order.paidAt}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-[var(--muted-foreground)]">Status</span>
                <span className={`text-sm font-medium ${order.paidAt ? "text-emerald-600" : "text-amber-600"}`}>
                  {order.paidAt ? "✅ Confirmed" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Order Timeline</h3>
            <div className="space-y-3">
              {order.timeline.map((event, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${event.completed ? "bg-emerald-500" : "bg-[var(--border)]"}`}>
                    {event.completed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${event.completed ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                      {event.event}
                    </p>
                    {event.time && (
                      <p className="text-xs text-[var(--muted-foreground)]">{event.time}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Special Instructions */}
          {order.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Special Instructions</h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[var(--card)] border-t border-[var(--border)] p-4 flex gap-2">
          <button className="flex-1 px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors">
            🖨️ Print
          </button>
          <button className="flex-1 px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors">
            📞 Call
          </button>
          <button className="flex-1 px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
            Update Status
          </button>
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

  // Filter orders
  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    const matchesChannel = channelFilter === "All" || order.channel === channelFilter;
    const matchesPayment = paymentFilter === "All" || order.paymentMethod === paymentFilter;
    return matchesSearch && matchesStatus && matchesChannel && matchesPayment;
  });

  // Calculate stats
  const stats = {
    total: filteredOrders.length,
    totalAmount: filteredOrders.reduce((sum, o) => sum + o.amount, 0),
    avgAmount: filteredOrders.length > 0 ? filteredOrders.reduce((sum, o) => sum + o.amount, 0) / filteredOrders.length : 0,
    pending: filteredOrders.filter((o) => o.status === "Pending").length,
    preparing: filteredOrders.filter((o) => o.status === "Preparing").length,
    ready: filteredOrders.filter((o) => o.status === "Ready").length,
    delivered: filteredOrders.filter((o) => o.status === "Delivered").length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Orders</h1>
            <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              Live - 3 new
            </span>
          </div>
          <p className="text-[var(--muted-foreground)]">Manage and track all orders</p>
        </div>
        <button className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
              className={`px-3 py-1.5 rounded text-sm ${viewMode === "table" ? "bg-[var(--card)] shadow-sm" : ""}`}
            >
              📋 Table
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === "card" ? "bg-[var(--card)] shadow-sm" : ""}`}
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
          Total: <strong>₵${stats.totalAmount.toFixed(2)}</strong>
        </span>
        <span className="text-[var(--muted-foreground)]">|</span>
        <span className="text-[var(--foreground)]">
          Avg: <strong>₵${stats.avgAmount.toFixed(2)}</strong>
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
          <span className="text-sm font-medium">{selectedOrders.length} orders selected</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">Mark as Paid</button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">Send to Kitchen</button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">Export</button>
            <button className="px-3 py-1.5 bg-white/20 rounded text-sm hover:bg-white/30 transition-colors">Print</button>
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
                      checked={selectedOrders.length === paginatedOrders.length && paginatedOrders.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Channel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-5xl mb-4">📭</span>
                        <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No orders found</h3>
                        <p className="text-sm text-[var(--muted-foreground)] mb-4">Try adjusting your filters or create a new order manually.</p>
                        <div className="flex gap-3">
                          <button onClick={resetFilters} className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
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
                    <tr key={order.id} className="hover:bg-[var(--muted)] transition-colors">
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
                          <p className="text-sm text-[var(--foreground)]">{order.time}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{order.timeAgo}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--foreground)]">{order.customer}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)] font-mono">{maskPhone(order.phone)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${channelIcons[order.channel]?.color}`}>
                          {channelIcons[order.channel]?.icon} {order.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">₵${order.amount.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} timeAgo={order.timeAgo} />
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => setShowActionsMenu(showActionsMenu === order.id ? null : order.id)}
                          className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                        {showActionsMenu === order.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setShowActionsMenu(null)} />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 py-1">
                              <button onClick={() => { setSelectedOrder(order); setShowActionsMenu(null); }} className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">👁️ View Details</button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">📝 Edit Order</button>
                              {order.status === "Pending" && (
                                <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">💰 Resend Payment Link</button>
                              )}
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">✅ Mark as Paid</button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">🍳 Send to Kitchen</button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">✓ Mark as Ready</button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">🚚 Mark as Dispatched</button>
                              <div className="border-t border-[var(--border)] my-1" />
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">📞 Call Customer</button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">💬 Send SMS</button>
                              <button className="w-full px-4 py-2 text-left text-sm text-[var(--foreground)] hover:bg-[var(--muted)]">🖨️ Print Receipt</button>
                              <div className="border-t border-[var(--border)] my-1" />
                              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">❌ Cancel Order</button>
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
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-1">No orders found</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">Try adjusting your filters or create a new order manually.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={resetFilters} className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
                  Reset Filters
                </button>
                <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
                  Create Order
                </button>
              </div>
            </div>
          ) : (
            paginatedOrders.map((order) => (
              <div key={order.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-sm font-bold text-[var(--primary)] hover:underline"
                  >
                    {order.id}
                  </button>
                  <StatusBadge status={order.status} timeAgo={order.timeAgo} />
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">{order.time} • {order.timeAgo}</p>
                <p className="text-sm font-medium text-[var(--foreground)] mb-1">{order.customer}</p>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  {channelIcons[order.channel]?.icon} {order.channel} • <span className="font-medium text-[var(--foreground)]">₵${order.amount.toFixed(2)}</span>
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
            <span className="text-sm text-[var(--muted-foreground)]">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                    className={`px-3 py-1.5 rounded text-sm ${currentPage === page ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] border border-[var(--border)]"}`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded text-sm disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
          <span className="text-sm text-[var(--muted-foreground)]">Total: {filteredOrders.length} orders</span>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center">
        <span className="text-xs text-[var(--muted-foreground)]">Press <kbd className="px-1.5 py-0.5 bg-[var(--muted)] rounded text-[var(--foreground)]">?</kbd> for keyboard shortcuts</span>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

