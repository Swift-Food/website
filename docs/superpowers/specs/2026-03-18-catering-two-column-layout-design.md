# Catering Order Builder: Two-Column Layout Redesign

**Date:** 2026-03-18

## Summary

Restructure the CateringOrderBuilder from a single-column (top: session/timeline, bottom: menu browser) to a two-column layout on desktop (left: menu browser, right: active session cart). On mobile, show only the menu browser with a "View Order" button that opens a full-page modal for the cart.

## Desktop Layout

### Structure
- **Top section (unchanged):** DateSessionNav + summary card (days/sessions/price/download menu button)
- **Below:** Two-column flex layout
  - **Left column (~60%):** RestaurantMenuBrowser or BundleBrowser — the menu browsing experience
  - **Right column (~40%):** Active session content — session header/details, SelectedItemsByCategory, and an inline checkout button at the bottom

### Changes from current
- **Remove timeline:** No day grouping with vertical line, day headers, "Add Session to Day" inline buttons, or SessionAccordion wrappers in the main content area. Session switching happens exclusively via DateSessionNav at the top.
- **One session at a time:** Only the active session's items are shown in the right column.
- **Checkout button:** Moves from fixed/floating position to inline at the bottom of the right column. No longer uses `position: fixed`.
- **No "Add Day" button in main content:** Day/session management is handled entirely by DateSessionNav.

## Mobile Layout

### Structure
- **Top section (unchanged):** DateSessionNav + summary card
- **Main content:** RestaurantMenuBrowser or BundleBrowser only (no cart/session items visible)
- **Bottom bar (fixed):** "View Order" button replaces the floating checkout bar

### View Order Modal (full-page)
- **Close button (X)** at top to return to menu browsing
- **Session picker:** Session pills/tabs (similar to DateSessionNav sessions mode) so user can switch between sessions
- **Session content:** SelectedItemsByCategory for the active session, with edit/remove/swap actions
- **Bottom (fixed):** "Proceed to Checkout" button

## Components Affected

### CateringOrderBuilder.tsx
- Remove timeline rendering (dayGroups mapping, unscheduled section, day headers, vertical line, "Add Session to Day" buttons, "Add Day" button in main content)
- Add two-column flex container (`flex` with `gap`) below the top section
- Left column renders RestaurantMenuBrowser or BundleBrowser
- Right column renders active session items + inline checkout
- On mobile (`md:hidden`), hide right column entirely
- On mobile, render a fixed bottom "View Order" bar
- On mobile, render ViewOrderModal component

### CheckoutBar.tsx
- On desktop: no longer fixed position, renders inline in right column
- On mobile: replaced by "View Order" button — existing CheckoutBar may be repurposed or replaced

### New: ViewOrderModal.tsx
- Full-page modal component for mobile
- Props: isOpen, onClose, onCheckout, session picker state, active session items
- Contains: close button, session picker (pills), SelectedItemsByCategory, fixed bottom "Proceed to Checkout" button

### SessionAccordion.tsx
- No longer used in main layout (sessions are not rendered as accordions)
- The right column will directly render session header info + SelectedItemsByCategory
- SessionAccordion may still exist but is not used in CateringOrderBuilder

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
