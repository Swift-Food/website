# Catering Two-Column Layout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure CateringOrderBuilder from single-column timeline to two-column desktop layout (left: menu browser, right: active session cart) with a mobile modal for cart viewing.

**Architecture:** Extract session display into `ActiveSessionPanel`, create `ViewOrderModal` for mobile, and create `MenuBrowserColumn` wrapper. Restructure `CateringOrderBuilder` to use a two-column flex layout on desktop and single-column + modal on mobile. Remove timeline rendering entirely.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide React icons

---

### Task 1: Add New Type Interfaces

**Files:**
- Modify: `lib/components/catering/types.ts`

- [ ] **Step 1: Add ActiveSessionPanelProps and ViewOrderModalProps interfaces**

Add to the end of `lib/components/catering/types.ts`:

```typescript
// ActiveSessionPanel component props
export interface ActiveSessionPanelProps {
  session: MealSessionState;
  sessionIndex: number;
  sessionTotal: number;
  sessionDiscount?: number;
  sessionPromotion?: any;
  validationError?: string | null;
  isUnscheduled?: boolean;
  canRemove: boolean;
  onEditSession: () => void;
  onRemoveSession: (e: React.MouseEvent) => void;
  onEditItem: (itemIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onSwapItem: (itemIndex: number) => void;
  onRemoveBundle: (bundleId: string) => void;
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
  onViewMenu: () => void;
  // Checkout (desktop inline)
  isCurrentSessionValid: boolean;
  totalPrice: number;
  onCheckout: () => void;
  showCheckoutButton?: boolean;
}

// ViewOrderModal component props
export interface ViewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealSessions: MealSessionState[];
  activeSessionIndex: number;
  onSessionChange: (index: number) => void;
  // Pass through to ActiveSessionPanel
  getSessionTotal: (index: number) => number;
  getSessionDiscount: (index: number) => { discount: number; promotion?: any };
  validationErrors: Record<number, string>;
  onEditSession: (index: number) => void;
  onRemoveSession: (index: number, e: React.MouseEvent) => void;
  onEditItem: (itemIndex: number) => void;
  onRemoveItem: (itemIndex: number) => void;
  onSwapItem: (itemIndex: number) => void;
  onRemoveBundle: (bundleId: string) => void;
  collapsedCategories: Set<string>;
  onToggleCategory: (categoryName: string) => void;
  onViewMenu: () => void;
  isCurrentSessionValid: boolean;
  totalPrice: number;
  onCheckout: () => void;
  canRemoveSession: (index: number) => boolean;
  formatTimeDisplay: (eventTime: string | undefined) => string;
}
```

- [ ] **Step 2: Commit**

Use `/git-commit`

---

### Task 2: Create ActiveSessionPanel Component

**Files:**
- Create: `lib/components/catering/ActiveSessionPanel.tsx`

- [ ] **Step 1: Create the ActiveSessionPanel component**

This component renders the right column content — session header, validation error, selected items, and checkout button. It extracts logic from `SessionAccordion` (header, edit/remove buttons, promotion banner) and combines it with `SelectedItemsByCategory`.

```tsx
"use client";

import { Clock, X, Tag, Pencil, ShoppingBag, AlertTriangle } from "lucide-react";
import { ActiveSessionPanelProps } from "./types";
import SelectedItemsByCategory from "./SelectedItemsByCategory";

export default function ActiveSessionPanel({
  session,
  sessionIndex,
  sessionTotal,
  sessionDiscount,
  sessionPromotion,
  validationError,
  isUnscheduled,
  canRemove,
  onEditSession,
  onRemoveSession,
  onEditItem,
  onRemoveItem,
  onSwapItem,
  onRemoveBundle,
  collapsedCategories,
  onToggleCategory,
  onViewMenu,
  isCurrentSessionValid,
  totalPrice,
  onCheckout,
  showCheckoutButton = true,
}: ActiveSessionPanelProps) {
  const totalItemCount = session.orderItems.reduce(
    (sum, oi) => sum + oi.quantity,
    0
  );

  const formatTime = (eventTime: string | undefined) => {
    if (!eventTime) return "Time not set";
    const [hours, minutes] = eventTime.split(":");
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    const start = `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
    const totalEnd = hour * 60 + minute + 30;
    const endHour = Math.floor(totalEnd / 60) % 24;
    const endMinute = totalEnd % 60;
    const endPeriod = endHour >= 12 ? "PM" : "AM";
    const endHour12 = endHour % 12 || 12;
    return `${start} – ${endHour12}:${String(endMinute).padStart(2, "0")} ${endPeriod}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-base-200">
      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 bg-red-50 border-b-2 border-red-500 rounded-t-xl flex items-start gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-1">
              Catering Hours Conflict
            </p>
            <p className="text-sm text-red-700">{validationError}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSession();
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Edit Session Time
            </button>
          </div>
        </div>
      )}

      {/* Unscheduled Warning */}
      {isUnscheduled && (
        <div className="p-4 bg-amber-50 border-b border-amber-200 rounded-t-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Set date & time to continue</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditSession();
              }}
              className="mt-2 px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 transition-colors"
            >
              Edit Session
            </button>
          </div>
        </div>
      )}

      {/* Session Header */}
      <div className="px-4 py-3 md:px-5 md:py-4 flex items-center justify-between border-b border-base-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm md:text-base font-semibold text-gray-800">
              {session.sessionName}
            </p>
            <p className="text-xs text-gray-500">
              {formatTime(session.eventTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <span className="text-sm md:text-base font-semibold text-primary">
              £{sessionTotal.toFixed(2)}
            </span>
            <p className="text-[10px] text-gray-500">{totalItemCount} items</p>
            {sessionDiscount != null && sessionDiscount > 0 && (
              <p className="text-[10px] text-green-600 font-semibold">
                -£{sessionDiscount.toFixed(2)} off
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditSession();
            }}
            className="p-2 rounded-full hover:bg-base-200 transition-colors text-primary"
            title="Edit Session"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {canRemove && (
            <button
              onClick={onRemoveSession}
              className="p-2 rounded-full hover:bg-red-50 transition-colors text-red-500"
              title="Remove Session"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Promotion Discount Banner */}
      {sessionDiscount != null && sessionDiscount > 0 && sessionPromotion && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <span className="text-xs md:text-sm font-semibold text-green-700">
              {sessionPromotion.name || "Restaurant Promotion"}
            </span>
            <span className="text-xs text-green-600 ml-1.5">
              {sessionPromotion.promotionType === "BUY_MORE_SAVE_MORE" && sessionPromotion.discountTiers?.length
                ? (() => {
                    const totalQty = session.orderItems.reduce((s, oi) => s + oi.quantity, 0);
                    const sorted = [...sessionPromotion.discountTiers].sort((a: any, b: any) => b.minQuantity - a.minQuantity);
                    const tier = sorted.find((t: any) => totalQty >= t.minQuantity);
                    return tier ? `${Number(tier.discountPercentage)}% off` : "";
                  })()
                : sessionPromotion.promotionType === "BOGO"
                ? "Buy One Get One"
                : `${Number(sessionPromotion.discountPercentage)}% off`}
            </span>
          </div>
          <span className="text-sm font-bold text-green-700 flex-shrink-0">
            -£{sessionDiscount.toFixed(2)}
          </span>
        </div>
      )}

      {/* Session Content */}
      <div className="p-4 md:p-5">
        {session.orderItems.length > 0 ? (
          <div className="min-w-0 overflow-hidden">
            <SelectedItemsByCategory
              sessionIndex={sessionIndex}
              onEdit={onEditItem}
              onRemove={onRemoveItem}
              onSwapItem={onSwapItem}
              onRemoveBundle={onRemoveBundle}
              collapsedCategories={collapsedCategories}
              onToggleCategory={onToggleCategory}
              onViewMenu={onViewMenu}
            />
          </div>
        ) : (
          <div className="py-12 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Browse the menu to add items</p>
          </div>
        )}
      </div>

      {/* Inline Checkout Button */}
      {showCheckoutButton && session.orderItems.length > 0 && (
        <div className="px-4 pb-4 md:px-5 md:pb-5">
          <button
            onClick={onCheckout}
            className={`w-full flex items-center justify-between px-5 py-3 rounded-xl text-white font-semibold transition-colors ${
              isCurrentSessionValid
                ? "bg-primary hover:bg-primary/90"
                : "bg-warning hover:bg-warning/90"
            }`}
          >
            <div>
              <span className="text-sm opacity-90">Total</span>
              <span className="ml-2 text-lg font-bold">£{totalPrice.toFixed(2)}</span>
            </div>
            <span>
              {isCurrentSessionValid ? "Checkout" : "Min. Order Not Met"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Use `/git-commit`

---

### Task 3: Create ViewOrderModal Component

**Files:**
- Create: `lib/components/catering/ViewOrderModal.tsx`

- [ ] **Step 1: Create the ViewOrderModal component**

Full-page modal for mobile cart viewing with session picker and checkout.

```tsx
"use client";

import { X, Clock } from "lucide-react";
import { ViewOrderModalProps } from "./types";
import ActiveSessionPanel from "./ActiveSessionPanel";

export default function ViewOrderModal({
  isOpen,
  onClose,
  mealSessions,
  activeSessionIndex,
  onSessionChange,
  getSessionTotal,
  getSessionDiscount,
  validationErrors,
  onEditSession,
  onRemoveSession,
  onEditItem,
  onRemoveItem,
  onSwapItem,
  onRemoveBundle,
  collapsedCategories,
  onToggleCategory,
  onViewMenu,
  isCurrentSessionValid,
  totalPrice,
  onCheckout,
  canRemoveSession,
  formatTimeDisplay,
}: ViewOrderModalProps) {
  if (!isOpen) return null;

  const activeSession = mealSessions[activeSessionIndex];
  if (!activeSession) return null;

  const { discount, promotion } = getSessionDiscount(activeSessionIndex);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-base-200 bg-white">
        <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-base-200 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Session Picker */}
      {mealSessions.length > 1 && (
        <div className="px-4 py-2 border-b border-base-200 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            {mealSessions.map((session, index) => (
              <button
                key={index}
                onClick={() => onSessionChange(index)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === activeSessionIndex
                    ? "bg-primary text-white"
                    : "bg-base-200 text-gray-600 hover:bg-base-300"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {session.sessionName}
                  {session.eventTime && (
                    <span className="ml-1 opacity-80">
                      {formatTimeDisplay(session.eventTime)}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <ActiveSessionPanel
          session={activeSession}
          sessionIndex={activeSessionIndex}
          sessionTotal={getSessionTotal(activeSessionIndex)}
          sessionDiscount={discount}
          sessionPromotion={promotion}
          validationError={validationErrors[activeSessionIndex] || null}
          isUnscheduled={!activeSession.sessionDate}
          canRemove={canRemoveSession(activeSessionIndex)}
          onEditSession={() => onEditSession(activeSessionIndex)}
          onRemoveSession={(e) => onRemoveSession(activeSessionIndex, e)}
          onEditItem={onEditItem}
          onRemoveItem={onRemoveItem}
          onSwapItem={onSwapItem}
          onRemoveBundle={onRemoveBundle}
          collapsedCategories={collapsedCategories}
          onToggleCategory={onToggleCategory}
          onViewMenu={onViewMenu}
          isCurrentSessionValid={isCurrentSessionValid}
          totalPrice={totalPrice}
          onCheckout={onCheckout}
          showCheckoutButton={false}
        />
      </div>

      {/* Fixed Bottom Checkout */}
      <div className="px-4 py-3 border-t border-base-200 bg-white">
        <button
          onClick={() => {
            onClose();
            onCheckout();
          }}
          className={`w-full flex items-center justify-between px-5 py-3.5 rounded-xl text-white font-semibold transition-colors ${
            isCurrentSessionValid
              ? "bg-primary hover:bg-primary/90"
              : "bg-warning hover:bg-warning/90"
          }`}
        >
          <div>
            <span className="text-sm opacity-90">Total</span>
            <span className="ml-2 text-lg font-bold">£{totalPrice.toFixed(2)}</span>
          </div>
          <span>
            {isCurrentSessionValid ? "Proceed to Checkout" : "Min. Order Not Met"}
          </span>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

Use `/git-commit`

---

### Task 4: Create MenuBrowserColumn Component

**Files:**
- Create: `lib/components/catering/MenuBrowserColumn.tsx`

- [ ] **Step 1: Create the MenuBrowserColumn component**

Thin wrapper that renders either RestaurantMenuBrowser or BundleBrowser.

```tsx
"use client";

import { RefObject } from "react";
import RestaurantMenuBrowser from "./RestaurantMenuBrowser";
import BundleBrowser from "./BundleBrowser";
import { MenuItem, Restaurant } from "./Step2MenuItems";
import { DietaryFilter } from "@/types/menuItem";

interface MenuBrowserColumnProps {
  showBundleBrowser: boolean;
  onToggleBundleBrowser: (show: boolean) => void;
  // BundleBrowser props
  sessionIndex: number;
  allMenuItems: MenuItem[] | null;
  fetchAllMenuItems: () => void;
  defaultGuestCount: number;
  // RestaurantMenuBrowser props
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
  expandedSessionIndex: number | null;
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
  expandedSessionIndex,
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
      sessionIndex={sessionIndex}
      expandedSessionIndex={expandedSessionIndex}
    />
  );
}
```

- [ ] **Step 2: Commit**

Use `/git-commit`

---

### Task 5: Restructure CateringOrderBuilder

**Files:**
- Modify: `lib/components/catering/CateringOrderBuilder.tsx`

This is the main task. We need to:
1. Remove timeline rendering (lines 1282-1401)
2. Remove `renderSessionContent` function (lines 1114-1185)
3. Remove `renderValidationErrorBanner` function (lines 1074-1110)
4. Remove unused imports and state (SessionAccordion, dayRefs, several timeline-related handlers)
5. Add two-column layout with MenuBrowserColumn and ActiveSessionPanel
6. Add mobile View Order bar and ViewOrderModal
7. Remove CheckoutBar import and usage
8. Simplify state by unifying expandedSessionIndex/activeSessionIndex

- [ ] **Step 1: Update imports**

Remove imports that are no longer needed and add new ones:

Remove these imports:
- `SessionAccordion` (line 23)
- `CheckoutBar` (line 26)
- `Plus, Clock, Calendar` from lucide-react (line 42)

Add these imports:
```tsx
import ActiveSessionPanel from "./ActiveSessionPanel";
import ViewOrderModal from "./ViewOrderModal";
import MenuBrowserColumn from "./MenuBrowserColumn";
import { ShoppingBag } from "lucide-react";
```

- [ ] **Step 2: Remove unused state and refs**

Remove these state/ref declarations:
- `expandedSessionIndex` state (line 70) — will use `activeSessionIndex` only
- `dayRefs` ref (line 78)
- `sessionAccordionRefs` ref (line 77)

Add new state:
```tsx
const [isViewOrderOpen, setIsViewOrderOpen] = useState(false);
```

- [ ] **Step 3: Remove/simplify timeline-related handlers**

Remove or simplify these functions since timeline is gone:
- `handleDateClick` (lines 365-380) — simplify to just set the selected day and switch to sessions mode without scroll
- `handleBackToDates` (lines 383-396) — simplify, remove session cleanup logic tied to scroll
- `handleSessionPillClick` (lines 399-420) — simplify to just set `activeSessionIndex` and `setShowBundleBrowser(false)`, no scroll
- `toggleSessionExpand` (lines 423-434) — remove entirely (no more accordions)
- `handleMinOrderNavigate` (lines 437-477) — simplify to just set active session + close modal, no scroll
- `handleAddSessionToDay` (lines 542-580) — simplify, remove scroll-to logic
- `handleEditorClose` (lines 588-632) — simplify, remove scroll-to logic
- `handleRemoveSession` / `confirmRemoveSession` — keep but remove scroll logic
- `handleAddItemsToEmptySession` (lines 972-1001) — simplify, remove scroll logic
- `handleCheckout` (lines 789-961) — keep validation but remove scroll-to-accordion logic

In all these functions, replace references to `expandedSessionIndex` with `activeSessionIndex` and remove all `sessionAccordionRefs` / `dayRefs` scrolling code.

- [ ] **Step 4: Remove `renderSessionContent` and `renderValidationErrorBanner`**

Delete the `renderSessionContent` function (lines 1114-1185) and `renderValidationErrorBanner` function (lines 1074-1110). These are replaced by `ActiveSessionPanel`.

- [ ] **Step 5: Replace the main JSX return**

Replace everything inside `<div className="min-h-screen bg-base-100">` (lines 1188-1546) with the new two-column layout:

```tsx
return (
  <div className="min-h-screen bg-base-100">
    {/* Sticky Navigation */}
    <DateSessionNav
      navMode={navMode}
      dayGroups={dayGroups}
      selectedDayDate={selectedDayDate}
      currentDayGroup={currentDayGroup}
      expandedSessionIndex={activeSessionIndex}
      isNavSticky={isNavSticky}
      onDateClick={handleDateClick}
      onBackToDates={handleBackToDates}
      onSessionPillClick={handleSessionPillClick}
      onAddDay={handleAddDay}
      onAddSessionToDay={handleAddSessionToDay}
      formatTimeDisplay={formatTimeDisplay}
      addDayNavButtonRef={addDayNavButtonRef}
      backButtonRef={backButtonRef}
      firstDayTabRef={firstDayTabRef}
      firstSessionPillRef={firstSessionPillRef}
      addSessionNavButtonRef={addSessionNavButtonRef}
    />

    {/* Session Editor Modal */}
    {editingSessionIndex !== null && (
      <SessionEditor
        session={mealSessions[editingSessionIndex]}
        sessionIndex={editingSessionIndex}
        onUpdate={updateMealSession}
        onClose={handleEditorClose}
        restaurants={restaurants}
      />
    )}

    <div className="max-w-7xl mx-auto p-2">
      {/* Summary Card */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-base-200 p-3 md:p-4 flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm text-gray-500">
              {totalDays > 0
                ? `${totalDays} day${totalDays !== 1 ? "s" : ""}`
                : "No days scheduled"}{" "}
              • {totalSessions} session{totalSessions !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl md:text-2xl font-bold text-primary">
              £{getTotalPrice().toFixed(2)}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              {totalItems} items total
            </p>
          </div>
        </div>

        {/* Download Menu Button */}
        {totalItems > 0 && (
          <button
            onClick={handleViewMenu}
            disabled={generatingPdf}
            className="flex-shrink-0 bg-white rounded-xl shadow-sm border border-base-200 p-4 flex flex-col items-center justify-center hover:border-primary hover:bg-primary/5 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingPdf ? (
              <>
                <span className="loading loading-spinner loading-sm text-primary"></span>
                <span className="hidden md:block text-xs text-gray-500 mt-1">Generating...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden md:block text-xs text-gray-500 mt-1 group-hover:text-primary transition-colors">Download Menu</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Column: Menu Browser */}
        <div className="flex-1 min-w-0">
          <MenuBrowserColumn
            showBundleBrowser={showBundleBrowser}
            onToggleBundleBrowser={setShowBundleBrowser}
            sessionIndex={activeSessionIndex}
            allMenuItems={allMenuItems}
            fetchAllMenuItems={fetchAllMenuItems}
            defaultGuestCount={mealSessions[activeSessionIndex]?.guestCount ?? 1}
            restaurants={restaurants}
            restaurantsLoading={restaurantsLoading}
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
            expandedSessionIndex={activeSessionIndex}
          />
        </div>

        {/* Right Column: Active Session (Desktop only) */}
        <div className="hidden md:block w-[400px] flex-shrink-0">
          {mealSessions[activeSessionIndex] && (
            <ActiveSessionPanel
              session={mealSessions[activeSessionIndex]}
              sessionIndex={activeSessionIndex}
              sessionTotal={getSessionTotal(activeSessionIndex)}
              sessionDiscount={getSessionDiscount(activeSessionIndex).discount}
              sessionPromotion={getSessionDiscount(activeSessionIndex).promotion}
              validationError={sessionValidationErrors[activeSessionIndex] || null}
              isUnscheduled={!mealSessions[activeSessionIndex].sessionDate}
              canRemove={mealSessions.length > 1}
              onEditSession={() => setEditingSessionIndex(activeSessionIndex)}
              onRemoveSession={(e) => handleRemoveSession(activeSessionIndex, e)}
              onEditItem={handleEditItem}
              onRemoveItem={handleRemoveItem}
              onSwapItem={handleSwapItem}
              onRemoveBundle={handleRemoveBundle}
              collapsedCategories={collapsedCategories}
              onToggleCategory={handleToggleCategory}
              onViewMenu={handleViewMenu}
              isCurrentSessionValid={isCurrentSessionValid}
              totalPrice={getTotalPrice()}
              onCheckout={handleCheckout}
            />
          )}
        </div>
      </div>
    </div>

    {/* Mobile: View Order Bar */}
    {mealSessions.some((s) => s.orderItems.length > 0) && (
      <div className="fixed bottom-0 left-0 right-0 md:hidden p-4 shadow-lg z-50 bg-primary">
        <button
          onClick={() => setIsViewOrderOpen(true)}
          className="w-full flex items-center justify-between text-white"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-semibold">View Order</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">£{getTotalPrice().toFixed(2)}</span>
            <span className="text-sm opacity-80">{totalItems} items</span>
          </div>
        </button>
      </div>
    )}

    {/* Mobile: View Order Modal */}
    <ViewOrderModal
      isOpen={isViewOrderOpen}
      onClose={() => setIsViewOrderOpen(false)}
      mealSessions={mealSessions}
      activeSessionIndex={activeSessionIndex}
      onSessionChange={setActiveSessionIndex}
      getSessionTotal={getSessionTotal}
      getSessionDiscount={getSessionDiscount}
      validationErrors={sessionValidationErrors}
      onEditSession={(index) => {
        setIsViewOrderOpen(false);
        setEditingSessionIndex(index);
      }}
      onRemoveSession={(index, e) => handleRemoveSession(index, e)}
      onEditItem={handleEditItem}
      onRemoveItem={handleRemoveItem}
      onSwapItem={handleSwapItem}
      onRemoveBundle={handleRemoveBundle}
      collapsedCategories={collapsedCategories}
      onToggleCategory={handleToggleCategory}
      onViewMenu={handleViewMenu}
      isCurrentSessionValid={isCurrentSessionValid}
      totalPrice={getTotalPrice()}
      onCheckout={handleCheckout}
      canRemoveSession={(index) => mealSessions.length > 1}
      formatTimeDisplay={formatTimeDisplay}
    />

    {/* Edit Item Modal */}
    {isEditModalOpen && editingItemIndex !== null && (
      <MenuItemModal
        item={mealSessions[activeSessionIndex].orderItems[editingItemIndex].item as MenuItem}
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingItemIndex(null); }}
        quantity={mealSessions[activeSessionIndex].orderItems[editingItemIndex].quantity}
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

    {/* Pending Item Modal */}
    {pendingItem && (
      <MenuItemModal
        item={pendingItem}
        isOpen={true}
        onClose={() => setPendingItem(null)}
        quantity={0}
        onAddItem={(item) => { handleAddItem(item); setPendingItem(null); }}
      />
    )}

    {/* Other modals (unchanged) */}
    <AddDayModal isOpen={isAddDayModalOpen} newDayDate={newDayDate} onDateChange={setNewDayDate} onConfirm={handleConfirmAddDay} onClose={() => setIsAddDayModalOpen(false)} />
    {emptySessionIndex !== null && (
      <EmptySessionWarningModal sessionName={mealSessions[emptySessionIndex]?.sessionName || "Session"} onRemove={handleRemoveEmptySession} onAddItems={handleAddItemsToEmptySession} />
    )}
    {sessionToRemove !== null && (
      <RemoveSessionConfirmModal sessionName={mealSessions[sessionToRemove]?.sessionName || "Session"} onConfirm={confirmRemoveSession} onCancel={() => setSessionToRemove(null)} />
    )}
    {minOrderModalSession !== null && (
      <MinOrderModal sessionName={mealSessions[minOrderModalSession.index]?.sessionName || "Session"} validationStatus={minOrderModalSession.validation} onClose={() => setMinOrderModalSession(null)} onNavigateToSection={handleMinOrderNavigate} />
    )}
    {showPdfModal && (
      <PdfDownloadModal onDownload={handlePdfDownload} onClose={() => setShowPdfModal(false)} isGenerating={generatingPdf} />
    )}
    {swapItemIndex !== null && (
      <SwapItemModal
        currentItem={mealSessions[activeSessionIndex]?.orderItems[swapItemIndex]?.item as MenuItem}
        currentQuantity={mealSessions[activeSessionIndex]?.orderItems[swapItemIndex]?.quantity ?? 0}
        alternatives={swapAlternatives}
        isOpen={true}
        onClose={() => { setSwapItemIndex(null); setSwapAlternatives([]); }}
        onSwap={handleConfirmSwap}
      />
    )}

    {/* Tutorial */}
    <TutorialTooltip step={currentTutorialStep} onNext={handleTutorialNext} onSkip={handleSkipTutorial} currentStepIndex={tutorialStep ?? 0} totalSteps={getTutorialSteps().length} />
    <button
      onClick={() => { resetTutorial(); setNavMode("dates"); setSelectedDayDate(null); }}
      className="fixed bottom-4 left-4 md:bottom-8 md:left-8 w-10 h-10 md:w-12 md:h-12 bg-white border border-base-300 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors z-40"
      title="Restart Tutorial"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  </div>
);
```

- [ ] **Step 6: Commit**

Use `/git-commit`

---

### Task 6: Clean Up Unused Code

**Files:**
- Modify: `lib/components/catering/CateringOrderBuilder.tsx`

- [ ] **Step 1: Remove unused imports and state variables**

After the restructure, verify and remove:
- `SessionAccordion` import
- `CheckoutBar` import
- `Plus`, `Clock`, `Calendar` from lucide-react (if no longer used)
- `dayRefs` ref
- `sessionAccordionRefs` ref
- `expandedSessionIndex` state (replaced by `activeSessionIndex`)
- Any dead code from removed timeline functions

- [ ] **Step 2: Update all references from `expandedSessionIndex` to `activeSessionIndex`**

Search through the file for remaining references to `expandedSessionIndex` and replace with `activeSessionIndex`. The `DateSessionNav` prop `expandedSessionIndex` still expects this name — pass `activeSessionIndex` as the value.

- [ ] **Step 3: Verify the app compiles**

Run: `npm run build` or `npx next build` — fix any TypeScript errors.

- [ ] **Step 4: Commit**

Use `/git-commit`

---

### Task 7: Manual Testing Checklist

- [ ] **Desktop: Two-column layout renders correctly** — menu browser on left, active session on right
- [ ] **Desktop: Session switching via DateSessionNav** — right column updates to show selected session
- [ ] **Desktop: Add items from menu browser** — items appear in right column
- [ ] **Desktop: Edit/remove session** — buttons in right column header work
- [ ] **Desktop: Checkout button inline** — renders at bottom of right column, not floating
- [ ] **Desktop: Empty session state** — shows "Browse the menu to add items"
- [ ] **Desktop: Validation error banner** — shows in right column when catering hours conflict
- [ ] **Desktop: Promotion banner** — displays correctly in right column
- [ ] **Mobile: Only menu browser visible** — no right column
- [ ] **Mobile: "View Order" bar at bottom** — shows price and item count
- [ ] **Mobile: View Order modal opens** — full page, shows session picker + items
- [ ] **Mobile: Session picker in modal** — can switch sessions
- [ ] **Mobile: "Proceed to Checkout" button** — works from modal
- [ ] **Mobile: Close modal** — returns to menu browsing
- [ ] **Mobile: "View Order" hidden when cart empty**
