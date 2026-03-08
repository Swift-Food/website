# Restaurant-Based Menu Browsing in Catering Builder

**Date:** 2026-03-06
**Status:** Approved

## Problem

The catering order builder currently browses menu items by category/subcategory. We want to change it to browse by restaurant first, then show that restaurant's items grouped by their menu groups (`groupTitle`).

## Approach

**Approach 1 (selected):** Create a new `RestaurantMenuBrowser` component that replaces `renderCategoriesSection` in `CateringOrderBuilder`. The old category-based code is preserved in `CategoryMenuBrowser.tsx` for revert.

## Design

### RestaurantMenuBrowser Component

Two internal views, toggled by local state:

#### 1. Restaurant List View (default)

- **Cuisine filter row** — horizontal scrollable. Each filter: emoji icon above, label below. Dummy data: Thai, Indian, Chinese, Mexican, Italian, Japanese, Mediterranean, American. Clicking filters the restaurant list client-side.
- **Dietary filter row** — Halal, Vegetarian, Vegan, Pescatarian pills below cuisine filters.
- **Search bar** — searches across all restaurants' items. Results grouped by restaurant.
- **Restaurant cards grid** — image, name, min order badge, advance notice. Reuses patterns from existing `RestaurantCatalogue`.

#### 2. Restaurant Menu View (after clicking a restaurant)

- **Back button** — arrow + "Back to Restaurants" at top.
- **Restaurant header** — name, contact info tooltip.
- **Dietary filters** — carried over from list view, filters items within this restaurant.
- **Items grouped by groupTitle** — collapsible sections. Items rendered via existing `MenuItemCard`.
- Sort: images first, then by display price.

### Data Flow

- Restaurants: already fetched by `useCateringData` via `GET /restaurant/catering/restaurants`.
- Menu items: fetch via `cateringService.getMenuItems()` (cached), filter by `restaurantId`.
- Search: uses existing `allMenuItems` cache from `useCateringData`.
- Cuisine filtering: client-side on dummy tags (no API yet).

### What Changes

- `renderCategoriesSection` in `CateringOrderBuilder` replaced with `<RestaurantMenuBrowser>`.
- Old category-based code extracted to `CategoryMenuBrowser.tsx`.
- `useCateringData` hook: minimal changes — still fetches restaurants, items, search. Category fetching becomes optional/unused by the new component.

### What Stays the Same

- `SessionAccordion`, `SelectedItemsByCategory`, all modals, `DateSessionNav`, `CheckoutBar`.
- All session management logic in `CateringOrderBuilder`.
- `useCateringTutorial` (tutorial refs may need minor updates).

### Cuisine Filter Data (dummy)

Constant array with emoji + label. Will be replaced by API data later.

```ts
const CUISINE_FILTERS = [
  { id: "thai", label: "Thai", icon: "🍜" },
  { id: "indian", label: "Indian", icon: "🍛" },
  { id: "chinese", label: "Chinese", icon: "🥡" },
  { id: "mexican", label: "Mexican", icon: "🌮" },
  { id: "italian", label: "Italian", icon: "🍝" },
  { id: "japanese", label: "Japanese", icon: "🍣" },
  { id: "mediterranean", label: "Mediterranean", icon: "🥙" },
  { id: "american", label: "American", icon: "🍔" },
];
```
