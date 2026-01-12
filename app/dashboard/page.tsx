"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, XAxis, Cell, Pie, PieChart, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Mock data for the dashboard
const mockData = {
  todayRevenue: 12450.0,
  ordersToday: 87,
  ordersPaid: 72,
  ordersPending: 10,
  ordersCompleted: 65,
  avgOrderValue: 143.1,
  conversionRate: 78.5,
  vsYesterday: 12.5,
  vsLastWeek: 8.3,
  thisWeekVsLast: 15.2,
  thisWeekRevenue: 45680.0,
  thisMonthRevenue: 156240.0,
  last30DaysRevenue: 189500.0,
  revenueByChannel: [
    { name: "Phone orders", amount: 4200, percentage: 33.7 },
    { name: "Website", amount: 3100, percentage: 24.9 },
    { name: "Social media", amount: 1850, percentage: 14.9 },
    { name: "Bolt Food", amount: 2100, percentage: 16.9 },
    { name: "Chowdeck", amount: 1200, percentage: 9.6 },
  ],
  revenueByPayment: [
    { method: "Mobile Money", amount: 6800 },
    { method: "Card", amount: 3950 },
    { method: "Cash", amount: 1700 },
  ],
  orderStatus: [
    { status: "Pending Payment", count: 5, color: "bg-amber-500" },
    { status: "Paid (awaiting kitchen)", count: 8, color: "bg-blue-500" },
    { status: "Preparing", count: 12, color: "bg-purple-500" },
    { status: "Ready for pickup/delivery", count: 4, color: "bg-cyan-500" },
    { status: "Out for delivery", count: 6, color: "bg-indigo-500" },
    { status: "Completed today", count: 52, color: "bg-emerald-500" },
  ],
  recentOrders: [
    {
      id: "#ORD-2847",
      time: "2:15 PM",
      customer: "John Doe",
      channel: "Website",
      amount: 156.0,
      status: "Preparing",
    },
    {
      id: "#ORD-2846",
      time: "2:08 PM",
      customer: "Sarah Smith",
      channel: "Bolt Food",
      amount: 89.5,
      status: "Ready",
    },
    {
      id: "#ORD-2845",
      time: "1:55 PM",
      customer: "Mike Johnson",
      channel: "Phone",
      amount: 234.0,
      status: "Delivered",
    },
    {
      id: "#ORD-2844",
      time: "1:42 PM",
      customer: "Emma Wilson",
      channel: "Chowdeck",
      amount: 67.0,
      status: "Preparing",
    },
    {
      id: "#ORD-2843",
      time: "1:30 PM",
      customer: "David Brown",
      channel: "Website",
      amount: 145.0,
      status: "Paid",
    },
    {
      id: "#ORD-2842",
      time: "1:18 PM",
      customer: "Lisa Anderson",
      channel: "Phone",
      amount: 312.0,
      status: "Completed",
    },
    {
      id: "#ORD-2841",
      time: "1:05 PM",
      customer: "James Taylor",
      channel: "Social",
      amount: 98.0,
      status: "Completed",
    },
    {
      id: "#ORD-2840",
      time: "12:52 PM",
      customer: "Amy Martinez",
      channel: "Bolt Food",
      amount: 176.0,
      status: "Completed",
    },
  ],
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
  topItems: [
    { name: "Jollof Rice with Chicken", qty: 45, revenue: 2250 },
    { name: "Fried Rice Special", qty: 38, revenue: 1900 },
    { name: "Grilled Fish Combo", qty: 32, revenue: 2240 },
    { name: "Pepper Soup", qty: 28, revenue: 840 },
    { name: "Suya Platter", qty: 24, revenue: 960 },
  ],
  failedPayments: { count: 8, lostRevenue: 1240 },
  paymentSuccessRate: 92.5,
  avgTimeToPayment: 4.2,
  pendingPaymentsTotal: 1850,
  deliveryAwaiting: 6,
  outForDelivery: 4,
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

// Daily revenue data for chart (last 7 days)
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
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{value}</p>
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
    Preparing:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    Ready: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    Delivered:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Completed:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    Pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        colors[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
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

export default function DashboardPage() {
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
  const revenueByChannelData = mockData.revenueByChannel.map((channel, i) => {
    const keys = ["phone", "website", "social", "bolt", "chowdeck"];
    return {
      name: channel.name,
      value: channel.amount,
      fill: `var(--color-${keys[i]})`,
    };
  });

  const totalPaymentRevenue = mockData.revenueByPayment.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const revenueByPaymentData = mockData.revenueByPayment.map((payment, i) => {
    const keys = ["mobile", "card", "cash"];
    return {
      name: payment.method,
      value: payment.amount,
      fill: `var(--color-${keys[i]})`,
      percentage: ((payment.amount / totalPaymentRevenue) * 100).toFixed(1),
    };
  });

  const orderStatusData = mockData.orderStatus.map((status, i) => {
    const colors = [
      "hsl(45, 93%, 47%)", // amber-500 for pending
      "hsl(217, 91%, 60%)", // blue-500 for paid
      "hsl(262, 83%, 58%)", // purple-500 for preparing
      "hsl(188, 94%, 43%)", // cyan-500 for ready
      "hsl(239, 84%, 67%)", // indigo-500 for delivery
      "hsl(142, 76%, 36%)", // emerald-500 for completed
    ];
    return {
      name: status.status,
      value: status.count,
      fill: colors[i],
    };
  });

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
  }, [activeIndex]);

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
  }, [revenueActiveIndex]);

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
            value={`₵{mockData.todayRevenue.toLocaleString()}`}
            change={mockData.vsYesterday}
            changeType="positive"
            subtitle="Live updating"
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
            value={mockData.ordersToday.toString()}
            subtitle={`${mockData.ordersPaid} paid • ${mockData.ordersPending} pending • ${mockData.ordersCompleted} completed`}
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
            value={`₵{mockData.avgOrderValue.toFixed(2)}`}
            change={5.2}
            changeType="positive"
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
                  radius={80}
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
                      const channel = mockData.revenueByChannel.find(
                        (c) => c.name === value
                      );
                      return channel ? `${channel.percentage}%` : "";
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {mockData.revenueByChannel.map((channel, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: revenueByChannelData[i].fill }}
                    />
                    <span className="text-[var(--foreground)]">
                      {channel.name}
                    </span>
                  </div>
                  <span className="text-[var(--muted-foreground)]">
                    ₵{channel.amount.toLocaleString()} ({channel.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Payment Method */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">
              Revenue by Payment Method
            </h3>
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
                  radius={80}
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
              {mockData.revenueByPayment.map((payment, i) => {
                const icons = ["📱", "💳", "💵"];
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{icons[i]}</span>
                      <span className="text-[var(--foreground)]">
                        {payment.method}
                      </span>
                    </div>
                    <span className="text-[var(--muted-foreground)]">
                      ₵{payment.amount.toLocaleString()} (
                      {revenueByPaymentData[i].percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
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
                  radius={80}
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
              {mockData.orderStatus.map((status, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: orderStatusData[i].fill }}
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
                  {mockData.recentOrders.map((order, i) => (
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
                        ₵{order.amount.toFixed(2)}
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
                  ))}
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
              Top Selling Items Today
            </h3>
            <div className="space-y-3">
              {mockData.topItems.map((item, i) => (
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
                      ₵{item.revenue}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                ₵{mockData.pendingPaymentsTotal.toLocaleString()}
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
                {mockData.deliveryAwaiting}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Awaiting Dispatch
              </p>
            </div>
            <div className="text-center p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {mockData.outForDelivery}
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
