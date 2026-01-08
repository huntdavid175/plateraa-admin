"use client";

const servers = [
  {
    name: "API Server (Primary)",
    status: "healthy",
    cpu: 45,
    ram: { used: 8.2, total: 16 },
    disk: { used: 234, total: 500 },
    uptime: "45 days, 12 hours",
  },
  {
    name: "API Server (Secondary)",
    status: "healthy",
    cpu: 38,
    ram: { used: 7.1, total: 16 },
    disk: { used: 198, total: 500 },
    uptime: "45 days, 12 hours",
  },
  {
    name: "Database Server",
    status: "healthy",
    cpu: 28,
    ram: { used: 24, total: 32 },
    disk: { used: 12.3, total: 50 },
    connections: { used: 234, total: 500 },
    queryTime: "12ms (avg)",
  },
  {
    name: "Redis Cache",
    status: "healthy",
    memory: { used: 2.3, total: 4 },
    hitRate: "94.7%",
    keys: 456789,
  },
  {
    name: "Storage (S3/Cloud)",
    status: "healthy",
    used: 234,
    total: 1000,
    files: 123456,
  },
];

const services = [
  {
    name: "Paystack Payment Gateway",
    status: "operational",
    latency: "234ms",
    successRate: "96.2%",
    failed: "892 / 23,456",
    lastCheck: "2 mins ago",
  },
  {
    name: "Flutterwave Payment",
    status: "operational",
    latency: "312ms",
    successRate: "95.8%",
    failed: "45 / 1,234",
  },
  {
    name: "Africa's Talking SMS",
    status: "active",
    deliveryRate: "98.5%",
    sentToday: "12,456",
    failed: "187",
    credits: "1.2M remaining",
  },
  {
    name: "WhatsApp Business API",
    status: "active",
    deliveryRate: "97.2%",
    messagesToday: "5,678",
  },
  {
    name: "Email Service (SendGrid)",
    status: "active",
    deliveryRate: "97.8%",
    sentToday: "3,456",
  },
  {
    name: "Yango Delivery API",
    status: "degraded",
    latency: "1,234ms (high)",
    ordersToday: "234",
    failed: "12",
  },
];

const recentErrors = [
  { time: "2:45 PM", type: "Payment Timeout", count: 23, affected: "5 restaurants" },
  { time: "1:30 PM", type: "SMS Send Failed", count: 12, affected: "3 restaurants" },
  { time: "12:15 PM", type: "API Rate Limit", count: 8, affected: "2 restaurants" },
  { time: "11:00 AM", type: "DB Connection", count: 2, affected: "System-wide" },
];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    healthy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    operational: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    degraded: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-700"}`}>
      ✅ {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function SystemHealthPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">System Health</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Monitor platform infrastructure and services</p>
      </div>

      {/* Server Status */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">🖥️ Server Status</h2>
        <div className="space-y-4">
          {servers.map((server, i) => (
            <div key={i} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-[var(--foreground)]">{server.name}</h3>
                <StatusBadge status={server.status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {server.cpu !== undefined && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">CPU</p>
                    <p className="font-medium text-[var(--foreground)]">{server.cpu}%</p>
                  </div>
                )}
                {server.ram && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">RAM</p>
                    <p className="font-medium text-[var(--foreground)]">{server.ram.used}GB / {server.ram.total}GB</p>
                  </div>
                )}
                {server.disk && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Disk</p>
                    <p className="font-medium text-[var(--foreground)]">{server.disk.used}GB / {server.disk.total}GB</p>
                  </div>
                )}
                {server.uptime && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Uptime</p>
                    <p className="font-medium text-[var(--foreground)]">{server.uptime}</p>
                  </div>
                )}
                {server.connections && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Connections</p>
                    <p className="font-medium text-[var(--foreground)]">{server.connections.used} / {server.connections.total}</p>
                  </div>
                )}
                {server.queryTime && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Query Time</p>
                    <p className="font-medium text-[var(--foreground)]">{server.queryTime}</p>
                  </div>
                )}
                {server.memory && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Memory</p>
                    <p className="font-medium text-[var(--foreground)]">{server.memory.used}GB / {server.memory.total}GB</p>
                  </div>
                )}
                {server.hitRate && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Hit Rate</p>
                    <p className="font-medium text-[var(--foreground)]">{server.hitRate}</p>
                  </div>
                )}
                {server.keys && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Keys</p>
                    <p className="font-medium text-[var(--foreground)]">{server.keys.toLocaleString()}</p>
                  </div>
                )}
                {server.used !== undefined && server.total && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Used</p>
                    <p className="font-medium text-[var(--foreground)]">{server.used}GB / {server.total}GB</p>
                  </div>
                )}
                {server.files && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Files</p>
                    <p className="font-medium text-[var(--foreground)]">{server.files.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-[var(--foreground)] bg-[var(--card)] rounded-lg hover:bg-[var(--border)]">
                  View Logs
                </button>
                {server.name.includes("API Server") && (
                  <>
                    <button className="px-3 py-1.5 text-xs font-medium text-[var(--foreground)] bg-[var(--card)] rounded-lg hover:bg-[var(--border)]">
                      Restart
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-[var(--foreground)] bg-[var(--card)] rounded-lg hover:bg-[var(--border)]">
                      Scale
                    </button>
                  </>
                )}
                {server.name.includes("Database") && (
                  <button className="px-3 py-1.5 text-xs font-medium text-[var(--foreground)] bg-[var(--card)] rounded-lg hover:bg-[var(--border)]">
                    Backup Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* External Services */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">🔌 External Services</h2>
        <div className="space-y-3">
          {services.map((service, i) => (
            <div key={i} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-[var(--foreground)]">{service.name}</h3>
                <StatusBadge status={service.status} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {service.latency && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Latency</p>
                    <p className="font-medium text-[var(--foreground)]">{service.latency}</p>
                  </div>
                )}
                {service.successRate && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Success Rate</p>
                    <p className="font-medium text-[var(--foreground)]">{service.successRate}</p>
                  </div>
                )}
                {service.failed && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Failed</p>
                    <p className="font-medium text-[var(--foreground)]">{service.failed}</p>
                  </div>
                )}
                {service.deliveryRate && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Delivery Rate</p>
                    <p className="font-medium text-[var(--foreground)]">{service.deliveryRate}</p>
                  </div>
                )}
                {service.sentToday && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Sent Today</p>
                    <p className="font-medium text-[var(--foreground)]">{service.sentToday}</p>
                  </div>
                )}
                {service.messagesToday && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Messages Today</p>
                    <p className="font-medium text-[var(--foreground)]">{service.messagesToday}</p>
                  </div>
                )}
                {service.credits && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Credits</p>
                    <p className="font-medium text-[var(--foreground)]">{service.credits}</p>
                  </div>
                )}
                {service.ordersToday && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Orders Today</p>
                    <p className="font-medium text-[var(--foreground)]">{service.ordersToday}</p>
                  </div>
                )}
                {service.lastCheck && (
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Last Check</p>
                    <p className="font-medium text-[var(--foreground)]">{service.lastCheck}</p>
                  </div>
                )}
              </div>
              {service.status === "degraded" && (
                <div className="mt-3">
                  <button className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30">
                    Contact Support
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error Monitoring */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">🐛 Recent Errors (Last 24 Hours)</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Time</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Type</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Count</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Affected</th>
              </tr>
            </thead>
            <tbody>
              {recentErrors.map((error, i) => (
                <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--muted)]">
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{error.time}</td>
                  <td className="py-3 px-4 text-sm text-[var(--foreground)]">{error.type}</td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-[var(--foreground)]">{error.count}</td>
                  <td className="py-3 px-4 text-sm text-[var(--muted-foreground)]">{error.affected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--foreground)] mb-2">
            Total Errors: 45 (0.03% error rate)
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Critical: 0 | High: 2 | Medium: 15 | Low: 28
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            View Error Logs
          </button>
          <button className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Set Up Alerts
          </button>
        </div>
      </div>
    </div>
  );
}

