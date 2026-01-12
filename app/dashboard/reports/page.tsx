"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, XAxis, Cell, Pie, PieChart, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Tab types
type ReportTab =
  | "sales"
  | "financial"
  | "orders"
  | "customers"
  | "menu"
  | "delivery"
  | "trends"
  | "custom";

// Mock data
const salesData = {
  totalRevenue: 45230,
  totalOrders: 856,
  avgOrderValue: 52.85,
  growth: 15.3,
  vsLastRevenue: 5890,
  vsLastOrders: 102,
  vsLastAov: 3.2,
  byChannel: [
    {
      channel: "Phone",
      orders: 245,
      revenue: 12450,
      avgOrder: 50.82,
      percentage: 27.5,
    },
    {
      channel: "Website",
      orders: 310,
      revenue: 18600,
      avgOrder: 60.0,
      percentage: 41.1,
    },
    {
      channel: "Social Media",
      orders: 156,
      revenue: 7020,
      avgOrder: 45.0,
      percentage: 15.5,
    },
    {
      channel: "Bolt Food",
      orders: 98,
      revenue: 4900,
      avgOrder: 50.0,
      percentage: 10.8,
    },
    {
      channel: "Chowdeck",
      orders: 47,
      revenue: 2260,
      avgOrder: 48.09,
      percentage: 5.0,
    },
  ],
  byPayment: [
    { method: "Mobile Money", orders: 512, revenue: 27138, percentage: 60.0 },
    { method: "Card", orders: 298, revenue: 15769, percentage: 34.9 },
    { method: "Cash", orders: 46, revenue: 2323, percentage: 5.1 },
  ],
  dailyPerformance: [
    {
      date: "Jan 1 (Wed)",
      orders: 28,
      revenue: 1456,
      avgOrder: 52.0,
      change: 5.2,
    },
    {
      date: "Jan 2 (Thu)",
      orders: 32,
      revenue: 1680,
      avgOrder: 52.5,
      change: 15.4,
    },
    {
      date: "Jan 3 (Fri)",
      orders: 45,
      revenue: 2475,
      avgOrder: 55.0,
      change: 47.3,
    },
    {
      date: "Jan 4 (Sat)",
      orders: 52,
      revenue: 2860,
      avgOrder: 55.0,
      change: 15.6,
    },
    {
      date: "Jan 5 (Sun)",
      orders: 38,
      revenue: 1976,
      avgOrder: 52.0,
      change: -30.9,
    },
    {
      date: "Jan 6 (Mon)",
      orders: 25,
      revenue: 1300,
      avgOrder: 52.0,
      change: -34.2,
    },
    {
      date: "Jan 7 (Tue)",
      orders: 30,
      revenue: 1590,
      avgOrder: 53.0,
      change: 22.3,
    },
  ],
  peakHours: [
    { hour: "11:00-12:00", orders: 45, revenue: 2340, percentage: 8.7 },
    {
      hour: "12:00-13:00",
      orders: 98,
      revenue: 5390,
      percentage: 20.0,
      isPeak: true,
    },
    { hour: "13:00-14:00", orders: 87, revenue: 4785, percentage: 17.8 },
    { hour: "14:00-15:00", orders: 52, revenue: 2704, percentage: 10.0 },
    { hour: "18:00-19:00", orders: 76, revenue: 4180, percentage: 15.5 },
    { hour: "19:00-20:00", orders: 89, revenue: 4891, percentage: 18.2 },
    { hour: "20:00-21:00", orders: 54, revenue: 2970, percentage: 11.0 },
  ],
  hourlyPerformance: [
    { time: "9 AM", revenue: 120, orders: 2 },
    { time: "10 AM", revenue: 280, orders: 5 },
    { time: "11 AM", revenue: 450, orders: 8 },
    { time: "12 PM", revenue: 890, orders: 15 },
    { time: "1 PM", revenue: 1240, orders: 22 },
    { time: "2 PM", revenue: 980, orders: 18 },
    { time: "3 PM", revenue: 650, orders: 12 },
    { time: "4 PM", revenue: 420, orders: 7 },
    { time: "5 PM", revenue: 560, orders: 10 },
    { time: "6 PM", revenue: 780, orders: 14 },
    { time: "7 PM", revenue: 1120, orders: 20 },
    { time: "8 PM", revenue: 950, orders: 17 },
    { time: "9 PM", revenue: 680, orders: 12 },
    { time: "10 PM", revenue: 340, orders: 6 },
  ],
  monthlyPerformance: [
    { date: "Jan 1", revenue: 1456, orders: 28 },
    { date: "Jan 2", revenue: 1680, orders: 32 },
    { date: "Jan 3", revenue: 2475, orders: 45 },
    { date: "Jan 4", revenue: 2860, orders: 52 },
    { date: "Jan 5", revenue: 1976, orders: 38 },
    { date: "Jan 6", revenue: 1300, orders: 25 },
    { date: "Jan 7", revenue: 1590, orders: 30 },
    { date: "Jan 8", revenue: 1820, orders: 35 },
    { date: "Jan 9", revenue: 2100, orders: 40 },
    { date: "Jan 10", revenue: 1950, orders: 37 },
    { date: "Jan 11", revenue: 2250, orders: 42 },
    { date: "Jan 12", revenue: 2400, orders: 45 },
    { date: "Jan 13", revenue: 2180, orders: 41 },
    { date: "Jan 14", revenue: 2650, orders: 48 },
    { date: "Jan 15", revenue: 2800, orders: 52 },
    { date: "Jan 16", revenue: 1950, orders: 37 },
    { date: "Jan 17", revenue: 2100, orders: 40 },
    { date: "Jan 18", revenue: 2350, orders: 44 },
    { date: "Jan 19", revenue: 2500, orders: 47 },
    { date: "Jan 20", revenue: 2750, orders: 51 },
    { date: "Jan 21", revenue: 2900, orders: 54 },
    { date: "Jan 22", revenue: 2200, orders: 42 },
    { date: "Jan 23", revenue: 2400, orders: 45 },
    { date: "Jan 24", revenue: 2600, orders: 48 },
    { date: "Jan 25", revenue: 2800, orders: 52 },
    { date: "Jan 26", revenue: 3000, orders: 56 },
    { date: "Jan 27", revenue: 2850, orders: 53 },
    { date: "Jan 28", revenue: 2700, orders: 50 },
    { date: "Jan 29", revenue: 2550, orders: 47 },
    { date: "Jan 30", revenue: 2400, orders: 45 },
    { date: "Jan 31", revenue: 2600, orders: 48 },
  ],
};

const ordersData = {
  total: 856,
  completed: 812,
  completedRate: 94.9,
  cancelled: 44,
  cancelledRate: 5.1,
  avgTime: 38,
  funnel: [
    { stage: "Payment Links Sent", count: 1024, percentage: 100 },
    { stage: "Payment Completed", count: 856, percentage: 83.6 },
    { stage: "Sent to Kitchen", count: 856, percentage: 100 },
    { stage: "Marked as Ready", count: 842, percentage: 98.4 },
    { stage: "Dispatched", count: 842, percentage: 100 },
    { stage: "Delivered", count: 812, percentage: 96.4 },
  ],
  byStatus: [
    {
      status: "Pending Payment",
      count: 15,
      percentage: 1.8,
      avgTime: "18 mins",
    },
    { status: "Paid", count: 8, percentage: 0.9, avgTime: "5 mins" },
    { status: "Preparing", count: 12, percentage: 1.4, avgTime: "23 mins" },
    { status: "Ready", count: 5, percentage: 0.6, avgTime: "8 mins" },
    { status: "Dispatched", count: 4, percentage: 0.5, avgTime: "35 mins" },
    { status: "Delivered", count: 812, percentage: 94.9, avgTime: "-" },
  ],
  cancellationReasons: [
    { reason: "Payment Failed", count: 18, percentage: 40.9 },
    { reason: "Customer Cancelled", count: 12, percentage: 27.3 },
    { reason: "Out of Stock", count: 8, percentage: 18.2 },
    { reason: "Delivery Issue", count: 4, percentage: 9.1 },
    { reason: "System Error", count: 2, percentage: 4.5 },
  ],
  valueDistribution: [
    { range: "₵0 - ₵20", orders: 56, revenue: 890, percentage: 6.5 },
    { range: "₵21 - ₵40", orders: 234, revenue: 8190, percentage: 27.3 },
    { range: "₵41 - ₵60", orders: 398, revenue: 21890, percentage: 46.5 },
    { range: "₵61 - ₵80", orders: 132, revenue: 9240, percentage: 15.4 },
    { range: "₵81 - ₵100", orders: 28, revenue: 2520, percentage: 3.3 },
    { range: "₵100+", orders: 8, revenue: 2500, percentage: 0.9 },
  ],
};

const customerData = {
  newCustomers: 84,
  repeatRate: 67,
  churnRate: 12,
  avgLifetimeValue: 156,
  vsLastNew: 15,
  vsLastRepeat: 3,
  vsLastChurn: -2,
  vsLastLtv: 12,
  segments: [
    {
      segment: "VIP (6+ orders)",
      customers: 82,
      orders: 512,
      revenue: 28672,
      avgOrder: 56.0,
      revenuePercent: 63.4,
    },
    {
      segment: "Regular (2-5)",
      customers: 180,
      orders: 289,
      revenue: 13572,
      avgOrder: 46.96,
      revenuePercent: 30.0,
    },
    {
      segment: "New (1 order)",
      customers: 245,
      orders: 55,
      revenue: 2986,
      avgOrder: 54.29,
      revenuePercent: 6.6,
    },
  ],
  cohortRetention: [
    {
      cohort: "Nov 2025",
      month1: 100,
      month2: 73,
      month3: 54,
      month4: 42,
      month5: 38,
    },
    {
      cohort: "Dec 2025",
      month1: 100,
      month2: 68,
      month3: 48,
      month4: 35,
      month5: null,
    },
    {
      cohort: "Jan 2026",
      month1: 100,
      month2: 71,
      month3: null,
      month4: null,
      month5: null,
    },
  ],
  frequency: [
    { frequency: "Weekly", customers: 34, percentage: 6.7 },
    { frequency: "Bi-weekly", customers: 78, percentage: 15.4 },
    { frequency: "Monthly", customers: 198, percentage: 39.1 },
    { frequency: "Quarterly", customers: 145, percentage: 28.6 },
    { frequency: "One-time only", customers: 52, percentage: 10.3 },
  ],
};

const menuData = {
  topItems: [
    {
      rank: 1,
      name: "Jollof Rice",
      orders: 312,
      quantity: 456,
      revenue: 9120,
      percentage: 20.2,
    },
    {
      rank: 2,
      name: "Fried Chicken",
      orders: 298,
      quantity: 412,
      revenue: 8240,
      percentage: 18.2,
    },
    {
      rank: 3,
      name: "Beef Suya",
      orders: 234,
      quantity: 345,
      revenue: 6900,
      percentage: 15.3,
    },
    {
      rank: 4,
      name: "Plantain",
      orders: 456,
      quantity: 678,
      revenue: 3390,
      percentage: 7.5,
    },
    {
      rank: 5,
      name: "Egusi Soup",
      orders: 189,
      quantity: 234,
      revenue: 4680,
      percentage: 10.3,
    },
  ],
  profitability: [
    {
      item: "Jollof Rice",
      sold: 456,
      revenue: 9120,
      cost: 2736,
      profit: 6384,
      margin: 70,
    },
    {
      item: "Fried Chicken",
      sold: 412,
      revenue: 8240,
      cost: 3296,
      profit: 4944,
      margin: 60,
    },
    {
      item: "Beef Suya",
      sold: 345,
      revenue: 6900,
      cost: 2760,
      profit: 4140,
      margin: 60,
    },
    {
      item: "Plantain",
      sold: 678,
      revenue: 3390,
      cost: 509,
      profit: 2881,
      margin: 85,
    },
    {
      item: "Drinks",
      sold: 789,
      revenue: 3945,
      cost: 986,
      profit: 2959,
      margin: 75,
    },
  ],
  trends: [
    { item: "Jollof Rice", thisMonth: 456, lastMonth: 398, change: 14.6 },
    { item: "Fried Chicken", thisMonth: 412, lastMonth: 435, change: -5.3 },
    { item: "Beef Suya", thisMonth: 345, lastMonth: 312, change: 10.6 },
    { item: "Egusi Soup", thisMonth: 234, lastMonth: 216, change: 8.3 },
    { item: "Fried Rice", thisMonth: 189, lastMonth: 206, change: -8.3 },
  ],
  categories: [
    {
      category: "Main Dishes",
      items: 12,
      orders: 856,
      revenue: 32450,
      percentage: 71.7,
    },
    {
      category: "Sides",
      items: 8,
      orders: 1234,
      revenue: 6780,
      percentage: 15.0,
    },
    {
      category: "Drinks",
      items: 15,
      orders: 789,
      revenue: 3945,
      percentage: 8.7,
    },
    {
      category: "Desserts",
      items: 5,
      orders: 123,
      revenue: 2055,
      percentage: 4.5,
    },
  ],
};

const deliveryData = {
  totalDeliveries: 745,
  avgTime: 35,
  onTimeRate: 89,
  successRate: 96.4,
  byMethod: [
    {
      method: "Self Delivery",
      orders: 412,
      avgTime: 32,
      cost: 5.0,
      successRate: 98.5,
    },
    { method: "Yango", orders: 234, avgTime: 38, cost: 7.5, successRate: 95.2 },
    {
      method: "Bolt Food",
      orders: 98,
      avgTime: 35,
      cost: 0,
      successRate: 94.9,
    },
    { method: "Chowdeck", orders: 47, avgTime: 40, cost: 0, successRate: 93.6 },
  ],
  timeDistribution: [
    { range: "0-20 mins", orders: 45, percentage: 6.0, rating: 5 },
    { range: "21-30 mins", orders: 234, percentage: 31.4, rating: 5 },
    { range: "31-40 mins", orders: 312, percentage: 41.9, rating: 4 },
    { range: "41-60 mins", orders: 123, percentage: 16.5, rating: 3 },
    { range: "60+ mins", orders: 31, percentage: 4.2, rating: 2 },
  ],
  issues: [
    {
      issue: "Delayed (>60 min)",
      count: 31,
      percentage: 4.2,
      resolution: "Discount applied",
    },
    {
      issue: "Wrong Address",
      count: 8,
      percentage: 1.1,
      resolution: "Reshipped",
    },
    {
      issue: "Customer Unavailable",
      count: 5,
      percentage: 0.7,
      resolution: "Returned",
    },
    {
      issue: "Food Spilled",
      count: 3,
      percentage: 0.4,
      resolution: "Refunded",
    },
    { issue: "Other", count: 4, percentage: 0.5, resolution: "Case-by-case" },
  ],
  riderPerformance: [
    { name: "James A.", deliveries: 145, avgTime: 28, onTime: 95, rating: 4.8 },
    { name: "Sarah K.", deliveries: 123, avgTime: 32, onTime: 92, rating: 4.7 },
    { name: "Mike O.", deliveries: 98, avgTime: 35, onTime: 88, rating: 4.5 },
    { name: "David L.", deliveries: 46, avgTime: 38, onTime: 85, rating: 4.3 },
  ],
};

function SummaryCard({
  title,
  value,
  subtitle,
  change,
  changeType,
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  changeType?: "positive" | "negative";
}) {
  return (
    <div className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)]">
      <p className="text-sm text-[var(--muted-foreground)]">{title}</p>
      <p className="text-2xl font-bold text-[var(--foreground)] mt-1">
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {subtitle}
        </p>
      )}
      {change !== undefined && (
        <p
          className={`text-xs mt-1 ${
            changeType === "positive"
              ? "text-emerald-600"
              : changeType === "negative"
              ? "text-red-600"
              : "text-[var(--muted-foreground)]"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change}%{" "}
          {changeType === "positive"
            ? "↑"
            : changeType === "negative"
            ? "↓"
            : ""}
        </p>
      )}
    </div>
  );
}

function DataTable({
  headers,
  data,
  className = "",
}: {
  headers: string[];
  data: (string | number | React.ReactNode)[][];
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full">
        <thead className="bg-[var(--muted)]">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[var(--muted)] transition-colors">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-4 py-3 text-sm text-[var(--foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProgressBar({
  value,
  max,
  color = "bg-[var(--primary)]",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  return (
    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full transition-all`}
        style={{ width: `${(value / max) * 100}%` }}
      />
    </div>
  );
}

function SimpleBarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number; highlight?: boolean }[];
  maxValue: number;
}) {
  return (
    <div className="flex items-end justify-between h-32 gap-1">
      {data.map((item, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t transition-all ${
              item.highlight ? "bg-[var(--primary)]" : "bg-[var(--primary)]/50"
            }`}
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          />
          <span className="text-[8px] text-[var(--muted-foreground)] whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// Sales Report Component
function SalesReports() {
  const [dateRange, setDateRange] = useState("This Month");
  const [groupBy, setGroupBy] = useState("Day");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Get chart data based on date range
  const { chartData, chartTitle, xAxisKey, xAxisFormatter } = useMemo(() => {
    if (dateRange === "Today" || dateRange === "Yesterday") {
      // Hourly data for today/yesterday
      return {
        chartData: salesData.hourlyPerformance.map((h) => ({
          label: h.time,
          fullLabel: h.time,
          revenue: h.revenue,
        })),
        chartTitle: `Revenue Trend (${dateRange} - By Hour)`,
        xAxisKey: "label",
        xAxisFormatter: (value: string) => value,
      };
    } else if (dateRange === "This Week" || dateRange === "Last 7 days") {
      // Daily data for this week
      return {
        chartData: salesData.dailyPerformance.map((d) => ({
          label: d.date.split(" ")[0],
          fullLabel: d.date,
          revenue: d.revenue,
        })),
        chartTitle: "Revenue Trend (Last 7 Days)",
        xAxisKey: "label",
        xAxisFormatter: (value: string) => value,
      };
    } else if (dateRange === "This Month" || dateRange === "Last 30 Days") {
      // Daily data for month
      return {
        chartData: salesData.monthlyPerformance.map((d) => ({
          label: d.date,
          fullLabel: d.date,
          revenue: d.revenue,
        })),
        chartTitle: `Revenue Trend (${dateRange} - By Day)`,
        xAxisKey: "label",
        xAxisFormatter: (value: string) => value,
      };
    } else {
      // Default to daily performance
      return {
        chartData: salesData.dailyPerformance.map((d) => ({
          label: d.date.split(" ")[0],
          fullLabel: d.date,
          revenue: d.revenue,
        })),
        chartTitle: "Revenue Trend",
        xAxisKey: "label",
        xAxisFormatter: (value: string) => value,
      };
    }
  }, [dateRange]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return chartData[activeIndex];
  }, [activeIndex, chartData]);

  // Pie chart configs and data for Sales Reports
  const revenueByChannelConfig = {
    revenue: { label: "Revenue" },
    phone: { label: "Phone", color: "var(--chart-1)" },
    website: { label: "Website", color: "var(--chart-2)" },
    social: { label: "Social Media", color: "var(--chart-3)" },
    bolt: { label: "Bolt Food", color: "var(--chart-4)" },
    chowdeck: { label: "Chowdeck", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const revenueByChannelData = salesData.byChannel.map((channel, i) => {
    const keys = ["phone", "website", "social", "bolt", "chowdeck"];
    return {
      name: channel.channel,
      value: channel.revenue,
      fill: `var(--color-${keys[i]})`,
      percentage: channel.percentage,
    };
  });

  const revenueByPaymentConfig = {
    revenue: { label: "Revenue" },
    mobile: { label: "Mobile Money", color: "var(--chart-1)" },
    card: { label: "Card", color: "var(--chart-2)" },
    cash: { label: "Cash", color: "var(--chart-3)" },
  } satisfies ChartConfig;

  const revenueByPaymentData = salesData.byPayment.map((payment, i) => {
    const keys = ["mobile", "card", "cash"];
    return {
      name: payment.method,
      value: payment.revenue,
      fill: `var(--color-${keys[i]})`,
      percentage: payment.percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Generate Sales Report
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
              <option>Custom Range</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Group By
            </label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option>Hour</option>
              <option>Day</option>
              <option>Week</option>
              <option>Month</option>
            </select>
          </div>
          <div className="col-span-2 flex items-end gap-2">
            <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
              📧 Schedule Email
            </button>
            <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
              📥 Export
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Revenue"
          value={`₵{salesData.totalRevenue.toLocaleString()}`}
          subtitle={`+₵{salesData.vsLastRevenue.toLocaleString()} vs last month`}
          change={salesData.growth}
          changeType="positive"
        />
        <SummaryCard
          title="Total Orders"
          value={salesData.totalOrders.toLocaleString()}
          subtitle={`+${salesData.vsLastOrders} vs last month`}
          change={13.5}
          changeType="positive"
        />
        <SummaryCard
          title="Avg Order Value"
          value={`₵{salesData.avgOrderValue.toFixed(2)}`}
          subtitle={`+₵{salesData.vsLastAov.toFixed(2)} vs last month`}
          change={6.4}
          changeType="positive"
        />
        <SummaryCard
          title="Growth"
          value={`${salesData.growth}%`}
          subtitle="Month over month"
          change={salesData.growth}
          changeType="positive"
        />
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            {chartTitle}
          </h3>
          {activeData ? (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {activeData.fullLabel}: ₵{activeData.revenue.toLocaleString()}
            </p>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {dateRange === "Today" || dateRange === "Yesterday"
                ? "Hourly revenue breakdown"
                : dateRange === "This Week" || dateRange === "Last 7 days"
                ? "Daily revenue over the past week"
                : "Daily revenue breakdown"}
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
                id="revenue-trend-pattern-dots"
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
              fill="url(#revenue-trend-pattern-dots)"
            />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-xs"
              tickFormatter={xAxisFormatter}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="revenue" radius={4} fill="var(--color-revenue)">
              {chartData.map((_, index) => (
                <Cell
                  className="duration-200"
                  key={`cell-${index}`}
                  fillOpacity={
                    activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                  }
                  stroke={activeIndex === index ? "var(--color-revenue)" : ""}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  onMouseEnter={() => setActiveIndex(index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>

      {/* Revenue by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
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
                  dataKey="percentage"
                  stroke="none"
                  fontSize={10}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {salesData.byChannel.map((channel, i) => (
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
                    {channel.channel}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--muted-foreground)]">
                    ₵{channel.revenue.toLocaleString()}
                  </span>
                  <span className="text-[var(--muted-foreground)] w-12 text-right">
                    {channel.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
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
                  formatter={(value: number) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {salesData.byPayment.map((payment, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: revenueByPaymentData[i].fill }}
                  />
                  <span className="text-[var(--foreground)]">
                    {payment.method}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--muted-foreground)]">
                    ₵{payment.revenue.toLocaleString()}
                  </span>
                  <span className="text-[var(--muted-foreground)] w-12 text-right">
                    {payment.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Hours */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Peak Hours Analysis
          </h3>
        </div>
        <DataTable
          headers={["Hour", "Orders", "Revenue", "% of Daily"]}
          data={salesData.peakHours.map((h) => [
            <span key={h.hour} className="flex items-center gap-2">
              {h.hour}
              {h.isPeak && (
                <span className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded">
                  Peak
                </span>
              )}
            </span>,
            h.orders,
            `₵{h.revenue.toLocaleString()}`,
            <div key={`bar-${h.hour}`} className="flex items-center gap-2">
              <ProgressBar
                value={h.percentage}
                max={25}
                color={h.isPeak ? "bg-amber-500" : "bg-[var(--primary)]"}
              />
              <span className="text-xs">{h.percentage}%</span>
            </div>,
          ])}
        />
      </div>

      {/* Day-by-Day Performance */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Day-by-Day Performance
          </h3>
        </div>
        <DataTable
          headers={[
            "Date",
            "Orders",
            "Revenue",
            "Avg Order",
            "vs Previous Day",
          ]}
          data={salesData.dailyPerformance.map((d) => [
            d.date,
            d.orders,
            `₵{d.revenue.toLocaleString()}`,
            `₵{d.avgOrder.toFixed(2)}`,
            <span
              key={d.date}
              className={d.change >= 0 ? "text-emerald-600" : "text-red-600"}
            >
              {d.change >= 0 ? "+" : ""}
              {d.change.toFixed(1)}% {d.change >= 0 ? "↑" : "↓"}
            </span>,
          ])}
        />
      </div>
    </div>
  );
}

// Orders Report Component
function OrdersReports() {
  // Pie chart configs and data for Orders Reports
  const orderStatusConfig = {
    orders: { label: "Orders" },
    pending: { label: "Pending Payment", color: "hsl(45, 93%, 47%)" },
    paid: { label: "Paid", color: "hsl(217, 91%, 60%)" },
    preparing: { label: "Preparing", color: "hsl(262, 83%, 58%)" },
    ready: { label: "Ready", color: "hsl(188, 94%, 43%)" },
    dispatched: { label: "Dispatched", color: "hsl(239, 84%, 67%)" },
    delivered: { label: "Delivered", color: "hsl(142, 76%, 36%)" },
  } satisfies ChartConfig;

  const orderStatusData = ordersData.byStatus.map((status, i) => {
    const colors = [
      "hsl(45, 93%, 47%)", // amber-500 for pending
      "hsl(217, 91%, 60%)", // blue-500 for paid
      "hsl(262, 83%, 58%)", // purple-500 for preparing
      "hsl(188, 94%, 43%)", // cyan-500 for ready
      "hsl(239, 84%, 67%)", // indigo-500 for dispatched
      "hsl(142, 76%, 36%)", // emerald-500 for delivered
    ];
    return {
      name: status.status,
      value: status.count,
      fill: colors[i],
      percentage: status.percentage,
    };
  });

  const cancellationConfig = {
    cancellations: { label: "Cancellations" },
    payment: { label: "Payment Failed", color: "var(--chart-1)" },
    customer: { label: "Customer Cancelled", color: "var(--chart-2)" },
    stock: { label: "Out of Stock", color: "var(--chart-3)" },
    delivery: { label: "Delivery Issue", color: "var(--chart-4)" },
    system: { label: "System Error", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const cancellationData = ordersData.cancellationReasons.map((reason, i) => {
    const keys = ["payment", "customer", "stock", "delivery", "system"];
    return {
      name: reason.reason,
      value: reason.count,
      fill: `var(--color-${keys[i]})`,
      percentage: reason.percentage,
    };
  });

  const orderValueConfig = {
    orders: { label: "Orders" },
    range1: { label: "₵0 - ₵20", color: "var(--chart-1)" },
    range2: { label: "₵21 - ₵40", color: "var(--chart-2)" },
    range3: { label: "₵41 - ₵60", color: "var(--chart-3)" },
    range4: { label: "₵61 - ₵80", color: "var(--chart-4)" },
    range5: { label: "₵81 - ₵100", color: "var(--chart-5)" },
    range6: { label: "₵100+", color: "hsl(45, 93%, 47%)" },
  } satisfies ChartConfig;

  const orderValueData = ordersData.valueDistribution.map((range, i) => {
    const keys = ["range1", "range2", "range3", "range4", "range5", "range6"];
    // range6 (₵100+) uses direct HSL color (amber), others use CSS variables
    const fillColor = i === 5 ? "hsl(45, 93%, 47%)" : `var(--color-${keys[i]})`;
    return {
      name: range.range,
      value: range.orders,
      fill: fillColor,
      percentage: range.percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Orders"
          value={ordersData.total.toLocaleString()}
        />
        <SummaryCard
          title="Completed"
          value={`${ordersData.completed} (${ordersData.completedRate}%)`}
          change={2.1}
          changeType="positive"
        />
        <SummaryCard
          title="Cancelled"
          value={`${ordersData.cancelled} (${ordersData.cancelledRate}%)`}
          change={-0.5}
          changeType="positive"
        />
        <SummaryCard title="Avg Time" value={`${ordersData.avgTime} mins`} />
      </div>

      {/* Order Funnel */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Order Funnel Analysis
        </h3>
        <div className="space-y-3">
          {ordersData.funnel.map((stage, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-40 text-sm text-[var(--foreground)]">
                {stage.stage}
              </div>
              <div className="flex-1">
                <ProgressBar
                  value={stage.percentage}
                  max={100}
                  color={
                    stage.percentage === 100
                      ? "bg-emerald-500"
                      : "bg-[var(--primary)]"
                  }
                />
              </div>
              <div className="w-24 text-right">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {stage.count}
                </span>
                <span className="text-xs text-[var(--muted-foreground)] ml-1">
                  ({stage.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            <strong>Drop-off Points:</strong> 168 customers (16.4%) didn&apos;t
            complete payment • 30 orders (3.6%) had delivery issues
          </p>
        </div>
      </div>

      {/* Orders by Status & Cancellation Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Orders by Status
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
            {ordersData.byStatus.map((status, i) => (
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
                <div className="flex items-center gap-3">
                  <span className="text-[var(--foreground)]">
                    {status.count}
                  </span>
                  <span className="text-[var(--muted-foreground)] w-12 text-right">
                    {status.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Cancellation Reasons
          </h3>
          <ChartContainer
            config={cancellationConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={cancellationData}
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
                  fontSize={10}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {ordersData.cancellationReasons.map((reason, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cancellationData[i].fill }}
                  />
                  <span className="text-[var(--foreground)]">
                    {reason.reason}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--foreground)]">
                    {reason.count}
                  </span>
                  <span className="text-[var(--muted-foreground)] w-12 text-right">
                    {reason.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 border-t border-[var(--border)] bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-xs text-red-700 dark:text-red-300">
              Lost Revenue: <strong>₵2,145</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Order Value Distribution */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Order Value Distribution
        </h3>
        <ChartContainer
          config={orderValueConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={orderValueData}
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
                fontSize={10}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {ordersData.valueDistribution.map((range, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: orderValueData[i].fill }}
                />
                <span className="text-[var(--foreground)]">{range.range}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--foreground)]">
                  {range.orders} orders
                </span>
                <span className="text-[var(--muted-foreground)] w-12 text-right">
                  {range.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 border-t border-[var(--border)] bg-[var(--muted)] rounded">
          <p className="text-xs text-[var(--foreground)]">
            Average: <strong>₵52.85</strong> • Median: <strong>₵51.00</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

// Customer Reports Component
function CustomerReports() {
  // Pie chart configs and data for Customer Reports
  const customerSegmentsConfig = {
    revenue: { label: "Revenue" },
    vip: { label: "VIP (6+ orders)", color: "hsl(45, 93%, 47%)" },
    regular: { label: "Regular (2-5)", color: "var(--chart-1)" },
    new: { label: "New (1 order)", color: "var(--chart-2)" },
  } satisfies ChartConfig;

  const customerSegmentsData = customerData.segments.map((segment, i) => {
    const keys = ["vip", "regular", "new"];
    // VIP uses direct HSL color (amber), others use CSS variables
    const fillColor = i === 0 ? "hsl(45, 93%, 47%)" : `var(--color-${keys[i]})`;
    return {
      name: segment.segment,
      value: segment.revenue,
      fill: fillColor,
      percentage: segment.revenuePercent,
    };
  });

  const orderFrequencyConfig = {
    customers: { label: "Customers" },
    weekly: { label: "Weekly", color: "var(--chart-1)" },
    biweekly: { label: "Bi-weekly", color: "var(--chart-2)" },
    monthly: { label: "Monthly", color: "var(--chart-3)" },
    quarterly: { label: "Quarterly", color: "var(--chart-4)" },
    onetime: { label: "One-time only", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const orderFrequencyData = customerData.frequency.map((freq, i) => {
    const keys = ["weekly", "biweekly", "monthly", "quarterly", "onetime"];
    return {
      name: freq.frequency,
      value: freq.customers,
      fill: `var(--color-${keys[i]})`,
      percentage: freq.percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="New Customers"
          value={customerData.newCustomers.toString()}
          change={customerData.vsLastNew}
          changeType="positive"
          subtitle="This month"
        />
        <SummaryCard
          title="Repeat Rate"
          value={`${customerData.repeatRate}%`}
          change={customerData.vsLastRepeat}
          changeType="positive"
        />
        <SummaryCard
          title="Churn Rate"
          value={`${customerData.churnRate}%`}
          change={customerData.vsLastChurn}
          changeType="positive"
        />
        <SummaryCard
          title="Avg Lifetime Value"
          value={`$${customerData.avgLifetimeValue}`}
          change={8}
          changeType="positive"
        />
      </div>

      {/* Customer Segments */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Customer Segments Performance
        </h3>
        <ChartContainer
          config={customerSegmentsConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={customerSegmentsData}
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
                fontSize={10}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {customerData.segments.map((segment, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: customerSegmentsData[i].fill }}
                />
                <span className="text-[var(--foreground)]">
                  {segment.segment}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--muted-foreground)]">
                  ₵{segment.revenue.toLocaleString()}
                </span>
                <span className="text-[var(--muted-foreground)] w-12 text-right">
                  {segment.revenuePercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 border-t border-[var(--border)] bg-amber-50 dark:bg-amber-900/20 rounded">
          <p className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Key Insight:</strong> VIP customers (16% of base) generate
            63% of revenue
          </p>
        </div>
      </div>

      {/* Cohort Retention */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Customer Retention Cohort Analysis
          </h3>
        </div>
        <DataTable
          headers={[
            "Cohort",
            "Month 1",
            "Month 2",
            "Month 3",
            "Month 4",
            "Month 5",
          ]}
          data={customerData.cohortRetention.map((c) => [
            c.cohort,
            `${c.month1}%`,
            c.month2 ? `${c.month2}%` : "-",
            c.month3 ? `${c.month3}%` : "-",
            c.month4 ? `${c.month4}%` : "-",
            c.month5 ? `${c.month5}%` : "-",
          ])}
        />
        <div className="p-4 border-t border-[var(--border)] bg-[var(--muted)]">
          <p className="text-sm text-[var(--foreground)]">
            Average Month 2 Retention: <strong>71%</strong> • Average Month 3
            Retention: <strong>51%</strong>
          </p>
        </div>
      </div>

      {/* Order Frequency */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Customer Order Frequency
        </h3>
        <ChartContainer
          config={orderFrequencyConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={orderFrequencyData}
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
                fontSize={10}
                fontWeight={500}
                fill="currentColor"
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {customerData.frequency.map((freq, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: orderFrequencyData[i].fill }}
                />
                <span className="text-[var(--foreground)]">
                  {freq.frequency}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--foreground)]">
                  {freq.customers} customers
                </span>
                <span className="text-[var(--muted-foreground)] w-12 text-right">
                  {freq.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Menu Reports Component
function MenuReports() {
  // Pie chart config and data for Menu Category Performance
  const menuCategoryConfig = {
    revenue: { label: "Revenue" },
    main: { label: "Main Dishes", color: "var(--chart-1)" },
    sides: { label: "Sides", color: "var(--chart-2)" },
    drinks: { label: "Drinks", color: "var(--chart-3)" },
    desserts: { label: "Desserts", color: "var(--chart-4)" },
  } satisfies ChartConfig;

  const menuCategoryData = menuData.categories.map((category, i) => {
    const keys = ["main", "sides", "drinks", "desserts"];
    return {
      name: category.category,
      value: category.revenue,
      fill: `var(--color-${keys[i]})`,
      percentage: category.percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Selling Items */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Top Selling Items
          </h3>
        </div>
        <DataTable
          headers={[
            "Rank",
            "Item Name",
            "Orders",
            "Quantity",
            "Revenue",
            "% of Total",
          ]}
          data={menuData.topItems.map((item) => [
            <span
              key={item.rank}
              className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs font-bold"
            >
              {item.rank}
            </span>,
            item.name,
            item.orders,
            item.quantity,
            `$${item.revenue.toLocaleString()}`,
            <div key={item.name} className="flex items-center gap-2">
              <ProgressBar value={item.percentage} max={25} />
              <span className="text-xs">{item.percentage}%</span>
            </div>,
          ])}
        />
      </div>

      {/* Profitability Analysis */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Item Profitability Analysis
          </h3>
        </div>
        <DataTable
          headers={["Item", "Sold", "Revenue", "Cost", "Profit", "Margin"]}
          data={menuData.profitability.map((item) => [
            item.item,
            item.sold,
            `$${item.revenue.toLocaleString()}`,
            `$${item.cost.toLocaleString()}`,
            `$${item.profit.toLocaleString()}`,
            <span
              key={item.item}
              className={`px-2 py-1 rounded text-xs font-medium ${
                item.margin >= 70
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {item.margin}%
            </span>,
          ])}
        />
      </div>

      {/* Menu Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Menu Item Trends
            </h3>
          </div>
          <DataTable
            headers={["Item", "This Month", "Last Month", "Change"]}
            data={menuData.trends.map((item) => [
              item.item,
              item.thisMonth,
              item.lastMonth,
              <span
                key={item.item}
                className={
                  item.change >= 0 ? "text-emerald-600" : "text-red-600"
                }
              >
                {item.change >= 0 ? "+" : ""}
                {item.change}% {item.change >= 0 ? "↑" : "↓"}
              </span>,
            ])}
          />
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
            Menu Mix Analysis
          </h3>
          <ChartContainer
            config={menuCategoryConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="name" hideLabel />}
              />
              <Pie
                data={menuCategoryData}
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
                  fontSize={10}
                  fontWeight={500}
                  fill="currentColor"
                  formatter={(value: number) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {menuData.categories.map((category, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: menuCategoryData[i].fill }}
                  />
                  <span className="text-[var(--foreground)]">
                    {category.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--muted-foreground)]">
                    ₵{category.revenue.toLocaleString()}
                  </span>
                  <span className="text-[var(--muted-foreground)] w-12 text-right">
                    {category.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Delivery Reports Component
function DeliveryReports() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Deliveries"
          value={deliveryData.totalDeliveries.toLocaleString()}
        />
        <SummaryCard title="Avg Time" value={`${deliveryData.avgTime} mins`} />
        <SummaryCard
          title="On-Time Rate"
          value={`${deliveryData.onTimeRate}%`}
          change={2}
          changeType="positive"
        />
        <SummaryCard
          title="Success Rate"
          value={`${deliveryData.successRate}%`}
          change={1.2}
          changeType="positive"
        />
      </div>

      {/* Delivery Method Breakdown */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Delivery Method Breakdown
          </h3>
        </div>
        <DataTable
          headers={["Method", "Orders", "Avg Time", "Cost", "Success Rate"]}
          data={deliveryData.byMethod.map((m) => [
            m.method,
            m.orders,
            `${m.avgTime} min`,
            m.cost > 0 ? `$${m.cost.toFixed(2)}` : "Included*",
            <span
              key={m.method}
              className={`px-2 py-1 rounded text-xs font-medium ${
                m.successRate >= 97
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : m.successRate >= 95
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {m.successRate}%
            </span>,
          ])}
        />
      </div>

      {/* Time Distribution & Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Delivery Time Distribution
            </h3>
          </div>
          <DataTable
            headers={["Time Range", "Orders", "% of Total", "Rating"]}
            data={deliveryData.timeDistribution.map((t) => [
              t.range,
              t.orders,
              `${t.percentage}%`,
              <span key={t.range}>{"⭐".repeat(t.rating)}</span>,
            ])}
          />
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Delivery Issues Report
            </h3>
          </div>
          <DataTable
            headers={["Issue Type", "Count", "% of Deliveries", "Resolution"]}
            data={deliveryData.issues.map((i) => [
              i.issue,
              i.count,
              `${i.percentage}%`,
              <span
                key={i.issue}
                className="text-xs text-[var(--muted-foreground)]"
              >
                {i.resolution}
              </span>,
            ])}
          />
        </div>
      </div>

      {/* Rider Performance */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Rider Performance (Self-Delivery)
          </h3>
        </div>
        <DataTable
          headers={[
            "Rider Name",
            "Deliveries",
            "Avg Time",
            "On-Time %",
            "Rating",
          ]}
          data={deliveryData.riderPerformance.map((r) => [
            r.name,
            r.deliveries,
            `${r.avgTime} min`,
            <span
              key={r.name}
              className={r.onTime >= 90 ? "text-emerald-600" : "text-amber-600"}
            >
              {r.onTime}%
            </span>,
            <span key={`rating-${r.name}`} className="text-amber-500">
              {r.rating}⭐
            </span>,
          ])}
        />
      </div>
    </div>
  );
}

// Custom Reports Component
function CustomReports() {
  const [selectedSources, setSelectedSources] = useState([
    "Orders",
    "Customers",
  ]);
  const [selectedMetrics, setSelectedMetrics] = useState([
    "Total Revenue",
    "Order Count",
  ]);

  return (
    <div className="space-y-6">
      {/* Custom Report Builder */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6">
          Build Your Custom Report
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Sources */}
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
              1. Select Data Sources
            </h4>
            <div className="space-y-2">
              {[
                "Orders",
                "Customers",
                "Menu Items",
                "Delivery",
                "Payments",
              ].map((source) => (
                <label
                  key={source}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSources([...selectedSources, source]);
                      } else {
                        setSelectedSources(
                          selectedSources.filter((s) => s !== source)
                        );
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    {source}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
              2. Choose Metrics
            </h4>
            <div className="space-y-2">
              {[
                "Total Revenue",
                "Order Count",
                "Customer Segments",
                "Payment Methods",
                "Top Items",
                "Delivery Times",
              ].map((metric) => (
                <label
                  key={metric}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMetrics([...selectedMetrics, metric]);
                      } else {
                        setSelectedMetrics(
                          selectedMetrics.filter((m) => m !== metric)
                        );
                      }
                    }}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-[var(--foreground)]">
                    {metric}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
              3. Filters
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                  Date Range
                </label>
                <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>This Month</option>
                  <option>Custom</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                  Channel
                </label>
                <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                  <option>All Channels</option>
                  <option>Phone</option>
                  <option>Website</option>
                  <option>Social</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">
                  Min Order Value
                </label>
                <input
                  type="number"
                  placeholder="₵0"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Group By & Visualizations */}
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
              4. Group By
            </h4>
            <div className="flex gap-2 flex-wrap mb-4">
              {["Day", "Week", "Month", "Channel"].map((group) => (
                <button
                  key={group}
                  className="px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm hover:bg-[var(--border)]"
                >
                  {group}
                </button>
              ))}
            </div>

            <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
              5. Visualizations
            </h4>
            <div className="space-y-2">
              {[
                "Summary Cards",
                "Line Chart",
                "Data Table",
                "Pie Chart",
                "Bar Chart",
              ].map((viz) => (
                <label
                  key={viz}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm text-[var(--foreground)]">
                    {viz}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-[var(--border)]">
          <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            Save as Template
          </button>
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            📧 Schedule Email
          </button>
        </div>
      </div>

      {/* Saved Templates */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Saved Report Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              name: "Monthly Executive Summary",
              icon: "📊",
              schedule: "Monthly",
            },
            {
              name: "Weekly Operations Review",
              icon: "📋",
              schedule: "Weekly",
            },
            { name: "Daily Flash Report", icon: "⚡", schedule: "Daily" },
            {
              name: "Quarterly Business Review",
              icon: "📈",
              schedule: "Quarterly",
            },
            {
              name: "Tax Preparation Report",
              icon: "💰",
              schedule: "On-demand",
            },
          ].map((template) => (
            <div
              key={template.name}
              className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{template.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {template.name}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {template.schedule}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-[var(--border)] text-[var(--primary)]">
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
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled Reports */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Scheduled Reports
        </h3>
        <DataTable
          headers={[
            "Report Name",
            "Frequency",
            "Time",
            "Recipients",
            "Format",
            "Actions",
          ]}
          data={[
            [
              "Daily Sales Report",
              "Daily",
              "6:00 AM",
              "owner@restaurant.com",
              "PDF, Excel",
              <button key="1" className="text-[var(--primary)] text-sm">
                Edit
              </button>,
            ],
            [
              "Weekly Summary",
              "Weekly (Mon)",
              "8:00 AM",
              "team@restaurant.com",
              "PDF",
              <button key="2" className="text-[var(--primary)] text-sm">
                Edit
              </button>,
            ],
            [
              "Monthly P&L",
              "Monthly (1st)",
              "9:00 AM",
              "owner@restaurant.com",
              "Excel",
              <button key="3" className="text-[var(--primary)] text-sm">
                Edit
              </button>,
            ],
          ]}
        />
      </div>
    </div>
  );
}

// Trends Component
function TrendsReports() {
  const [revenueActiveIndex, setRevenueActiveIndex] = useState<number | null>(
    null
  );
  const [ordersActiveIndex, setOrdersActiveIndex] = useState<number | null>(
    null
  );

  const revenueData = [
    8500, 9200, 7800, 10500, 12100, 14200, 12450, 11800, 13500, 15200, 14800,
    16100,
  ];
  const ordersData = [
    420, 480, 390, 520, 610, 720, 680, 590, 670, 780, 740, 856,
  ];
  const monthLabels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const revenueChartData = revenueData.map((val, i) => ({
    month: monthLabels[i],
    fullMonth: monthLabels[i],
    revenue: val,
  }));

  const ordersChartData = ordersData.map((val, i) => ({
    month: monthLabels[i],
    fullMonth: monthLabels[i],
    orders: val,
  }));

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--primary)",
    },
  } satisfies ChartConfig;

  const ordersChartConfig = {
    orders: {
      label: "Orders",
      color: "#10b981", // emerald-500
    },
  } satisfies ChartConfig;

  const revenueActiveData = useMemo(() => {
    if (revenueActiveIndex === null) return null;
    return revenueChartData[revenueActiveIndex];
  }, [revenueActiveIndex]);

  const ordersActiveData = useMemo(() => {
    if (ordersActiveIndex === null) return null;
    return ordersChartData[ordersActiveIndex];
  }, [ordersActiveIndex]);

  return (
    <div className="space-y-6">
      {/* Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Revenue Growth Trend
            </h3>
            {revenueActiveData ? (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {revenueActiveData.fullMonth}: $
                {revenueActiveData.revenue.toLocaleString()}
              </p>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Monthly revenue trend (last 12 months)
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
                  id="revenue-growth-pattern-dots"
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
                fill="url(#revenue-growth-pattern-dots)"
              />
              <XAxis
                dataKey="month"
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
                      revenueActiveIndex === index ? "var(--color-revenue)" : ""
                    }
                    strokeWidth={revenueActiveIndex === index ? 2 : 0}
                    onMouseEnter={() => setRevenueActiveIndex(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Order Volume Trend
            </h3>
            {ordersActiveData ? (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {ordersActiveData.fullMonth}: {ordersActiveData.orders} orders
              </p>
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Monthly orders trend (last 12 months)
              </p>
            )}
          </div>
          <ChartContainer
            config={ordersChartConfig}
            className="h-[200px] w-full"
          >
            <BarChart
              accessibilityLayer
              data={ordersChartData}
              onMouseLeave={() => setOrdersActiveIndex(null)}
            >
              <defs>
                <pattern
                  id="orders-volume-pattern-dots"
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
                fill="url(#orders-volume-pattern-dots)"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-xs"
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="orders" radius={4} fill="var(--color-orders)">
                {ordersChartData.map((_, index) => (
                  <Cell
                    className="duration-200"
                    key={`cell-${index}`}
                    fillOpacity={
                      ordersActiveIndex === null
                        ? 1
                        : ordersActiveIndex === index
                        ? 1
                        : 0.3
                    }
                    stroke={
                      ordersActiveIndex === index ? "var(--color-orders)" : ""
                    }
                    strokeWidth={ordersActiveIndex === index ? 2 : 0}
                    onMouseEnter={() => setOrdersActiveIndex(index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Comparative Analysis */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Comparative Analysis
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Period A
            </label>
            <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
              <option>Jan 1-15, 2026</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--muted-foreground)] block mb-1">
              Period B
            </label>
            <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
              <option>Dec 1-15, 2025</option>
            </select>
          </div>
          <div className="col-span-2 flex items-end">
            <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
              Compare
            </button>
          </div>
        </div>
        <DataTable
          headers={["Metric", "Period A", "Period B", "Change"]}
          data={[
            [
              "Revenue",
              "₵22,450",
              "₵19,230",
              <span key="1" className="text-emerald-600">
                +16.7% ↑
              </span>,
            ],
            [
              "Orders",
              "428",
              "389",
              <span key="2" className="text-emerald-600">
                +10.0% ↑
              </span>,
            ],
            [
              "Avg Order Value",
              "₵52.45",
              "₵49.43",
              <span key="3" className="text-emerald-600">
                +6.1% ↑
              </span>,
            ],
            [
              "New Customers",
              "42",
              "38",
              <span key="4" className="text-emerald-600">
                +10.5% ↑
              </span>,
            ],
          ]}
        />
      </div>

      {/* Anomaly Detection */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          ⚠️ Unusual Patterns Detected
        </h3>
        <div className="space-y-3">
          {[
            {
              type: "warning",
              message: "Tuesday revenue 40% below average",
              action: "Investigate: Was system down? Bad weather?",
            },
            {
              type: "error",
              message: "Bolt Food orders dropped 60% this week",
              action: "Action: Check platform status",
            },
            {
              type: "warning",
              message: "Mobile money payment failures up 25%",
              action: "Action: Contact payment provider",
            },
          ].map((alert, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border ${
                alert.type === "error"
                  ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                  : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  alert.type === "error"
                    ? "text-red-700 dark:text-red-300"
                    : "text-amber-700 dark:text-amber-300"
                }`}
              >
                {alert.message}
              </p>
              <p
                className={`text-xs mt-1 ${
                  alert.type === "error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}
              >
                → {alert.action}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Forecasts */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
        <h3 className="text-sm font-semibold mb-4">
          📈 AI-Powered Forecasts (Coming Soon)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-80">Expected Tomorrow</p>
            <p className="text-lg font-bold">32-38 orders • ₵1,680-₵1,995</p>
            <p className="text-xs opacity-80 mt-1">Peak Hour: 1:00-2:00 PM</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-80">Expected This Weekend</p>
            <p className="text-lg font-bold">Saturday: 52 orders • ₵2,860</p>
            <p className="text-xs opacity-80 mt-1">
              Sunday: 38 orders • ₵1,976
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Financial Reports Component (simplified)
function FinancialReports() {
  const revenue = 45230;
  const cogs = 13569; // Cost of Goods Sold
  const grossProfit = revenue - cogs;
  const grossProfitMargin = ((grossProfit / revenue) * 100).toFixed(1);
  const vsLastGrossProfit = 31661; // Last period gross profit
  const grossProfitChange = grossProfit - vsLastGrossProfit;
  const grossProfitChangePercent = (
    (grossProfitChange / vsLastGrossProfit) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Gross Profit Section */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100 mb-1">
              Gross Profit
            </h3>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Revenue minus Cost of Goods Sold
            </p>
          </div>
          <div className="text-4xl">💰</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white dark:bg-[var(--card)] rounded-lg p-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Gross Profit
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              ${grossProfit.toLocaleString()}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              {grossProfitChange >= 0 ? "+" : ""}$
              {Math.abs(grossProfitChange).toLocaleString()} (
              {grossProfitChangePercent}%) vs last period
            </p>
          </div>
          <div className="bg-white dark:bg-[var(--card)] rounded-lg p-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Gross Profit Margin
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
              {grossProfitMargin}%
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {((grossProfit / revenue) * 100).toFixed(1)}% of revenue
            </p>
          </div>
          <div className="bg-white dark:bg-[var(--card)] rounded-lg p-4">
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              COGS Ratio
            </p>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {((cogs / revenue) * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Cost of Goods Sold
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[var(--card)] rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Total Revenue
              </span>
              <span className="font-medium text-[var(--foreground)]">
                ${revenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Cost of Goods Sold (COGS)
              </span>
              <span className="font-medium text-red-600">
                -${cogs.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex justify-between">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                Gross Profit
              </span>
              <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
                ${grossProfit.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Profit & Loss Statement
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--border)]">
            <span className="font-medium text-[var(--foreground)]">INCOME</span>
            <span></span>
          </div>
          <div className="flex justify-between pl-4">
            <span className="text-sm text-[var(--muted-foreground)]">
              Revenue from Orders
            </span>
            <span className="text-sm text-[var(--foreground)]">₵45,230</span>
          </div>
          <div className="flex justify-between font-medium border-t border-[var(--border)] pt-2">
            <span className="text-[var(--foreground)]">TOTAL INCOME</span>
            <span className="text-emerald-600">₵45,230</span>
          </div>

          <div className="flex justify-between py-2 border-b border-[var(--border)] mt-4">
            <span className="font-medium text-[var(--foreground)]">
              EXPENSES
            </span>
            <span></span>
          </div>
          {[
            { item: "Cost of Goods Sold", amount: 13569, percent: 30 },
            { item: "Staff Salaries", amount: 8000 },
            { item: "Rent & Utilities", amount: 3500 },
            { item: "Delivery Costs", amount: 2850 },
            { item: "Payment Gateway Fees", amount: 1130, percent: 2.5 },
            { item: "Third-Party Commissions", amount: 3917, percent: 8.7 },
            { item: "Marketing", amount: 1200 },
            { item: "Other Expenses", amount: 500 },
          ].map((exp, i) => (
            <div key={i} className="flex justify-between pl-4">
              <span className="text-sm text-[var(--muted-foreground)]">
                {exp.item}
              </span>
              <span className="text-sm text-[var(--foreground)]">
                ${exp.amount.toLocaleString()}
                {exp.percent ? ` (${exp.percent}%)` : ""}
              </span>
            </div>
          ))}
          <div className="flex justify-between font-medium border-t border-[var(--border)] pt-2">
            <span className="text-[var(--foreground)]">TOTAL EXPENSES</span>
            <span className="text-red-600">$34,666</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t-2 border-[var(--border)] pt-3 mt-4">
            <span className="text-[var(--foreground)]">NET PROFIT</span>
            <span className="text-emerald-600">$10,564 (23.4% margin)</span>
          </div>
        </div>
      </div>

      {/* Payment Reconciliation */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Payment Reconciliation Report
          </h3>
        </div>
        <DataTable
          headers={[
            "Payment Method",
            "Expected",
            "Received",
            "Pending",
            "Difference",
          ]}
          data={[
            [
              "Mobile Money",
              "$27,138",
              "$26,890",
              "$248",
              <span key="1" className="text-red-600">
                -$248
              </span>,
            ],
            [
              "Card Payments",
              "$15,769",
              "$15,550",
              "$219",
              <span key="2" className="text-red-600">
                -$219
              </span>,
            ],
            [
              "Cash",
              "$2,323",
              "$2,323",
              "$0",
              <span key="3" className="text-emerald-600">
                $0
              </span>,
            ],
          ]}
        />
        <div className="p-4 border-t border-[var(--border)] bg-amber-50 dark:bg-amber-900/20">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ⚠️ $467 in pending/missing payments requires follow-up
          </p>
        </div>
      </div>

      {/* Commission Breakdown */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Commission & Fees Breakdown
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
              Third-Party Platform Costs
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Bolt Food (25% commission)</span>
                <span className="font-medium">$1,225</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Chowdeck (25% commission)</span>
                <span className="font-medium">$565</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <h4 className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
              Payment Gateway Fees
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mobile Money (2.5%)</span>
                <span className="font-medium">$678</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Card Payments (2.5%)</span>
                <span className="font-medium">$394</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-[var(--primary)]/10 rounded-lg">
          <p className="text-sm text-[var(--foreground)]">
            <strong>Total Commissions & Fees:</strong> $2,862 (6.3% of revenue)
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");

  const tabs: { key: ReportTab; label: string; icon: string }[] = [
    { key: "sales", label: "Sales Reports", icon: "📊" },
    { key: "financial", label: "Financial", icon: "💰" },
    { key: "orders", label: "Orders", icon: "📦" },
    { key: "customers", label: "Customers", icon: "👥" },
    { key: "menu", label: "Menu Performance", icon: "🍽️" },
    { key: "delivery", label: "Delivery", icon: "🚚" },
    { key: "trends", label: "Trends", icon: "📈" },
    { key: "custom", label: "Custom", icon: "🎯" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Reports
          </h1>
          <p className="text-[var(--muted-foreground)]">
            Analyze your business performance
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2.5 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)] transition-colors flex items-center gap-2">
            📧 Schedule Reports
          </button>
          <button className="px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors flex items-center gap-2">
            📥 Export All
          </button>
        </div>
      </div>

      {/* Report Category Tabs */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-2 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      {activeTab === "sales" && <SalesReports />}
      {activeTab === "financial" && <FinancialReports />}
      {activeTab === "orders" && <OrdersReports />}
      {activeTab === "customers" && <CustomerReports />}
      {activeTab === "menu" && <MenuReports />}
      {activeTab === "delivery" && <DeliveryReports />}
      {activeTab === "trends" && <TrendsReports />}
      {activeTab === "custom" && <CustomReports />}
    </div>
  );
}
