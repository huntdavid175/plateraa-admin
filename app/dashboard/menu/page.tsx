"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

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

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isDestructive,
  isLoading,
}: {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onCancel} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
        <div className="flex items-center gap-3 mb-4">
          {isDestructive ? (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          )}
          <h2 className="text-lg font-bold text-[var(--foreground)]">{title}</h2>
        </div>
        
        <p className="text-[var(--muted-foreground)] mb-6 ml-[52px]">{message}</p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)] disabled:opacity-50"
          >
            {cancelLabel || "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
              isDestructive
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
            }`}
          >
            {isLoading ? "Deleting..." : confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </>
  );
}

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

// Database category type for mapping
type DbCategory = {
  id: string;
  name: string;
};

// Add/Edit Item Modal Component
function ItemModal({ 
  onClose, 
  categories, 
  dbCategories,
  onSuccess,
  editItem 
}: { 
  onClose: () => void; 
  categories: Category[];
  dbCategories: DbCategory[];
  onSuccess: () => void;
  editItem?: MenuItem | null;
}) {
  const [imagePreview, setImagePreview] = useState<string | null>(editItem?.image || null);
  const [name, setName] = useState(editItem?.name || "");
  const [description, setDescription] = useState(editItem?.description || "");
  const [price, setPrice] = useState(editItem?.price || 0);
  const [categoryName, setCategoryName] = useState(editItem?.category || categories[0]?.name || "");
  const [preparationTime, setPreparationTime] = useState(editItem?.preparationTime || 20);
  const [isAvailable, setIsAvailable] = useState(editItem?.available ?? true);
  const [isFeatured, setIsFeatured] = useState(editItem?.featured ?? false);
  const [unlimitedStock, setUnlimitedStock] = useState(editItem?.unlimitedStock ?? true);
  const [stockQuantity, setStockQuantity] = useState(editItem?.stock || 0);
  const [options, setOptions] = useState<{ name: string; price: number }[]>(editItem?.variants || []);
  const [addons, setAddons] = useState<{ name: string; price: number }[]>(editItem?.addons || []);
  const [newOption, setNewOption] = useState({ name: "", price: 0 });
  const [newAddon, setNewAddon] = useState({ name: "", price: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Item name is required");
      return;
    }
    if (price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    setIsSaving(true);
    setError("");

    const supabase = createClient();

    try {
      // Get institution_id from current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("institution_id")
        .eq("auth_id", user.id)
        .single();
      
      if (!userData?.institution_id) throw new Error("No institution found");

      // Find category ID
      const selectedCategory = dbCategories.find(c => c.name === categoryName);
      if (!selectedCategory) throw new Error("Category not found");

      const itemData = {
        institution_id: userData.institution_id,
        category_id: selectedCategory.id,
        name: name.trim(),
        description: description.trim(),
        price,
        preparation_time: preparationTime,
        is_available: isAvailable,
        is_featured: isFeatured,
        is_unlimited_stock: unlimitedStock,
        stock_quantity: unlimitedStock ? null : stockQuantity,
        image_url: imagePreview,
      };

      let itemId: string;

      if (editItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editItem.id);

        if (updateError) throw updateError;
        itemId = editItem.id;

        // Delete old variants and addons
        await supabase.from("menu_item_variants").delete().eq("menu_item_id", itemId);
        await supabase.from("menu_item_addons").delete().eq("menu_item_id", itemId);
      } else {
        // Insert new item
        const { data: newItem, error: insertError } = await supabase
          .from("menu_items")
          .insert(itemData)
          .select("id")
          .single();

        if (insertError) throw insertError;
        itemId = newItem.id;
      }

      // Insert variants
      if (options.length > 0) {
        const variantsData = options.map((opt, idx) => ({
          menu_item_id: itemId,
          name: opt.name,
          price: opt.price,
          sort_order: idx + 1,
          is_default: idx === 0,
        }));
        await supabase.from("menu_item_variants").insert(variantsData);
      }

      // Insert addons
      if (addons.length > 0) {
        const addonsData = addons.map((addon, idx) => ({
          menu_item_id: itemId,
          name: addon.name,
          price: addon.price,
          sort_order: idx + 1,
          is_available: true,
        }));
        await supabase.from("menu_item_addons").insert(addonsData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error saving item:", err);
      setError(err instanceof Error ? err.message : "Failed to save item");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {editItem ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Jollof Rice"
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Category *
              </label>
              <select 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm"
              >
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
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
                value={preparationTime || ""}
                onChange={(e) => setPreparationTime(Number(e.target.value))}
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
                <input 
                  type="radio" 
                  name="stock" 
                  checked={unlimitedStock}
                  onChange={() => setUnlimitedStock(true)}
                  className="w-4 h-4" 
                />
                <span className="text-sm">Unlimited stock</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="stock" 
                  checked={!unlimitedStock}
                  onChange={() => setUnlimitedStock(false)}
                  className="w-4 h-4" 
                />
                <span className="text-sm">Track inventory</span>
                <input
                  type="number"
                  value={stockQuantity || ""}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  disabled={unlimitedStock}
                  placeholder="Stock quantity"
                  className="ml-2 w-24 px-2 py-1 bg-[var(--muted)] border border-[var(--border)] rounded text-sm disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="border-t border-[var(--border)] pt-4">
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 rounded" 
                />
                <span className="text-sm">Available for order</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded" 
                />
                <span className="text-sm">Featured item (show first)</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50"
            >
              {isSaving ? "Saving..." : editItem ? "Save Changes" : "Add Item"}
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
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  
  // Data from Supabase
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Category form state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryFormName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("🍽️");
  const [categoryVisible, setCategoryVisible] = useState(true);
  const [isSavingCategory, setIsSavingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState("");

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: "item" | "category";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "item",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch menu data from Supabase
  const fetchMenuData = async () => {
      const supabase = createClient();
      
      try {
        // Fetch categories with item counts
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("*")
          .order("sort_order");
        
        if (categoriesError) {
          console.error("Error fetching categories:", categoriesError);
        }

        // Fetch menu items with their variants, addons, and tags
        const { data: itemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select(`
            *,
            menu_categories (name),
            menu_item_variants (name, price, sort_order),
            menu_item_addons (name, price, sort_order),
            menu_item_tags (
              menu_tags (name)
            )
          `)
          .order("created_at", { ascending: true });

        if (itemsError) {
          console.error("Error fetching menu items:", itemsError);
        }

        // Transform categories to match the expected type
        if (categoriesData) {
          // Store raw categories for database operations
          setDbCategories(categoriesData.map((cat) => ({ id: cat.id, name: cat.name })));
          
          const transformedCategories: Category[] = categoriesData.map((cat) => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || "🍽️",
            itemCount: 0, // Will be calculated below
            visible: cat.is_visible,
            order: cat.sort_order,
          }));

          // Calculate item counts per category
          if (itemsData) {
            itemsData.forEach((item) => {
              const category = transformedCategories.find(
                (c) => c.name === item.menu_categories?.name
              );
              if (category) {
                category.itemCount++;
              }
            });
          }

          setCategories(transformedCategories);
        }

        // Transform menu items to match the expected type
        if (itemsData) {
          const transformedItems: MenuItem[] = itemsData.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description || "",
            price: Number(item.price),
            category: item.menu_categories?.name || "",
            image: item.image_url,
            available: item.is_available,
            stock: item.stock_quantity,
            unlimitedStock: item.is_unlimited_stock,
            preparationTime: item.preparation_time || 15,
            featured: item.is_featured,
            tags: item.menu_item_tags?.map((t: { menu_tags: { name: string } }) => t.menu_tags?.name).filter(Boolean) || [],
            variants: item.menu_item_variants?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((v: { name: string; price: number }) => ({
              name: v.name,
              price: Number(v.price),
            })),
            addons: item.menu_item_addons?.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order).map((a: { name: string; price: number }) => ({
              name: a.name,
              price: Number(a.price),
            })),
          }));

          setMenuItems(transformedItems);
        }
      } catch (err) {
        console.error("Error fetching menu data:", err);
      } finally {
        setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  // Handle save category (add or edit)
  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      setCategoryError("Category name is required");
      return;
    }

    setIsSavingCategory(true);
    setCategoryError("");

    const supabase = createClient();

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: userData } = await supabase
        .from("users")
        .select("institution_id")
        .eq("auth_id", user.id)
        .single();
      
      if (!userData?.institution_id) throw new Error("No institution found");

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("menu_categories")
          .update({
            name: categoryName.trim(),
            icon: categoryIcon || "🍽️",
            is_visible: categoryVisible,
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
      } else {
        // Insert new category
        const { error } = await supabase.from("menu_categories").insert({
          institution_id: userData.institution_id,
          name: categoryName.trim(),
          icon: categoryIcon || "🍽️",
          is_visible: categoryVisible,
          sort_order: categories.length + 1,
        });

        if (error) throw error;
      }

      // Reset form and close modal
      handleCloseCategoryModal();
      
      // Refresh data
      fetchMenuData();
    } catch (err) {
      console.error("Error saving category:", err);
      setCategoryError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSavingCategory(false);
    }
  };

  // Handle edit item
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setShowAddItem(true);
  };

  // Handle close item modal
  const handleCloseItemModal = () => {
    setShowAddItem(false);
    setEditingItem(null);
  };

  // Handle delete menu item - show confirmation modal
  const handleDeleteItem = (itemId: string, itemName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Menu Item",
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      type: "item",
      onConfirm: async () => {
        setIsDeleting(true);
        const supabase = createClient();

        try {
          // Delete variants and addons first (cascade should handle this, but being explicit)
          await supabase.from("menu_item_variants").delete().eq("menu_item_id", itemId);
          await supabase.from("menu_item_addons").delete().eq("menu_item_id", itemId);
          await supabase.from("menu_item_tags").delete().eq("menu_item_id", itemId);
          
          const { error } = await supabase.from("menu_items").delete().eq("id", itemId);
          
          if (error) throw error;
          
          // Close modal and refresh data
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchMenuData();
        } catch (err) {
          console.error("Error deleting item:", err);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          // Show error in a more user-friendly way
          setTimeout(() => {
            setConfirmModal({
              isOpen: true,
              title: "Delete Failed",
              message: "Failed to delete the item. Please try again.",
              type: "item",
              onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
            });
          }, 100);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormName(category.name);
    setCategoryIcon(category.icon);
    setCategoryVisible(category.visible);
    setShowAddCategory(true);
  };

  // Handle delete category - show confirmation modal
  const handleDeleteCategory = (categoryId: string, catName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Category",
      message: `Are you sure you want to delete "${catName}"? Items in this category will be uncategorized.`,
      type: "category",
      onConfirm: async () => {
        setIsDeleting(true);
        const supabase = createClient();

        try {
          const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId);
          
          if (error) throw error;
          
          // Close modal and refresh data
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          fetchMenuData();
        } catch (err) {
          console.error("Error deleting category:", err);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setTimeout(() => {
            setConfirmModal({
              isOpen: true,
              title: "Delete Failed",
              message: "Failed to delete the category. Please try again.",
              type: "category",
              onConfirm: () => setConfirmModal(prev => ({ ...prev, isOpen: false })),
            });
          }, 100);
        } finally {
          setIsDeleting(false);
        }
      },
    });
  };

  // Close confirmation modal
  const handleCloseConfirmModal = () => {
    if (!isDeleting) {
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Handle close category modal
  const handleCloseCategoryModal = () => {
    setShowAddCategory(false);
    setEditingCategory(null);
    setCategoryFormName("");
    setCategoryIcon("🍽️");
    setCategoryVisible(true);
    setCategoryError("");
  };

  const filteredItems = menuItems.filter((item) => {
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--muted-foreground)]">Loading menu...</p>
        </div>
      </div>
    );
  }

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
          Menu Items ({menuItems.length})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          }`}
        >
          Categories ({categories.length})
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
                {categories.map((cat) => (
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
                        {categories.find((c) => c.name === item.category)?.icon || "🍽️"}
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
                      <button 
                        onClick={() => handleEditItem(item)}
                        className="flex-1 px-3 py-1.5 bg-[var(--muted)] rounded-lg text-sm font-medium hover:bg-[var(--border)]"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(item.id, item.name)}
                        className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200"
                      >
                        🗑️
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
                            {categories.find((c) => c.name === item.category)?.icon || "🍽️"}
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
                          <button 
                            onClick={() => handleEditItem(item)}
                            className="text-sm text-[var(--primary)]"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="text-sm text-red-600"
                          >
                            Delete
                          </button>
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
          {categories.map((category) => (
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
                <button 
                  onClick={() => handleEditCategory(category)}
                  className="px-3 py-1.5 text-sm text-[var(--primary)]"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category.id, category.name)}
                  className="px-3 py-1.5 text-sm text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      {showAddItem && (
        <ItemModal
          onClose={handleCloseItemModal}
          categories={categories}
          dbCategories={dbCategories}
          onSuccess={fetchMenuData}
          editItem={editingItem}
        />
      )}

      {/* Add/Edit Category Modal */}
      {showAddCategory && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCloseCategoryModal}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--card)] rounded-xl shadow-2xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={handleCloseCategoryModal}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                ✕
              </button>
            </div>
            
            {categoryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{categoryError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryFormName(e.target.value)}
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
                  value={categoryIcon}
                  onChange={(e) => setCategoryIcon(e.target.value)}
                  placeholder="🍛"
                  maxLength={2}
                  className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-2xl text-center"
                />
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={categoryVisible}
                    onChange={(e) => setCategoryVisible(e.target.checked)}
                    className="w-4 h-4 rounded" 
                  />
                  <span className="text-sm">Visible to customers</span>
                </label>
              </div>
              <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                <button
                  onClick={handleCloseCategoryModal}
                  disabled={isSavingCategory}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveCategory}
                  disabled={isSavingCategory}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {isSavingCategory ? "Saving..." : editingCategory ? "Save Changes" : "Add Category"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="Delete"
        onConfirm={confirmModal.onConfirm}
        onCancel={handleCloseConfirmModal}
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}

