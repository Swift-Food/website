"use client";

import { RefObject } from "react";
import RestaurantMenuBrowser from "./RestaurantMenuBrowser";
import BundleBrowser from "./BundleBrowser";
import { MenuItem, Restaurant } from "./Step2MenuItems";
import { DietaryFilter } from "@/types/menuItem";

interface MenuBrowserColumnProps {
  showBundleBrowser: boolean;
  onToggleBundleBrowser: (show: boolean) => void;
  sessionIndex: number;
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
  defaultGuestCount: number;
  restaurants: Restaurant[];
  restaurantsLoading: boolean;
  onAddItem: (item: MenuItem) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onAddOrderPress: (item: MenuItem) => void;
  getItemQuantity: (itemId: string) => number;
  expandedItemId: string | null;
  setExpandedItemId: (id: string | null) => void;
  selectedDietaryFilters: DietaryFilter[];
  toggleDietaryFilter: (filter: DietaryFilter) => void;
  restaurantListRef: RefObject<HTMLDivElement | null>;
  firstMenuItemRef: RefObject<HTMLDivElement | null>;
  categoriesRowRef?: RefObject<HTMLDivElement | null>;
  expandedSessionIndex: number | null;
  onRegisterResetToList?: (fn: () => void) => void;
}

export default function MenuBrowserColumn({
  showBundleBrowser,
  onToggleBundleBrowser,
  sessionIndex,
  allMenuItems,
  fetchAllMenuItems,
  defaultGuestCount,
  restaurants,
  restaurantsLoading,
  onAddItem,
  onUpdateQuantity,
  onAddOrderPress,
  getItemQuantity,
  expandedItemId,
  setExpandedItemId,
  selectedDietaryFilters,
  toggleDietaryFilter,
  restaurantListRef,
  firstMenuItemRef,
  categoriesRowRef,
  expandedSessionIndex,
  onRegisterResetToList,
}: MenuBrowserColumnProps) {
  if (showBundleBrowser) {
    return (
      <BundleBrowser
        sessionIndex={sessionIndex}
        allMenuItems={allMenuItems}
        fetchAllMenuItems={fetchAllMenuItems}
        onBack={() => onToggleBundleBrowser(false)}
        defaultGuestCount={defaultGuestCount}
      />
    );
  }

  return (
    <RestaurantMenuBrowser
      restaurants={restaurants}
      restaurantsLoading={restaurantsLoading}
      onOpenBundles={() => onToggleBundleBrowser(true)}
      defaultBundleGuestCount={defaultGuestCount}
      allMenuItems={allMenuItems}
      fetchAllMenuItems={fetchAllMenuItems}
      onAddItem={onAddItem}
      onUpdateQuantity={onUpdateQuantity}
      onAddOrderPress={onAddOrderPress}
      getItemQuantity={getItemQuantity}
      expandedItemId={expandedItemId}
      setExpandedItemId={setExpandedItemId}
      selectedDietaryFilters={selectedDietaryFilters}
      toggleDietaryFilter={toggleDietaryFilter}
      restaurantListRef={restaurantListRef}
      firstMenuItemRef={firstMenuItemRef}
      categoriesRowRef={categoriesRowRef}
      sessionIndex={sessionIndex}
      expandedSessionIndex={expandedSessionIndex}
      onRegisterResetToList={onRegisterResetToList}
    />
  );
}
