"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { Bar, BarChart, XAxis, Cell, Pie, PieChart, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createClient } from "@/lib/supabase/client";
import { useBranch } from "@/app/providers/BranchProvider";

// Helper function to format currency with thousand separators
function formatCurrency(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Types for database data
type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  channel: string;
  payment_method: string | null;
  delivery_type: string;
  created_at: string;
};

type OrderItem = {
  item_name: string;
  quantity: number;
  total_price: number;
};

type DashboardData = {
  todayRevenue: number;
  ordersToday: number;
  ordersByStatus: {
    pending: number;
    paid: number;
    preparing: number;
    ready: number;
    dispatched: number;
    delivered: number;
    cancelled: number;
  };
  avgOrderValue: number;
  revenueByChannel: { name: string; amount: number; percentage: number }[];
  revenueByPayment: { method: string; amount: number }[];
  recentOrders: {
    id: string;
    time: string;
    customer: string;
    channel: string;
    amount: number;
    status: string;
  }[];
  topItems: { name: string; qty: number; revenue: number }[];
  pendingPaymentsTotal: number;
  deliveryAwaiting: number;
  outForDelivery: number;
};

// Mock data for items we don't have in DB yet
const mockData = {
  conversionRate: 78.5,
  vsYesterday: 12.5,
  vsLastWeek: 8.3,
  thisWeekVsLast: 15.2,
  thisWeekRevenue: 45680.0,
  thisMonthRevenue: 156240.0,
  last30DaysRevenue: 189500.0,
  peakHours: [
    { hour: "9 AM", orders: 5 },
    { hour: "10 AM", orders: 8 },
    { hour: "11 AM", orders: 15 },
    { hour: "12 PM", orders: 28 },
    { hour: "1 PM", orders: 32 },
    { hour: "2 PM", orders: 24 },
    { hour: "3 PM", orders: 12 },
    { hour: "4 PM", orders: 8 },
    { hour: "5 PM", orders: 14 },
    { hour: "6 PM", orders: 22 },
    { hour: "7 PM", orders: 35 },
    { hour: "8 PM", orders: 30 },
  ],
  failedPayments: { count: 8, lostRevenue: 1240 },
  paymentSuccessRate: 92.5,
  avgTimeToPayment: 4.2,
  avgDeliveryTime: 28,
  alerts: [
    { type: "warning", message: "5 orders pending payment for >30 minutes" },
    { type: "error", message: "Kitchen display disconnected 10 mins ago" },
    {
      type: "warning",
      message: "Low conversion rate today (45% vs 70% average)",
    },
    {
      type: "success",
      message: "New order from Bolt Food - requires acceptance",
    },
  ],
};

// Daily revenue data for chart (last 7 days) - mock for now
const dailyRevenue = [
  { day: "Mon", amount: 8500 },
  { day: "Tue", amount: 9200 },
  { day: "Wed", amount: 7800 },
  { day: "Thu", amount: 10500 },
  { day: "Fri", amount: 12100 },
  { day: "Sat", amount: 14200 },
  { day: "Sun", amount: 12450 },
];

function MetricCard({
  title,
  value,
  subtitle,
  change,
  changeType,
  icon,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-[var(--muted)] rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
          )}
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {subtitle}
            </p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {changeType === "positive" ? (
                <svg
                  className="w-4 h-4 text-emerald-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              ) : changeType === "negative" ? (
                <svg
                  className="w-4 h-4 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 7L7 17M7 17H17M7 17V7"
                  />
                </svg>
              ) : null}
              <span
                className={`text-sm font-medium ${
                  changeType === "positive"
                    ? "text-emerald-500"
                    : changeType === "negative"
                    ? "text-red-500"
                    : "text-[var(--muted-foreground)]"
                }`}
              >
                {change > 0 ? "+" : ""}
                {change}%
              </span>
            </div>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    preparing:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Preparing:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    ready: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Ready: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    delivered:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Delivered:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Completed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dispatched:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    Dispatched:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    cancelled:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    Cancelled:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };
  
  const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
  
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {displayStatus}
    </span>
  );
}

function AlertItem({ type, message }: { type: string; message: string }) {
  const styles: Record<
    string,
    { bg: string; icon: React.ReactNode; text: string }
  > = {
    warning: {
      bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
      text: "text-amber-800 dark:text-amber-200",
      icon: (
        <svg
          className="w-5 h-5 text-amber-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
    },
    error: {
      bg: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      text: "text-red-800 dark:text-red-200",
      icon: (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      ),
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
      text: "text-emerald-800 dark:text-emerald-200",
      icon: (
        <svg
          className="w-5 h-5 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };
  const style = styles[type] || styles.warning;
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg}`}
    >
      {style.icon}
      <p className={`text-sm ${style.text}`}>{message}</p>
    </div>
  );
}

// Channel display names
const channelNames: Record<string, string> = {
  phone: "Phone orders",
  website: "Website",
  social: "Social media",
  bolt_food: "Bolt Food",
  chowdeck: "Chowdeck",
  glovo: "Glovo",
  walk_in: "Walk-in",
  pos: "POS",
};

// Payment method display names
const paymentNames: Record<string, string> = {
  mobile_money: "Mobile Money",
  card: "Card",
  cash: "Cash",
  bank_transfer: "Bank Transfer",
};

export default function DashboardPage() {
  const { currentBranch } = useBranch();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    todayRevenue: 0,
    ordersToday: 0,
    ordersByStatus: {
      pending: 0,
      paid: 0,
      preparing: 0,
      ready: 0,
      dispatched: 0,
      delivered: 0,
      cancelled: 0,
    },
    avgOrderValue: 0,
    revenueByChannel: [],
    revenueByPayment: [],
    recentOrders: [],
    topItems: [],
    pendingPaymentsTotal: 0,
    deliveryAwaiting: 0,
    outForDelivery: 0,
  });

  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [revenueActiveIndex, setRevenueActiveIndex] = useState<number | null>(
    null
  );
  const maxOrders = Math.max(...mockData.peakHours.map((h) => h.orders));

  const fetchDashboardData = useCallback(async () => {
    if (!currentBranch) return;

    setLoading(true);
    const supabase = createClient();

    try {
      // Get today's start and end timestamps
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);

      // Fetch all orders for the branch
      const { data: allOrders, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("branch_id", currentBranch.id)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      const orders: Order[] = allOrders || [];

      // Filter today's orders
      const todaysOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= todayStart && orderDate <= todayEnd;
      });

      // Calculate today's revenue (only delivered orders)
      const todayRevenue = todaysOrders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Count orders by status
      const ordersByStatus = {
        pending: todaysOrders.filter((o) => o.status === "pending").length,
        paid: todaysOrders.filter((o) => o.status === "paid").length,
        preparing: todaysOrders.filter((o) => o.status === "preparing").length,
        ready: todaysOrders.filter((o) => o.status === "ready").length,
        dispatched: todaysOrders.filter((o) => o.status === "dispatched").length,
        delivered: todaysOrders.filter((o) => o.status === "delivered").length,
        cancelled: todaysOrders.filter((o) => o.status === "cancelled").length,
      };

      // Calculate average order value
      const completedOrders = todaysOrders.filter(
        (o) => o.status === "delivered" || o.status === "completed"
      );
      const avgOrderValue =
        completedOrders.length > 0
          ? completedOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) /
            completedOrders.length
          : 0;

      // Revenue by channel
      const channelRevenue: Record<string, number> = {};
      todaysOrders.forEach((order) => {
        if (order.status === "delivered") {
          channelRevenue[order.channel] =
            (channelRevenue[order.channel] || 0) + Number(order.total_amount);
        }
      });

      const totalChannelRevenue = Object.values(channelRevenue).reduce(
        (a, b) => a + b,
        0
      );
      const revenueByChannel = Object.entries(channelRevenue)
        .map(([channel, amount]) => ({
          name: channelNames[channel] || channel,
          amount,
          percentage:
            totalChannelRevenue > 0
              ? Math.round((amount / totalChannelRevenue) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Revenue by payment method
      const paymentRevenue: Record<string, number> = {};
      todaysOrders.forEach((order) => {
        if (order.status === "delivered" && order.payment_method) {
          paymentRevenue[order.payment_method] =
            (paymentRevenue[order.payment_method] || 0) +
            Number(order.total_amount);
        }
      });

      const revenueByPayment = Object.entries(paymentRevenue)
        .map(([method, amount]) => ({
          method: paymentNames[method] || method,
          amount,
        }))
        .sort((a, b) => b.amount - a.amount);

      // Recent orders (last 10)
      const recentOrders = orders.slice(0, 10).map((order) => ({
        id: order.order_number,
        time: new Date(order.created_at).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        }),
        customer: order.customer_name,
        channel: channelNames[order.channel] || order.channel,
        amount: Number(order.total_amount),
        status: order.status,
      }));

      // Pending payments total
      const pendingPaymentsTotal = todaysOrders
        .filter((o) => o.status === "pending")
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Delivery stats
      const deliveryAwaiting = todaysOrders.filter(
        (o) => o.status === "ready" && o.delivery_type === "delivery"
      ).length;
      const outForDelivery = todaysOrders.filter(
        (o) => o.status === "dispatched"
      ).length;

      // Fetch top items from order_items
      const { data: orderItems, error: itemsError } = await supabase
        .from("order_items")
        .select(
          `
          item_name,
          quantity,
          total_price,
          order_id,
          orders!inner(branch_id, created_at, status)
        `
        )
        .eq("orders.branch_id", currentBranch.id);

      let topItems: { name: string; qty: number; revenue: number }[] = [];
      if (!itemsError && orderItems) {
        // Aggregate items
        const itemStats: Record<string, { qty: number; revenue: number }> = {};
        orderItems.forEach((item) => {
          // orders is an array from the join, get first element
          const orderData = Array.isArray(item.orders) ? item.orders[0] : item.orders;
          if (orderData?.status === "delivered") {
            if (!itemStats[item.item_name]) {
              itemStats[item.item_name] = { qty: 0, revenue: 0 };
            }
            itemStats[item.item_name].qty += item.quantity;
            itemStats[item.item_name].revenue += Number(item.total_price);
          }
        });

        topItems = Object.entries(itemStats)
          .map(([name, stats]) => ({
            name,
            qty: stats.qty,
            revenue: stats.revenue,
          }))
          .sort((a, b) => b.qty - a.qty)
          .slice(0, 5);
      }

      setDashboardData({
        todayRevenue,
        ordersToday: todaysOrders.length,
        ordersByStatus,
        avgOrderValue,
        revenueByChannel,
        revenueByPayment,
        recentOrders,
        topItems,
        pendingPaymentsTotal,
        deliveryAwaiting,
        outForDelivery,
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentBranch]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart configs for pie charts
  const revenueByChannelConfig = {
    revenue: { label: "Revenue" },
    phone: { label: "Phone orders", color: "var(--chart-1)" },
    website: { label: "Website", color: "var(--chart-2)" },
    social: { label: "Social media", color: "var(--chart-3)" },
    bolt: { label: "Bolt Food", color: "var(--chart-4)" },
    chowdeck: { label: "Chowdeck", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const revenueByPaymentConfig = {
    revenue: { label: "Revenue" },
    mobile: { label: "Mobile Money", color: "var(--chart-1)" },
    card: { label: "Card", color: "var(--chart-2)" },
    cash: { label: "Cash", color: "var(--chart-3)" },
  } satisfies ChartConfig;

  const orderStatusConfig = {
    orders: { label: "Orders" },
    pending: { label: "Pending Payment", color: "hsl(45, 93%, 47%)" },
    paid: { label: "Paid", color: "hsl(217, 91%, 60%)" },
    preparing: { label: "Preparing", color: "hsl(262, 83%, 58%)" },
    ready: { label: "Ready", color: "hsl(188, 94%, 43%)" },
    delivery: { label: "Out for delivery", color: "hsl(239, 84%, 67%)" },
    completed: { label: "Completed", color: "hsl(142, 76%, 36%)" },
  } satisfies ChartConfig;

  // Transform data for pie charts
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const revenueByChannelData = dashboardData.revenueByChannel.map(
    (channel, i) => ({
      name: channel.name,
      value: channel.amount,
      fill: chartColors[i % chartColors.length],
    })
  );

  const totalPaymentRevenue = dashboardData.revenueByPayment.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const revenueByPaymentData = dashboardData.revenueByPayment.map(
    (payment, i) => ({
      name: payment.method,
      value: payment.amount,
      fill: chartColors[i % chartColors.length],
      percentage:
        totalPaymentRevenue > 0
          ? ((payment.amount / totalPaymentRevenue) * 100).toFixed(1)
          : "0",
    })
  );

  // Order status data for pie chart
  const orderStatusList = [
    {
      status: "Pending Payment",
      count: dashboardData.ordersByStatus.pending,
      color: "hsl(45, 93%, 47%)",
    },
    {
      status: "Paid (awaiting kitchen)",
      count: dashboardData.ordersByStatus.paid,
      color: "hsl(217, 91%, 60%)",
    },
    {
      status: "Preparing",
      count: dashboardData.ordersByStatus.preparing,
      color: "hsl(262, 83%, 58%)",
    },
    {
      status: "Ready for pickup/delivery",
      count: dashboardData.ordersByStatus.ready,
      color: "hsl(188, 94%, 43%)",
    },
    {
      status: "Out for delivery",
      count: dashboardData.ordersByStatus.dispatched,
      color: "hsl(239, 84%, 67%)",
    },
    {
      status: "Completed today",
      count: dashboardData.ordersByStatus.delivered,
      color: "hsl(142, 76%, 36%)",
    },
  ];

  const orderStatusData = orderStatusList.map((status) => ({
    name: status.status,
    value: status.count,
    fill: status.color,
  }));

  // Transform peakHours data for the chart
  const chartData = mockData.peakHours.map((h) => ({
    hour: h.hour,
    orders: h.orders,
  }));

  const chartConfig = {
    orders: {
      label: "Orders",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return chartData[activeIndex];
  }, [activeIndex, chartData]);

  // Revenue overview bar chart data and config
  const revenueChartData = dailyRevenue.map((d) => ({
    day: d.day,
    revenue: d.amount,
  }));

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const revenueActiveData = useMemo(() => {
    if (revenueActiveIndex === null) return null;
    return revenueChartData[revenueActiveIndex];
  }, [revenueActiveIndex, revenueChartData]);

  // Calculate subtitle for orders
  const ordersSubtitle = `${dashboardData.ordersByStatus.paid + dashboardData.ordersByStatus.delivered} paid • ${dashboardData.ordersByStatus.pending} pending • ${dashboardData.ordersByStatus.delivered} completed`;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Admin Overview
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--muted-foreground)]">
            {currentTime}
          </span>
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Top Priority Metrics */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Today&apos;s Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Today's Revenue"
            value={`₵${formatCurrency(dashboardData.todayRevenue)}`}
            change={mockData.vsYesterday}
            changeType="positive"
            subtitle="Live updating"
            loading={loading}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
          <MetricCard
            title="Orders Today"
            value={dashboardData.ordersToday.toString()}
            subtitle={ordersSubtitle}
            loading={loading}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            }
          />
          <MetricCard
            title="Average Order Value"
            value={`₵${formatCurrency(dashboardData.avgOrderValue)}`}
            change={5.2}
            changeType="positive"
            loading={loading}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                />
              </svg>
            }
          />
          <MetricCard
            title="Conversion Rate"
            value={`${mockData.conversionRate}%`}
            change={-2.1}
            changeType="negative"
            subtitle="Paid ÷ Links sent"
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            }
          />
        </div>
      </section>

      {/* Quick Comparisons */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              vs. Yesterday
            </p>
            <p className="text-xl font-bold text-emerald-500">
              +{mockData.vsYesterday}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              vs. Last Week (same day)
            </p>
            <p className="text-xl font-bold text-emerald-500">
              +{mockData.vsLastWeek}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          </div>
        </div>
        <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">
              This Week vs. Last Week
            </p>
            <p className="text-xl font-bold text-emerald-500">
              +{mockData.thisWeekVsLast}%
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Revenue Overview Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Revenue Overview
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Time-based Revenue */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Time-based Revenue
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--foreground)]">
                  This Week
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  ₵{mockData.thisWeekRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--foreground)]">
                  This Month
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  ₵{mockData.thisMonthRevenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[var(--foreground)]">
                  Last 30 Days
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  ₵{mockData.last30DaysRevenue.toLocaleString()}
                </span>
              </div>
            </div>
            {/* Daily Revenue Chart */}
            <div className="mt-6">
              <div className="mb-4">
                <p className="text-xs text-[var(--muted-foreground)]">
                  Daily Revenue (Last 7 Days)
                </p>
                {revenueActiveData ? (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {revenueActiveData.day}: ₵
                    {revenueActiveData.revenue.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Hover over bars to see daily revenue
                  </p>
                )}
              </div>
              <ChartContainer
                config={revenueChartConfig}
                className="h-[200px] w-full"
              >
                <BarChart
                  accessibilityLayer
                  data={revenueChartData}
                  onMouseLeave={() => setRevenueActiveIndex(null)}
                >
                  <defs>
                    <pattern
                      id="revenue-overview-pattern-dots"
                      x="0"
                      y="0"
                      width="10"
                      height="10"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        className="dark:text-muted/40 text-muted"
                        cx="2"
                        cy="2"
                        r="1"
                        fill="currentColor"
                      />
                    </pattern>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="85%"
                    fill="url(#revenue-overview-pattern-dots)"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="text-xs"
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Bar dataKey="revenue" radius={4} fill="var(--color-revenue)">
                    {revenueChartData.map((_, index) => (
                      <Cell
                        className="duration-200"
                        key={`cell-${index}`}
                        fillOpacity={
                          revenueActiveIndex === null
                            ? 1
                            : revenueActiveIndex === index
                            ? 1
                            : 0.3
                        }
                        stroke={
                          revenueActiveIndex === index
                            ? "var(--color-revenue)"
                            : ""
                        }
                        strokeWidth={revenueActiveIndex === index ? 2 : 0}
                        onMouseEnter={() => setRevenueActiveIndex(index)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>

          {/* Revenue by Channel */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Revenue by Channel
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-[250px]">
                <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : revenueByChannelData.length > 0 ? (
              <>
                <ChartContainer
                  config={revenueByChannelConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                      data={revenueByChannelData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={30}
                      outerRadius={80}
                      cornerRadius={8}
                      paddingAngle={4}
                    >
                      <LabelList
                        dataKey="name"
                        stroke="none"
                        fontSize={10}
                        fontWeight={500}
                        fill="currentColor"
                        formatter={(value: string) => {
                          const channel = dashboardData.revenueByChannel.find(
                            (c) => c.name === value
                          );
                          return channel ? `${channel.percentage}%` : "";
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {dashboardData.revenueByChannel.map((channel, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              chartColors[i % chartColors.length],
                          }}
                        />
                        <span className="text-[var(--foreground)]">
                          {channel.name}
                        </span>
                      </div>
                      <span className="text-[var(--muted-foreground)]">
                        ₵{formatCurrency(channel.amount)} ({channel.percentage}
                        %)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-[var(--muted-foreground)]">
                No revenue data yet
              </div>
            )}
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Revenue by Payment Method
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-[250px]">
                <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : revenueByPaymentData.length > 0 ? (
              <>
                <ChartContainer
                  config={revenueByPaymentConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                      data={revenueByPaymentData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={30}
                      outerRadius={80}
                      cornerRadius={8}
                      paddingAngle={4}
                    >
                      <LabelList
                        dataKey="percentage"
                        stroke="none"
                        fontSize={12}
                        fontWeight={500}
                        fill="currentColor"
                        formatter={(value: string) => `${value}%`}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {dashboardData.revenueByPayment.map((payment, i) => {
                    const icons: Record<string, string> = {
                      "Mobile Money": "📱",
                      Card: "💳",
                      Cash: "💵",
                      "Bank Transfer": "🏦",
                    };
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {icons[payment.method] || "💰"}
                          </span>
                          <span className="text-[var(--foreground)]">
                            {payment.method}
                          </span>
                        </div>
                        <span className="text-[var(--muted-foreground)]">
                          ₵{formatCurrency(payment.amount)} (
                          {revenueByPaymentData[i]?.percentage || 0}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-[var(--muted-foreground)]">
                No revenue data yet
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Order Performance Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Order Performance
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Order Status Overview */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Order Status Overview
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-[250px]">
                <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <ChartContainer
                  config={orderStatusConfig}
                  className="mx-auto aspect-square max-h-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      content={<ChartTooltipContent nameKey="name" hideLabel />}
                    />
                    <Pie
                      data={orderStatusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={30}
                      outerRadius={80}
                      cornerRadius={8}
                      paddingAngle={4}
                    >
                      <LabelList
                        dataKey="value"
                        stroke="none"
                        fontSize={10}
                        fontWeight={500}
                        fill="currentColor"
                        formatter={(value: number) => value.toString()}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {orderStatusList.map((status, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="text-[var(--foreground)]">
                          {status.status}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-[var(--foreground)]">
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Recent Orders Table */}
          <div className="lg:col-span-3 bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                Recent Orders
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                        </div>
                      </td>
                    </tr>
                  ) : dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order, i) => (
                      <tr
                        key={i}
                        className="hover:bg-[var(--muted)] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[var(--primary)]">
                          {order.id}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {order.time}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                          {order.customer}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {order.channel}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                          ₵{formatCurrency(order.amount)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3">
                          <button className="text-[var(--primary)] hover:underline text-sm">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-8 text-center text-[var(--muted-foreground)]"
                      >
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Sales Insights Section */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
          Sales Insights
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Peak Hours Chart */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
                Peak Hours
              </h3>
              {activeData ? (
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {activeData.hour}: {activeData.orders} orders
                </p>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  Orders by hour today
                </p>
              )}
            </div>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <defs>
                  <pattern
                    id="peak-hours-pattern-dots"
                    x="0"
                    y="0"
                    width="10"
                    height="10"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      className="dark:text-muted/40 text-muted"
                      cx="2"
                      cy="2"
                      r="1"
                      fill="currentColor"
                    />
                  </pattern>
                </defs>
                <rect
                  x="0"
                  y="0"
                  width="100%"
                  height="85%"
                  fill="url(#peak-hours-pattern-dots)"
                />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) =>
                    value.replace(" AM", "").replace(" PM", "")
                  }
                  className="text-xs"
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="orders" radius={4} fill="var(--color-orders)">
                  {chartData.map((_, index) => (
                    <Cell
                      className="duration-200"
                      key={`cell-${index}`}
                      fillOpacity={
                        activeIndex === null
                          ? 1
                          : activeIndex === index
                          ? 1
                          : 0.3
                      }
                      stroke={
                        activeIndex === index ? "var(--color-orders)" : ""
                      }
                      strokeWidth={activeIndex === index ? 2 : 0}
                      onMouseEnter={() => setActiveIndex(index)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
            <p className="text-xs text-[var(--muted-foreground)] mt-4">
              Busiest:{" "}
              {mockData.peakHours.find((h) => h.orders === maxOrders)?.hour} (
              {maxOrders} orders)
            </p>
          </div>

          {/* Top Selling Items */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Top Selling Items
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-[var(--muted)] rounded animate-pulse"
                  />
                ))}
              </div>
            ) : dashboardData.topItems.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.topItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--muted)] flex items-center justify-center text-xs font-medium text-[var(--muted-foreground)]">
                        {i + 1}
                      </span>
                      <span className="text-sm text-[var(--foreground)]">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--foreground)]">
                        {item.qty} sold
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        ₵{formatCurrency(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-[var(--muted-foreground)]">
                No sales data yet
              </div>
            )}
          </div>

          {/* Failed/Abandoned Payments */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Failed/Abandoned Payments
            </h3>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-red-500">
                {mockData.failedPayments.count}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                unpaid payment links
              </p>
              <p className="text-lg font-semibold text-red-500 mt-3">
                ₵{mockData.failedPayments.lostRevenue}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                estimated lost revenue
              </p>
            </div>
            <button className="w-full mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors">
              Send Reminders
            </button>
          </div>
        </div>
      </section>

      {/* Financial Health & Operations */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Health */}
        <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Financial Health
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[var(--muted)] rounded-lg">
              <p className="text-sm text-[var(--muted-foreground)]">
                Payment Success Rate
              </p>
              <p className="text-2xl font-bold text-emerald-500">
                {mockData.paymentSuccessRate}%
              </p>
            </div>
            <div className="p-4 bg-[var(--muted)] rounded-lg">
              <p className="text-sm text-[var(--muted-foreground)]">
                Avg. Time to Payment
              </p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {mockData.avgTimeToPayment} min
              </p>
            </div>
            <div className="col-span-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Pending Payments Total
              </p>
              <p className="text-2xl font-bold text-amber-600">
                ₵{formatCurrency(dashboardData.pendingPaymentsTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Operations
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {dashboardData.deliveryAwaiting}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Awaiting Dispatch
              </p>
            </div>
            <div className="text-center p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {dashboardData.outForDelivery}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Out for Delivery
              </p>
            </div>
            <div className="text-center p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {mockData.avgDeliveryTime}m
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Avg. Delivery Time
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <span className="text-sm text-[var(--foreground)]">
                Kitchen Display
              </span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                ✅ Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <span className="text-sm text-[var(--foreground)]">
                Payment Gateway
              </span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                ✅ Active
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <span className="text-sm text-[var(--foreground)]">
                Third-party Integrations
              </span>
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                ✅ All Synced
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions & Alerts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
              <span className="text-xl">📊</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                Generate Report
              </span>
            </button>
            <button className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
              <span className="text-xl">📧</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                Email Summary
              </span>
            </button>
            <button className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
              <span className="text-xl">🔔</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                View Notifications
              </span>
            </button>
            <button className="flex items-center gap-3 p-3 rounded-lg bg-[var(--muted)] hover:bg-[var(--border)] transition-colors">
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                Settings
              </span>
            </button>
            <button className="col-span-2 flex items-center justify-center gap-3 p-3 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors">
              <span className="text-xl">📱</span>
              <span className="text-sm font-medium text-white">
                Send Bulk SMS to Customers
              </span>
            </button>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Alerts & Notifications
          </h3>
          <div className="space-y-3">
            {mockData.alerts.map((alert, i) => (
              <AlertItem key={i} type={alert.type} message={alert.message} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
