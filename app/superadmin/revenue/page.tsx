"use client";

const revenueData = {
  subscriptionRevenue: 12153,
  transactionFees: 2456,
  totalRevenue: 14609,
  subscriptionChange: 10.5,
  transactionChange: 8.2,
  totalChange: 9.8,
  mrr: 11234,
  arr: 134808,
  churnRate: 2.3,
  mrrChange: 8.5,
  arrChange: 8.5,
  churnChange: -0.5,
};

const planBreakdown = [
  { plan: "Free Trial", customers: 8, mrr: 0, percentage: 0 },
  { plan: "Basic ($29)", customers: 145, mrr: 4205, percentage: 37.4 },
  { plan: "Pro ($49)", customers: 87, mrr: 4263, percentage: 37.9 },
  { plan: "Business ($99)", customers: 7, mrr: 693, percentage: 6.2 },
];

const upcomingRenewals = [
  { date: "Jan 28", restaurant: "Chicken Republic", plan: "Business", amount: 99, status: "ready" },
  { date: "Feb 1", restaurant: "Mama Cass", plan: "Pro", amount: 49, status: "ready" },
  { date: "Feb 1", restaurant: "23 others", plan: "Various", amount: 1267, status: "ready" },
  { date: "Feb 3", restaurant: "Amala Spot", plan: "Basic", amount: 29, status: "warning", note: "Card expires" },
];

function MetricCard({ title, value, change, changeType, subtitle }: {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative";
  subtitle?: string;
}) {
  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
      <p className="text-xs font-medium text-[var(--muted-foreground)] mb-1">{title}</p>
      <p className="text-2xl font-bold text-[var(--foreground)] mb-1">{value}</p>
      {change !== undefined && (
        <p className={`text-xs font-medium ${changeType === "positive" ? "text-emerald-500" : "text-red-500"}`}>
          {changeType === "positive" ? "+" : ""}{change}% {changeType === "positive" ? "↑" : "↓"}
        </p>
      )}
      {subtitle && (
        <p className="text-xs text-[var(--muted-foreground)] mt-1">{subtitle}</p>
      )}
    </div>
  );
}

export default function RevenuePage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Revenue & Billing</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Platform Revenue - January 2026</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="SUBSCRIPTION REVENUE"
          value={`$${revenueData.subscriptionRevenue.toLocaleString()}`}
          change={revenueData.subscriptionChange}
          changeType="positive"
          subtitle="+10.5% ↑"
        />
        <MetricCard
          title="TRANSACTION FEES"
          value={`$${revenueData.transactionFees.toLocaleString()}`}
          change={revenueData.transactionChange}
          changeType="positive"
          subtitle="+8.2% ↑"
        />
        <MetricCard
          title="TOTAL REVENUE"
          value={`$${revenueData.totalRevenue.toLocaleString()}`}
          change={revenueData.totalChange}
          changeType="positive"
          subtitle="+9.8% ↑"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="MRR (MONTHLY)"
          value={`$${revenueData.mrr.toLocaleString()}`}
          change={revenueData.mrrChange}
          changeType="positive"
          subtitle="+8.5% ↑"
        />
        <MetricCard
          title="ARR (ANNUAL)"
          value={`$${revenueData.arr.toLocaleString()}`}
          change={revenueData.arrChange}
          changeType="positive"
          subtitle="+8.5% ↑"
        />
        <MetricCard
          title="CHURN RATE"
          value={`${revenueData.churnRate}%`}
          change={Math.abs(revenueData.churnChange)}
          changeType="positive"
          subtitle="-0.5% ↓ Better"
        />
      </div>

      {/* Revenue by Plan */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Revenue Breakdown by Plan</h2>
        <div className="space-y-3">
          {planBreakdown.map((plan, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[var(--muted)]">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[var(--foreground)]">{plan.plan}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{plan.percentage}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--primary)] rounded-full"
                      style={{ width: `${plan.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-[var(--muted-foreground)]">{plan.customers} customers</span>
                  <span className="text-xs font-medium text-[var(--foreground)]">${plan.mrr.toLocaleString()}/month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--foreground)]">Total Active: 247</span>
            <span className="text-sm font-medium text-[var(--foreground)]">${revenueData.mrr.toLocaleString()}/month</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Avg Revenue Per Customer: $45.48 • Lifetime Value: $546 (12 month avg retention)
          </p>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Payment Collection Status</h2>
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <span className="text-sm text-[var(--foreground)]">✅ Paid On Time:</span>
            <span className="text-sm font-medium text-[var(--foreground)]">234 restaurants (94.7%)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
            <span className="text-sm text-[var(--foreground)]">⏳ Payment Pending:</span>
            <span className="text-sm font-medium text-[var(--foreground)]">10 restaurants (4.0%)</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
            <span className="text-sm text-[var(--foreground)]">⚠️ Payment Overdue:</span>
            <span className="text-sm font-medium text-[var(--foreground)]">3 restaurants (1.2%)</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-sm font-medium text-[var(--foreground)] mb-2">Overdue Accounts:</p>
          <ul className="space-y-1 text-sm text-[var(--muted-foreground)]">
            <li>• Old Buka (15 days) - $29</li>
            <li>• Test Kitchen (7 days) - $49</li>
            <li>• Small Spot (3 days) - $29</li>
          </ul>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Send Payment Reminders
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            View Details
          </button>
        </div>
      </div>

      {/* Upcoming Renewals */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Upcoming Renewals (Next 7 Days)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Date</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Restaurant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Plan</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {upcomingRenewals.map((renewal, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--muted)]">
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{renewal.date}</td>
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{renewal.restaurant}</td>
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{renewal.plan}</td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-[var(--foreground)]">${renewal.amount}</td>
                  <td className="py-3 px-4">
                    {renewal.status === "ready" ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">✅ Ready</span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">⚠️ {renewal.note}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--foreground)]">Total Expected:</span>
            <span className="text-lg font-bold text-[var(--foreground)]">$1,444</span>
          </div>
        </div>
        <div className="mt-4">
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Send Renewal Reminders
          </button>
        </div>
      </div>
    </div>
  );
}

