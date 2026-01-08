"use client";

import { useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  stock?: number;
  unlimitedStock: boolean;
  preparationTime: number;
  featured: boolean;
  tags: string[];
  variants?: { name: string; price: number }[];
  addons?: { name: string; price: number }[];
};

type Category = {
  id: string;
  name: string;
  icon: string;
  itemCount: number;
  visible: boolean;
  order: number;
};

const mockCategories: Category[] = [
  { id: "1", name: "Main Dishes", icon: "🍛", itemCount: 12, visible: true, order: 1 },
  { id: "2", name: "Sides", icon: "🍗", itemCount: 8, visible: true, order: 2 },
  { id: "3", name: "Drinks", icon: "🥤", itemCount: 15, visible: true, order: 3 },
  { id: "4", name: "Desserts", icon: "🍰", itemCount: 5, visible: false, order: 4 },
  { id: "5", name: "Appetizers", icon: "🥗", itemCount: 6, visible: true, order: 5 },
];

const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Jollof Rice",
    description: "Delicious Nigerian jollof rice cooked with fresh tomatoes and spices. Served with choice of protein.",
    price: 2000,
    category: "Main Dishes",
    available: true,
    unlimitedStock: true,
    preparationTime: 20,
    featured: true,
    tags: ["Spicy", "Popular"],
    variants: [
      { name: "Small", price: 1500 },
      { name: "Regular", price: 2000 },
      { name: "Large", price: 3000 },
    ],
    addons: [
      { name: "Extra Chicken", price: 500 },
      { name: "Extra Plantain", price: 300 },
    ],
  },
  {
    id: "2",
    name: "Fried Chicken",
    description: "Crispy fried chicken pieces marinated in special spices. Served with fries.",
    price: 2500,
    category: "Main Dishes",
    available: true,
    stock: 45,
    unlimitedStock: false,
    preparationTime: 25,
    featured: true,
    tags: ["Popular"],
  },
  {
    id: "3",
    name: "Egusi Soup",
    description: "Traditional Nigerian soup made with melon seeds, vegetables, and assorted meat.",
    price: 3000,
    category: "Main Dishes",
    available: false,
    stock: 0,
    unlimitedStock: false,
    preparationTime: 30,
    featured: false,
    tags: ["Traditional"],
  },
  {
    id: "4",
    name: "Grilled Fish",
    description: "Fresh fish grilled to perfection with herbs and spices. Served with vegetables.",
    price: 4500,
    category: "Main Dishes",
    available: true,
    stock: 3,
    unlimitedStock: false,
    preparationTime: 35,
    featured: false,
    tags: ["Healthy"],
  },
  {
    id: "5",
    name: "Plantain",
    description: "Fried ripe plantain, sweet and crispy.",
    price: 800,
    category: "Sides",
    available: true,
    unlimitedStock: true,
    preparationTime: 10,
    featured: false,
    tags: [],
  },
  {
    id: "6",
    name: "Coca-Cola",
    description: "Chilled soft drink",
    price: 500,
    category: "Drinks",
    available: true,
    stock: 120,
    unlimitedStock: false,
    preparationTime: 2,
    featured: false,
    tags: [],
  },
  {
    id: "7",
    name: "Chapman",
    description: "Refreshing Nigerian cocktail drink",
    price: 1500,
    category: "Drinks",
    available: true,
    unlimitedStock: true,
    preparationTime: 5,
    featured: true,
    tags: ["Popular"],
  },
  {
    id: "8",
    name: "Ice Cream",
    description: "Vanilla ice cream with toppings",
    price: 1200,
    category: "Desserts",
    available: true,
    unlimitedStock: true,
    preparationTime: 3,
    featured: false,
    tags: [],
  },
];

function StatusBadge({ status }: { status: "available" | "unavailable" | "low-stock" }) {
  const styles = {
    available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    unavailable: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    "low-stock": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  };
  const labels = {
    available: "✅ Available",
    unavailable: "🔴 Out of Stock",
    "low-stock": "⚠️ Low Stock",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Add Item Modal Component
function AddItemModal({ onClose, categories }: { onClose: () => void; categories: Category[] }) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [options, setOptions] = useState<{ name: string; price: number }[]>([]);
  const [addons, setAddons] = useState<{ name: string; price: number }[]>([]);
  const [newOption, setNewOption] = useState({ name: "", price: 0 });
  const [newAddon, setNewAddon] = useState({ name: "", price: 0 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addOption = () => {
    if (newOption.name && newOption.price >= 0) {
      setOptions([...options, { ...newOption }]);
      setNewOption({ name: "", price: 0 });
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const addAddon = () => {
    if (newAddon.name && newAddon.price >= 0) {
      setAddons([...addons, { ...newAddon }]);
      setNewAddon({ name: "", price: 0 });
    }
  };

  const removeAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Add Menu Item</h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Item Image
            </label>
            <div className="flex items-center gap-4">
              <div className="w-32 h-32 rounded-lg border-2 border-dashed border-[var(--border)] flex items-center justify-center overflow-hidden bg-[var(--muted)]">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <svg
                      className="w-8 h-8 mx-auto text-[var(--muted-foreground)] mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-xs text-[var(--muted-foreground)]">No image</p>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="px-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm font-medium cursor-pointer hover:bg-[var(--border)] inline-block">
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </span>
                </label>
                {imagePreview && (
                  <button
                    onClick={() => setImagePreview(null)}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Remove Image
                  </button>
                )}
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Recommended: 500x500px, JPG or PNG
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Item Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Jollof Rice"
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Category *
              </label>
              <select className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Description
            </label>
            <textarea
              placeholder="Describe the item..."
              rows={3}
              className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Base Price (₵) *
              </label>
              <input
                type="number"
                placeholder="2000"
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Base price (if no options) or starting price
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Preparation Time (minutes)
              </label>
              <input
                type="number"
                placeholder="20"
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
          </div>

          {/* Options/Variants */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)]">Options/Variants</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Add size options (e.g., Small, Medium, Large) with different prices
                </p>
              </div>
            </div>

            {options.length > 0 && (
              <div className="space-y-2 mb-4">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={option.name}
                        readOnly
                        className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm"
                        placeholder="Option name"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm">₵</span>
                        <input
                          type="number"
                          value={option.price}
                          readOnly
                          className="flex-1 px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm"
                          placeholder="Price"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeOption(index)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newOption.name}
                onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                placeholder="e.g., Small, Medium, Large"
                className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
              <div className="flex items-center gap-2 w-32">
                <span className="text-sm">₵</span>
                <input
                  type="number"
                  value={newOption.price || ""}
                  onChange={(e) => setNewOption({ ...newOption, price: Number(e.target.value) })}
                  placeholder="Price"
                  className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <button
                onClick={addOption}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
              >
                Add Option
              </button>
            </div>
          </div>

          {/* Add-ons */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--foreground)]">Add-ons</h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Add extras (e.g., Extra Chicken, Extra Sauce) with additional prices
                </p>
              </div>
            </div>

            {addons.length > 0 && (
              <div className="space-y-2 mb-4">
                {addons.map((addon, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 bg-[var(--muted)] rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={addon.name}
                        readOnly
                        className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm"
                        placeholder="Add-on name"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-sm">+₵</span>
                        <input
                          type="number"
                          value={addon.price}
                          readOnly
                          className="flex-1 px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded text-sm"
                          placeholder="Additional price"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => removeAddon(index)}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAddon.name}
                onChange={(e) => setNewAddon({ ...newAddon, name: e.target.value })}
                placeholder="e.g., Extra Chicken, Extra Sauce"
                className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
              <div className="flex items-center gap-2 w-32">
                <span className="text-sm">+₵</span>
                <input
                  type="number"
                  value={newAddon.price || ""}
                  onChange={(e) => setNewAddon({ ...newAddon, price: Number(e.target.value) })}
                  placeholder="Price"
                  className="flex-1 px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <button
                onClick={addAddon}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
              >
                Add Add-on
              </button>
            </div>
          </div>

          {/* Stock Management */}
          <div className="border-t border-[var(--border)] pt-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
              Stock Management
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="stock" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Unlimited stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="stock" className="w-4 h-4" />
                <span className="text-sm">Track inventory</span>
                <input
                  type="number"
                  placeholder="Stock quantity"
                  className="ml-2 w-24 px-2 py-1 bg-[var(--muted)] border border-[var(--border)] rounded text-sm"
                />
              </label>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                <span className="text-sm">Available for order</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm">Featured item (show first)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" />
                <span className="text-sm">New item badge</span>
              </label>
            </div>
          </div>

          {/* Dietary Tags */}
          <div className="border-t border-[var(--border)] pt-4">
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Dietary Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {["Vegetarian", "Vegan", "Gluten-free", "Spicy", "Halal"].map((tag) => (
                <label
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[var(--muted)] rounded-lg cursor-pointer hover:bg-[var(--border)]"
                >
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]">
              Add Item
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function MenuPage() {
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemStatus = (item: MenuItem): "available" | "unavailable" | "low-stock" => {
    if (!item.available) return "unavailable";
    if (!item.unlimitedStock && item.stock !== undefined && item.stock < 10) return "low-stock";
    return "available";
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((item) => item.id));
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Menu Management</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="px-3 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]"
            >
              {viewMode === "grid" ? "📋 List" : "🎴 Grid"}
            </button>
            {activeTab === "items" ? (
              <button
                onClick={() => setShowAddItem(true)}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
              >
                + Add Item
              </button>
            ) : (
              <button
                onClick={() => setShowAddCategory(true)}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)]"
              >
                + Add Category
              </button>
            )}
          </div>
        </div>
        <p className="text-[var(--muted-foreground)]">Manage your menu items and categories</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "items"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Menu Items ({mockMenuItems.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Categories ({mockCategories.length})
        </button>
      </div>

      {/* Menu Items Tab */}
      {activeTab === "items" && (
        <>
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search items by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <svg
                  className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="all">All Categories</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="p-4 bg-[var(--muted)] rounded-lg flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--border)]">
                    Toggle Availability
                  </button>
                  <button className="px-3 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--border)]">
                    Export
                  </button>
                  <button className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Items Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Item Image */}
                  <div className="relative h-48 bg-gradient-to-br from-[var(--muted)] to-[var(--border)]">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {mockCategories.find((c) => c.name === item.category)?.icon || "🍽️"}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-4 h-4 rounded"
                      />
                      {item.featured && (
                        <span className="px-2 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <StatusBadge status={getItemStatus(item)} />
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[var(--foreground)]">{item.name}</h3>
                      <span className="text-lg font-bold text-[var(--primary)]">
                        ₵{item.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-3">
                      <span>{item.category}</span>
                      <span>⏱️ {item.preparationTime} min</span>
                    </div>
                    {!item.unlimitedStock && item.stock !== undefined && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[var(--muted-foreground)]">Stock</span>
                          <span className={item.stock < 10 ? "text-amber-600" : "text-emerald-600"}>
                            {item.stock} left
                          </span>
                        </div>
                        <div className="h-1.5 bg-[var(--muted)] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.stock < 10 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min((item.stock / 100) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-[var(--muted)] text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {(item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0) ? (
                      <div className="flex gap-2 mb-3 text-xs text-[var(--muted-foreground)]">
                        {item.variants && item.variants.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            {item.variants.length} option{item.variants.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {item.addons && item.addons.length > 0 && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            {item.addons.length} add-on{item.addons.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    ) : null}
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm hover:bg-[var(--border)]">
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Item
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--muted)]">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-4 h-4 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-2xl">
                            {mockCategories.find((c) => c.name === item.category)?.icon || "🍽️"}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)]">{item.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {item.category}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-[var(--foreground)]">
                          ₵{item.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {item.unlimitedStock ? (
                          <span className="text-[var(--muted-foreground)]">∞ Unlimited</span>
                        ) : (
                          <span className={item.stock && item.stock < 10 ? "text-amber-600" : "text-emerald-600"}>
                            {item.stock} left
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={getItemStatus(item)} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-sm text-[var(--primary)]">Edit</button>
                          <button className="text-sm text-[var(--muted-foreground)]">⋮</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">No items found</h3>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => setShowAddItem(true)}
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium"
              >
                Add Your First Item
              </button>
            </div>
          )}
        </>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          {mockCategories.map((category) => (
            <div
              key={category.id}
              className="p-4 bg-[var(--card)] rounded-xl border border-[var(--border)] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--muted)] flex items-center justify-center text-2xl">
                  {category.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[var(--foreground)]">{category.name}</h3>
                    {!category.visible && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {category.itemCount} items
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={category.visible}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-[var(--muted-foreground)]">Visible</span>
                </label>
                <button className="px-3 py-1.5 text-sm text-[var(--primary)]">Edit</button>
                <button className="px-3 py-1.5 text-sm text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          categories={mockCategories}
        />
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddCategory(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Add Category</h2>
              <button
                onClick={() => setShowAddCategory(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Main Dishes"
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  placeholder="🍛"
                  maxLength={2}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-2xl text-center"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded" />
                  <span className="text-sm">Visible to customers</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium">
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

