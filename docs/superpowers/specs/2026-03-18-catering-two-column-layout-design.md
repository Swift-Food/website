# Catering Order Builder: Two-Column Layout Redesign

**Date:** 2026-03-18

## Summary

Restructure the CateringOrderBuilder from a single-column (top: session/timeline, bottom: menu browser) to a two-column layout on desktop (left: menu browser, right: active session cart). On mobile, show only the menu browser with a "View Order" button that opens a full-page modal for the cart.

## Desktop Layout

### Structure
- **Top section (unchanged):** DateSessionNav + summary card (days/sessions/price/download menu button)
- **Below:** Two-column flex layout
  - **Left column (~60%):** RestaurantMenuBrowser or BundleBrowser — extracted from session content and rendered independently
  - **Right column (~40%):** Active session content — session header, SelectedItemsByCategory, and an inline checkout button at the bottom

### Right Column Header
Replaces SessionAccordion header. Contains:
- Session name and time range (e.g. "Main Event • 12:00 PM – 12:30 PM")
- Session total price and item count
- "Edit Session" button (pencil icon) — opens SessionEditor
- "Remove Session" button (trash icon) — opens RemoveSessionConfirmModal (only if more than 1 session)
- Promotion/discount banner (if applicable) — same styling as current SessionAccordion promotion display

### Right Column Empty State
When the active session has zero items, show a centered message: "Browse the menu to add items" with a subtle illustration or icon.

### Validation Error Banners
Catering hours conflict errors render at the top of the right column, above the session header.

### Scroll/Navigation Behavior
- Session switching via DateSessionNav updates the right column content in place (no scroll-to behavior needed)
- `expandedSessionIndex` and `activeSessionIndex` are unified — always the same value
- Checkout validation errors switch the active session and show the error banner in the right column

### Changes from current
- **Remove timeline:** No day grouping with vertical line, day headers, "Add Session to Day" inline buttons, or SessionAccordion wrappers. Session switching happens exclusively via DateSessionNav.
- **Extract menu browser:** RestaurantMenuBrowser and BundleBrowser are removed from session content (renderSessionContent) and rendered independently in the left column.
- **One session at a time:** Only the active session's items are shown in the right column.
- **Checkout button:** Moves from fixed/floating position to inline at the bottom of the right column.
- **No "Add Day" button in main content:** Day/session management is handled entirely by DateSessionNav.
- **BundleBrowser toggle:** `showBundleBrowser` state remains, toggled via the "Open Bundles" button in RestaurantMenuBrowser. No longer tied to `expandedSessionIndex`.

### Unscheduled Sessions
Sessions without a date still appear in DateSessionNav. When an unscheduled session is active, the right column shows the same layout but with a warning banner: "Set date & time to continue" with an "Edit Session" button that opens SessionEditor.

## Mobile Layout

### Structure
- **Top section (unchanged):** DateSessionNav + summary card
- **Main content:** RestaurantMenuBrowser or BundleBrowser only (no cart/session items visible)
- **Bottom bar (fixed):** "View Order" button replaces the floating checkout bar

### View Order Button
- Shows total price and item count (e.g. "View Order • £300.60 • 5 items")
- Uses `bg-primary` styling when minimum order is met
- Uses `bg-warning` styling when minimum order is not met
- Hidden when cart is empty (no items in any session)

### View Order Modal (full-page)
- **Close button (X)** at top-right to return to menu browsing
- **Session picker:** Horizontal scrollable pills showing ALL sessions across all days, grouped visually. Each pill shows session name + time. Active session is highlighted. Default active session is the globally active session when modal opens.
- **Session content:** Right column header (session name, time, edit/remove actions) + SelectedItemsByCategory for the active session, with edit/remove/swap actions
- **Validation errors:** Same banners as desktop, shown at top of modal content
- **Bottom (fixed):** "Proceed to Checkout" button

## New Components

### ActiveSessionPanel.tsx
The right column content, extracted as a reusable component. Used both in the desktop right column and inside ViewOrderModal.
- Props: sessionIndex, session, onEditSession, onRemoveSession, canRemove, sessionTotal, sessionDiscount, sessionPromotion, validationError, onEditItem, onRemoveItem, onSwapItem, onRemoveBundle, collapsedCategories, onToggleCategory, onViewMenu, onCheckout, totalPrice, isCurrentSessionValid
- Renders: session header, validation error banner, SelectedItemsByCategory, checkout/proceed button

### ViewOrderModal.tsx
- Full-page modal component for mobile
- Props: isOpen, onClose, sessions, activeSessionIndex, onSessionChange, plus all ActiveSessionPanel props
- Contains: close button, session picker pills, ActiveSessionPanel

### MenuBrowserColumn.tsx
The left column content wrapper.
- Props: showBundleBrowser, bundleBrowserProps, restaurantMenuBrowserProps, onToggleBundleBrowser
- Renders: RestaurantMenuBrowser or BundleBrowser based on state

## Components Affected

### CateringOrderBuilder.tsx
- Remove timeline rendering (dayGroups mapping, unscheduled section, day headers, vertical line, "Add Session to Day" buttons, "Add Day" button in main content)
- Remove `renderSessionContent` function
- Remove `renderValidationErrorBanner` inline function (moves to ActiveSessionPanel)
- Add two-column flex container below top section
- Left column: MenuBrowserColumn
- Right column (desktop only, `hidden md:block`): ActiveSessionPanel
- Mobile: fixed bottom "View Order" bar + ViewOrderModal
- Unify `expandedSessionIndex` and `activeSessionIndex`

### CheckoutBar.tsx
- No longer used. Replaced by inline checkout in ActiveSessionPanel (desktop) and "View Order" bar + modal checkout (mobile).

### SessionAccordion.tsx
- No longer used in CateringOrderBuilder. Can remain in codebase but is not imported.

## Responsive Breakpoints

- **Desktop (md+):** Two-column layout, right column visible, no View Order modal
- **Mobile (<md):** Single column (menu browser only), fixed "View Order" bar, full-page modal for cart

## Unchanged

- DateSessionNav component and behavior
- Summary card (days/sessions/price/download)
- SessionEditor modal (for editing session details)
- All other modals (AddDayModal, EmptySessionWarningModal, RemoveSessionConfirmModal, MinOrderModal, PdfDownloadModal, SwapItemModal, MenuItemModal)
- RestaurantMenuBrowser and BundleBrowser internal behavior
- SelectedItemsByCategory internal behavior
- Tutorial system
