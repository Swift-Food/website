"use client";

import { useState, useMemo } from "react";
import { useCatering } from "@/context/CateringContext";
import { MealSessionState, SelectedMenuItem } from "@/types/catering.types";
import { ChefHat, ChevronDown, ChevronUp, Calendar, Clock } from "lucide-react";

interface GroupedItem {
  item: any;
  quantity: number;
  originalIndex: number;
}

interface CategoryGroup {
  items: GroupedItem[];
  subcategories: Map<string, GroupedItem[]>;
}

interface AllMealSessionsItemsProps {
  showActions?: boolean;
  onEdit?: (sessionIndex: number, itemIndex: number) => void;
  onRemove?: (sessionIndex: number, itemIndex: number) => void;
}

export default function AllMealSessionsItems({
  showActions = false,
  onEdit,
  onRemove,
}: AllMealSessionsItemsProps) {
  const { mealSessions } = useCatering();

  // Track expanded state for sessions and restaurants
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(
    new Set(mealSessions.map((_, idx) => idx))
  );
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleSession = (sessionIndex: number) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionIndex)) {
        newSet.delete(sessionIndex);
      } else {
        newSet.add(sessionIndex);
      }
      return newSet;
    });
  };

  const toggleCategory = (categoryKey: string) => {
    setCollapsedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryKey)) {
        newSet.delete(categoryKey);
      } else {
        newSet.add(categoryKey);
      }
      return newSet;
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "Date TBD";
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "Time TBD";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Group items by category -> subcategory for a session
  const groupItemsByCategory = (orderItems: SelectedMenuItem[]) => {
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
  };

  // Calculate session total
  const calculateSessionTotal = (orderItems: SelectedMenuItem[]) => {
    return orderItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const unitPrice =
        item.isDiscount && discountPrice > 0 ? discountPrice : price;

      const addonTotal = (item.selectedAddons || []).reduce(
        (sum: number, addon: { price: number; quantity: number }) =>
          sum + (addon.price || 0) * (addon.quantity || 0),
        0
      );

      return total + unitPrice * quantity + addonTotal;
    }, 0);
  };

  const renderItemRow = (
    groupedItem: GroupedItem,
    sessionIndex: number
  ) => {
    const { item, quantity, originalIndex } = groupedItem;
    const price = parseFloat(item.price?.toString() || "0");
    const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
    const itemPrice =
      item.isDiscount && discountPrice > 0 ? discountPrice : price;
    const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
    const portions = quantity / BACKEND_QUANTITY_UNIT;

    const addonTotal = (item.selectedAddons || []).reduce(
      (sum: number, addon: { price: number; quantity: number }) =>
        sum + (addon.price || 0) * (addon.quantity || 0),
      0
    );
    const subtotal = itemPrice * quantity + addonTotal;

    return (
      <div
        key={`${sessionIndex}-${originalIndex}`}
        className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex gap-3 flex-1">
            {item.image && (
              <img
                src={item.image}
                alt={item.menuItemName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">
                {item.menuItemName}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                {portions} portion{portions !== 1 ? "s" : ""}
              </p>
              {item.selectedAddons && item.selectedAddons.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  {item.selectedAddons.map(
                    (
                      addon: { name: string; quantity: number },
                      idx: number
                    ) => (
                      <span key={idx}>
                        + {addon.name}
                        {addon.quantity > 1 && ` (×${addon.quantity})`}
                        {idx < item.selectedAddons!.length - 1 ? ", " : ""}
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
            <p className="font-bold text-pink-600 text-sm sm:text-base whitespace-nowrap">
              £{subtotal.toFixed(2)}
            </p>
            {showActions && onEdit && onRemove && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(sessionIndex, originalIndex)}
                  className="px-3 py-1.5 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-colors text-xs sm:text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(sessionIndex, originalIndex)}
                  className="px-3 py-1.5 border border-pink-500 text-pink-500 rounded-lg hover:bg-pink-50 transition-colors text-xs sm:text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryGroup = (
    categoryName: string,
    categoryGroup: CategoryGroup,
    sessionIndex: number
  ) => {
    const categoryKey = `${sessionIndex}-${categoryName}`;
    const isCollapsed = collapsedCategories.has(categoryKey);
    const totalItems =
      categoryGroup.items.length +
      Array.from(categoryGroup.subcategories.values()).reduce(
        (sum, items) => sum + items.length,
        0
      );

    return (
      <div
        key={categoryKey}
        className="border border-gray-200 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => toggleCategory(categoryKey)}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChefHat className="h-4 w-4 text-pink-500" />
            <span className="font-semibold text-gray-800">{categoryName}</span>
            <span className="text-sm text-gray-500">
              ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </span>
          </div>
          {isCollapsed ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          )}
        </button>

        {!isCollapsed && (
          <div className="p-3 space-y-2">
            {categoryGroup.items.map((groupedItem) =>
              renderItemRow(groupedItem, sessionIndex)
            )}

            {Array.from(categoryGroup.subcategories.entries()).map(
              ([subName, items]) => (
                <div key={subName}>
                  <p className="text-xs font-medium text-gray-600 mb-2 pl-2">
                    {subName}
                  </p>
                  <div className="space-y-2">
                    {items.map((groupedItem) =>
                      renderItemRow(groupedItem, sessionIndex)
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMealSession = (session: MealSessionState, sessionIndex: number) => {
    const isExpanded = expandedSessions.has(sessionIndex);
    const groupedItems = groupItemsByCategory(session.orderItems);
    const sessionTotal = calculateSessionTotal(session.orderItems);
    const itemCount = session.orderItems.length;

    if (itemCount === 0) return null;

    return (
      <div
        key={sessionIndex}
        className="border-2 border-pink-200 rounded-xl overflow-hidden bg-white shadow-sm"
      >
        {/* Session Header */}
        <button
          onClick={() => toggleSession(sessionIndex)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-150 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
            <h3 className="text-lg sm:text-xl font-bold text-pink-700">
              {session.sessionName || `Session ${sessionIndex + 1}`}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-pink-500" />
                {formatDate(session.sessionDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-pink-500" />
                {formatTime(session.eventTime)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm sm:text-base font-bold text-pink-600">
              £{sessionTotal.toFixed(2)}
            </span>
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-pink-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="h-5 w-5 text-pink-400 flex-shrink-0" />
            )}
          </div>
        </button>

        {/* Session Content */}
        {isExpanded && (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Guest count and special requirements */}
            {(session.guestCount || session.specialRequirements) && (
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                {session.guestCount && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Guests:</span>{" "}
                    {session.guestCount} people
                  </p>
                )}
                {session.specialRequirements && (
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                      Special Requirements:
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {session.specialRequirements}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Categories and items */}
            <div className="space-y-3">
              {Array.from(groupedItems.entries()).map(
                ([categoryName, categoryGroup]) =>
                  renderCategoryGroup(categoryName, categoryGroup, sessionIndex)
              )}
            </div>

            {/* Session Total */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-gray-900 font-bold">
                <span>Session Total:</span>
                <span className="text-pink-600">£{sessionTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate grand total
  const grandTotal = useMemo(() => {
    return mealSessions.reduce(
      (total, session) => total + calculateSessionTotal(session.orderItems),
      0
    );
  }, [mealSessions]);

  // Filter out empty sessions
  const nonEmptySessions = mealSessions.filter(
    (session) => session.orderItems.length > 0
  );

  if (nonEmptySessions.length === 0) {
    return null;
  }

  // If only one session, use simpler styling
  const isSingleSession = nonEmptySessions.length === 1;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
        Your Order
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {nonEmptySessions.map((session) => {
          // Find the actual index in mealSessions array
          const actualIndex = mealSessions.indexOf(session);
          return renderMealSession(session, actualIndex);
        })}
      </div>

      {/* Grand Total (only show if multiple sessions) */}
      {!isSingleSession && (
        <div className="border-t-2 border-gray-300 pt-4 sm:pt-6 mt-4 sm:mt-6">
          <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900">
            <span>Order Total:</span>
            <span className="text-pink-600">£{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
