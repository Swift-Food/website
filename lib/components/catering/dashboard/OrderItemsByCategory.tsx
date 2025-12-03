// app/components/catering/dashboard/OrderItemsByCategory.tsx
"use client";

import React, { useState, useMemo } from "react";
import { CateringOrderResponse, MealSessionResponse } from "@/types/api";
import { PricingMenuItem, PricingOrderItem } from "@/types/api/pricing.api.types";
import { ChefHat, Package, ChevronDown, ChevronUp, Calendar, Clock } from "lucide-react";

interface OrderItemsByCategoryProps {
  order: CateringOrderResponse;
}

// Extended PricingMenuItem with category/subcategory info from backend
interface PricingMenuItemWithCategories extends PricingMenuItem {
  categoryName?: string;
  subcategory?: {
    id: string;
    name: string;
    categoryId: string;
    displayOrder: number;
  };
}

interface GroupedItem {
  item: PricingMenuItemWithCategories;
  restaurantName: string;
  originalRestaurantIdx: number;
  originalItemIdx: number;
}

interface SubcategoryGroup {
  items: GroupedItem[];
}

interface CategoryGroup {
  items: GroupedItem[]; // Items without subcategory
  subcategories: Map<string, SubcategoryGroup>;
}

export default function OrderItemsByCategory({ order }: OrderItemsByCategoryProps) {
  const hasMealSessions = order.mealSessions && order.mealSessions.length > 0;

  // Sort meal sessions by date and time
  const sortedMealSessions = useMemo(() => {
    if (!order.mealSessions) return [];
    return [...order.mealSessions].sort((a, b) => {
      const dateA = new Date(a.sessionDate);
      const dateB = new Date(b.sessionDate);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      // Same date, sort by time
      return a.eventTime.localeCompare(b.eventTime);
    });
  }, [order.mealSessions]);

  // Legacy support: restaurants array for orders without meal sessions
  const restaurantsData = order.restaurants || order.orderItems || [];

  // Track expanded state for sessions and categories
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(sortedMealSessions.map((s) => s.id))
  );
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleSession = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
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

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Group items by category and subcategory from all restaurants
  const groupItemsByCategory = (restaurants: PricingOrderItem[]): Map<string, CategoryGroup> => {
    const map = new Map<string, CategoryGroup>();

    restaurants.forEach((restaurant, restIdx) => {
      restaurant.menuItems.forEach((menuItem, itemIdx) => {
        const item = menuItem as PricingMenuItemWithCategories;

        // Get category name - use categoryName field, fallback to groupTitle, then "Other Items"
        // Capitalize first letter for display
        const rawCategoryName = item.categoryName || item.groupTitle || "Other Items";
        const categoryName = rawCategoryName.charAt(0).toUpperCase() + rawCategoryName.slice(1);

        // Get subcategory name from subcategory object if available
        const subcategoryName = item.subcategory?.name || "";

        if (!map.has(categoryName)) {
          map.set(categoryName, { items: [], subcategories: new Map() });
        }

        const category = map.get(categoryName)!;
        const groupedItem: GroupedItem = {
          item,
          restaurantName: restaurant.restaurantName,
          originalRestaurantIdx: restIdx,
          originalItemIdx: itemIdx,
        };

        if (subcategoryName) {
          // Add to subcategory
          if (!category.subcategories.has(subcategoryName)) {
            category.subcategories.set(subcategoryName, { items: [] });
          }
          category.subcategories.get(subcategoryName)!.items.push(groupedItem);
        } else {
          // Add directly to category (no subcategory)
          category.items.push(groupedItem);
        }
      });
    });

    return map;
  };

  // Render a single menu item
  const renderItemRow = (groupedItem: GroupedItem, keyPrefix: string) => {
    const { item, restaurantName } = groupedItem;
    const cateringUnit = item.cateringQuantityUnit || 1;
    const feedsPerUnit = item.feedsPerUnit || 10;
    const numUnits = item.quantity / cateringUnit;
    const totalFeeds = numUnits * feedsPerUnit;

    // Support both 'addons' and 'selectedAddons' property names
    const itemAddons = item.selectedAddons || [];

    return (
      <div
        key={keyPrefix}
        className="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
          <div className="flex-1 sm:pr-4">
            <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1 break-words">
              {item.menuItemName || item.name}
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              {Math.round(numUnits)} portion
              {Math.round(numUnits) !== 1 ? "s" : ""} &bull; Serves ~
              {Math.round(totalFeeds)} people
            </p>
            <p className="text-xs text-gray-500 mt-1">
              From: {restaurantName}
            </p>
          </div>
          <p className="font-bold text-pink-600 text-sm sm:text-base whitespace-nowrap self-end sm:self-auto">
            £{Number(item.customerTotalPrice || 0).toFixed(2)}
          </p>
        </div>

        {/* Addons */}
        {itemAddons.length > 0 && (
          <div className="mt-2 sm:mt-3 pl-3 sm:pl-4 border-l-2 sm:border-l-3 border-pink-300 bg-white rounded-r-lg p-2 sm:p-3">
            <p className="text-xs font-semibold text-gray-700 mb-1 sm:mb-2 uppercase tracking-wide">
              Add-ons:
            </p>
            <div className="space-y-1">
              {itemAddons.map((addon, addonIdx) => (
                <div
                  key={addonIdx}
                  className="flex justify-between items-center text-xs sm:text-sm gap-2"
                >
                  <span className="text-gray-700 flex-1 break-words">
                    &bull; {addon.name}{" "}
                    <span className="text-gray-500">
                      x {addon.quantity}
                    </span>
                  </span>
                  <span className="text-pink-600 font-semibold whitespace-nowrap">
                    +£
                    {(
                      (addon.customerUnitPrice || 0) * addon.quantity
                    ).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render a category group with subcategories
  const renderCategoryGroup = (
    categoryName: string,
    categoryGroup: CategoryGroup,
    keyPrefix: string
  ) => {
    const categoryKey = `${keyPrefix}-${categoryName}`;
    const isCollapsed = collapsedCategories.has(categoryKey);

    // Count total items including those in subcategories
    const totalItems =
      categoryGroup.items.length +
      Array.from(categoryGroup.subcategories.values()).reduce(
        (sum, subGroup) => sum + subGroup.items.length,
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
            {/* Items without subcategory */}
            {categoryGroup.items.map((groupedItem, idx) =>
              renderItemRow(groupedItem, `${categoryKey}-item-${idx}`)
            )}

            {/* Subcategories and their items */}
            {Array.from(categoryGroup.subcategories.entries()).map(
              ([subcategoryName, subGroup]) => (
                <div key={`${categoryKey}-sub-${subcategoryName}`} className="mt-3">
                  <p className="text-xs font-medium text-gray-600 mb-2 pl-2 uppercase tracking-wide">
                    {subcategoryName}
                  </p>
                  <div className="space-y-2">
                    {subGroup.items.map((groupedItem, idx) =>
                      renderItemRow(
                        groupedItem,
                        `${categoryKey}-sub-${subcategoryName}-${idx}`
                      )
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

  // Render a meal session
  const renderMealSession = (session: MealSessionResponse) => {
    const isExpanded = expandedSessions.has(session.id);
    const groupedItems = groupItemsByCategory(session.orderItems);

    return (
      <div
        key={session.id}
        className="border-2 border-pink-200 rounded-xl overflow-hidden bg-white shadow-sm"
      >
        {/* Session Header */}
        <button
          onClick={() => toggleSession(session.id)}
          className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 bg-gradient-to-r from-pink-50 to-pink-100 hover:from-pink-100 hover:to-pink-150 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
            <h3 className="text-lg sm:text-xl font-bold text-pink-700">
              {session.sessionName}
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
              £{Number(session.sessionTotal || 0).toFixed(2)}
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
                  renderCategoryGroup(categoryName, categoryGroup, session.id)
              )}
            </div>

            {/* Session Pricing Summary */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="space-y-2 bg-gray-50 rounded-lg p-3 sm:p-4">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Subtotal:</span>
                  <span className="font-semibold">
                    £{Number(session.subtotal || 0).toFixed(2)}
                  </span>
                </div>
                {session.deliveryFee > 0 && (
                  <div className="flex justify-between text-gray-700 text-sm">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">
                      £{Number(session.deliveryFee).toFixed(2)}
                    </span>
                  </div>
                )}
                {session.promoDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Discount:</span>
                    <span className="font-semibold">
                      -£{Number(session.promoDiscount).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                  <span>Session Total:</span>
                  <span className="text-pink-600">
                    £{Number(session.sessionTotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render legacy view (no meal sessions) grouped by category
  const renderLegacyItemsByCategory = () => {
    const groupedItems = groupItemsByCategory(restaurantsData);

    return (
      <div className="space-y-3">
        {Array.from(groupedItems.entries()).map(
          ([categoryName, categoryGroup]) =>
            renderCategoryGroup(categoryName, categoryGroup, "legacy")
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
        <Package className="h-5 w-5 sm:h-6 sm:w-6 text-pink-500" />
        Order Items
      </h2>

      <div className="space-y-4 sm:space-y-6">
        {/* Meal Sessions View */}
        {hasMealSessions ? (
          <div className="space-y-4 sm:space-y-6">
            {sortedMealSessions.map((session) => renderMealSession(session))}
          </div>
        ) : (
          /* Legacy View - No Meal Sessions, grouped by category */
          renderLegacyItemsByCategory()
        )}

        {/* Pricing Summary */}
        <div className="border-t-2 border-gray-300 pt-4 sm:pt-6 mt-4 sm:mt-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
            Order Summary
          </h3>
          <div className="space-y-2 sm:space-y-3 bg-gray-50 rounded-lg p-3 sm:p-5">
            <div className="flex justify-between text-gray-700 text-sm sm:text-base">
              <span className="font-medium">Subtotal:</span>
              <span className="font-semibold">
                £{Number(order.subtotal).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-gray-700 text-sm sm:text-base">
              <span className="font-medium">Delivery Fee:</span>
              <span className="font-semibold">
                £{Number(order.deliveryFee).toFixed(2)}
              </span>
            </div>

            {order.promoDiscount && order.promoDiscount > 0 && (
              <div className="flex justify-between text-green-600 text-sm sm:text-base">
                <span className="font-semibold">Promo Discount:</span>
                <span className="font-bold">
                  -£{Number(order.promoDiscount).toFixed(2)}
                </span>
              </div>
            )}

            {order.promoCodes && order.promoCodes.length > 0 && (
              <div className="pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-600 mb-1">
                  Applied Promo Codes:
                </p>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {order.promoCodes.map((code, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between text-lg sm:text-xl font-bold text-gray-900 pt-2 sm:pt-3 border-t-2 border-gray-300">
              <span>Total:</span>
              <span className="text-pink-600">
                £{Number(order.finalTotal ?? order.estimatedTotal).toFixed(2)}
              </span>
            </div>

            {order.depositAmount && order.depositAmount > 0 && (
              <div className="pt-2 sm:pt-3 border-t border-gray-300">
                <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                  <span className="font-medium">Deposit Amount:</span>
                  <span className="font-semibold text-blue-600">
                    £{Number(order.depositAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Status */}
          {order.paidAt && (
            <div className="mt-3 sm:mt-4 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <p className="text-xs sm:text-sm font-semibold text-green-900">
                  Payment Received
                </p>
              </div>
              <p className="text-xs text-green-700">
                Paid on{" "}
                {new Date(order.paidAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {order.paymentLinkUrl && !order.paidAt && (
            <div className="mt-3 sm:mt-4">
              <a
                href={order.paymentLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-pink-500 text-white text-center py-2.5 sm:py-3 rounded-lg font-bold hover:bg-pink-600 transition-colors text-sm sm:text-base"
              >
                Complete Payment
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
