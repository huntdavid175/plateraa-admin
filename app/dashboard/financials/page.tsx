"use client";

import { useState, useMemo } from "react";
import { Bar, BarChart, XAxis, Cell, Pie, PieChart, LabelList } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type FinancialTab =
  | "overview"
  | "income"
  | "expenses"
  | "invoices"
  | "pl"
  | "cashflow"
  | "bank"
  | "reports"
  | "settings";

// Mock data
const financialOverview = {
  totalRevenue: 4523000,
  totalExpenses: 3466600,
  netProfit: 1056400,
  profitMargin: 23.4,
  cashBalance: 3956400,
  pendingBills: 245000,
  pendingBillsCount: 3,
  revenueChange: 15.3,
  expensesChange: 8.2,
  profitChange: 28.5,
  cashChange: 14.5,
  marginChange: 2.1,
};

const expenseBreakdown = [
  { category: "Cost of Goods Sold", amount: 1356900, percentage: 39.1 },
  { category: "Employee Salaries", amount: 800000, percentage: 23.1 },
  { category: "Rent & Utilities", amount: 450000, percentage: 13.0 },
  { category: "Third-Party Fees", amount: 391700, percentage: 11.3 },
  { category: "Delivery Costs", amount: 285000, percentage: 8.2 },
  { category: "Marketing", amount: 120000, percentage: 3.5 },
  { category: "Payment Gateway Fees", amount: 113000, percentage: 3.3 },
  { category: "Other Expenses", amount: 50000, percentage: 1.4 },
];

const incomeData = {
  revenueFromOrders: 4523000,
  byChannel: [
    { channel: "Phone Orders", amount: 1244500, percentage: 27.5 },
    { channel: "Website Orders", amount: 1860000, percentage: 41.1 },
    { channel: "Social Media", amount: 702000, percentage: 15.5 },
    { channel: "Bolt Food", amount: 490000, percentage: 10.8 },
    { channel: "Chowdeck", amount: 226000, percentage: 5.0 },
  ],
  otherIncome: 50000,
  otherIncomeItems: [
    {
      date: "Jan 15, 2026",
      category: "Catering",
      amount: 35000,
      notes: "Wedding",
    },
    {
      date: "Jan 10, 2026",
      category: "Merchandise",
      amount: 15000,
      notes: "T-shirts",
    },
  ],
};

const unpaidBills = [
  {
    vendor: "Fresh Foods Ltd",
    amount: 156000,
    dueDate: "Jan 25, 2026",
    days: "OVERDUE",
    priority: "high",
  },
  {
    vendor: "Electricity Co.",
    amount: 65000,
    dueDate: "Jan 28, 2026",
    days: "1 day",
    priority: "medium",
  },
  {
    vendor: "Internet ISP",
    amount: 12000,
    dueDate: "Feb 5, 2026",
    days: "10 days",
    priority: "low",
  },
];

function MetricCard({
  title,
  value,
  change,
  subtitle,
}: {
  title: string;
  value: string;
  change?: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">
        {title}
      </p>
      <p className="text-2xl font-bold text-[var(--foreground)] mb-1">
        {value}
      </p>
      {change && (
        <p
          className={`text-xs ${
            change.startsWith("+") ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {change}
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

function DataTable({
  headers,
  data,
}: {
  headers: string[];
  data: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[var(--muted)]">
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[var(--muted)]">
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
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
      <div
        className={`h-full ${color} rounded-full`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Overview Tab
function OverviewTab() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Mock data for revenue vs expenses (last 6 months)
  const revenueVsExpensesData = [
    { month: "Aug", revenue: 3850000, expenses: 3120000 },
    { month: "Sep", revenue: 4120000, expenses: 3280000 },
    { month: "Oct", revenue: 3980000, expenses: 3350000 },
    { month: "Nov", revenue: 4350000, expenses: 3420000 },
    { month: "Dec", revenue: 4210000, expenses: 3380000 },
    { month: "Jan", revenue: 4523000, expenses: 3466600 },
  ];

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--primary)",
    },
    expenses: {
      label: "Expenses",
      color: "#ef4444", // red-500
    },
  } satisfies ChartConfig;

  const activeData = useMemo(() => {
    if (activeIndex === null) return null;
    return revenueVsExpensesData[activeIndex];
  }, [activeIndex]);

  // Expense breakdown pie chart config and data
  const expenseConfig = {
    expenses: { label: "Expenses" },
    cogs: { label: "Cost of Goods Sold", color: "var(--chart-1)" },
    salaries: { label: "Employee Salaries", color: "var(--chart-2)" },
    rent: { label: "Rent & Utilities", color: "var(--chart-3)" },
    thirdparty: { label: "Third-Party Fees", color: "var(--chart-4)" },
    delivery: { label: "Delivery Costs", color: "var(--chart-5)" },
    marketing: { label: "Marketing", color: "hsl(45, 93%, 47%)" },
    gateway: { label: "Payment Gateway Fees", color: "hsl(217, 91%, 60%)" },
    other: { label: "Other Expenses", color: "hsl(142, 76%, 36%)" },
  } satisfies ChartConfig;

  const expenseData = expenseBreakdown.map((expense, i) => {
    const keys = [
      "cogs",
      "salaries",
      "rent",
      "thirdparty",
      "delivery",
      "marketing",
      "gateway",
      "other",
    ];
    return {
      name: expense.category,
      value: expense.amount,
      fill: `var(--color-${keys[i]})`,
      percentage: expense.percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₵{(financialOverview.totalRevenue / 1000).toFixed(0)}k`}
          change={`+${financialOverview.revenueChange}% ↑`}
        />
        <MetricCard
          title="Total Expenses"
          value={`₵{(financialOverview.totalExpenses / 1000).toFixed(0)}k`}
          change={`+${financialOverview.expensesChange}% ↑`}
        />
        <MetricCard
          title="Net Profit"
          value={`₵{(financialOverview.netProfit / 1000).toFixed(0)}k`}
          change={`+${financialOverview.profitChange}% ↑`}
        />
        <MetricCard
          title="Profit Margin"
          value={`${financialOverview.profitMargin}%`}
          change={`+${financialOverview.marginChange}% ↑`}
        />
        <MetricCard
          title="Cash Balance"
          value={`₵{(financialOverview.cashBalance / 1000).toFixed(0)}k`}
          change={`+${financialOverview.cashChange}% ↑`}
        />
        <MetricCard
          title="Pending Bills"
          value={`₵{(financialOverview.pendingBills / 1000).toFixed(0)}k`}
          subtitle={`${financialOverview.pendingBillsCount} bills`}
        />
      </div>

      {/* Revenue vs Expenses Chart */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Revenue vs Expenses Trend (Last 6 Months)
          </h3>
          {activeData ? (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              {activeData.month}: Revenue ₵
              {(activeData.revenue / 1000).toFixed(0)}k, Expenses ₵
              {(activeData.expenses / 1000).toFixed(0)}k
            </p>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Monthly comparison of revenue and expenses
            </p>
          )}
        </div>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={revenueVsExpensesData}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <defs>
              <pattern
                id="revenue-expenses-pattern-dots"
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
              fill="url(#revenue-expenses-pattern-dots)"
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
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4}>
              {revenueVsExpensesData.map((_, index) => (
                <Cell
                  key={`cell-revenue-${index}`}
                  fillOpacity={
                    activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                  }
                  stroke={activeIndex === index ? "var(--color-revenue)" : ""}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="duration-200"
                />
              ))}
            </Bar>
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4}>
              {revenueVsExpensesData.map((_, index) => (
                <Cell
                  key={`cell-expenses-${index}`}
                  fillOpacity={
                    activeIndex === null ? 1 : activeIndex === index ? 1 : 0.3
                  }
                  stroke={activeIndex === index ? "var(--color-expenses)" : ""}
                  strokeWidth={activeIndex === index ? 2 : 0}
                  onMouseEnter={() => setActiveIndex(index)}
                  className="duration-200"
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
        <div className="flex items-center justify-center gap-4 mt-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[var(--primary)]"></span>
            Revenue
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            Expenses
          </span>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Expense Categories - January 2026
        </h3>
        <ChartContainer
          config={expenseConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
            <Pie
              data={expenseData}
              dataKey="value"
              nameKey="name"
              innerRadius={40}
              radius={100}
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
          {expenseBreakdown.map((expense, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: expenseData[i].fill }}
                />
                <span className="text-[var(--foreground)]">
                  {expense.category}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[var(--muted-foreground)]">
                  ₵{(expense.amount / 1000).toFixed(0)}k
                </span>
                <span className="text-[var(--muted-foreground)] w-12 text-right">
                  {expense.percentage}%
                </span>
              </div>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-[var(--border)] flex items-center justify-between font-medium text-sm">
            <span className="text-[var(--foreground)]">TOTAL</span>
            <span className="text-[var(--foreground)]">
              ₵{(financialOverview.totalExpenses / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl border border-emerald-200 dark:border-emerald-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Financial Health Score: 85/100 🟢 Excellent
          </h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">✅</span>
            <span>Profit Margin: 23.4% (Above target of 20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">✅</span>
            <span>Cash Reserve: 2.8 months of expenses</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⚠️</span>
            <span>Food Cost: 30% (Target: 28-32%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">✅</span>
            <span>Labor Cost: 17.7% (Target: 25-35%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-amber-600">⚠️</span>
            <span>3 overdue bills (₵85,000)</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">
            Recommendations:
          </p>
          <ul className="text-sm text-emerald-700 dark:text-emerald-300 space-y-1">
            <li>• Pay overdue bills to avoid penalties</li>
            <li>• Food cost is optimal, maintain current suppliers</li>
            <li>• Consider increasing marketing spend (currently 3.5%)</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
            + Add Expense
          </button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            + Record Income
          </button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            + Pay Bill
          </button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            Generate P&L
          </button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            Export Financials
          </button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
            Send to Accountant
          </button>
        </div>
      </div>
    </div>
  );
}

// Income Tab
function IncomeTab() {
  const [showAddIncome, setShowAddIncome] = useState(false);

  // Income by channel pie chart config and data
  const incomeChannelConfig = {
    revenue: { label: "Revenue" },
    phone: { label: "Phone Orders", color: "var(--chart-1)" },
    website: { label: "Website Orders", color: "var(--chart-2)" },
    social: { label: "Social Media", color: "var(--chart-3)" },
    bolt: { label: "Bolt Food", color: "var(--chart-4)" },
    chowdeck: { label: "Chowdeck", color: "var(--chart-5)" },
  } satisfies ChartConfig;

  const incomeChannelData = incomeData.byChannel.map((channel, i) => {
    const keys = ["phone", "website", "social", "bolt", "chowdeck"];
    return {
      name: channel.channel,
      value: channel.amount,
      fill: `var(--color-${keys[i]})`,
      percentage: channel.percentage,
    };
  });

  return (
    <div className="space-y-6">
      {/* Income Summary */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Income Summary - January 2026
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[var(--foreground)]">
                Revenue from Orders
              </span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                ₵{(incomeData.revenueFromOrders / 1000).toFixed(0)}k
              </span>
            </div>
            <ChartContainer
              config={incomeChannelConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <Pie
                  data={incomeChannelData}
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
              {incomeData.byChannel.map((channel, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: incomeChannelData[i].fill }}
                    />
                    <span className="text-[var(--foreground)]">
                      {channel.channel}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--foreground)]">
                      ₵{(channel.amount / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[var(--muted-foreground)] w-12 text-right">
                      {channel.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--foreground)]">
                Other Income
              </span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                ₵{(incomeData.otherIncome / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="pl-4 space-y-1">
              {incomeData.otherIncomeItems.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-[var(--muted-foreground)]">
                    ├─ {item.category}
                  </span>
                  <span className="text-[var(--foreground)]">
                    ₵{(item.amount / 1000).toFixed(0)}k
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t-2 border-[var(--border)] flex items-center justify-between font-bold">
            <span className="text-[var(--foreground)]">TOTAL INCOME</span>
            <span className="text-lg text-[var(--foreground)]">
              ₵
              {(
                (incomeData.revenueFromOrders + incomeData.otherIncome) /
                1000
              ).toFixed(0)}
              k
            </span>
          </div>
        </div>
      </div>

      {/* Record Other Income */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Record Other Income
          </h3>
          <button
            onClick={() => setShowAddIncome(true)}
            className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
          >
            + Add Income
          </button>
        </div>
        <DataTable
          headers={["Date", "Category", "Amount", "Notes"]}
          data={incomeData.otherIncomeItems.map((item) => [
            item.date,
            item.category,
            `₵{(item.amount / 1000).toFixed(0)}k`,
            item.notes,
          ])}
        />
      </div>

      {/* Add Income Modal */}
      {showAddIncome && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddIncome(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Record Other Income
              </h3>
              <button
                onClick={() => setShowAddIncome(false)}
                className="text-[var(--muted-foreground)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category *
                </label>
                <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                  <option>Catering</option>
                  <option>Merchandise</option>
                  <option>Event</option>
                  <option>Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Amount *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">₵</span>
                  <input
                    type="number"
                    placeholder="35000"
                    className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Payment Method
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <span className="text-sm">Cash</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Bank Transfer</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" name="payment" className="w-4 h-4" />
                    <span className="text-sm">Mobile Money</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Customer/Client (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Johnson & Sons Ltd."
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Description/Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Wedding catering service - 100 guests"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Attach Invoice/Receipt
                </label>
                <button className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--border)]">
                  📄 Upload File
                </button>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setShowAddIncome(false)}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
                  Save Income
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Expenses Tab
function ExpensesTab() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddExpense, setShowAddExpense] = useState(false);

  const cogsEntries = [
    {
      date: "Jan 20",
      supplier: "Fresh Foods Ltd",
      items: "Rice, Chicken",
      amount: 245000,
    },
    {
      date: "Jan 18",
      supplier: "Market Vendors",
      items: "Vegetables",
      amount: 85000,
    },
    {
      date: "Jan 15",
      supplier: "Meat Supplies",
      items: "Beef, Fish",
      amount: 180000,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex items-center gap-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          <option value="cogs">Cost of Goods Sold</option>
          <option value="salaries">Salaries</option>
          <option value="rent">Rent & Utilities</option>
          <option value="delivery">Delivery</option>
          <option value="marketing">Marketing</option>
        </select>
        <select className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
          <option>This Month</option>
          <option>Last Month</option>
          <option>This Quarter</option>
          <option>Custom Range</option>
        </select>
        <input
          type="text"
          placeholder="Search..."
          className="flex-1 px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
        />
        <button
          onClick={() => setShowAddExpense(true)}
          className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
        >
          + Add Expense
        </button>
      </div>

      {/* Cost of Goods Sold */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              🛒 Cost of Goods Sold
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Total This Month: ₵1,356,900 (30% of revenue) ✅ Within range
            </p>
          </div>
          <button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
            + Add Entry
          </button>
        </div>
        <DataTable
          headers={["Date", "Supplier", "Items", "Amount"]}
          data={cogsEntries.map((entry) => [
            entry.date,
            entry.supplier,
            entry.items,
            `₵{(entry.amount / 1000).toFixed(0)}k`,
          ])}
        />
      </div>

      {/* Employee Salaries */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              👥 Employee Salaries
            </h3>
            <button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
              + Add Payment
            </button>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Total This Month: ₵800,000 (17.7% of revenue) ✅ Below target
            (efficient)
          </p>
        </div>
        <DataTable
          headers={["Employee", "Position", "Monthly", "Paid", "Status"]}
          data={[
            ["John Doe", "Manager", "₵150k", "Jan 1", "✅ Paid"],
            ["Sarah Manager", "Cashier", "₵80k", "Jan 1", "✅ Paid"],
            ["Mike Kitchen", "Chef", "₵120k", "Jan 1", "✅ Paid"],
            ["Peter Clean", "Cleaner", "₵45k", "Pending", "🔴 Due"],
          ]}
        />
      </div>

      {/* Other Expense Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            🏢 Rent & Utilities
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Total: ₵450,000 (9.9% of revenue)
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Shop Rent</span>
              <span className="text-[var(--foreground)]">₵350k ✅</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">
                Electricity
              </span>
              <span className="text-[var(--foreground)]">₵65k ✅</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Water</span>
              <span className="text-[var(--foreground)]">₵15k ✅</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            📱 Third-Party Fees
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Total: ₵391,700 (8.7% of revenue) ⚠️ High commission rate
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Bolt Food</span>
              <span className="text-[var(--foreground)]">₵122.5k</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Chowdeck</span>
              <span className="text-[var(--foreground)]">₵56.5k</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">
                Platform Delivery
              </span>
              <span className="text-[var(--foreground)]">₵212.7k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddExpense(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Add Expense
              </h3>
              <button
                onClick={() => setShowAddExpense(false)}
                className="text-[var(--muted-foreground)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Category *
                  </label>
                  <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                    <option>Cost of Goods Sold</option>
                    <option>Salaries</option>
                    <option>Rent & Utilities</option>
                    <option>Delivery Costs</option>
                    <option>Marketing</option>
                    <option>Equipment</option>
                    <option>Repairs & Maintenance</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Amount *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">₵</span>
                  <input
                    type="number"
                    placeholder="15000"
                    className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Vendor/Supplier
                </label>
                <input
                  type="text"
                  placeholder="Kitchen Supplies Ltd."
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Payment Method *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="expensePayment"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Cash</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="expensePayment"
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Bank Transfer</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="expensePayment"
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Mobile Money</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Commercial blender for smoothies"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Attach Receipt/Invoice
                </label>
                <button className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--border)]">
                  📄 Upload File
                </button>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setShowAddExpense(false)}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
                  Save Expense
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Invoices & Bills Tab
function InvoicesTab() {
  const [showAddBill, setShowAddBill] = useState(false);

  return (
    <div className="space-y-6">
      {/* Unpaid Bills */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              📋 Unpaid Bills
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Total Outstanding: ₵245,000 ⚠️ 3 bills due this week
            </p>
          </div>
          <button
            onClick={() => setShowAddBill(true)}
            className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
          >
            + Add Bill
          </button>
        </div>
        <DataTable
          headers={["Vendor", "Amount", "Due Date", "Days", "Priority"]}
          data={unpaidBills.map((bill) => [
            bill.vendor,
            `₵{(bill.amount / 1000).toFixed(0)}k`,
            bill.dueDate,
            <span
              key={bill.dueDate}
              className={bill.days === "OVERDUE" ? "text-red-600" : ""}
            >
              {bill.days}
            </span>,
            bill.priority === "high"
              ? "🔴 High"
              : bill.priority === "medium"
              ? "🟡 Med"
              : "🟢 Low",
          ])}
        />
      </div>

      {/* Paid Bills History */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
            📋 Paid Bills
          </h3>
          <div className="flex gap-4">
            <select className="px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
              <option>Last 30 days</option>
              <option>This Month</option>
              <option>Last Month</option>
            </select>
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 px-3 py-1.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            />
          </div>
        </div>
        <DataTable
          headers={["Date Paid", "Vendor", "Amount", "Invoice#", "Paid"]}
          data={[
            ["Jan 20", "Fresh Foods", "₵245k", "INV-123", "✅"],
            ["Jan 15", "Electricity", "₵65k", "BILL-456", "✅"],
            ["Jan 10", "Water Co.", "₵15k", "BILL-789", "✅"],
          ]}
        />
        <div className="p-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--foreground)]">
            Total Paid This Month: <strong>₵1,234,000</strong>
          </p>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddBill && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddBill(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                Add Bill/Invoice
              </h3>
              <button
                onClick={() => setShowAddBill(false)}
                className="text-[var(--muted-foreground)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Vendor/Supplier *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Select or add new..."
                    className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                  <button className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                    New
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Bill/Invoice Number
                </label>
                <input
                  type="text"
                  placeholder="INV-2026-0156"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Bill Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Amount *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm">₵</span>
                  <input
                    type="number"
                    placeholder="156000"
                    className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category *
                </label>
                <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                  <option>Cost of Goods Sold</option>
                  <option>Rent & Utilities</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Rice and chicken supplies - bulk order"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Attach Invoice
                </label>
                <button className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--border)]">
                  📄 Upload
                </button>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setShowAddBill(false)}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
                  Save Bill
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Profit & Loss Tab
function ProfitLossTab() {
  const revenue = 4573000;
  const cogs = 1401900;
  const grossProfit = revenue - cogs;
  const operatingExpenses = 2209700;
  const netProfit = grossProfit - operatingExpenses;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">
              Period
            </label>
            <select className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
              <option>January 2026</option>
              <option>December 2025</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--muted-foreground)] mb-1">
              Compare to
            </label>
            <select className="px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
              <option>December 2025</option>
              <option>January 2025</option>
            </select>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">
              Export PDF
            </button>
            <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">
              Export Excel
            </button>
          </div>
        </div>
      </div>

      {/* P&L Statement */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Profit & Loss Statement
        </h3>

        {/* Revenue */}
        <div className="space-y-2 mb-4">
          <div className="font-medium text-[var(--foreground)]">REVENUE</div>
          <div className="pl-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Sales Revenue
              </span>
              <span className="text-[var(--foreground)]">
                ₵{(revenue / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Phone Orders
                </span>
                <span className="text-[var(--foreground)]">₵1,244k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Website Orders
                </span>
                <span className="text-[var(--foreground)]">₵1,860k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Social Media
                </span>
                <span className="text-[var(--foreground)]">₵702k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Bolt Food
                </span>
                <span className="text-[var(--foreground)]">₵490k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  └─ Chowdeck
                </span>
                <span className="text-[var(--foreground)]">₵226k</span>
              </div>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--muted-foreground)]">
                Other Income
              </span>
              <span className="text-[var(--foreground)]">₵50k</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-[var(--border)]">
              <span className="text-[var(--foreground)]">TOTAL REVENUE</span>
              <span className="text-emerald-600">
                ₵{(revenue / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>

        {/* COGS */}
        <div className="space-y-2 mb-4 pt-4 border-t border-[var(--border)]">
          <div className="font-medium text-[var(--foreground)]">
            COST OF GOODS SOLD (COGS)
          </div>
          <div className="pl-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Food & Ingredients
              </span>
              <span className="text-[var(--foreground)]">₵1,356k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Packaging Materials
              </span>
              <span className="text-[var(--foreground)]">₵45k</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--foreground)]">TOTAL COGS</span>
              <span className="text-red-600">₵{(cogs / 1000).toFixed(0)}k</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-[var(--border)]">
              <span className="text-[var(--foreground)]">GROSS PROFIT</span>
              <span className="text-emerald-600">
                ₵{(grossProfit / 1000).toFixed(0)}k (69.3% margin)
              </span>
            </div>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="space-y-2 mb-4 pt-4 border-t border-[var(--border)]">
          <div className="font-medium text-[var(--foreground)]">
            OPERATING EXPENSES
          </div>
          <div className="pl-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Employee Salaries & Benefits
              </span>
              <span className="text-[var(--foreground)]">₵800k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Rent</span>
              <span className="text-[var(--foreground)]">₵350k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">Utilities</span>
              <span className="text-[var(--foreground)]">₵100k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Third-Party Platform Fees
              </span>
              <span className="text-[var(--foreground)]">₵391k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Delivery Costs
              </span>
              <span className="text-[var(--foreground)]">₵285k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Marketing & Advertising
              </span>
              <span className="text-[var(--foreground)]">₵120k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Payment Gateway Fees
              </span>
              <span className="text-[var(--foreground)]">₵113k</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Other Operating Expenses
              </span>
              <span className="text-[var(--foreground)]">₵50k</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--foreground)]">
                TOTAL OPERATING EXPENSES
              </span>
              <span className="text-red-600">
                ₵{(operatingExpenses / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </div>

        {/* Net Profit */}
        <div className="space-y-2 pt-4 border-t-2 border-[var(--border)]">
          <div className="font-medium text-[var(--foreground)]">
            NET PROFIT (EBITDA)
          </div>
          <div className="pl-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Gross Profit
              </span>
              <span className="text-[var(--foreground)]">
                ₵{(grossProfit / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--muted-foreground)]">
                Less: Operating Expenses
              </span>
              <span className="text-red-600">
                -₵{(operatingExpenses / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-2 border-t-2 border-[var(--border)]">
              <span className="text-[var(--foreground)]">NET PROFIT</span>
              <span className="text-emerald-600">
                ₵{(netProfit / 1000).toFixed(0)}k (21.0% margin) 🎉
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          KEY METRICS
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Gross Profit Margin
            </p>
            <p className="text-lg font-bold text-emerald-600">69.3% ✅</p>
            <p className="text-xs text-[var(--muted-foreground)]">Excellent</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Net Profit Margin
            </p>
            <p className="text-lg font-bold text-emerald-600">21.0% ✅</p>
            <p className="text-xs text-[var(--muted-foreground)]">Good</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Food Cost %
            </p>
            <p className="text-lg font-bold text-emerald-600">30.7% ✅</p>
            <p className="text-xs text-[var(--muted-foreground)]">Optimal</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)] mb-1">
              Labor Cost %
            </p>
            <p className="text-lg font-bold text-emerald-600">17.5% ✅</p>
            <p className="text-xs text-[var(--muted-foreground)]">Efficient</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Cash Flow Tab
function CashFlowTab() {
  const openingBalance = 2995000;
  const totalInflows = 4560300;
  const totalOutflows = 2842400;
  const autoDeductions = 680200;
  const netCashFlow = totalInflows - totalOutflows - autoDeductions;
  const closingBalance = openingBalance + netCashFlow;

  return (
    <div className="space-y-6">
      {/* Cash Flow Statement */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Cash Flow Statement - January 2026
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              Opening Balance (Jan 1, 2026)
            </span>
            <span className="text-[var(--foreground)] font-medium">
              ₵{(openingBalance / 1000).toFixed(0)}k
            </span>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <div className="font-medium text-[var(--foreground)] mb-2">
              CASH INFLOWS
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Cash from Orders
                </span>
                <span className="text-[var(--foreground)]">₵232k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Mobile Money Received
                </span>
                <span className="text-[var(--foreground)]">₵2,713k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Card Payments Received
                </span>
                <span className="text-[var(--foreground)]">₵1,564k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Other Income
                </span>
                <span className="text-[var(--foreground)]">₵50k</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--foreground)]">Total Inflows</span>
                <span className="text-emerald-600">
                  ₵{(totalInflows / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <div className="font-medium text-[var(--foreground)] mb-2">
              CASH OUTFLOWS
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Supplier Payments (COGS)
                </span>
                <span className="text-[var(--foreground)]">₵1,356k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Salaries Paid
                </span>
                <span className="text-[var(--foreground)]">₵755k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Rent Paid
                </span>
                <span className="text-[var(--foreground)]">₵350k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Utilities Paid
                </span>
                <span className="text-[var(--foreground)]">₵100k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Delivery Costs
                </span>
                <span className="text-[var(--foreground)]">₵110k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Marketing Paid
                </span>
                <span className="text-[var(--foreground)]">₵120k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Other Expenses
                </span>
                <span className="text-[var(--foreground)]">₵50k</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--foreground)]">Total Outflows</span>
                <span className="text-red-600">
                  ₵{(totalOutflows / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <div className="font-medium text-[var(--foreground)] mb-2">
              Auto-Deductions
            </div>
            <div className="pl-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Platform Fees
                </span>
                <span className="text-[var(--foreground)]">₵391k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Payment Gateway Fees
                </span>
                <span className="text-[var(--foreground)]">₵113k</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">
                  ├─ Yango Delivery
                </span>
                <span className="text-[var(--foreground)]">₵175k</span>
              </div>
              <div className="flex justify-between font-medium pt-2 border-t border-[var(--border)]">
                <span className="text-[var(--foreground)]">
                  Total Auto-Deductions
                </span>
                <span className="text-red-600">
                  ₵{(autoDeductions / 1000).toFixed(0)}k
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-[var(--border)]">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-[var(--foreground)]">NET CASH FLOW</span>
              <span className="text-emerald-600">
                ₵{(netCashFlow / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-2 border-t border-[var(--border)]">
              <span className="text-[var(--foreground)]">
                Closing Balance (Jan 31, 2026)
              </span>
              <span className="text-emerald-600">
                ₵{(closingBalance / 1000).toFixed(0)}k (+34.6% ↑)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cash Flow Forecast */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Cash Flow Forecast (Next 3 Months)
        </h3>
        <DataTable
          headers={["Month", "Projected In", "Projected Out", "Net", "Balance"]}
          data={[
            ["Feb 2026", "₵4,800k", "₵3,200k", "+₵1,600k", "₵5.6M"],
            ["Mar 2026", "₵5,100k", "₵3,400k", "+₵1,700k", "₵7.3M"],
            ["Apr 2026", "₵5,300k", "₵3,500k", "+₵1,800k", "₵9.1M"],
          ]}
        />
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
            ⚠️ Upcoming Large Expenses:
          </p>
          <ul className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
            <li>• Feb 1: Bulk supplier payment (₵500k)</li>
            <li>• Mar 15: Equipment purchase (₵300k)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Bank Accounts Tab
function BankAccountsTab() {
  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Bank Accounts
          </h3>
          <button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
            + Add Account
          </button>
        </div>
        <div className="space-y-4">
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  First Bank - Business Account
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Account: 0123456789
                </p>
              </div>
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded">
                ✅ Connected
              </span>
            </div>
            <p className="text-sm text-[var(--foreground)] mb-3">
              Balance: <strong>₵3,856,400</strong> (as of Jan 31, 2026)
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                View Transactions
              </button>
              <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                Reconcile
              </button>
            </div>
          </div>

          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-medium text-[var(--foreground)]">
                  Cash on Hand
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Location: Register/Till
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--foreground)] mb-3">
              Balance: <strong>₵176,300</strong>
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mb-3">
              Last counted: Jan 31, 2026 at 10:00 PM
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                Count Cash
              </button>
              <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                View History
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)]">
            <p className="text-sm font-medium text-[var(--foreground)]">
              Total Liquid Assets: <strong>₵4,532,700</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Bank Reconciliation */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Bank Reconciliation - First Bank
        </h3>
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              System Balance:
            </span>
            <span className="text-[var(--foreground)]">₵3,856,400</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[var(--muted-foreground)]">
              Bank Statement Balance:
            </span>
            <span className="text-[var(--foreground)]">₵3,840,200</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t border-[var(--border)]">
            <span className="text-[var(--foreground)]">Difference:</span>
            <span className="text-amber-600">₵16,200 ⚠️</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm">
            Mark as Reconciled
          </button>
          <button className="px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm">
            Add Adjustment
          </button>
          <button className="px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm">
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}

// Financial Reports Tab
function FinancialReportsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Financial Reports
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">
              Standard Reports:
            </h4>
            <div className="space-y-3">
              {[
                {
                  name: "Profit & Loss Statement",
                  period: "This Month",
                  format: "PDF",
                },
                {
                  name: "Balance Sheet",
                  period: "Jan 31, 2026",
                  format: "PDF",
                },
                {
                  name: "Cash Flow Statement",
                  period: "This Month",
                  format: "PDF",
                },
                {
                  name: "Expense Report by Category",
                  period: "This Month",
                  format: "Excel",
                },
                {
                  name: "Revenue Report by Channel",
                  period: "This Quarter",
                  format: "Excel",
                },
                {
                  name: "Payroll Summary",
                  period: "This Month",
                  format: "PDF",
                },
                {
                  name: "Tax Report (VAT & Income)",
                  period: "Q4 2025",
                  format: "PDF",
                },
                {
                  name: "Vendor Payment History",
                  period: "This Year",
                  format: "Excel",
                },
              ].map((report, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {report.name}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Period: {report.period}
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm">
                    Generate {report.format}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-4 border-t border-[var(--border)]">
            <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">
              Build Custom Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Financial Settings Tab
function FinancialSettingsTab() {
  return (
    <div className="space-y-6">
      {/* Accounting Preferences */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Accounting Settings
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Fiscal Year Start
              </label>
              <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                <option>January</option>
                <option>April</option>
                <option>July</option>
                <option>October</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Fiscal Year End
              </label>
              <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                <option>December</option>
                <option>March</option>
                <option>June</option>
                <option>September</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Accounting Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="accountingMethod"
                  defaultChecked
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  Cash Basis (record when money received/paid)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="accountingMethod"
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  Accrual Basis (record when earned/incurred)
                </span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Currency
              </label>
              <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                <option>GHS - Ghanaian Cedis (₵)</option>
                <option>USD - US Dollar ($)</option>
                <option>GBP - British Pound (£)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Decimal Places
              </label>
              <input
                type="number"
                defaultValue={2}
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Default Payment Terms
            </label>
            <input
              type="text"
              defaultValue="Net 15 days"
              className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                VAT Rate
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue={7.5}
                  step={0.1}
                  className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
                <span className="text-sm">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Tax ID
              </label>
              <input
                type="text"
                defaultValue="12345678-0001"
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
          </div>
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
            Save Settings
          </button>
        </div>
      </div>

      {/* Expense Categories */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Expense Categories
          </h3>
          <button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
            + Add Category
          </button>
        </div>
        <DataTable
          headers={["Category Name", "Subcategories", "Active"]}
          data={[
            ["Cost of Goods Sold", "Food, Beverages", "✅"],
            ["Salaries & Wages", "Staff, Contractors", "✅"],
            ["Rent & Utilities", "Rent, Electric...", "✅"],
            ["Marketing", "Digital, Print", "✅"],
            ["Delivery", "Yango, Fuel", "✅"],
            ["Equipment", "Kitchen, Tech", "✅"],
            ["Professional Services", "Legal, Accounting", "✅"],
          ]}
        />
      </div>

      {/* Accountant Access */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">
          Accountant Access
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Accountant Email
            </label>
            <input
              type="email"
              placeholder="accountant@firm.com"
              className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Access Level
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="accessLevel"
                  defaultChecked
                  className="w-4 h-4"
                />
                <span className="text-sm">
                  Read-only (can view, cannot edit)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="accessLevel" className="w-4 h-4" />
                <span className="text-sm">
                  Full access (can edit transactions)
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Auto-send reports:
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Monthly P&L statement</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Expense reports</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm">Tax reports (quarterly)</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">
              Export to QuickBooks
            </button>
            <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">
              Export to Xero
            </button>
          </div>
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
            Invite Accountant
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FinancialsPage() {
  const [activeTab, setActiveTab] = useState<FinancialTab>("overview");

  const tabs: { key: FinancialTab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "income", label: "Income", icon: "💵" },
    { key: "expenses", label: "Expenses", icon: "💸" },
    { key: "invoices", label: "Invoices & Bills", icon: "🧾" },
    { key: "pl", label: "Profit & Loss", icon: "📈" },
    { key: "cashflow", label: "Cash Flow", icon: "💰" },
    { key: "bank", label: "Bank Accounts", icon: "🏦" },
    { key: "reports", label: "Financial Reports", icon: "📋" },
    { key: "settings", label: "Financial Settings", icon: "⚙️" },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "income":
        return <IncomeTab />;
      case "expenses":
        return <ExpensesTab />;
      case "invoices":
        return <InvoicesTab />;
      case "pl":
        return <ProfitLossTab />;
      case "cashflow":
        return <CashFlowTab />;
      case "bank":
        return <BankAccountsTab />;
      case "reports":
        return <FinancialReportsTab />;
      case "settings":
        return <FinancialSettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          💰 Financials
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Complete financial management and accounting
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-[var(--border)]">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTab()}
    </div>
  );
}
