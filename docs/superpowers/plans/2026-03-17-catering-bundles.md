# Catering Bundles Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the catering bundles system from halkins-food to the website, matching the exact UI/UX: a "Browse Bundles" entry point in the restaurant list, a full-screen BundleBrowser view, per-restaurant bundle sections within the restaurant menu, bundle-aware cart display with remove/edit capabilities, and bundle metadata tracked in the catering context.

**Architecture:** Bundle items are added to meal sessions as regular `SelectedMenuItem` entries with `bundleId` and `bundleName` metadata. Three new components handle bundle UX: `BundleCard` (list tile), `BundleDetailModal` (add-to-session), and `BundleBrowser` (all-bundles view). `RestaurantMenuBrowser` gains a per-restaurant bundles section and the "Browse Bundles" entry point. `SelectedItemsByCategory` gains bundle grouping with bulk remove.

**Tech Stack:** Next.js 14, React, TypeScript, Tailwind CSS, lucide-react, next/image

---

## File Map

### New Files
- `lib/components/catering/BundleCard.tsx` — presentational tile for one bundle (image, name, price/person, item count)
- `lib/components/catering/BundleBrowser.tsx` — full-screen all-bundles view with back-to-restaurants navigation
- `lib/components/catering/modals/BundleDetailModal.tsx` — modal for viewing bundle items, adjusting quantity, and adding to session

### Modified Files
- `types/catering.types.ts` — add `bundleId?` and `bundleName?` to `SelectedMenuItem`
- `lib/constants/api.ts` — add `CATERING_BUNDLES_CATERING` and `CATERING_BUNDLES_RESTAURANT` endpoints
- `services/api/catering.api.ts` — add `getCateringBundles()` and `getBundlesByRestaurant()` methods
- `lib/components/catering/RestaurantMenuBrowser.tsx` — add bundle state, per-restaurant bundle section, "Browse Bundles" button, `MenuItemGroup`/`BundleGroup` union type, `enrichBundleItemAddons` helper, `handleAddBundle`
- `lib/components/catering/CateringOrderBuilder.tsx` — add `showBundleBrowser` state, `BundleBrowser` rendering, pass `onOpenBundles`/`defaultBundleGuestCount`/`sessionDate`/`eventTime` to `RestaurantMenuBrowser`
- `lib/components/catering/SelectedItemsByCategory.tsx` — show bundle badge on bundle items, add "Remove Bundle" button that removes all items sharing a `bundleId`

---

## Chunk 1: Types, API Endpoints, and API Methods

### Task 1: Extend `SelectedMenuItem` with bundle metadata

**Files:**
- Modify: `types/catering.types.ts` (line 200-203)

- [ ] **Step 1: Update the `SelectedMenuItem` interface**

In `types/catering.types.ts`, change:
```typescript
export interface SelectedMenuItem {
  item: SearchResult | MenuItem;
  quantity: number;
}
```
To:
```typescript
export interface SelectedMenuItem {
  item: SearchResult | MenuItem;
  quantity: number;
  bundleId?: string;
  bundleName?: string;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/thadoos/Coding/AllRestaurantApps/website && npx tsc --noEmit 2>&1 | head -30
```
Expected: No new errors related to `SelectedMenuItem`.

- [ ] **Step 3: Commit**

```bash
git add types/catering.types.ts
git commit -m "feat: add bundleId and bundleName to SelectedMenuItem"
```

---

### Task 2: Add bundle API endpoints

**Files:**
- Modify: `lib/constants/api.ts`

- [ ] **Step 1: Add the two bundle endpoints**

In `lib/constants/api.ts`, add inside the `API_ENDPOINTS` object after `CATERING_BUNDLE`:
```typescript
  CATERING_BUNDLES_CATERING: '/catering-bundles?type=catering',
  CATERING_BUNDLES_RESTAURANT: (restaurantId: string) => `/catering-bundles/restaurant/${restaurantId}`,
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/constants/api.ts
git commit -m "feat: add catering bundle API endpoint constants"
```

---

### Task 3: Add bundle API service methods

**Files:**
- Modify: `services/api/catering.api.ts`

Context: `CateringBundleResponse` is already imported from `@/types/api` (re-exported through the barrel at `types/api/index.ts`). The `getBundleById` method already exists at line 128 — add the new methods right after it.

- [ ] **Step 1: Add `getCateringBundles` and `getBundlesByRestaurant` to `CateringService`**

Find the `getBundleById` method (around line 128) and add immediately after its closing brace:
```typescript
  async getCateringBundles(): Promise<CateringBundleResponse[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${API_ENDPOINTS.CATERING_BUNDLES_CATERING}`
    );
    if (!response.ok) throw new Error("Failed to fetch catering bundles");
    return response.json();
  }

  async getBundlesByRestaurant(restaurantId: string): Promise<CateringBundleResponse[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}${API_ENDPOINTS.CATERING_BUNDLES_RESTAURANT(restaurantId)}`
    );
    if (!response.ok) throw new Error("Failed to fetch restaurant bundles");
    return response.json();
  }
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add services/api/catering.api.ts
git commit -m "feat: add getCateringBundles and getBundlesByRestaurant to catering service"
```

---

## Chunk 2: BundleCard and BundleDetailModal Components

### Task 4: Create `BundleCard`

**Files:**
- Create: `lib/components/catering/BundleCard.tsx`

This is a direct port from halkins-food. The `CateringBundleResponse` type already exists in `types/api/catering.api.types.ts`.

- [ ] **Step 1: Create the file**

```typescript
// lib/components/catering/BundleCard.tsx
"use client";

import { CateringBundleResponse } from "@/types/api/catering.api.types";
import { Package } from "lucide-react";

interface BundleCardProps {
  bundle: CateringBundleResponse;
  onClick: (bundle: CateringBundleResponse) => void;
}

export default function BundleCard({ bundle, onClick }: BundleCardProps) {
  return (
    <button
      onClick={() => onClick(bundle)}
      className="w-full cursor-pointer flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-shadow"
    >
      {bundle.imageUrl ? (
        <img
          src={bundle.imageUrl}
          alt={bundle.name}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center flex-shrink-0">
          <Package className="w-8 h-8 text-primary/40" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{bundle.name}</h3>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm sm:text-base font-bold text-primary">
              £{Number(bundle.pricePerPerson || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500">per person</p>
          </div>
        </div>

        {bundle.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bundle.description}</p>
        )}

        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1.5">
          <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
            {bundle.items.length} items
          </span>
          <span>Serves {bundle.baseGuestCount || 0}+</span>
        </div>
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/components/catering/BundleCard.tsx
git commit -m "feat: add BundleCard component"
```

---

### Task 5: Create `BundleDetailModal`

**Files:**
- Create: `lib/components/catering/modals/BundleDetailModal.tsx`

Direct port from halkins-food. Uses `next/image` for dietary icons (already used in project) and `CateringBundleResponse` from the existing types.

- [ ] **Step 1: Create the file**

```typescript
// lib/components/catering/modals/BundleDetailModal.tsx
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { CateringBundleResponse } from "@/types/api/catering.api.types";
import { MenuItem } from "@/lib/components/catering/Step2MenuItems";
import { Package, Minus, Plus } from "lucide-react";

const DIETARY_ICON_MAP: Record<string, { file: string; label: string }> = {
  vegetarian: { file: "vegetarian.png", label: "Vegetarian" },
  vegan: { file: "vegan.png", label: "Vegan" },
  halal: { file: "halal.png", label: "Halal" },
  pescatarian: { file: "pescatarian.png", label: "Pescatarian" },
  no_nut: { file: "no_nut.png", label: "Nut-Free" },
  no_dairy: { file: "no_dairy.png", label: "Dairy-Free" },
};

interface BundleDetailModalProps {
  bundle: CateringBundleResponse;
  defaultQuantity: number;
  isAdding: boolean;
  onAdd: (bundle: CateringBundleResponse, quantity: number) => void;
  onClose: () => void;
  allMenuItems?: MenuItem[] | null;
}

export default function BundleDetailModal({
  bundle,
  defaultQuantity,
  isAdding,
  onAdd,
  onClose,
  allMenuItems,
}: BundleDetailModalProps) {
  const [quantity, setQuantity] = useState(Math.max(1, defaultQuantity));
  const [showDescriptions, setShowDescriptions] = useState(false);
  const peopleServed = (bundle.baseGuestCount ?? 1) * quantity;

  const sortedItems = [...bundle.items].sort((a, b) => a.sortOrder - b.sortOrder);

  const menuItemLookup = useMemo(() => {
    if (!allMenuItems) return new Map<string, MenuItem>();
    const map = new Map<string, MenuItem>();
    for (const mi of allMenuItems) {
      map.set(mi.id, mi);
    }
    return map;
  }, [allMenuItems]);

  const estimatedTotal = useMemo(() => {
    let total = 0;
    for (const item of bundle.items) {
      const mi = menuItemLookup.get(item.menuItemId);
      if (!mi) continue;
      const price =
        mi.isDiscount && mi.discountPrice
          ? parseFloat(mi.discountPrice.toString())
          : parseFloat(mi.price?.toString() || "0");
      const addonTotal = (item.selectedAddons || []).reduce((sum, a) => {
        const addonPrice = mi.addons?.find((ma) => ma.name === a.name);
        return sum + Number(addonPrice?.price ?? 0) * (a.quantity || 0);
      }, 0);
      const scaledQty = item.quantity * quantity;
      total += price * scaledQty + addonTotal * quantity;
    }
    return total;
  }, [bundle.items, menuItemLookup, quantity]);

  const estimatedPricePerPerson = peopleServed > 0 ? estimatedTotal / peopleServed : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[60] sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-[100dvh] max-h-[100dvh] sm:h-auto sm:max-h-[85vh] sm:max-w-lg rounded-none sm:rounded-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-lg text-gray-900">{bundle.name}</h3>
            {bundle.description && (
              <div className="mt-1 max-h-[4.5rem] overflow-y-auto pr-1">
                <p className="text-sm leading-6 text-gray-500">{bundle.description}</p>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-base-200 transition-colors flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Show descriptions toggle */}
        <div className="px-4 py-2 border-b border-base-200">
          <button
            onClick={() => setShowDescriptions((v) => !v)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              showDescriptions
                ? "border-primary bg-primary/10 text-primary"
                : "border-base-300 text-gray-600 hover:bg-base-100"
            }`}
          >
            {showDescriptions ? "Hide" : "Show"} item descriptions
          </button>
        </div>

        {/* Quantity selector */}
        <div className="px-4 py-3 border-b border-base-200 bg-base-100/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Bundle quantity</p>
              <p className="text-xs text-gray-500">Serves ~{peopleServed} people</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-base-300 hover:bg-base-200 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setQuantity(val);
                }}
                className="w-14 text-center font-bold text-lg border border-base-300 rounded-lg py-1"
                min={1}
              />
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-base-300 hover:bg-base-200 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Items list */}
        <div className="overflow-y-auto flex-1 divide-y divide-base-200">
          {sortedItems.map((item) => {
            const scaledQty = item.quantity * quantity;
            const mi = menuItemLookup.get(item.menuItemId);
            const dietaryFilters = mi?.dietaryFilters || [];
            const servesCount = scaledQty * (mi?.feedsPerUnit || 1);
            const unitPrice = mi
              ? mi.isDiscount && mi.discountPrice
                ? parseFloat(mi.discountPrice.toString())
                : parseFloat(mi.price?.toString() || "0")
              : 0;
            const addonTotal = (item.selectedAddons || []).reduce((sum, a) => {
              const addonPrice = mi?.addons?.find((ma) => ma.name === a.name);
              return sum + Number(addonPrice?.price ?? 0) * (a.quantity || 0);
            }, 0);
            const lineTotal = unitPrice * scaledQty + addonTotal * quantity;
            return (
              <div key={item.id} className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                    ×{scaledQty}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{item.menuItemName}</p>
                    {(dietaryFilters.length > 0 || servesCount > 0) && (
                      <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[11px] text-gray-500">Serves ~{servesCount}</span>
                        {dietaryFilters.slice(0, 4).map((filter) => {
                          const icon = DIETARY_ICON_MAP[filter.toLowerCase()];
                          if (!icon) return null;
                          return (
                            <div key={`${item.id}-${filter}`} className="relative w-4 h-4" title={icon.label}>
                              <Image
                                src={`/dietary-icons/unfilled/${icon.file}`}
                                alt={icon.label}
                                fill
                                className="object-contain"
                              />
                            </div>
                          );
                        })}
                        {dietaryFilters.length > 4 && (
                          <span className="text-[10px] text-gray-500">+{dietaryFilters.length - 4}</span>
                        )}
                      </div>
                    )}
                    {showDescriptions && mi?.description && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{mi.description}</p>
                    )}
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedAddons.map((addon, i) => {
                          const matchedAddon = mi?.addons?.find((ma) => ma.name === addon.name);
                          return (
                            <p key={i} className="text-xs text-gray-500">
                              • {matchedAddon?.groupTitle ?? "Options"}: {addon.name}
                              {addon.quantity > 1 && ` (×${addon.quantity})`}
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  {mi && (
                    <span className="text-sm font-bold text-gray-800 flex-shrink-0">
                      £{lineTotal.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-base-200 space-y-3">
          <p className="text-xs text-gray-500 text-center">
            You can change individual item amounts after adding to your session.
          </p>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">Estimated total</p>
              <p className="text-xs text-gray-500">
                {bundle.items.length} items • Serves ~{peopleServed} people
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">£{estimatedTotal.toFixed(2)}</p>
              <p className="text-xs text-gray-500">£{estimatedPricePerPerson.toFixed(2)}/person</p>
            </div>
          </div>

          <button
            onClick={() => onAdd(bundle, quantity)}
            disabled={isAdding}
            className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isAdding ? (
              <>
                <span className="loading loading-spinner loading-sm" />
                Adding...
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Add Bundle to Session
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/components/catering/modals/BundleDetailModal.tsx
git commit -m "feat: add BundleDetailModal component"
```

---

### Task 6: Create `BundleBrowser`

**Files:**
- Create: `lib/components/catering/BundleBrowser.tsx`

Direct port from halkins-food. Fetches all catering bundles and lets the user pick one to add to their session. The `MenuItem` type is imported from `Step2MenuItems` (website convention).

- [ ] **Step 1: Create the file**

```typescript
// lib/components/catering/BundleBrowser.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { cateringService } from "@/services/api/catering.api";
import { CateringBundleResponse, CateringBundleItem } from "@/types/api/catering.api.types";
import { MenuItem } from "@/lib/components/catering/Step2MenuItems";
import { useCatering } from "@/context/CateringContext";
import BundleCard from "./BundleCard";
import BundleDetailModal from "./modals/BundleDetailModal";
import { mapToMenuItem } from "./catering-order-helpers";
import { ArrowLeft, Package } from "lucide-react";

interface BundleBrowserProps {
  sessionIndex: number;
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
  onBack: () => void;
  defaultGuestCount?: number;
}

function enrichBundleItemAddons(
  bundleItem: CateringBundleItem,
  menuItem: MenuItem
): MenuItem["selectedAddons"] {
  if (!bundleItem.selectedAddons || bundleItem.selectedAddons.length === 0) {
    return [];
  }

  return bundleItem.selectedAddons.map((bundleAddon) => {
    const matchedAddon = menuItem.addons?.find((a) => a.name === bundleAddon.name);
    return {
      name: bundleAddon.name,
      price: Number(matchedAddon?.price ?? 0),
      quantity: bundleAddon.quantity,
      groupTitle: matchedAddon?.groupTitle ?? "Options",
    };
  });
}

export default function BundleBrowser({
  sessionIndex,
  allMenuItems,
  fetchAllMenuItems,
  onBack,
  defaultGuestCount = 1,
}: BundleBrowserProps) {
  const { addMenuItem } = useCatering();
  const [bundles, setBundles] = useState<CateringBundleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null);
  const [menuItemsCache, setMenuItemsCache] = useState<MenuItem[] | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<CateringBundleResponse | null>(null);

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const cateringBundles = await cateringService.getCateringBundles();
        setBundles(cateringBundles);
      } catch (err) {
        console.error("Failed to fetch bundles:", err);
        setError("Failed to load bundles. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  useEffect(() => {
    if (allMenuItems) {
      setMenuItemsCache(allMenuItems);
    }
  }, [allMenuItems]);

  const ensureMenuItems = useCallback(async (): Promise<MenuItem[]> => {
    if (menuItemsCache) return menuItemsCache;
    if (allMenuItems) {
      setMenuItemsCache(allMenuItems);
      return allMenuItems;
    }

    fetchAllMenuItems();
    const response = await cateringService.getMenuItems();
    const items = (response || []).map(mapToMenuItem);
    setMenuItemsCache(items);
    return items;
  }, [menuItemsCache, allMenuItems, fetchAllMenuItems]);

  const handleAddBundle = async (bundle: CateringBundleResponse, guestQuantity: number) => {
    setAddingBundleId(bundle.id);
    try {
      const items = await ensureMenuItems();

      for (const bundleItem of bundle.items) {
        const menuItem = items.find((mi) => mi.id === bundleItem.menuItemId);
        if (!menuItem) {
          console.warn(`Menu item ${bundleItem.menuItemId} (${bundleItem.menuItemName}) not found, skipping`);
          continue;
        }

        const enrichedAddons = enrichBundleItemAddons(bundleItem, menuItem);
        const scaledQuantity = bundleItem.quantity * guestQuantity;

        addMenuItem(sessionIndex, {
          item: { ...menuItem, selectedAddons: enrichedAddons },
          quantity: scaledQuantity,
          bundleId: bundle.id,
          bundleName: bundle.name,
        });
      }

      setSelectedBundle(null);
    } catch (err) {
      console.error("Failed to add bundle:", err);
      alert("Failed to add bundle. Please try again.");
    } finally {
      setAddingBundleId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (bundles.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No bundles available at the moment.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 text-primary font-medium hover:bg-primary/5 rounded-lg transition-colors"
        >
          Browse Menu Instead
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to restaurants
      </button>

      <div className="mb-4 rounded-2xl border border-primary/15 bg-primary/[0.05] px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Need some inspiration?</h3>
            <p className="mt-1 text-sm text-gray-600">
              Browse our curated bundles for quick event-ready combinations.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} onClick={setSelectedBundle} />
        ))}
      </div>

      {selectedBundle && (
        <BundleDetailModal
          bundle={selectedBundle}
          defaultQuantity={defaultGuestCount}
          isAdding={addingBundleId === selectedBundle.id}
          onAdd={handleAddBundle}
          onClose={() => setSelectedBundle(null)}
          allMenuItems={menuItemsCache || allMenuItems}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add lib/components/catering/BundleBrowser.tsx
git commit -m "feat: add BundleBrowser component"
```

---

## Chunk 3: RestaurantMenuBrowser Bundle Integration

### Task 7: Update `RestaurantMenuBrowser` with bundle support

**Files:**
- Modify: `lib/components/catering/RestaurantMenuBrowser.tsx`

This is the largest change. The restaurant menu view gains a per-restaurant "Bundles" section (fetched when a restaurant is selected). The restaurant list view gains a "Don't know what to get?" / "Browse Bundles" button. The groups system is upgraded to a union type to render bundles differently from item groups. Also adds `enrichBundleItemAddons` and `handleAddBundle` (for inline bundle-to-cart from within the restaurant menu view).

- [ ] **Step 1: Replace the entire file with the updated version**

```typescript
"use client";

import { useState, useMemo, useEffect, useRef, RefObject, useCallback } from "react";
import {
  Search,
  X,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Package,
  Clock3,
} from "lucide-react";
import { MenuItem, Restaurant } from "./Step2MenuItems";
import { DietaryFilter } from "@/types/menuItem";
import { CategoryWithSubcategories } from "@/types/catering.types";
import { CateringBundleItem, CateringBundleResponse } from "@/types/api/catering.api.types";
import { categoryService } from "@/services/api/category.api";
import { cateringService } from "@/services/api/catering.api";
import { useCatering } from "@/context/CateringContext";
import MenuItemCard from "./MenuItemCard";
import BundleCard from "./BundleCard";
import BundleDetailModal from "./modals/BundleDetailModal";
import { mapToMenuItem } from "./catering-order-helpers";

interface RestaurantMenuBrowserProps {
  restaurants: Restaurant[];
  restaurantsLoading: boolean;
  onOpenBundles: () => void;
  sessionDate?: string;
  eventTime?: string;
  defaultBundleGuestCount?: number;
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
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
  sessionIndex: number;
  expandedSessionIndex: number | null;
}

interface MenuItemGroup {
  type: "items";
  name: string;
  items: MenuItem[];
  information: string | null;
}

interface BundleGroup {
  type: "bundles";
  name: string;
  bundles: CateringBundleResponse[];
}

type RestaurantGroup = MenuItemGroup | BundleGroup;

function enrichBundleItemAddons(
  bundleItem: CateringBundleItem,
  menuItem: MenuItem
): MenuItem["selectedAddons"] {
  if (!bundleItem.selectedAddons || bundleItem.selectedAddons.length === 0) {
    return [];
  }
  return bundleItem.selectedAddons.map((bundleAddon) => {
    const matchedAddon = menuItem.addons?.find((addon) => addon.name === bundleAddon.name);
    return {
      name: bundleAddon.name,
      price: Number(matchedAddon?.price ?? 0),
      quantity: bundleAddon.quantity,
      groupTitle: matchedAddon?.groupTitle ?? "Options",
    };
  });
}

function getRestaurantAdvanceNoticeText(restaurant: Restaurant): string | null {
  const advanceNotice = restaurant.advanceNoticeSettings;

  if (
    advanceNotice?.type === "hours" &&
    typeof advanceNotice.hours === "number" &&
    advanceNotice.hours > 0
  ) {
    return `${advanceNotice.hours}h notice`;
  }

  if (
    advanceNotice?.type === "days_before_time" &&
    typeof advanceNotice.days === "number"
  ) {
    if (advanceNotice.cutoffTime) {
      const [h, m] = advanceNotice.cutoffTime.split(":").map(Number);
      const period = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      const timeStr = `${h12}:${m.toString().padStart(2, "0")} ${period}`;
      if (advanceNotice.days === 0) return `Order by ${timeStr}`;
      const label = advanceNotice.days === 1 ? "day" : "days";
      return `${advanceNotice.days} ${label} notice by ${timeStr}`;
    }
    if (advanceNotice.days > 0) {
      const label = advanceNotice.days === 1 ? "day" : "days";
      return `${advanceNotice.days} ${label} notice`;
    }
  }

  if (
    typeof restaurant.minimumDeliveryNoticeHours === "number" &&
    restaurant.minimumDeliveryNoticeHours > 0
  ) {
    return `${restaurant.minimumDeliveryNoticeHours}h notice`;
  }

  return null;
}

export default function RestaurantMenuBrowser({
  restaurants,
  restaurantsLoading,
  onOpenBundles,
  sessionDate,
  eventTime,
  defaultBundleGuestCount = 1,
  allMenuItems,
  fetchAllMenuItems,
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
  sessionIndex,
  expandedSessionIndex,
}: RestaurantMenuBrowserProps) {
  const { addMenuItem } = useCatering();

  // --- State ---
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantSearchQuery, setRestaurantSearchQuery] = useState("");
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [activeGroupName, setActiveGroupName] = useState<string | null>(null);
  const [stickyTopOffset, setStickyTopOffset] = useState(72);

  // Bundle state
  const [restaurantBundles, setRestaurantBundles] = useState<CateringBundleResponse[]>([]);
  const [bundlesLoading, setBundlesLoading] = useState(false);
  const [bundlesError, setBundlesError] = useState<string | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<CateringBundleResponse | null>(null);
  const [addingBundleId, setAddingBundleId] = useState<string | null>(null);
  const [menuItemsCache, setMenuItemsCache] = useState<MenuItem[] | null>(null);

  const sectionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const groupButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const isProgrammaticScroll = useRef(false);

  // Eagerly load all menu items on mount
  useEffect(() => {
    fetchAllMenuItems();
  }, [fetchAllMenuItems]);

  useEffect(() => {
    if (allMenuItems) setMenuItemsCache(allMenuItems);
  }, [allMenuItems]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch bundles when restaurant selection changes
  useEffect(() => {
    if (!selectedRestaurantId) {
      setRestaurantBundles([]);
      setBundlesLoading(false);
      setBundlesError(null);
      return;
    }

    let cancelled = false;
    const fetchRestaurantBundles = async () => {
      try {
        setBundlesLoading(true);
        setBundlesError(null);
        const bundles = await cateringService.getBundlesByRestaurant(selectedRestaurantId);
        if (!cancelled) setRestaurantBundles(bundles);
      } catch (error) {
        console.error("Failed to fetch restaurant bundles:", error);
        if (!cancelled) {
          setRestaurantBundles([]);
          setBundlesError("Failed to load bundles for this restaurant.");
        }
      } finally {
        if (!cancelled) setBundlesLoading(false);
      }
    };
    fetchRestaurantBundles();
    return () => { cancelled = true; };
  }, [selectedRestaurantId]);

  const isSearchActive = searchQuery.trim().length > 0;
  const isRestaurantSearchActive = restaurantSearchQuery.trim().length > 0;

  // --- Derived data ---
  const availableRestaurants = useMemo(
    () => restaurants.filter((r) => r.status !== "coming_soon"),
    [restaurants]
  );

  const dietaryFilteredItems = useMemo(() => {
    if (!allMenuItems) return [];
    if (selectedDietaryFilters.length === 0) return allMenuItems;
    return allMenuItems.filter((item) => {
      if (!item.dietaryFilters || item.dietaryFilters.length === 0) return false;
      return selectedDietaryFilters.every((filter) => item.dietaryFilters!.includes(filter));
    });
  }, [allMenuItems, selectedDietaryFilters]);

  const searchResults = useMemo(() => {
    if (!isSearchActive) return null;
    const query = searchQuery.toLowerCase();
    const matchingItems = dietaryFilteredItems.filter(
      (item) =>
        item.menuItemName.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.groupTitle?.toLowerCase().includes(query)
    );

    const grouped = new Map<string, { restaurant: Restaurant; items: MenuItem[] }>();
    matchingItems.forEach((item) => {
      const restaurant = availableRestaurants.find((r) => r.id === item.restaurantId);
      if (!restaurant) return;
      const existing = grouped.get(restaurant.id);
      if (existing) { existing.items.push(item); return; }
      grouped.set(restaurant.id, { restaurant, items: [item] });
    });

    return Array.from(grouped.values()).sort((a, b) =>
      a.restaurant.restaurant_name.localeCompare(b.restaurant.restaurant_name)
    );
  }, [isSearchActive, searchQuery, dietaryFilteredItems, availableRestaurants]);

  const filteredRestaurants = useMemo(() => {
    return availableRestaurants.filter((restaurant) => {
      const matchesCategory =
        !selectedCategoryId ||
        (restaurant.categories ?? []).some((category) => category.id === selectedCategoryId);
      const matchesDiet =
        selectedDietaryFilters.length === 0 ||
        selectedDietaryFilters.every((filter) => (restaurant.dietaryFilters ?? []).includes(filter));
      return matchesCategory && matchesDiet;
    });
  }, [availableRestaurants, selectedCategoryId, selectedDietaryFilters]);

  const selectedRestaurant = useMemo(
    () => availableRestaurants.find((r) => r.id === selectedRestaurantId) || null,
    [availableRestaurants, selectedRestaurantId]
  );

  const restaurantItems = useMemo(() => {
    if (!selectedRestaurantId) return [];
    return dietaryFilteredItems.filter((item) => item.restaurantId === selectedRestaurantId);
  }, [selectedRestaurantId, dietaryFilteredItems]);

  const filteredRestaurantItems = useMemo(() => {
    if (!isRestaurantSearchActive) return restaurantItems;
    const query = restaurantSearchQuery.toLowerCase();
    return restaurantItems.filter(
      (item) =>
        item.menuItemName.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.groupTitle?.toLowerCase().includes(query)
    );
  }, [restaurantItems, isRestaurantSearchActive, restaurantSearchQuery]);

  const groupedItems = useMemo<MenuItemGroup[]>(() => {
    if (filteredRestaurantItems.length === 0) return [];

    const restaurant = restaurants.find((r) => r.id === selectedRestaurantId);
    const menuGroupSettings =
      restaurant?.menuGroupSettings || filteredRestaurantItems[0]?.restaurant?.menuGroupSettings;
    const hasSettings = menuGroupSettings && Object.keys(menuGroupSettings).length > 0;

    let groupNames: string[];
    if (hasSettings) {
      groupNames = Object.keys(menuGroupSettings!).sort((a, b) => {
        const orderA = menuGroupSettings![a]?.displayOrder ?? 999;
        const orderB = menuGroupSettings![b]?.displayOrder ?? 999;
        return orderA - orderB;
      });
    } else {
      groupNames = Array.from(
        new Set(filteredRestaurantItems.map((i) => i.groupTitle || "Other"))
      ).sort((a, b) => a.localeCompare(b));
    }

    const buckets: Record<string, MenuItem[]> = {};
    groupNames.forEach((g) => (buckets[g] = []));
    filteredRestaurantItems.forEach((item) => {
      const group = item.groupTitle || "Other";
      if (!buckets[group]) buckets[group] = [];
      buckets[group].push(item);
    });

    const getDisplayPrice = (item: MenuItem) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      return (
        (item.cateringQuantityUnit ?? 1) *
        (item.isDiscount && discountPrice > 0 ? discountPrice : price)
      );
    };

    return groupNames
      .filter((name) => buckets[name] && buckets[name].length > 0)
      .map((name) => {
        const items = buckets[name];
        items.sort((a, b) => {
          const orderA = a.itemDisplayOrder ?? 999;
          const orderB = b.itemDisplayOrder ?? 999;
          if (orderA !== orderB) return orderA - orderB;
          const aHasImage = a.image && a.image.trim() !== "" ? 0 : 1;
          const bHasImage = b.image && b.image.trim() !== "" ? 0 : 1;
          if (aHasImage !== bHasImage) return aHasImage - bHasImage;
          return getDisplayPrice(a) - getDisplayPrice(b);
        });
        const information = menuGroupSettings?.[name]?.information || null;
        return { type: "items" as const, name, items, information };
      });
  }, [filteredRestaurantItems, restaurants, selectedRestaurantId]);

  const filteredRestaurantBundles = useMemo(() => {
    if (!isRestaurantSearchActive) return restaurantBundles;
    const query = restaurantSearchQuery.toLowerCase();
    return restaurantBundles.filter(
      (bundle) =>
        bundle.name.toLowerCase().includes(query) ||
        bundle.description?.toLowerCase().includes(query) ||
        bundle.items.some((item) => item.menuItemName.toLowerCase().includes(query))
    );
  }, [restaurantBundles, isRestaurantSearchActive, restaurantSearchQuery]);

  const restaurantGroups = useMemo<RestaurantGroup[]>(() => {
    const groups: RestaurantGroup[] = [];
    const shouldShowBundlesSection =
      bundlesLoading || bundlesError !== null || filteredRestaurantBundles.length > 0;
    if (shouldShowBundlesSection) {
      groups.push({ type: "bundles", name: "Bundles", bundles: filteredRestaurantBundles });
    }
    groups.push(...groupedItems);
    return groups;
  }, [bundlesLoading, bundlesError, filteredRestaurantBundles, groupedItems]);

  const firstMenuGroupName = groupedItems[0]?.name ?? null;

  const ensureMenuItems = useCallback(async (): Promise<MenuItem[]> => {
    if (menuItemsCache) return menuItemsCache;
    if (allMenuItems) {
      setMenuItemsCache(allMenuItems);
      return allMenuItems;
    }
    fetchAllMenuItems();
    const response = await cateringService.getMenuItems();
    const items = (response || []).map(mapToMenuItem);
    setMenuItemsCache(items);
    return items;
  }, [menuItemsCache, allMenuItems, fetchAllMenuItems]);

  const handleAddBundle = useCallback(
    async (bundle: CateringBundleResponse, guestQuantity: number) => {
      setAddingBundleId(bundle.id);
      try {
        const items = await ensureMenuItems();
        for (const bundleItem of bundle.items) {
          const menuItem = items.find((item) => item.id === bundleItem.menuItemId);
          if (!menuItem) continue;
          const enrichedAddons = enrichBundleItemAddons(bundleItem, menuItem);
          const scaledQuantity = bundleItem.quantity * guestQuantity;
          addMenuItem(sessionIndex, {
            item: { ...menuItem, selectedAddons: enrichedAddons },
            quantity: scaledQuantity,
            bundleId: bundle.id,
            bundleName: bundle.name,
          });
        }
        setSelectedBundle(null);
      } catch (error) {
        console.error("Failed to add bundle:", error);
        alert("Failed to add bundle. Please try again.");
      } finally {
        setAddingBundleId(null);
      }
    },
    [addMenuItem, ensureMenuItems, sessionIndex]
  );

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  const handleSelectRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setRestaurantSearchQuery("");
    setSelectedCategoryId(null);
    setCollapsedGroups(new Set());
    setActiveGroupName(null);
  };

  const handleBackToRestaurants = () => {
    setSelectedRestaurantId(null);
    setRestaurantSearchQuery("");
    setCollapsedGroups(new Set());
    setActiveGroupName(null);
  };

  useEffect(() => {
    const navElement = document.querySelector<HTMLElement>("[data-catering-session-nav='true']");
    if (!navElement) return;
    const updateOffset = () => setStickyTopOffset(navElement.getBoundingClientRect().height);
    updateOffset();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateOffset);
    observer.observe(navElement);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    sectionRefs.current.clear();
    groupButtonRefs.current.clear();
    setActiveGroupName(restaurantGroups[0]?.name || null);
  }, [restaurantGroups, selectedRestaurantId]);

  useEffect(() => {
    if (!activeGroupName) return;
    const activeButton = groupButtonRefs.current.get(activeGroupName);
    activeButton?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeGroupName]);

  useEffect(() => {
    if (!selectedRestaurantId || restaurantGroups.length === 0) return;
    const updateActiveGroup = () => {
      if (isProgrammaticScroll.current) return;
      const activationLine = stickyTopOffset + 96;
      let nextActiveGroup = restaurantGroups[0]?.name || null;
      for (const group of restaurantGroups) {
        const section = sectionRefs.current.get(group.name);
        if (!section) continue;
        const { top } = section.getBoundingClientRect();
        if (top <= activationLine) nextActiveGroup = group.name;
        else break;
      }
      setActiveGroupName((prev) => (prev === nextActiveGroup ? prev : nextActiveGroup));
    };
    updateActiveGroup();
    window.addEventListener("scroll", updateActiveGroup, { passive: true });
    window.addEventListener("resize", updateActiveGroup);
    return () => {
      window.removeEventListener("scroll", updateActiveGroup);
      window.removeEventListener("resize", updateActiveGroup);
    };
  }, [restaurantGroups, selectedRestaurantId, stickyTopOffset]);

  const handleGroupTabClick = (groupName: string) => {
    setCollapsedGroups((prev) => {
      if (!prev.has(groupName)) return prev;
      const next = new Set(prev);
      next.delete(groupName);
      return next;
    });
    setActiveGroupName(groupName);
    const section = sectionRefs.current.get(groupName);
    if (!section) return;
    isProgrammaticScroll.current = true;
    const topOffset = stickyTopOffset + 80;
    const nextTop = section.getBoundingClientRect().top + window.scrollY - topOffset;
    window.scrollTo({ top: Math.max(nextTop, 0), behavior: "smooth" });
    window.setTimeout(() => { isProgrammaticScroll.current = false; }, 450);
  };

  const renderRestaurantCard = (restaurant: Restaurant, onClick?: () => void) => {
    const advanceNoticeText = getRestaurantAdvanceNoticeText(restaurant);

    const cardContent = (
      <>
        {restaurant.images && restaurant.images.length > 0 ? (
          <div className="relative w-full aspect-video bg-gray-100">
            <img src={restaurant.images[0]} alt={restaurant.restaurant_name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full aspect-video bg-base-200 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-300">
              {restaurant.restaurant_name.charAt(0)}
            </span>
          </div>
        )}
        <div className="p-3">
          <p className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900">
            {restaurant.restaurant_name}
          </p>
          {restaurant.minCateringOrderQuantity && restaurant.minCateringOrderQuantity > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                Min {restaurant.minCateringOrderQuantity} items
              </span>
            </div>
          ) : null}
          {advanceNoticeText ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] leading-4 text-gray-500">
              <Clock3 className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
              <span className="line-clamp-1">{advanceNoticeText}</span>
            </div>
          ) : null}
        </div>
      </>
    );

    if (!onClick) {
      return (
        <div className="w-full overflow-hidden rounded-xl border border-base-300 bg-white shadow-sm">
          {cardContent}
        </div>
      );
    }
    return (
      <button
        onClick={onClick}
        className="block w-full overflow-hidden rounded-xl border border-base-300 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        {cardContent}
      </button>
    );
  };

  const renderDietaryFilters = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-hide">
      <span className="flex-shrink-0 text-xs text-gray-500 mr-1">Diet:</span>
      {(
        [
          { value: DietaryFilter.HALAL, label: "Halal" },
          { value: DietaryFilter.VEGETARIAN, label: "Vegetarian" },
          { value: DietaryFilter.VEGAN, label: "Vegan" },
          { value: DietaryFilter.PESCATERIAN, label: "Pescatarian" },
        ] as const
      ).map((option) => (
        <button
          key={option.value}
          onClick={() => toggleDietaryFilter(option.value)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
            selectedDietaryFilters.includes(option.value)
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-600"
          }`}
        >
          {option.label}
          {selectedDietaryFilters.includes(option.value) && (
            <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-white/20">x</span>
          )}
        </button>
      ))}
    </div>
  );

  const renderCategoryFilters = () => (
    <div style={{ contain: "inline-size" }}>
      <div className="overflow-x-auto pb-2 pt-1 scrollbar-hide">
        <div className="flex items-center gap-2 md:gap-3">
          {categoriesLoading
            ? [...Array(6)].map((_, index) => (
              <div key={index} className="h-10 w-20 md:w-24 flex-shrink-0 rounded-xl bg-base-200 animate-pulse" />
            ))
            : categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)
                }
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border flex flex-col items-center justify-center gap-0.5 leading-none ${
                  category.icon ? "min-h-16" : ""
                } ${
                  selectedCategoryId === category.id
                    ? "bg-base-200/30 border-primary text-primary"
                    : "bg-base-200/30 border-transparent text-gray-700 hover:text-primary"
                }`}
              >
                {category.icon && (
                  <span className="flex h-6 md:h-7 items-center justify-center text-xl md:text-2xl leading-none">
                    {category.icon}
                  </span>
                )}
                <span className="text-center text-xs md:text-sm">{category.name}</span>
              </button>
            ))}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // VIEW 2: Restaurant Menu
  // ============================================================
  if (selectedRestaurantId && selectedRestaurant) {
    return (
      <div style={{ contain: "inline-size" }}>
        <button
          onClick={handleBackToRestaurants}
          className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Restaurants
        </button>

        <div className="flex items-center gap-3 mb-3">
          {selectedRestaurant.images && selectedRestaurant.images.length > 0 ? (
            <img
              src={selectedRestaurant.images[0]}
              alt={selectedRestaurant.restaurant_name}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-base-200 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-gray-400">
                {selectedRestaurant.restaurant_name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-gray-900">{selectedRestaurant.restaurant_name}</h2>
            {selectedRestaurant.minCateringOrderQuantity &&
              selectedRestaurant.minCateringOrderQuantity > 0 && (
                <p className="text-xs text-gray-500">
                  Min order: {selectedRestaurant.minCateringOrderQuantity} items
                </p>
              )}
          </div>
        </div>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={restaurantSearchQuery}
            onChange={(e) => setRestaurantSearchQuery(e.target.value)}
            placeholder={`Search ${selectedRestaurant.restaurant_name} items...`}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-base-300 bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          {restaurantSearchQuery && (
            <button
              onClick={() => setRestaurantSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="mt-2">{renderDietaryFilters()}</div>

        <div className="mt-3">
          {restaurantGroups.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm">No items match the current filters.</p>
            </div>
          ) : (
            <>
              <div
                className="sticky z-30 mt-2 mb-3 w-full overflow-x-auto scrollbar-hide rounded-full border border-base-300 bg-white/50 px-2 py-1.5 md:px-4 md:py-2 shadow-sm backdrop-blur-md"
                style={{ top: stickyTopOffset + 8 }}
              >
                <div className="flex gap-2 md:gap-5">
                  {restaurantGroups.map((group) => {
                    const isActive = activeGroupName === group.name;
                    return (
                      <button
                        key={group.name}
                        ref={(el) => {
                          if (el) groupButtonRefs.current.set(group.name, el);
                          else groupButtonRefs.current.delete(group.name);
                        }}
                        onClick={() => handleGroupTabClick(group.name)}
                        className={`flex-shrink-0 whitespace-nowrap rounded-full px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-500 hover:bg-black/5 hover:text-gray-700"
                        }`}
                      >
                        {group.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {restaurantGroups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.name);
                const groupCount =
                  group.type === "bundles" ? group.bundles.length : group.items.length;
                return (
                  <div
                    key={group.name}
                    ref={(el) => {
                      if (el) sectionRefs.current.set(group.name, el);
                      else sectionRefs.current.delete(group.name);
                    }}
                    data-group-name={group.name}
                    style={{ scrollMarginTop: stickyTopOffset + 80 }}
                    className="mb-4"
                  >
                    <button
                      onClick={() => toggleGroupCollapse(group.name)}
                      className="w-full flex items-center justify-between py-2 px-1 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-primary">{group.name}</h3>
                        <span className="text-xs text-gray-400 font-normal">({groupCount})</span>
                      </div>
                      {isCollapsed ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {group.type === "items" && group.information && !isCollapsed && (
                      <div className="flex items-start gap-1.5 px-1 pb-2">
                        <Info className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 whitespace-pre-line">{group.information}</p>
                      </div>
                    )}

                    {!isCollapsed && (
                      group.type === "bundles" ? (
                        bundlesLoading ? (
                          <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                            <span className="loading loading-spinner loading-sm text-primary" />
                            Loading bundles...
                          </div>
                        ) : bundlesError ? (
                          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {bundlesError}
                          </div>
                        ) : group.bundles.length === 0 ? (
                          <div className="mt-2 rounded-xl border border-dashed border-base-300 bg-base-100/60 px-4 py-5 text-sm text-gray-500">
                            No bundles match the current filters.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                            {group.bundles.map((bundle) => (
                              <BundleCard key={bundle.id} bundle={bundle} onClick={setSelectedBundle} />
                            ))}
                          </div>
                        )
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                          {group.items.map((item, itemIdx) => (
                            <div
                              key={item.id}
                              ref={
                                expandedSessionIndex === sessionIndex &&
                                itemIdx === 0 &&
                                group.name === firstMenuGroupName
                                  ? firstMenuItemRef
                                  : undefined
                              }
                            >
                              <MenuItemCard
                                item={item}
                                quantity={getItemQuantity(item.id)}
                                isExpanded={expandedItemId === item.id}
                                onToggleExpand={() =>
                                  setExpandedItemId(expandedItemId === item.id ? null : item.id)
                                }
                                onAddItem={onAddItem}
                                onUpdateQuantity={onUpdateQuantity}
                                onAddOrderPress={onAddOrderPress}
                              />
                            </div>
                          ))}
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {selectedBundle && (
          <BundleDetailModal
            bundle={selectedBundle}
            defaultQuantity={defaultBundleGuestCount}
            isAdding={addingBundleId === selectedBundle.id}
            onAdd={handleAddBundle}
            onClose={() => setSelectedBundle(null)}
            allMenuItems={menuItemsCache || allMenuItems}
          />
        )}
      </div>
    );
  }

  // ============================================================
  // VIEW 1: Restaurant List (default)
  // ============================================================
  return (
    <div style={{ contain: "inline-size" }}>
      <div className="relative mt-2 mb-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search across all restaurants..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-base-300 bg-white text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div>
        {!isSearchActive && (
          <button
            type="button"
            onClick={onOpenBundles}
            className="mb-3 flex w-full items-start justify-between rounded-2xl border border-primary/15 bg-primary/[0.05] px-4 py-4 text-left transition-colors hover:bg-primary/[0.08]"
          >
            <span className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                <Package className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-gray-900">
                  Don&apos;t know what to get?
                </span>
                <span className="mt-1 block text-sm text-gray-600">Look at our bundles.</span>
              </span>
            </span>
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              Browse
            </span>
          </button>
        )}
        {!isSearchActive && renderCategoryFilters()}
        {renderDietaryFilters()}
      </div>

      {isSearchActive ? (
        !allMenuItems ? (
          <div className="text-center py-6">
            <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-sm text-gray-500">Loading menu items...</p>
          </div>
        ) : searchResults && searchResults.length === 0 ? (
          <div className="text-center py-6">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No items found for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : searchResults ? (
          <div className="mt-3">
            {searchResults.map((result) => (
              <div key={result.restaurant.id} className="mb-6">
                <div className="mb-3 max-w-sm">
                  {renderRestaurantCard(result.restaurant, () =>
                    handleSelectRestaurant(result.restaurant.id)
                  )}
                </div>
                {result.items.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-primary mb-2">
                      Matching items{" "}
                      <span className="text-gray-400 font-normal">({result.items.length})</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {result.items.map((item) => (
                        <div key={item.id}>
                          <MenuItemCard
                            item={item}
                            quantity={getItemQuantity(item.id)}
                            isExpanded={expandedItemId === item.id}
                            onToggleExpand={() =>
                              setExpandedItemId(expandedItemId === item.id ? null : item.id)
                            }
                            onAddItem={onAddItem}
                            onUpdateQuantity={onUpdateQuantity}
                            onAddOrderPress={onAddOrderPress}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null
      ) : (
        <div
          ref={restaurantListRef}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3"
        >
          {restaurantsLoading ? (
            <div className="col-span-full py-8">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Loading restaurants...</p>
              </div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="col-span-full text-center py-6">
              <p className="text-gray-500 text-sm">No restaurants found.</p>
            </div>
          ) : (
            filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id}>
                {renderRestaurantCard(restaurant, () => handleSelectRestaurant(restaurant.id))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add lib/components/catering/RestaurantMenuBrowser.tsx
git commit -m "feat: add bundle support to RestaurantMenuBrowser"
```

---

## Chunk 4: CateringOrderBuilder and Cart Bundle Awareness

### Task 8: Update `CateringOrderBuilder` to add `showBundleBrowser` and wire props

**Files:**
- Modify: `lib/components/catering/CateringOrderBuilder.tsx`

Three changes needed:
1. Import `BundleBrowser`
2. Add `showBundleBrowser` state with open/close handlers
3. Conditionally render `BundleBrowser` in place of `RestaurantMenuBrowser` when open
4. Pass `onOpenBundles`, `defaultBundleGuestCount`, `sessionDate`, `eventTime` to `RestaurantMenuBrowser`

Context: `RestaurantMenuBrowser` is called inside `renderSessionContent` (line 1074-1091). The active session's `sessionDate` and `eventTime` come from `mealSessions[activeSessionIndex]`.

- [ ] **Step 1: Add BundleBrowser import**

At the top of `CateringOrderBuilder.tsx`, add after the existing `RestaurantMenuBrowser` import:
```typescript
import BundleBrowser from "./BundleBrowser";
```

- [ ] **Step 2: Add `showBundleBrowser` state**

After the `pendingItem` state declaration (line 88), add:
```typescript
// Bundle browser state
const [showBundleBrowser, setShowBundleBrowser] = useState(false);
```

- [ ] **Step 3: Update `renderSessionContent` to pass new props and conditionally render**

Find the `renderSessionContent` function (line 1038-1093). Replace the `<RestaurantMenuBrowser ... />` block with:

```typescript
      {showBundleBrowser && expandedSessionIndex === index ? (
        <BundleBrowser
          sessionIndex={index}
          allMenuItems={allMenuItems}
          fetchAllMenuItems={fetchAllMenuItems}
          onBack={() => setShowBundleBrowser(false)}
          defaultGuestCount={mealSessions[index]?.guestCount ?? 1}
        />
      ) : (
        <RestaurantMenuBrowser
          restaurants={restaurants}
          restaurantsLoading={restaurantsLoading}
          onOpenBundles={() => setShowBundleBrowser(true)}
          sessionDate={mealSessions[index]?.sessionDate}
          eventTime={mealSessions[index]?.eventTime}
          defaultBundleGuestCount={mealSessions[index]?.guestCount ?? 1}
          allMenuItems={allMenuItems}
          fetchAllMenuItems={fetchAllMenuItems}
          onAddItem={handleAddItem}
          onUpdateQuantity={handleUpdateQuantity}
          onAddOrderPress={handleAddOrderPress}
          getItemQuantity={getItemQuantity}
          expandedItemId={expandedItemId}
          setExpandedItemId={setExpandedItemId}
          selectedDietaryFilters={selectedDietaryFilters}
          toggleDietaryFilter={toggleDietaryFilter}
          restaurantListRef={restaurantListRef}
          firstMenuItemRef={firstMenuItemRef}
          sessionIndex={index}
          expandedSessionIndex={expandedSessionIndex}
        />
      )}
```

Also reset `showBundleBrowser` when the accordion is toggled to a different session. In `toggleSessionExpand`:
```typescript
const toggleSessionExpand = (sessionIndex: number) => {
  const session = mealSessions[sessionIndex];
  if (session?.sessionDate) {
    setSelectedDayDate(session.sessionDate);
    setNavMode("sessions");
  }
  setExpandedSessionIndex((prev) => prev === sessionIndex ? null : sessionIndex);
  setActiveSessionIndex(sessionIndex);
  setShowBundleBrowser(false); // reset when switching sessions
};
```

And in `handleSessionPillClick`, also reset:
```typescript
setShowBundleBrowser(false);
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add lib/components/catering/CateringOrderBuilder.tsx
git commit -m "feat: wire BundleBrowser into CateringOrderBuilder"
```

---

### Task 9: Update `SelectedItemsByCategory` to show bundle badges and bulk-remove

**Files:**
- Modify: `lib/components/catering/SelectedItemsByCategory.tsx`

Bundle items have `bundleId` and `bundleName` on their `SelectedMenuItem`. This task:
1. Reads `bundleName` and `bundleId` from each order item for display
2. Shows a small `Package` badge with the bundle name on bundle items
3. Adds a "Remove bundle" button at the bundle group level that removes all items sharing the same `bundleId` in one click

The `onRemove` prop already calls `removeMenuItemByIndex` per item. For bulk-remove we need access to the `removeMenuItemByIndex` from context, or we can call `onRemove` in reverse index order.

- [ ] **Step 1: Read the full current file to understand structure**

```bash
cat -n /Users/thadoos/Coding/AllRestaurantApps/website/lib/components/catering/SelectedItemsByCategory.tsx
```

- [ ] **Step 2: Add bundle badge to individual items**

In the item render section, after the item name display, add a bundle badge when `item.bundleName` is set. The `SelectedMenuItem` type now has `bundleName?`. The `orderItems` array from `mealSessions[currentSessionIndex].orderItems` already has this field.

Find where item names are rendered and add after the name:
```tsx
{/* Bundle badge */}
{(orderItem as any).bundleName && (
  <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
    <Package className="w-2.5 h-2.5" />
    {(orderItem as any).bundleName}
  </span>
)}
```

Import `Package` from `lucide-react` at the top.

- [ ] **Step 3: Add "Remove bundle" button to bundle groups**

In the section that renders category/group headers, detect when all items in the group share the same `bundleId`. When they do, show a "Remove bundle" button.

The cleanest approach: after grouping items, detect bundle groups separately. For each unique `bundleId` across all items, collect the indices of items with that bundleId. Show a "× Remove bundle" button for each bundle group that removes all those items at once (call `onRemove` for each index in descending order to avoid index shifting).

Add a computed map above the render:
```typescript
// Group items by bundleId to enable bulk removal
const bundleGroups = useMemo(() => {
  const map = new Map<string, { bundleName: string; indices: number[] }>();
  orderItems.forEach((orderItem, idx) => {
    const { bundleId, bundleName } = orderItem as any;
    if (!bundleId) return;
    if (!map.has(bundleId)) {
      map.set(bundleId, { bundleName: bundleName ?? "Bundle", indices: [] });
    }
    map.get(bundleId)!.indices.push(idx);
  });
  return map;
}, [orderItems]);
```

And at the bottom of the item list (or in its own section above the category list), render bundle group headers with bulk-remove:
```tsx
{bundleGroups.size > 0 && onRemove && (
  <div className="mb-3">
    {Array.from(bundleGroups.entries()).map(([bundleId, { bundleName, indices }]) => (
      <div key={bundleId} className="flex items-center justify-between py-1.5 px-2 bg-primary/5 rounded-xl mb-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
          <Package className="w-3.5 h-3.5" />
          {bundleName}
          <span className="text-gray-500 font-normal">({indices.length} items)</span>
        </span>
        <button
          onClick={() => {
            // Remove in descending order to avoid index shifting
            [...indices].sort((a, b) => b - a).forEach((i) => onRemove(i));
          }}
          className="text-xs text-red-500 hover:text-red-700 font-medium"
        >
          Remove bundle
        </button>
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add lib/components/catering/SelectedItemsByCategory.tsx
git commit -m "feat: add bundle badge and bulk-remove to SelectedItemsByCategory"
```

---

### Task 10: Verify end-to-end TypeScript clean build

- [ ] **Step 1: Run full TypeScript check**

```bash
cd /Users/thadoos/Coding/AllRestaurantApps/website && npx tsc --noEmit 2>&1
```
Expected: zero errors.

- [ ] **Step 2: Run dev server to verify no runtime errors**

```bash
npm run dev 2>&1 | head -40
```
Expected: "Ready" with no compilation errors.

- [ ] **Step 3: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "fix: resolve any TypeScript errors from bundle integration"
```

---

## Notes

### Import paths
- `MenuItem` in the website comes from `@/lib/components/catering/Step2MenuItems` (not `@/types/restaurant.types` like halkins-food)
- `CateringBundleResponse` and `CateringBundleItem` come from `@/types/api/catering.api.types` (same in both codebases)
- `mapToMenuItem` comes from `@/lib/components/catering/catering-order-helpers`

### MenuItemModal and edit flow
Bundle items are regular `SelectedMenuItem` entries — editing a bundle item via `MenuItemModal` already works (it edits quantity, addons, etc.) with no changes needed. The bundle badge in `SelectedItemsByCategory` clarifies provenance. If the user wants to edit the whole bundle quantity, they must remove the bundle and re-add it with a different quantity from the BundleBrowser.

### `addMenuItem` dedup logic
The existing `addMenuItem` in `CateringContext` deduplicates items with the same id + addons by increasing quantity. Bundle items may share IDs across bundles; since bundles are added in a loop, each item is enriched individually. If two bundles share a menu item, their quantities will be summed — this is the correct behavior (matches halkins-food).
