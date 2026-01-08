"use client";

import { useState } from "react";

const mockRestaurants = [
  {
    id: "1",
    name: "Mama Cass",
    owner: "John Doe",
    location: "Lagos",
    plan: "Pro",
    planPrice: 49,
    status: "active",
    orders: 1234,
    joined: "Jan 2025",
    dueDate: "Feb 1",
  },
  {
    id: "2",
    name: "Chicken Republic",
    owner: "Sarah M.",
    location: "Lagos",
    plan: "Business",
    planPrice: 99,
    status: "active",
    orders: 2345,
    joined: "Dec 2024",
    dueDate: "Jan 28",
  },
  {
    id: "3",
    name: "Amala Spot",
    owner: "Mike K.",
    location: "Ibadan",
    plan: "Basic",
    planPrice: 29,
    status: "active",
    orders: 567,
    joined: "Nov 2024",
    dueDate: "Feb 5",
  },
  {
    id: "4",
    name: "Test Kitchen",
    owner: "Test User",
    location: "Lagos",
    plan: "Trial",
    planPrice: 0,
    status: "trial",
    orders: 2,
    joined: "Jan 28, 2026",
    expires: "Feb 11",
  },
  {
    id: "5",
    name: "Old Buka",
    owner: "David L.",
    location: "Abuja",
    plan: "Basic",
    planPrice: 29,
    status: "suspended",
    orders: 0,
    joined: "Aug 2024",
    overdue: "15 days",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    trial: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    suspended: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  const labels = {
    active: "✅ Active",
    trial: "🟡 Trial",
    suspended: "🔴 Suspended",
    inactive: "⚫ Inactive",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.inactive}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
}

export default function RestaurantsPage() {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRestaurants = mockRestaurants.filter((restaurant) => {
    const matchesStatus = selectedStatus === "all" || restaurant.status === selectedStatus;
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">Restaurants</h1>
          <p className="text-sm text-[var(--muted-foreground)]">All Restaurants ({mockRestaurants.length})</p>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          + Add Manual
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1.5 text-xs font-medium bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Active: 234
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Trial: 8
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Suspended: 3
          </button>
          <button className="px-3 py-1.5 text-xs font-medium bg-[var(--muted)] rounded-lg hover:bg-[var(--border)]">
            Inactive: 2
          </button>
        </div>
      </div>

      {/* Restaurant Table */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Restaurant</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Owner</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Plan</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Orders</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--muted-foreground)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{restaurant.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{restaurant.location}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">Joined: {restaurant.joined}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[var(--foreground)]">{restaurant.owner}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{restaurant.plan}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {restaurant.planPrice > 0 ? `$${restaurant.planPrice}/mo` : "Free"}
                      </p>
                      {restaurant.dueDate && (
                        <p className="text-xs text-[var(--muted-foreground)]">Due: {restaurant.dueDate}</p>
                      )}
                      {restaurant.expires && (
                        <p className="text-xs text-amber-600">Expires: {restaurant.expires}</p>
                      )}
                      {restaurant.overdue && (
                        <p className="text-xs text-red-600">Payment overdue {restaurant.overdue}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={restaurant.status} />
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-[var(--foreground)]">{restaurant.orders.toLocaleString()} orders</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

