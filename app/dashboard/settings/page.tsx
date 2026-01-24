"use client";

import { useState, useEffect } from "react";

type SettingsSection = 
  | "profile" | "users" | "payments" | "delivery" | "menu" 
  | "integrations" | "notifications" | "hours" | "taxes" 
  | "branding" | "security" | "analytics" | "data" | "api" | "system" | "loyalty";

const settingsNav = [
  { key: "profile" as const, label: "Restaurant Profile", icon: "🏪" },
  { key: "users" as const, label: "Users & Permissions", icon: "👥" },
  { key: "payments" as const, label: "Payment Settings", icon: "💳" },
  { key: "delivery" as const, label: "Delivery Settings", icon: "🚚" },
  { key: "menu" as const, label: "Menu Management", icon: "🍽️" },
  { key: "integrations" as const, label: "Channels & Integrations", icon: "📱" },
  { key: "notifications" as const, label: "Notifications", icon: "🔔" },
  { key: "hours" as const, label: "Business Hours", icon: "📊" },
  { key: "taxes" as const, label: "Taxes & Fees", icon: "💰" },
  { key: "loyalty" as const, label: "Loyalty & Rewards", icon: "🎁" },
  { key: "branding" as const, label: "Branding & Customization", icon: "🎨" },
  { key: "security" as const, label: "Security", icon: "🔒" },
  { key: "analytics" as const, label: "Analytics & Tracking", icon: "📈" },
  { key: "data" as const, label: "Data & Backup", icon: "🗄️" },
  { key: "api" as const, label: "API & Webhooks", icon: "🔌" },
  { key: "system" as const, label: "System Information", icon: "ℹ️" },
];

function FormField({ label, required, children, hint }: { 
  label: string; 
  required?: boolean; 
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
    </div>
  );
}

function Input({ placeholder, value, type = "text", disabled, onChange }: { 
  placeholder?: string; 
  value?: string; 
  type?: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50"
    />
  );
}

function Select({ children, value, onChange }: { 
  children: React.ReactNode; 
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) {
  return (
    <select 
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
    >
      {children}
    </select>
  );
}

function Toggle({ label, checked, hint }: { label: string; checked?: boolean; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" defaultChecked={checked} className="mt-1 w-4 h-4 rounded" />
      <div>
        <span className="text-sm text-[var(--foreground)]">{label}</span>
        {hint && <p className="text-xs text-[var(--muted-foreground)]">{hint}</p>}
      </div>
    </label>
  );
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)]">
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
        {action}
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: "connected" | "disconnected" | "warning"; label: string }) {
  const styles = {
    connected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    disconnected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status === "connected" ? "✅" : status === "disconnected" ? "🔴" : "⚠️"} {label}
    </span>
  );
}

// Restaurant Profile Section
function RestaurantProfile() {
  return (
    <div className="space-y-6">
      <Card title="Restaurant Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Restaurant Name" required>
            <Input value="Plateraa Restaurant" placeholder="Enter restaurant name" />
          </FormField>
          <FormField label="Business Name (Legal)" required>
            <Input value="Plateraa Foods Ltd" placeholder="Legal business name" />
          </FormField>
          <FormField label="Phone Number" required>
            <Input value="+234 801 234 5678" placeholder="+234..." />
          </FormField>
          <FormField label="Email">
            <Input value="contact@plateraa.com" type="email" placeholder="contact@restaurant.com" />
          </FormField>
          <FormField label="Website">
            <Input value="https://plateraa.com" placeholder="https://..." />
          </FormField>
          <FormField label="Business Type">
            <Select value="restaurant">
              <option value="restaurant">Restaurant</option>
              <option value="fast-food">Fast Food</option>
              <option value="cafe">Cafe</option>
              <option value="cloud-kitchen">Cloud Kitchen</option>
            </Select>
          </FormField>
        </div>
        <FormField label="Description">
          <textarea 
            className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] min-h-[80px]"
            defaultValue="Authentic Nigerian cuisine, serving Lagos since 2020"
            placeholder="Describe your restaurant..."
          />
        </FormField>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Cuisine Types</label>
          <div className="flex flex-wrap gap-2">
            {["Nigerian", "African", "Continental", "Chinese", "Indian", "Italian"].map((cuisine) => (
              <label key={cuisine} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)] rounded-lg cursor-pointer hover:bg-[var(--border)]">
                <input type="checkbox" defaultChecked={["Nigerian", "African"].includes(cuisine)} className="w-4 h-4 rounded" />
                <span className="text-sm">{cuisine}</span>
              </label>
            ))}
          </div>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          Save Changes
        </button>
      </Card>

      <Card title="Business Location">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <FormField label="Street Address" required>
              <Input value="123 Admiralty Way" placeholder="Enter street address" />
            </FormField>
          </div>
          <FormField label="City" required>
            <Input value="Lagos" placeholder="City" />
          </FormField>
          <FormField label="State/Region" required>
            <Input value="Lagos" placeholder="State" />
          </FormField>
          <FormField label="Country" required>
            <Select value="nigeria"><option value="nigeria">Nigeria</option></Select>
          </FormField>
          <FormField label="Postal Code">
            <Input value="101241" placeholder="Postal code" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Landmark/Directions">
              <Input value="Near Four Points Hotel, opposite Eko Hotel" placeholder="Nearby landmarks..." />
            </FormField>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Delivery Radius (km)</label>
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((km) => (
              <button key={km} className={`px-4 py-2 rounded-lg text-sm font-medium ${km === 10 ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]"}`}>
                {km} km
              </button>
            ))}
            <input type="number" placeholder="Custom" className="w-24 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm" />
          </div>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          Save Location
        </button>
      </Card>

      <Card title="Restaurant Branding" action={<button className="text-sm text-[var(--primary)]">+ Add Images</button>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Logo (500x500px)</label>
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center">
              <div className="w-20 h-20 mx-auto bg-[var(--primary)] rounded-lg flex items-center justify-center text-white text-2xl font-bold mb-2">
                P
              </div>
              <button className="text-sm text-[var(--primary)]">Change Logo</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Cover Photo (1200x400px)</label>
            <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center h-[140px] flex items-center justify-center">
              <button className="text-sm text-[var(--primary)]">Upload Cover Photo</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Users & Permissions Section
interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  branchId: string | null;
  branchName: string | null;
  status: string;
}

interface Branch {
  id: string;
  name: string;
}

interface InstitutionCode {
  id: string;
  code: string;
  name: string | null;
  is_active: boolean;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

function UsersPermissions() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [codes, setCodes] = useState<InstitutionCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editBranchId, setEditBranchId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Code creation state
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newCodeName, setNewCodeName] = useState("");
  const [isCreatingCode, setIsCreatingCode] = useState(false);

  // Fetch users, branches, and codes on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [usersRes, branchesRes, codesRes] = await Promise.all([
          fetch("/api/users"),
          fetch("/api/branches"),
          fetch("/api/institution-codes"),
        ]);
        
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        }
        
        if (branchesRes.ok) {
          const data = await branchesRes.json();
          setBranches(data.branches || []);
        }
        
        if (codesRes.ok) {
          const data = await codesRes.json();
          console.log("Fetched codes:", data);
          setCodes(data.codes || []);
        } else {
          console.error("Failed to fetch codes:", await codesRes.text());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      owner: "Owner",
      manager: "Manager",
      admin: "Admin",
      cashier: "Cashier",
      kitchen: "Kitchen Staff",
      delivery: "Rider",
      accountant: "Accountant",
    };
    return roleMap[role] || role;
  };

  const roles = [
    { value: "owner", label: "Owner" },
    { value: "manager", label: "Manager" },
    { value: "admin", label: "Admin" },
    { value: "cashier", label: "Cashier" },
    { value: "kitchen", label: "Kitchen Staff" },
    { value: "delivery", label: "Rider" },
    { value: "accountant", label: "Accountant" },
  ];

  const handleCreateCode = async () => {
    if (!newCode.trim()) {
      alert("Please enter a code");
      return;
    }
    
    setIsCreatingCode(true);
    try {
      const res = await fetch("/api/institution-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newCode,
          name: newCodeName || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCodes([data.code, ...codes]);
        setShowCodeModal(false);
        setNewCode("");
        setNewCodeName("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create code");
      }
    } catch (err) {
      console.error("Error creating code:", err);
      alert("Failed to create code");
    } finally {
      setIsCreatingCode(false);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("Are you sure you want to delete this code?")) return;
    
    try {
      const res = await fetch(`/api/institution-codes/${codeId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCodes(codes.filter(c => c.id !== codeId));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete code");
      }
    } catch (err) {
      console.error("Error deleting code:", err);
      alert("Failed to delete code");
    }
  };

  const handleToggleCode = async (codeId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/institution-codes/${codeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setCodes(codes.map(c => 
          c.id === codeId ? { ...c, is_active: !isActive } : c
        ));
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update code");
      }
    } catch (err) {
      console.error("Error updating code:", err);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditBranchId(user.branchId || "");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditRole("");
    setEditBranchId("");
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          branchId: editBranchId || null,
        }),
      });

      if (res.ok) {
        // Update local state
        setUsers(users.map(u => 
          u.id === editingUser.id 
            ? { 
                ...u, 
                role: editRole, 
                branchId: editBranchId || null,
                branchName: branches.find(b => b.id === editBranchId)?.name || null,
              } 
            : u
        ));
        closeEditModal();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Institution Codes */}
      <Card title="Institution Codes">
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Share these codes with staff members. They can sign up at{" "}
            <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">
              /staff/signup
            </code>
          </p>
        </div>

        {codes.length === 0 ? (
          <div className="py-6 text-center text-[var(--muted-foreground)]">
            <p className="mb-4">No institution codes yet.</p>
            <button
              onClick={() => setShowCodeModal(true)}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90"
            >
              Create Your First Code
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowCodeModal(true)}
                className="px-4 py-2 bg-[var(--primary)] text-white text-sm rounded-lg hover:opacity-90"
              >
                + New Code
              </button>
            </div>
            <div className="space-y-3">
              {codes.map((code) => (
                <div 
                  key={code.id} 
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    code.is_active 
                      ? "bg-[var(--muted)] border-[var(--border)]" 
                      : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <code className="px-3 py-1.5 bg-[var(--background)] border border-[var(--border)] rounded font-mono text-lg font-semibold">
                        {code.code}
                      </code>
                      {!code.is_active && (
                        <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
                      {code.name && <span>{code.name}</span>}
                      <span>Used {code.uses_count} times</span>
                      {code.max_uses && <span>Max: {code.max_uses}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCode(code.id, code.is_active)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        code.is_active
                          ? "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                          : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                      }`}
                    >
                      {code.is_active ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => handleDeleteCode(code.id)}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card title="Team Members">
        {isLoading ? (
          <div className="py-8 text-center text-[var(--muted-foreground)]">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-[var(--muted-foreground)]">
            <p className="mb-2">No team members yet.</p>
            <p className="text-sm">Share your institution code with staff to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-[var(--muted)]">
                    <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{user.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "owner" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" :
                        user.role === "manager" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}>
                        {formatRole(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                      {user.branchName || <span className="text-amber-600 dark:text-amber-400">Not assigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="text-sm text-[var(--primary)] hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Role Permissions">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {["Owner", "Manager", "Cashier", "Kitchen Staff", "Rider", "Accountant"].map((role) => (
            <div key={role} className="p-4 bg-[var(--muted)] rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-[var(--foreground)]">{role}</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                {role === "Owner" ? "Full access to all features" : 
                 role === "Manager" ? "Most access, no billing" :
                 role === "Cashier" ? "Create orders, view reports" :
                 role === "Kitchen Staff" ? "View/update orders only" :
                 role === "Rider" ? "View delivery orders only" :
                 "View reports only"}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Edit User</h2>
              <p className="text-sm text-[var(--muted-foreground)]">{editingUser.name}</p>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Branch Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Branch
                </label>
                <select
                  value={editBranchId}
                  onChange={(e) => setEditBranchId(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">No branch assigned</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Create Institution Code</h2>
              <p className="text-sm text-[var(--muted-foreground)]">Create a code for staff to join your institution</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Code *
                </label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g., PLAT-2024"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] font-mono uppercase"
                />
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  Staff will enter this code during signup
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newCodeName}
                  onChange={(e) => setNewCodeName(e.target.value)}
                  placeholder="e.g., Kitchen Staff Code"
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setNewCode("");
                  setNewCodeName("");
                }}
                className="px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCode}
                disabled={isCreatingCode || !newCode.trim()}
                className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isCreatingCode ? "Creating..." : "Create Code"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Payment Settings Section
function PaymentSettings() {
  return (
    <div className="space-y-6">
      <Card title="Payment Gateways">
        <div className="space-y-4">
          {[
            { name: "Paystack", status: "connected", details: "Mobile Money, Card Payments" },
            { name: "Flutterwave", status: "disconnected", details: null },
            { name: "Cash on Delivery", status: "connected", details: "Available for Delivery & Pickup" },
          ].map((gateway) => (
            <div key={gateway.name} className="p-4 bg-[var(--muted)] rounded-lg flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">{gateway.name}</span>
                  <StatusBadge status={gateway.status as "connected" | "disconnected"} label={gateway.status === "connected" ? "Connected" : "Not Setup"} />
                </div>
                {gateway.details && <p className="text-xs text-[var(--muted-foreground)] mt-1">{gateway.details}</p>}
              </div>
              <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                {gateway.status === "connected" ? "Configure" : "Connect Now"}
              </button>
            </div>
          ))}
        </div>
        <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
          + Add Payment Method
        </button>
      </Card>

      <Card title="Payment Link Settings">
        <div className="space-y-4">
          <FormField label="Link Expiration" hint="Payment links will expire after this duration">
            <div className="flex items-center gap-2">
              <input type="number" defaultValue={30} className="w-20 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm" />
              <span className="text-sm text-[var(--muted-foreground)]">minutes</span>
            </div>
          </FormField>
          <Toggle label="Send reminder if not paid within 15 minutes" checked />
          <Toggle label="Auto-cancel orders if payment not received within 60 minutes" checked />
          <Toggle label="Show restaurant logo on payment page" checked />
          <FormField label="Custom Message">
            <Input value="Thank you for ordering!" placeholder="Message shown on payment page" />
          </FormField>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          Save Settings
        </button>
      </Card>

      <Card title="Order Limits">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Toggle label="Require minimum order" checked />
            <div className="flex items-center gap-2">
              <span className="text-sm">₵</span>
              <input type="number" defaultValue={1000} className="w-24 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-4 pl-7">
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
              <span className="text-sm">Delivery</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="text-sm">Pickup</span>
            </label>
          </div>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          Save Limits
        </button>
      </Card>
    </div>
  );
}

// Delivery Settings Section
function DeliverySettings() {
  return (
    <div className="space-y-6">
      <Card title="Delivery Methods">
        <div className="space-y-4">
          <div className="p-4 bg-[var(--muted)] rounded-lg space-y-3">
            <Toggle label="Enable self delivery with own riders" checked />
            <div className="grid grid-cols-3 gap-4 pl-7">
              <FormField label="Base Fee">
                <div className="flex items-center gap-2">
                  <span className="text-sm">₵</span>
                  <Input value="500" type="number" />
                </div>
              </FormField>
              <FormField label="Per km">
                <div className="flex items-center gap-2">
                  <span className="text-sm">₵</span>
                  <Input value="100" type="number" />
                </div>
              </FormField>
              <FormField label="Free delivery over">
                <div className="flex items-center gap-2">
                  <span className="text-sm">₵</span>
                  <Input value="5000" type="number" />
                </div>
              </FormField>
            </div>
          </div>
          <div className="p-4 bg-[var(--muted)] rounded-lg space-y-3">
            <Toggle label="Allow customers to pick up orders" checked />
            <div className="grid grid-cols-2 gap-4 pl-7">
              <FormField label="Pickup Discount">
                <div className="flex items-center gap-2">
                  <Input value="5" type="number" />
                  <span className="text-sm">%</span>
                </div>
              </FormField>
              <FormField label="Ready Time">
                <div className="flex items-center gap-2">
                  <Input value="30" type="number" />
                  <span className="text-sm">mins</span>
                </div>
              </FormField>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Delivery Zones" action={<button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">+ Add Zone</button>}>
        <div className="space-y-3">
          {[
            { name: "Victoria Island & Ikoyi", radius: "0-5 km", fee: 500, time: "20-30 mins" },
            { name: "Lekki Phase 1", radius: "5-10 km", fee: 800, time: "30-45 mins" },
            { name: "Ajah, Lekki Phase 2", radius: "10-15 km", fee: 1200, time: "45-60 mins" },
          ].map((zone, i) => (
            <div key={i} className="p-4 bg-[var(--muted)] rounded-lg flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--foreground)]">{zone.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {zone.radius} • ₵{zone.fee} • {zone.time}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="text-sm text-[var(--primary)]">Edit</button>
                <button className="text-sm text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Riders" action={<button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">+ Add Rider</button>}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Vehicle</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {[
                { name: "James A.", phone: "080-123-4567", vehicle: "Bike", status: "available" },
                { name: "Sarah K.", phone: "070-234-5678", vehicle: "Bike", status: "busy" },
                { name: "Mike O.", phone: "090-345-6789", vehicle: "Car", status: "offline" },
              ].map((rider, i) => (
                <tr key={i} className="hover:bg-[var(--muted)]">
                  <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">{rider.name}</td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{rider.phone}</td>
                  <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{rider.vehicle}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      rider.status === "available" ? "text-emerald-600" : 
                      rider.status === "busy" ? "text-amber-600" : "text-gray-500"
                    }`}>
                      {rider.status === "available" ? "🟢" : rider.status === "busy" ? "🔴" : "⚫"} {rider.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-sm text-[var(--primary)]">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Notifications Section - Coming Soon
function NotificationsSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">🔔</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Notifications Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Configure SMS, WhatsApp, and email notifications for orders, payments, and staff alerts.
        </p>
      </div>
    </div>
  );
}

/*
// Original NotificationsSettings data - commented out for later implementation
const notificationsData = {
  customerNotifications: [
    { event: "Order Confirmation", sms: true, whatsapp: true, email: false },
    { event: "Payment Received", sms: true, whatsapp: true, email: false },
    { event: "Order Preparing", sms: false, whatsapp: true, email: false },
    { event: "Order Ready", sms: true, whatsapp: true, email: false },
    { event: "Out for Delivery", sms: true, whatsapp: true, email: false },
    { event: "Order Delivered", sms: true, whatsapp: false, email: false },
    { event: "Payment Reminder", sms: true, whatsapp: true, email: false },
  ],
  staffNotifications: [
    { event: "New Order (Paid)", recipients: "Kitchen Staff", push: true, sms: true },
    { event: "Order Cancelled", recipients: "Manager, Kitchen", push: true, sms: false },
    { event: "Low Stock Alert", recipients: "Manager", push: true, sms: true },
    { event: "Daily Summary", recipients: "Owner, Manager", push: false, sms: false, email: true },
    { event: "Failed Payment", recipients: "Cashier", push: true, sms: false },
  ],
};
*/

// Business Hours Section
function BusinessHours() {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  
  return (
    <div className="space-y-6">
      <Card title="Operating Hours">
        <div className="space-y-3">
          {days.map((day, i) => (
            <div key={day} className="flex items-center gap-4 p-3 bg-[var(--muted)] rounded-lg">
              <label className="flex items-center gap-2 w-32">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-[var(--foreground)]">{day}</span>
              </label>
              <select className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                <option>{i === 5 ? "10:00 AM" : i === 6 ? "11:00 AM" : "09:00 AM"}</option>
              </select>
              <span className="text-sm text-[var(--muted-foreground)]">to</span>
              <select className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                <option>{i >= 4 && i <= 5 ? "11:00 PM" : i === 6 ? "09:00 PM" : "10:00 PM"}</option>
              </select>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-emerald-600">✅ Currently: OPEN (Closes at 10:00 PM)</span>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          Save Hours
        </button>
      </Card>

      <Card title="Order Acceptance">
        <div className="space-y-4">
          <FormField label="Stop accepting orders before closing" hint="Orders will be rejected this many minutes before closing time">
            <div className="flex items-center gap-2">
              <input type="number" defaultValue={30} className="w-20 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm" />
              <span className="text-sm text-[var(--muted-foreground)]">minutes</span>
            </div>
          </FormField>
          <Toggle label="Allow customers to schedule orders for later" checked />
          <div className="grid grid-cols-2 gap-4 pl-7">
            <FormField label="Minimum advance notice">
              <div className="flex items-center gap-2">
                <Input value="2" type="number" />
                <span className="text-sm">hours</span>
              </div>
            </FormField>
            <FormField label="Maximum advance">
              <div className="flex items-center gap-2">
                <Input value="7" type="number" />
                <span className="text-sm">days</span>
              </div>
            </FormField>
          </div>
        </div>
        <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
          Save Settings
        </button>
      </Card>

      <Card title="Holiday Schedule" action={<button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">+ Add Holiday</button>}>
        <div className="space-y-2">
          {[
            { date: "Dec 25, 2025", name: "Christmas Day", hours: "Closed" },
            { date: "Dec 26, 2025", name: "Boxing Day", hours: "12PM-6PM" },
            { date: "Jan 1, 2026", name: "New Year", hours: "11AM-8PM" },
          ].map((holiday, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">{holiday.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{holiday.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm ${holiday.hours === "Closed" ? "text-red-600" : "text-amber-600"}`}>{holiday.hours}</span>
                <button className="text-xs text-[var(--primary)]">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Integrations Section
function IntegrationsSettings() {
  return (
    <div className="space-y-6">
      <Card title="Delivery Platforms">
        <div className="space-y-4">
          {[
            { name: "Bolt Food", id: "BF_1234567", connected: true, commission: "25%" },
            { name: "Chowdeck", id: "CD_7654321", connected: true, commission: "25%" },
            { name: "Glovo", id: null, connected: false, commission: null },
          ].map((platform) => (
            <div key={platform.name} className="p-4 bg-[var(--muted)] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">{platform.name}</span>
                    <StatusBadge status={platform.connected ? "connected" : "disconnected"} label={platform.connected ? "Connected" : "Not Connected"} />
                  </div>
                  {platform.connected && (
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">
                      ID: {platform.id} • Commission: {platform.commission}
                    </div>
                  )}
                </div>
                <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                  {platform.connected ? "Configure" : "Connect Now"}
                </button>
              </div>
              {platform.connected && (
                <div className="mt-3 flex gap-4">
                  <Toggle label="Auto-accept orders" checked={platform.name === "Bolt Food"} />
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Social Media & Messaging">
        <div className="space-y-4">
          {[
            { name: "WhatsApp Business", handle: "+234 801 234 5678", connected: true },
            { name: "Instagram", handle: "@platerafoods", connected: true },
            { name: "Facebook", handle: null, connected: false },
          ].map((social) => (
            <div key={social.name} className="p-4 bg-[var(--muted)] rounded-lg flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">{social.name}</span>
                  <StatusBadge status={social.connected ? "connected" : "disconnected"} label={social.connected ? "Connected" : "Not Connected"} />
                </div>
                {social.handle && <p className="text-xs text-[var(--muted-foreground)] mt-1">{social.handle}</p>}
              </div>
              <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm">
                {social.connected ? "Settings" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card title="SMS Provider">
        <div className="space-y-4">
          <FormField label="Provider">
            <Select value="africastalking">
              <option value="africastalking">Africa&apos;s Talking</option>
              <option value="twilio">Twilio</option>
              <option value="termii">Termii</option>
            </Select>
          </FormField>
          <FormField label="API Key">
            <Input value="at_api_••••••••••••••••" />
          </FormField>
          <FormField label="Sender ID" hint="Brand name shown in SMS (max 11 characters)">
            <Input value="Plateraa" />
          </FormField>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">SMS Credits Balance: 2,450 SMS remaining</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium">Test SMS</button>
            <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Save Settings</button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Security Section - Coming Soon
function SecuritySettings() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Security Settings Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Configure two-factor authentication, password policies, session timeouts, and view activity logs.
        </p>
      </div>
    </div>
  );
}

/*
// Original SecuritySettings data - commented out for later implementation
const securityData = {
  recentActivity: [
    { time: "Jan 3, 2:45 PM", user: "John Doe", action: "Updated menu item" },
    { time: "Jan 3, 1:30 PM", user: "Sarah K.", action: "Created order #1245" },
    { time: "Jan 3, 12:15 PM", user: "Mike O.", action: "Changed delivery zone" },
    { time: "Jan 2, 6:00 PM", user: "System", action: "Daily report sent" },
  ],
};
*/

// System Information Section - Coming Soon
function SystemInformation() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">System Information Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          View subscription details, system health, version info, and access support resources.
        </p>
      </div>
    </div>
  );
}

/*
// Original SystemInformation data - commented out for later implementation
const systemInfoData = {
  subscription: {
    plan: "Professional",
    price: "$49/month",
    nextBilling: "Feb 1, 2026",
    features: [
      "Unlimited orders",
      "2 locations",
      "10 staff accounts",
      "Advanced reports",
      "Priority support",
      "API access",
    ],
  },
  systemHealth: [
    { service: "Platform Status", status: "operational" },
    { service: "API", status: "operational" },
    { service: "Payment Gateway", status: "operational" },
    { service: "SMS Service", status: "operational", note: "2,450 credits" },
    { service: "Database", status: "operational" },
  ],
  about: {
    version: "v2.4.1",
    lastUpdated: "Dec 28, 2025",
    supportEmail: "support@plateraa.com",
    supportPhone: "+234 800 123 4567",
  },
};
*/

// Data & Backup Section - Coming Soon
function DataBackup() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">💾</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Data & Backup Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Configure automatic backups, export data, and manage privacy compliance settings.
        </p>
      </div>
    </div>
  );
}

/*
// Original DataBackup data - commented out for later implementation
const dataBackupData = {
  backup: {
    autoBackupEnabled: true,
    retentionDays: 30,
    lastBackup: "Jan 3, 2026 at 3:00 AM",
  },
  privacy: {
    customerDataRetentionYears: 2,
    allowDataDeletionRequests: true,
  },
};
*/

// API & Webhooks Section - Coming Soon
function APIWebhooks() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">API & Webhooks Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Manage API keys, configure webhooks, and integrate with external services.
        </p>
      </div>
    </div>
  );
}

/*
// Original APIWebhooks data - commented out for later implementation
const apiWebhooksData = {
  apiKeys: {
    productionKey: "pk_live_••••••••••••••••••••",
    productionLastUsed: "Jan 3, 2026",
    testKey: "pk_test_••••••••••••••••••••",
  },
  webhooks: [
    {
      url: "https://yourapp.com/webhooks/orders",
      status: "active",
      events: ["order.created", "order.paid", "order.ready"],
    },
  ],
  availableEvents: [
    "order.created",
    "order.paid",
    "order.preparing",
    "order.ready",
    "order.delivered",
    "order.cancelled",
    "payment.failed",
    "customer.created",
  ],
};
*/

// Taxes & Fees Section - Coming Soon
function TaxesSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">💰</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Taxes & Fees Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Configure VAT, service charges, and other fees for your orders.
        </p>
      </div>
    </div>
  );
}

/*
// Original TaxesSettings data - commented out for later implementation
const taxesData = {
  vatRate: 7.5,
  vatDisplay: "included", // or "added"
  serviceCharge: {
    enabled: true,
    rate: 10,
    appliesTo: ["dine_in"],
  },
};
*/

function BrandingSettings() {
  return (
    <div className="space-y-6">
      <Card title="Customer Website">
        <div className="space-y-4">
          <div className="p-4 bg-[var(--muted)] rounded-lg">
            <p className="text-sm text-[var(--muted-foreground)]">Your Website URL</p>
            <p className="text-sm font-medium text-[var(--primary)]">https://plateraa.order.io</p>
            <div className="flex gap-2 mt-2">
              <button className="text-xs text-[var(--primary)]">Copy Link</button>
              <button className="text-xs text-[var(--primary)]">Visit Site</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Primary Color">
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#5046e5" className="w-10 h-10 rounded border border-[var(--border)]" />
                <Input value="#5046e5" />
              </div>
            </FormField>
            <FormField label="Secondary Color">
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#FFC107" className="w-10 h-10 rounded border border-[var(--border)]" />
                <Input value="#FFC107" />
              </div>
            </FormField>
          </div>
          <FormField label="Font">
            <Select value="poppins">
              <option value="poppins">Poppins</option>
              <option value="roboto">Roboto</option>
              <option value="inter">Inter</option>
              <option value="lato">Lato</option>
            </Select>
          </FormField>
          <FormField label="Homepage Headline">
            <Input value="Authentic Nigerian Cuisine" placeholder="Enter headline" />
          </FormField>
          <FormField label="Tagline">
            <Input value="Fresh, Fast, Delicious" placeholder="Enter tagline" />
          </FormField>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-lg text-sm font-medium">Preview Website</button>
          <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">Save Changes</button>
        </div>
      </Card>
    </div>
  );
}

// Analytics & Tracking Section - Coming Soon
function AnalyticsSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">📈</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Analytics & Tracking Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Configure Google Analytics, Facebook Pixel, and other tracking tools for your storefront.
        </p>
      </div>
    </div>
  );
}

/*
// Original AnalyticsSettings data - commented out for later implementation
const analyticsData = {
  googleAnalytics: {
    enabled: true,
    trackingId: "G-XXXXXXXXXX",
  },
  facebookPixel: {
    enabled: true,
    pixelId: "1234567890",
  },
};
*/

function MenuManagement() {
  return (
    <div className="space-y-6">
      <Card title="Menu Categories" action={<button className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">+ Add Category</button>}>
        <div className="space-y-2">
          {[
            { name: "Main Dishes", items: 12, visible: true, icon: "🍛" },
            { name: "Sides", items: 8, visible: true, icon: "🍗" },
            { name: "Drinks", items: 15, visible: true, icon: "🥤" },
            { name: "Desserts", items: 5, visible: false, icon: "🍰" },
          ].map((cat, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">{cat.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{cat.items} items</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={cat.visible ? "connected" : "disconnected"} label={cat.visible ? "Visible" : "Hidden"} />
                <button className="text-sm text-[var(--primary)]">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">📥 Import CSV</button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">📤 Export CSV</button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">💰 Bulk Price Update</button>
          <button className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium">👁️ Toggle Availability</button>
        </div>
      </Card>
    </div>
  );
}

// Loyalty & Rewards Settings Section - Coming Soon
function LoyaltyRewardsSettings() {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-12 text-center">
        <div className="text-6xl mb-4">🎁</div>
        <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">Loyalty & Rewards Coming Soon</h3>
        <p className="text-[var(--muted-foreground)] max-w-md mx-auto">
          Configure points earning, redemption, customer tiers, and reward programs for your customers.
        </p>
      </div>
    </div>
  );
}

/*
// Original LoyaltyRewardsSettings data - commented out for later implementation
const loyaltyData = {
  topMembers: [
    { rank: 1, name: "Sarah Mike", tier: "Gold", points: 2450, orders: 28, lifetime: "₵124,000" },
    { rank: 2, name: "John Doe", tier: "Gold", points: 1890, orders: 22, lifetime: "₵98,000" },
    { rank: 3, name: "Mike Jones", tier: "Silver", points: 1234, orders: 15, lifetime: "₵68,500" },
    { rank: 4, name: "Alice Brown", tier: "Silver", points: 890, orders: 12, lifetime: "₵52,000" },
    { rank: 5, name: "David King", tier: "Bronze", points: 567, orders: 8, lifetime: "₵35,000" },
  ],
  tiers: [
    { icon: "🥉", name: "Bronze", range: "0 - 499 points", multiplier: "1x", discount: "—" },
    { icon: "🥈", name: "Silver", range: "500 - 1,999 points", multiplier: "1.25x", discount: "5% off" },
    { icon: "🥇", name: "Gold", range: "2,000+ points", multiplier: "1.5x", discount: "10% off" },
  ],
  stats: [
    { label: "Total Members", value: "347", icon: "👥" },
    { label: "Points Issued", value: "45,230", icon: "⭐" },
    { label: "Points Redeemed", value: "12,450", icon: "🎁" },
    { label: "Redemption Rate", value: "27.5%", icon: "📊" },
  ],
};
*/

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case "profile": return <RestaurantProfile />;
      case "users": return <UsersPermissions />;
      case "payments": return <PaymentSettings />;
      case "delivery": return <DeliverySettings />;
      case "menu": return <MenuManagement />;
      case "integrations": return <IntegrationsSettings />;
      case "notifications": return <NotificationsSettings />;
      case "hours": return <BusinessHours />;
      case "taxes": return <TaxesSettings />;
      case "loyalty": return <LoyaltyRewardsSettings />;
      case "branding": return <BrandingSettings />;
      case "security": return <SecuritySettings />;
      case "analytics": return <AnalyticsSettings />;
      case "data": return <DataBackup />;
      case "api": return <APIWebhooks />;
      case "system": return <SystemInformation />;
      default: return <RestaurantProfile />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-[var(--muted-foreground)]">Manage your restaurant configuration</p>
      </div>

      {/* Mobile Nav Toggle */}
      <button
        onClick={() => setMobileNavOpen(!mobileNavOpen)}
        className="lg:hidden w-full mb-4 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-lg flex items-center justify-between"
      >
        <span className="text-sm font-medium text-[var(--foreground)]">
          {settingsNav.find(n => n.key === activeSection)?.icon} {settingsNav.find(n => n.key === activeSection)?.label}
        </span>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className="flex gap-6">
        {/* Settings Navigation */}
        <aside className={`${mobileNavOpen ? "block" : "hidden"} lg:block w-full lg:w-64 shrink-0`}>
          <nav className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            {settingsNav.map((item) => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setMobileNavOpen(false); }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                  activeSection === item.key
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className={`flex-1 min-w-0 ${mobileNavOpen ? "hidden lg:block" : "block"}`}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

