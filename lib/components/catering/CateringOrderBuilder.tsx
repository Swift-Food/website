"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useCatering } from "@/context/CateringContext";
import {
  MealSessionState,
  CategoryWithSubcategories,
  Subcategory,
  MenuItemDetails,
  SelectedMenuItem,
} from "@/types/catering.types";
import { categoryService } from "@/services/api/category.api";
import MenuItemCard from "./MenuItemCard";
import MenuItemModal from "./MenuItemModal";
import { MenuItem } from "./Step2MenuItems";

// Hour and minute options for time picker
const HOUR_12_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: `${i + 1}`,
  value: String(i + 1).padStart(2, "0"),
}));

const MINUTE_OPTIONS = [
  { label: "00", value: "00" },
  { label: "15", value: "15" },
  { label: "30", value: "30" },
  { label: "45", value: "45" },
];

interface SessionEditorProps {
  session: MealSessionState;
  sessionIndex: number;
  onUpdate: (index: number, updates: Partial<MealSessionState>) => void;
  onClose: (cancelled: boolean) => void;
  anchorRect: DOMRect | null;
}

function SessionEditor({
  session,
  sessionIndex,
  onUpdate,
  onClose,
  anchorRect,
}: SessionEditorProps) {
  const [sessionName, setSessionName] = useState(session.sessionName);
  const [sessionDate, setSessionDate] = useState(session.sessionDate);
  const [selectedHour, setSelectedHour] = useState(() => {
    if (session.eventTime) {
      const h = session.eventTime.split(":")[0];
      const hour12 = Number(h) % 12 || 12;
      return String(hour12).padStart(2, "0");
    }
    return "";
  });
  const [selectedMinute, setSelectedMinute] = useState(() => {
    if (session.eventTime) {
      return session.eventTime.split(":")[1];
    }
    return "00";
  });
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    if (session.eventTime) {
      const hour = Number(session.eventTime.split(":")[0]);
      return hour >= 12 ? "PM" : "AM";
    }
    return "AM";
  });

  const editorRef = useRef<HTMLDivElement>(null);

  // Close on click outside - saves the session
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node)
      ) {
        handleSave();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sessionName, sessionDate, selectedHour, selectedMinute, selectedPeriod]);

  const handleCancel = () => {
    onClose(true);
  };

  const getMinDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date.toISOString().split("T")[0];
  };

  const handleSave = () => {
    let eventTime = "";
    if (selectedHour && selectedMinute) {
      let hourNum = Number(selectedHour) % 12;
      if (selectedPeriod === "PM") hourNum += 12;
      if (selectedPeriod === "AM" && hourNum === 12) hourNum = 0;
      eventTime = `${String(hourNum).padStart(2, "0")}:${selectedMinute}`;
    }

    onUpdate(sessionIndex, {
      sessionName: sessionName || "Untitled Session",
      sessionDate,
      eventTime,
    });
    onClose(false);
  };

  if (!anchorRect) return null;

  const editorContent = (
    <div
      ref={editorRef}
      className="w-72 bg-white rounded-xl shadow-lg border border-base-200 p-4 fixed z-[100]"
      style={{
        top: anchorRect.bottom + 8,
        left: anchorRect.left,
      }}
    >
      <div className="flex flex-col gap-3">
        {/* Session Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Session Name
          </label>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g., Breakfast, Lunch, Dinner"
            className="w-full px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            min={getMinDate()}
            max={getMaxDate()}
            className="w-full px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Time
          </label>
          <div className="flex items-center gap-2">
            <select
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">HH</option>
              {HOUR_12_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="text-gray-400">:</span>
            <select
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {MINUTE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(editorContent, document.body);
}

// Component to display selected items grouped by category
interface SelectedItemsByCategoryProps {
  orderItems: SelectedMenuItem[];
  onEdit: (index: number) => void;
  onRemove: (index: number) => void;
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
}

interface GroupedItem {
  item: any;
  quantity: number;
  originalIndex: number;
}

interface CategoryGroup {
  items: GroupedItem[];
  subcategories: Map<string, GroupedItem[]>;
}

function SelectedItemsByCategory({
  orderItems,
  onEdit,
  onRemove,
  collapsedCategories,
  onToggleCategory,
}: SelectedItemsByCategoryProps) {
  // Group items by category -> subcategory
  const grouped = useMemo(() => {
    const map = new Map<string, CategoryGroup>();

    orderItems.forEach((orderItem, index) => {
      const catName = orderItem.item.categoryName || "Uncategorized";
      const subName = orderItem.item.subcategoryName || "";

      if (!map.has(catName)) {
        map.set(catName, { items: [], subcategories: new Map() });
      }

      const category = map.get(catName)!;
      const groupedItem: GroupedItem = {
        item: orderItem.item,
        quantity: orderItem.quantity,
        originalIndex: index,
      };

      if (subName) {
        if (!category.subcategories.has(subName)) {
          category.subcategories.set(subName, []);
        }
        category.subcategories.get(subName)!.push(groupedItem);
      } else {
        category.items.push(groupedItem);
      }
    });

    return map;
  }, [orderItems]);

  if (orderItems.length === 0) return null;

  const renderItemRow = (groupedItem: GroupedItem) => {
    const { item, quantity, originalIndex } = groupedItem;
    const price = parseFloat(item.price?.toString() || "0");
    const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
    const itemPrice =
      item.isDiscount && discountPrice > 0 ? discountPrice : price;
    const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
    const portions = quantity / BACKEND_QUANTITY_UNIT;

    // Calculate addon total
    const addonTotal = (item.selectedAddons || []).reduce(
      (sum: number, addon: { price: number; quantity: number }) =>
        sum + (addon.price || 0) * (addon.quantity || 0),
      0
    );
    const subtotal = itemPrice * quantity + addonTotal;

    return (
      <div
        key={originalIndex}
        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-[#F5F0E8] rounded-xl"
      >
        {/* Mobile Layout */}
        <div className="flex gap-3 sm:hidden">
          {/* Image */}
          {item.image && (
            <img
              src={item.image}
              alt={item.menuItemName}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
            />
          )}
          {/* Name + Addons */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 italic">{item.menuItemName}</p>
            {item.selectedAddons && item.selectedAddons.length > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                {item.selectedAddons.map(
                  (
                    addon: { groupTitle: string; name: string; quantity: number },
                    idx: number
                  ) => (
                    <div key={idx}>
                      <p className="font-medium text-gray-800">{addon.groupTitle}</p>
                      <p className="text-gray-500">
                        + {addon.name}
                        {addon.quantity > 1 && ` (×${addon.quantity})`}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Price & Portions + Actions */}
        <div className="flex items-center justify-between sm:hidden">
          <div>
            <p className="font-bold text-primary text-lg">
              £{subtotal.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              {portions} portion{portions !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(originalIndex)}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onRemove(originalIndex)}
              className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>

        {/* Desktop Layout */}
        {/* Image */}
        {item.image && (
          <img
            src={item.image}
            alt={item.menuItemName}
            className="hidden sm:block w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}

        {/* Name + Addons */}
        <div className="hidden sm:block flex-1 min-w-0">
          <p className="font-semibold text-gray-800">{item.menuItemName}</p>
          {item.selectedAddons && item.selectedAddons.length > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              {item.selectedAddons.map(
                (
                  addon: { groupTitle: string; name: string; quantity: number },
                  idx: number
                ) => (
                  <p key={idx}>
                    <span className="font-medium">{addon.groupTitle}:</span>{" "}
                    {addon.name}
                    {addon.quantity > 1 && ` (×${addon.quantity})`}
                  </p>
                )
              )}
            </div>
          )}
        </div>

        {/* Price & Portions */}
        <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
          <p className="font-bold text-primary text-lg">
            £{subtotal.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600 whitespace-nowrap">
            {portions} portion{portions !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Actions */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(originalIndex)}
            className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onRemove(originalIndex)}
            className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6 bg-white rounded-2xl border border-base-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-base-100 border-b border-base-200">
        <h2 className="text-xl font-bold text-gray-800">Your List</h2>
      </div>

      {/* Categories */}
      <div className="p-4 space-y-4">
        {Array.from(grouped.entries()).map(([categoryName, categoryGroup]) => {
          const isCollapsed = collapsedCategories.has(categoryName);
          const totalItems =
            categoryGroup.items.length +
            Array.from(categoryGroup.subcategories.values()).reduce(
              (sum, items) => sum + items.length,
              0
            );

          return (
            <div
              key={categoryName}
              className="border border-base-200 rounded-xl overflow-hidden"
            >
              {/* Category Header */}
              <button
                onClick={() => onToggleCategory(categoryName)}
                className="w-full flex items-center justify-between px-4 py-3 bg-base-100 hover:bg-base-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-800">
                    {categoryName}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({totalItems} item{totalItems !== 1 ? "s" : ""})
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    isCollapsed ? "" : "rotate-180"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Category Content */}
              {!isCollapsed && (
                <div className="p-4 space-y-3">
                  {/* Items without subcategory */}
                  {categoryGroup.items.map(renderItemRow)}

                  {/* Subcategories */}
                  {Array.from(categoryGroup.subcategories.entries()).map(
                    ([subName, items]) => (
                      <div key={subName}>
                        <p className="text-sm font-medium text-gray-600 mb-2 pl-2">
                          {subName}
                        </p>
                        <div className="space-y-3">
                          {items.map(renderItemRow)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CateringOrderBuilder() {
  const {
    mealSessions,
    activeSessionIndex,
    setActiveSessionIndex,
    addMealSession,
    updateMealSession,
    removeMealSession,
    addMenuItem,
    updateItemQuantity,
    removeMenuItemByIndex,
    updateMenuItemByIndex,
    getSessionTotal,
  } = useCatering();

  const [editingSessionIndex, setEditingSessionIndex] = useState<number | null>(
    null
  );
  const [pendingNewSessionIndex, setPendingNewSessionIndex] = useState<
    number | null
  >(null);
  const [editorAnchorRect, setEditorAnchorRect] = useState<DOMRect | null>(
    null
  );
  const sessionButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Category state
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithSubcategories | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Menu items state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuItemsLoading, setMenuItemsLoading] = useState(false);
  const [menuItemsError, setMenuItemsError] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Edit item state
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Collapsed categories state for the cart list
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  // Get quantity for an item in the current session
  const getItemQuantity = (itemId: string): number => {
    const session = mealSessions[activeSessionIndex];
    if (!session) return 0;
    const orderItem = session.orderItems.find((oi) => oi.item.id === itemId);
    return orderItem?.quantity || 0;
  };

  // Handle adding item to cart
  const handleAddItem = (item: MenuItem) => {
    const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
    const portionQuantity = item.portionQuantity || 1;
    const quantity = portionQuantity * BACKEND_QUANTITY_UNIT;

    addMenuItem(activeSessionIndex, {
      item: {
        id: item.id,
        menuItemName: item.menuItemName,
        description: item.description,
        price: item.price,
        discountPrice: item.discountPrice,
        allergens: item.allergens,
        isDiscount: item.isDiscount,
        image: item.image,
        restaurantId: item.restaurantId,
        groupTitle: item.groupTitle,
        cateringQuantityUnit: item.cateringQuantityUnit,
        feedsPerUnit: item.feedsPerUnit,
        itemDisplayOrder: item.itemDisplayOrder,
        addons: item.addons,
        selectedAddons: item.selectedAddons,
        // Add category context for grouping in cart
        categoryId: selectedCategory?.id,
        categoryName: selectedCategory?.name,
        subcategoryId: selectedSubcategory?.id,
        subcategoryName: selectedSubcategory?.name,
      },
      quantity,
    });
    setExpandedItemId(null);
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateItemQuantity(activeSessionIndex, itemId, quantity);
  };

  // Handle opening modal for add/edit
  const handleAddOrderPress = (item: MenuItem) => {
    setExpandedItemId(item.id);
  };

  // Helper to map MenuItemDetails to MenuItem format
  const mapToMenuItem = (item: MenuItemDetails): MenuItem => ({
    id: item.id,
    menuItemName: item.name,
    description: item.description,
    price: item.price?.toString() || "0",
    discountPrice: item.discountPrice?.toString(),
    allergens: item.allergens,
    isDiscount: item.isDiscount || false,
    image: item.image,
    averageRating: item.averageRating,
    restaurantId: item.restaurantId,
    groupTitle: item.groupTitle,
    status: item.status,
    itemDisplayOrder: item.itemDisplayOrder || 0,
    cateringQuantityUnit: (item as any).cateringQuantityUnit,
    feedsPerUnit: (item as any).feedsPerUnit,
    addons: (item.addons || []).map((addon) => ({
      name: addon.name,
      price: addon.price?.toString() || "0",
      allergens: addon.allergens?.join(", ") || "",
      groupTitle: addon.groupTitle || "",
      isRequired: addon.isRequired || false,
      selectionType: addon.selectionType || "single",
    })),
  });

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        setCategoriesError(null);
        const data = await categoryService.getCategoriesWithSubcategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch menu items when category or subcategory changes
  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedCategory) {
        setMenuItems([]);
        return;
      }

      try {
        setMenuItemsLoading(true);
        setMenuItemsError(null);

        let data: MenuItemDetails[];
        if (selectedSubcategory) {
          data = await categoryService.getMenuItemsBySubcategory(
            selectedSubcategory.id
          );
        } else {
          data = await categoryService.getMenuItemsByCategory(
            selectedCategory.id
          );
        }
        // Map to MenuItem format for MenuItemCard
        const mappedItems = data.map(mapToMenuItem);
        setMenuItems(mappedItems);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        setMenuItemsError("Failed to load menu items");
        setMenuItems([]);
      } finally {
        setMenuItemsLoading(false);
      }
    };

    fetchMenuItems();
  }, [selectedCategory, selectedSubcategory]);

  const handleCategoryClick = (category: CategoryWithSubcategories) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategoryClick = (subcategory: Subcategory) => {
    setSelectedSubcategory(
      selectedSubcategory?.id === subcategory.id ? null : subcategory
    );
  };

  const handleAddSession = () => {
    const newSession: MealSessionState = {
      sessionName: `Session ${mealSessions.length + 1}`,
      sessionDate: "",
      eventTime: "",
      orderItems: [],
    };
    addMealSession(newSession);
    // Auto-open editor for new session
    const newIndex = mealSessions.length;
    setEditingSessionIndex(newIndex);
    setActiveSessionIndex(newIndex);
    setPendingNewSessionIndex(newIndex);
    // Anchor rect will be set via useEffect after render
  };

  // Update anchor rect when editing a newly added session
  useEffect(() => {
    if (editingSessionIndex !== null && editorAnchorRect === null) {
      const buttonEl = sessionButtonRefs.current.get(editingSessionIndex);
      if (buttonEl) {
        setEditorAnchorRect(buttonEl.getBoundingClientRect());
      }
    }
  }, [editingSessionIndex, editorAnchorRect, mealSessions.length]);

  const handleEditorClose = (cancelled: boolean) => {
    if (cancelled && pendingNewSessionIndex !== null) {
      // Remove the pending session if cancel was clicked
      removeMealSession(pendingNewSessionIndex);
    }
    setEditingSessionIndex(null);
    setPendingNewSessionIndex(null);
    setEditorAnchorRect(null);
  };

  const handleSessionClick = (index: number) => {
    const buttonEl = sessionButtonRefs.current.get(index);
    if (activeSessionIndex === index && editingSessionIndex !== index) {
      // If clicking on already active session, toggle editor
      if (editingSessionIndex === index) {
        setEditingSessionIndex(null);
        setEditorAnchorRect(null);
      } else {
        setEditingSessionIndex(index);
        if (buttonEl) setEditorAnchorRect(buttonEl.getBoundingClientRect());
      }
    } else {
      setActiveSessionIndex(index);
      setEditingSessionIndex(null);
      setEditorAnchorRect(null);
    }
  };

  const handleRemoveSession = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mealSessions.length > 1) {
      removeMealSession(index);
      setEditingSessionIndex(null);
    }
  };

  const formatSessionDisplay = (session: MealSessionState) => {
    const parts: string[] = [];

    if (session.sessionDate) {
      const date = new Date(session.sessionDate);
      parts.push(
        date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
      );
    }

    if (session.eventTime) {
      const [hours, minutes] = session.eventTime.split(":");
      const hour = parseInt(hours);
      const period = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      parts.push(`${hour12}:${minutes} ${period}`);
    }

    return parts.length > 0 ? parts.join(" • ") : "Set date & time";
  };

  // Toggle collapsed category
  const handleToggleCategory = (categoryName: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  // Handle edit item from cart list
  const handleEditItem = (itemIndex: number) => {
    setEditingItemIndex(itemIndex);
    setIsEditModalOpen(true);
  };

  // Handle remove item from cart list
  const handleRemoveItem = (itemIndex: number) => {
    removeMenuItemByIndex(activeSessionIndex, itemIndex);
  };

  // Handle save from edit modal
  const handleSaveEditedItem = (updatedItem: MenuItem) => {
    if (editingItemIndex === null) return;

    const BACKEND_QUANTITY_UNIT = updatedItem.cateringQuantityUnit || 7;
    const quantity = (updatedItem.portionQuantity || 1) * BACKEND_QUANTITY_UNIT;

    // Preserve the category context from the original item
    const originalItem =
      mealSessions[activeSessionIndex].orderItems[editingItemIndex].item;

    updateMenuItemByIndex(activeSessionIndex, editingItemIndex, {
      item: {
        ...updatedItem,
        categoryId: originalItem.categoryId,
        categoryName: originalItem.categoryName,
        subcategoryId: originalItem.subcategoryId,
        subcategoryName: originalItem.subcategoryName,
      },
      quantity,
    });

    setIsEditModalOpen(false);
    setEditingItemIndex(null);
  };

  return (
    <div className="min-h-screen bg-base-100">
      {/* Meal Sessions Tab Bar - Sticky */}
      <div className="sticky top-[100px] md:top-[112px] z-40 bg-base-100 border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-start gap-2 py-3">
            {/* Add Session Button - Fixed */}
            <button
              onClick={handleAddSession}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium bg-secondary text-white hover:bg-secondary/90 transition-all shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="hidden sm:inline">Add Session</span>
            </button>

            {/* Session Tabs - Scrollable */}
            <div className="flex-1 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 h-full">
                {mealSessions.map((session, index) => (
                  <div key={index} className="relative flex-shrink-0">
                    <button
                      ref={(el) => {
                        if (el) sessionButtonRefs.current.set(index, el);
                        else sessionButtonRefs.current.delete(index);
                      }}
                      onClick={() => handleSessionClick(index)}
                      className={`
                        relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all
                        ${
                          activeSessionIndex === index
                            ? "bg-primary text-white"
                            : "bg-base-200 text-gray-700 hover:bg-base-300"
                        }
                      `}
                    >
                      <span className="whitespace-nowrap">
                        {session.sessionName}
                      </span>

                      {/* Remove button (only if more than 1 session) */}
                      {mealSessions.length > 1 &&
                        activeSessionIndex === index && (
                          <button
                            onClick={(e) => handleRemoveSession(index, e)}
                            className="ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Session Editor - Rendered via portal */}
          {editingSessionIndex !== null && (
            <SessionEditor
              session={mealSessions[editingSessionIndex]}
              sessionIndex={editingSessionIndex}
              onUpdate={updateMealSession}
              onClose={handleEditorClose}
              anchorRect={editorAnchorRect}
            />
          )}

          {/* Active Session Info Bar */}
          <div className="flex items-center justify-between py-2 border-t border-base-200 text-sm">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setEditingSessionIndex(activeSessionIndex);
                  const buttonEl =
                    sessionButtonRefs.current.get(activeSessionIndex);
                  if (buttonEl)
                    setEditorAnchorRect(buttonEl.getBoundingClientRect());
                }}
                className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-gray-500">
                  {formatSessionDisplay(mealSessions[activeSessionIndex])}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-4 text-gray-600">
              <span>
                {mealSessions[activeSessionIndex].orderItems.length} items
              </span>
              <span className="font-semibold text-primary">
                £{getSessionTotal(activeSessionIndex).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Selected Items by Category - Cart List */}
        {mealSessions[activeSessionIndex].orderItems.length > 0 && (
          <SelectedItemsByCategory
            orderItems={mealSessions[activeSessionIndex].orderItems}
            onEdit={handleEditItem}
            onRemove={handleRemoveItem}
            collapsedCategories={collapsedCategories}
            onToggleCategory={handleToggleCategory}
          />
        )}

        {/* Categories Row - Sticky */}
        <div className="sticky top-[200px] md:top-[212px] z-30 bg-base-100 pb-2 -mx-4 px-4 pt-2">
          {categoriesLoading ? (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-28 h-10 bg-base-200 rounded-full animate-pulse"
                />
              ))}
            </div>
          ) : categoriesError ? (
            <div className="text-center py-4 text-red-500">
              {categoriesError}
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all
                    ${
                      selectedCategory?.id === category.id
                        ? "bg-primary text-white"
                        : "bg-base-200 text-gray-700 hover:bg-base-300"
                    }
                  `}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subcategories Row - Sticky (shown when category is selected) */}
        {selectedCategory && selectedCategory.subcategories.length > 0 && (
          <div className="sticky top-[260px] md:top-[270px] z-30 bg-base-100 pb-2 -mx-4 px-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="flex-shrink-0 text-sm text-gray-500 mr-2">
                {selectedCategory.name}:
              </span>
              {selectedCategory.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className={`
                    flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border-primary/50 border-1
                    ${
                      selectedSubcategory?.id === subcategory.id
                        ? "bg-secondary text-white"
                        : "bg-secondary/10 text-primary hover:bg-secondary/20"
                    }
                  `}
                >
                  {subcategory.name}
                  {selectedSubcategory?.id === subcategory.id && (
                    <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20">
                      ×
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items Area */}
        <div className="bg-base-200/50 rounded-2xl p-8">
          {menuItemsLoading ? (
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">Loading menu items...</p>
            </div>
          ) : menuItemsError ? (
            <div className="text-center text-red-500">{menuItemsError}</div>
          ) : !selectedCategory ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                Select a Category
              </h2>
              <p className="text-gray-500">
                Choose a category above to browse menu items
              </p>
            </div>
          ) : menuItems.length === 0 ? (
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                No Items Found
              </h2>
              <p className="text-gray-500">
                No menu items available for{" "}
                {selectedSubcategory?.name || selectedCategory.name}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {selectedSubcategory?.name || selectedCategory.name}
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({menuItems.length} items)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    quantity={getItemQuantity(item.id)}
                    isExpanded={expandedItemId === item.id}
                    onToggleExpand={() =>
                      setExpandedItemId(
                        expandedItemId === item.id ? null : item.id
                      )
                    }
                    onAddItem={handleAddItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    onAddOrderPress={handleAddOrderPress}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Item Modal */}
      {isEditModalOpen && editingItemIndex !== null && (
        <MenuItemModal
          item={
            mealSessions[activeSessionIndex].orderItems[editingItemIndex]
              .item as MenuItem
          }
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingItemIndex(null);
          }}
          quantity={
            mealSessions[activeSessionIndex].orderItems[editingItemIndex]
              .quantity
          }
          isEditMode={true}
          editingIndex={editingItemIndex}
          onAddItem={handleSaveEditedItem}
          onRemoveItem={(index) => {
            removeMenuItemByIndex(activeSessionIndex, index);
            setIsEditModalOpen(false);
            setEditingItemIndex(null);
          }}
        />
      )}
    </div>
  );
}
