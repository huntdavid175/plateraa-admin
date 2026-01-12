"use client";

import { useState } from "react";

// Mock data
const platformMetrics = {
  restaurants: { total: 247, change: 12, changeType: "positive" },
  totalUsers: { total: 1856, change: 145, changeType: "positive" },
  activeToday: { total: 189, percentage: 76 },
  totalOrders: { total: 45678, change: 8.5, changeType: "positive" },
  platformRevenue: { total: 12567890, change: 15.2, changeType: "positive" },
  monthlyRecurring: { total: 1234500, change: 10.5, changeType: "positive" },
  avgOrderValue: { total: 2345, change: 3.2, changeType: "positive" },
  successRate: { total: 94.8, change: 1.2, changeType: "positive" },
  systemUptime: { total: 99.97 },
};

const topRestaurants = [
  {
    rank: 1,
    name: "Mama Cass",
    location: "Lagos",
    orders: 2456,
    revenue: 5234000,
  },
  {
    rank: 2,
    name: "Chicken Republic",
    location: "Lagos",
    orders: 2234,
    revenue: 4890000,
  },
  {
    rank: 3,
    name: "Amala Spot",
    location: "Ibadan",
    orders: 1987,
    revenue: 4567000,
  },
  {
    rank: 4,
    name: "Mr Biggs",
    location: "Abuja",
    orders: 1845,
    revenue: 4234000,
  },
  {
    rank: 5,
    name: "Tastee Fried",
    location: "Lagos",
    orders: 1756,
    revenue: 3987000,
  },
  {
    rank: 6,
    name: "Buka Express",
    location: "Lagos",
    orders: 1678,
    revenue: 3756000,
  },
  {
    rank: 7,
    name: "Suya Spot",
    location: "Kano",
    orders: 1567,
    revenue: 3456000,
  },
  {
    rank: 8,
    name: "Rice & More",
    location: "Port H.",
    orders: 1489,
    revenue: 3234000,
  },
  {
    rank: 9,
    name: "Naija Kitchen",
    location: "Enugu",
    orders: 1398,
    revenue: 2987000,
  },
  {
    rank: 10,
    name: "Jollof Palace",
    location: "Lagos",
    orders: 1287,
    revenue: 2845000,
  },
];

const recentActivity = [
  {
    time: "2 mins ago",
    icon: "🆕",
    type: "New restaurant signup",
    details: "Iya Basira",
  },
  {
    time: "5 mins ago",
    icon: "💰",
    type: "Plan upgrade",
    details: "Mama Cass upgraded to Professional",
  },
  {
    time: "8 mins ago",
    icon: "⚠️",
    type: "Payment failed",
    details: "Chicken Republic",
  },
  {
    time: "12 mins ago",
    icon: "📦",
    type: "Milestone",
    details: "1,234th order today processed",
  },
  {
    time: "15 mins ago",
    icon: "🔧",
    type: "System",
    details: "System backup completed",
  },
  {
    time: "18 mins ago",
    icon: "👤",
    type: "New user",
    details: "New user registered (Amala Spot)",
  },
  {
    time: "25 mins ago",
    icon: "📊",
    type: "Report",
    details: "Daily report sent to 234 restaurants",
  },
  {
    time: "30 mins ago",
    icon: "🎉",
    type: "Milestone",
    details: "Buka Express hit 1,000 orders",
  },
];

const systemHealth = [
  {
    name: "API Status",
    status: "operational",
    value: "45ms avg",
    color: "emerald",
  },
  {
    name: "Database",
    status: "healthy",
    value: "12.3GB / 50GB",
    color: "emerald",
  },
  { name: "Payment Gateway", status: "connected", value: "", color: "emerald" },
  {
    name: "SMS Service",
    status: "active",
    value: "98.5% delivery",
    color: "emerald",
  },
  { name: "Email Service", status: "active", value: "", color: "emerald" },
  {
    name: "Storage",
    status: "healthy",
    value: "234GB / 1TB used",
    color: "emerald",
  },
  {
    name: "Background Jobs",
    status: "operational",
    value: "456 processed/hour",
    color: "emerald",
  },
  {
    name: "Error Rate",
    status: "low",
    value: "0.03% (last hour)",
    color: "emerald",
  },
];

function MetricCard({
  title,
  value,
  change,
  changeType,
  subtitle,
}: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative";
  subtitle?: string;
}) {
  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">
        {title}
      </p>
      <p className="text-2xl font-bold text-[var(--foreground)] mb-1">
        {value}
      </p>
      {change !== undefined && (
        <p
          className={`text-xs font-medium ${
            changeType === "positive" ? "text-emerald-500" : "text-red-500"
          }`}
        >
          {changeType === "positive" ? "+" : ""}
          {change}% {changeType === "positive" ? "↑" : "↓"}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
          Platform Overview
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">January 2026</p>
      </div>

      {/* Key Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="RESTAURANTS"
          value={platformMetrics.restaurants.total}
          change={platformMetrics.restaurants.change}
          changeType={platformMetrics.restaurants.changeType}
          subtitle="+12 this mo."
        />
        <MetricCard
          title="TOTAL USERS"
          value={platformMetrics.totalUsers.total.toLocaleString()}
          change={platformMetrics.totalUsers.change}
          changeType={platformMetrics.totalUsers.changeType}
          subtitle="+145 this mo."
        />
        <MetricCard
          title="ACTIVE TODAY"
          value={platformMetrics.activeToday.total}
          subtitle={`${platformMetrics.activeToday.percentage}% online`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="TOTAL ORDERS"
          value={platformMetrics.totalOrders.total.toLocaleString()}
          change={platformMetrics.totalOrders.change}
          changeType={platformMetrics.totalOrders.changeType}
          subtitle="+8.5% vs last"
        />
        <MetricCard
          title="PLATFORM REV"
          value={`₵{(platformMetrics.platformRevenue.total / 1000).toFixed(0)}k`}
          change={platformMetrics.platformRevenue.change}
          changeType={platformMetrics.platformRevenue.changeType}
          subtitle="+15.2% vs last"
        />
        <MetricCard
          title="MONTHLY REC. REV"
          value={`₵{(platformMetrics.monthlyRecurring.total / 1000).toFixed(0)}k`}
          change={platformMetrics.monthlyRecurring.change}
          changeType={platformMetrics.monthlyRecurring.changeType}
          subtitle="+10.5% ↑"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="AVG ORDER VAL"
          value={`₵{platformMetrics.avgOrderValue.total.toLocaleString()}`}
          change={platformMetrics.avgOrderValue.change}
          changeType={platformMetrics.avgOrderValue.changeType}
          subtitle="+3.2% ↑"
        />
        <MetricCard
          title="SUCCESS RATE"
          value={`${platformMetrics.successRate.total}%`}
          change={platformMetrics.successRate.change}
          changeType={platformMetrics.successRate.changeType}
          subtitle="+1.2% ↑"
        />
        <MetricCard
          title="SYSTEM UPTIME"
          value={`${platformMetrics.systemUptime.total}%`}
          subtitle="Last 30 days"
        />
      </div>

      {/* Top Performing Restaurants */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Top Performing Restaurants
          </h2>
          <button className="text-sm text-[var(--primary)] hover:underline">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  Rank
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  Restaurant
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  Location
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  Orders
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {topRestaurants.map((restaurant) => (
                <tr
                  key={restaurant.rank}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)]"
                >
                  <td className="py-3 px-4">
                    {restaurant.rank === 1 && "🥇"}
                    {restaurant.rank === 2 && "🥈"}
                    {restaurant.rank === 3 && "🥉"}
                    {restaurant.rank > 3 && restaurant.rank}
                  </td>
                  <td className="py-3 px-4 font-medium text-[var(--foreground)]">
                    {restaurant.name}
                  </td>
                  <td className="py-3 px-4 text-sm text-[var(--muted-foreground)]">
                    {restaurant.location}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-[var(--foreground)]">
                    {restaurant.orders.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-[var(--foreground)]">
                    ₵{(restaurant.revenue / 1000).toFixed(0)}k
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            View Details
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Feed */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Platform Activity
            </h2>
            <button className="text-sm text-[var(--primary)] hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--muted)]"
              >
                <span className="text-xl">{activity.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--foreground)]">
                    <span className="font-medium">{activity.type}:</span>{" "}
                    {activity.details}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health Status */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            System Health
          </h2>
          <div className="space-y-3">
            {systemHealth.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {item.name}:
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 font-medium">
                    ✅ {item.status}
                  </span>
                  {item.value && (
                    <span className="text-xs text-[var(--muted-foreground)]">
                      ({item.value})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
              View Detailed Status
            </button>
            <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
              View Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
