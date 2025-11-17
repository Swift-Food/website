# Restaurant Inventory Management System

## Overview

Your frontend now has a complete inventory management system for restaurant dashboards. This system integrates two backend features:

1. **Catering Daily Portions Tracking** - Limits total catering portions per day
2. **Corporate Session-Based Inventory** - Manages portions and ingredients for corporate dining

---

## 📁 Files Added/Modified

### New Files Created

1. **`/types/inventory.types.ts`**
   - Complete TypeScript interfaces for inventory management
   - Includes all API request/response types
   - Form data structures and validation types

2. **`/app/restaurant/settings/components/InventoryManagement.tsx`**
   - Main inventory management component
   - Handles both catering and corporate inventory
   - Real-time status displays with progress bars
   - Clean, professional UI matching your design system

3. **`/docs/INVENTORY_MANAGEMENT.md`** (this file)
   - Complete documentation

### Modified Files

1. **`/app/api/restaurantApi.ts`**
   - Added `getCateringPortionsAvailability()`
   - Added `updateCateringPortionsLimit()`
   - Added `updateCorporateInventory()`
   - Added `getRestaurantDetails()`

2. **`/app/restaurant/settings/[restaurantId]/page.tsx`**
   - Added inventory management tab
   - Integrated InventoryManagement component
   - Added isCatering/isCorporate state tracking

---

## 🎨 UI Features

### Tab Navigation
The settings page now has two tabs:
- **Restaurant Profile** - Name, description, images (existing)
- **Inventory Management** - Catering & corporate inventory (new)

### Catering Daily Portions Section

**Features:**
- Set maximum portions per day
- Real-time usage display with progress bar
- Color-coded status (green → yellow → red)
- Automatic reset info (midnight UTC)
- Percentage used calculation

**Visual Elements:**
```
┌─────────────────────────────────────────────┐
│ 🍽️ Catering Daily Portions Limit           │
├─────────────────────────────────────────────┤
│ Today's Usage                               │
│ ▓▓▓▓▓▓░░░░░░ 45 / 150 portions (30%)      │
│ Remaining: 105 portions                     │
│                                             │
│ Maximum Portions Per Day: [150]            │
│ ⏰ Auto-reset: Daily at 12:00 AM           │
│                                             │
│ [Save Catering Limit]                      │
└─────────────────────────────────────────────┘
```

### Corporate Session Inventory Section

**Features:**
- Session reset schedule selector (Daily / Lunch & Dinner / Disabled)
- Optional max portions per session
- Dynamic ingredient tracking with add/remove
- Current session status display
- Real-time remaining quantities

**Visual Elements:**
```
┌─────────────────────────────────────────────┐
│ 🏢 Corporate Session Inventory              │
├─────────────────────────────────────────────┤
│ Session Reset Schedule:                     │
│ ○ Daily (Midnight)                         │
│ ● Lunch & Dinner (12:00 & 18:00)          │
│ ○ Disabled                                 │
│                                             │
│ Max Portions Per Session: ☑ Enable        │
│ [100]                                       │
│                                             │
│ Limited Ingredients: ☑ Enable              │
│ ┌───────────────────────────────────────┐  │
│ │ Chicken  [15] Remaining: 12/15 [X]    │  │
│ │ Lobster  [2]  Remaining: 1/2   [X]    │  │
│ │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄  │  │
│ │ [Ingredient name] [Max] [+ Add]       │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ [Save Corporate Inventory]                 │
└─────────────────────────────────────────────┘
```

---

## 🔌 API Integration

### Backend Endpoints Used

#### Catering Portions

**Get Availability**
```typescript
GET /restaurant/:restaurantId/catering-portions-availability

Response:
{
  restaurantId: string;
  restaurantName: string;
  maximumCateringPortionsPerDay: number;
  cateringPortionsToday: number;
  remainingPortions: number;
  isAvailable: boolean;
}
```

**Update Limit**
```typescript
PATCH /restaurant/:restaurantId/catering-portions-limit

Body:
{
  maximumCateringPortionsPerDay: number
}
```

#### Corporate Inventory

**Update Settings**
```typescript
PATCH /restaurant/:restaurantId

Body:
{
  sessionResetPeriod?: "daily" | "lunch_dinner" | null;
  maxPortionsPerSession?: number | null;
  limitedIngredientsPerSession?: {
    [ingredientName: string]: number
  } | null;
}
```

**Get Restaurant Details**
```typescript
GET /restaurant/:restaurantId

Response includes:
{
  id: string;
  restaurant_name: string;
  isCatering: boolean;
  isCorporate: boolean;

  // Catering fields
  maximumCateringPortionsPerDay: number;
  cateringPortionsToday: number; // Read-only

  // Corporate fields
  sessionResetPeriod: "daily" | "lunch_dinner" | null;
  maxPortionsPerSession: number | null;
  portionsRemaining: number | null; // Read-only
  limitedIngredientsPerSession: { [key: string]: number } | null;
  limitedIngredientsRemaining: { [key: string]: number } | null; // Read-only
}
```

---

## 💻 Usage Example

### Accessing the Inventory Management

1. Navigate to: `/restaurant/settings/:restaurantId`
2. Click on the **"Inventory Management"** tab
3. The component automatically loads current settings from the backend
4. Make changes and click save buttons

### For Catering Restaurants

```typescript
// The component checks formData.isCatering
// If true, displays the Catering Daily Portions section

// Restaurant can:
- Set maximum daily portions (default: 150)
- View current usage in real-time
- See remaining portions
- Track percentage used
```

### For Corporate Restaurants

```typescript
// The component checks formData.isCorporate
// If true, displays the Corporate Session Inventory section

// Restaurant can:
- Choose reset schedule (daily, lunch_dinner, or disabled)
- Enable/disable portion limits per session
- Enable/disable ingredient tracking
- Add/remove tracked ingredients
- Set max quantities for each ingredient
- View current session status
```

---

## 🔐 Authentication

The component requires a valid JWT token stored in `sessionStorage`:

```typescript
sessionStorage.getItem("restaurant_token")
```

Make sure the token is set during restaurant login:
```typescript
// In your login flow
sessionStorage.setItem("restaurant_token", tokenPair.access_token);
```

---

## 🎯 Data Flow

### Loading Data

```
Page Load
    ↓
loadRestaurantDetails()
    ↓
cateringService.getRestaurant(restaurantId)
    ↓
Set formData (isCatering, isCorporate)
    ↓
InventoryManagement component receives props
    ↓
loadInventoryData()
    ├─→ getCateringPortionsAvailability() [if catering]
    └─→ getRestaurantDetails() [if corporate]
    ↓
Display current settings & status
```

### Saving Changes

**Catering:**
```
User updates max portions
    ↓
Clicks "Save Catering Limit"
    ↓
restaurantApi.updateCateringPortionsLimit()
    ↓
Success → Reload data
    ↓
Show success message
```

**Corporate:**
```
User configures inventory settings
    ↓
Clicks "Save Corporate Inventory"
    ↓
Build limitedIngredientsPerSession object
    ↓
restaurantApi.updateCorporateInventory()
    ↓
Success → Reload data
    ↓
Show success message
```

---

## 🎨 Styling

The component uses your existing design system:

- **Primary color** for catering sections
- **Purple** for corporate sections
- **Tailwind CSS** classes throughout
- **Lucide icons** for consistency
- **Responsive design** (mobile-friendly)

### Color Scheme

- 🔵 Blue/Primary - Catering features
- 🟣 Purple - Corporate features
- 🟢 Green - Success states, available capacity
- 🟡 Yellow - Warning states (70-90% used)
- 🔴 Red - Critical states (>90% used)

---

## ✅ Validation & Error Handling

### Input Validation

- All portion numbers must be ≥ 0
- Ingredient names cannot be duplicated
- Session reset period required if corporate inventory enabled
- Empty ingredient names are rejected

### Error Handling

```typescript
// Display errors in red alert boxes
{error && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <AlertCircle /> {error}
  </div>
)}

// Display success in green alert boxes
{success && (
  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
    {success}
  </div>
)}
```

### Loading States

- Page-level loader while fetching data
- Button-level loaders while saving
- Disabled states during operations

---

## 📊 Real-Time Status Displays

### Progress Bars

The catering section includes a dynamic progress bar:

```typescript
// Color changes based on usage percentage
const color = usagePercent > 90 ? "red" :
              usagePercent > 70 ? "yellow" :
              "green";

// Width based on actual usage
width: `${Math.min((used / max) * 100, 100)}%`
```

### Live Counters

```typescript
// Automatically updates when data refreshes
{cateringPortionsToday} / {maximumCateringPortionsPerDay}
Remaining: {remainingPortions}
```

---

## 🔄 Reset Schedules

### Catering Daily Reset

- **Frequency:** Once per day
- **Time:** 00:00 (midnight) UTC
- **Cron:** `0 0 0 * * *`
- **Field Reset:** `cateringPortionsToday` → 0

### Corporate Session Resets

**Daily Mode:**
- **Frequency:** Once per day
- **Time:** 00:00 (midnight)
- **Cron:** `0 0 0 * * *`

**Lunch & Dinner Mode:**
- **Frequency:** Twice per day
- **Times:** 12:00 (lunch) and 18:00 (dinner)
- **Cron:** `0 0 12,18 * * *`

**Fields Reset:**
- `portionsRemaining` → `maxPortionsPerSession`
- `limitedIngredientsRemaining` → `limitedIngredientsPerSession`

---

## 🧪 Testing Checklist

- [ ] Load settings page for catering restaurant
- [ ] Load settings page for corporate restaurant
- [ ] Load settings page for non-catering/corporate restaurant
- [ ] Update catering daily limit
- [ ] View catering usage progress bar
- [ ] Select daily reset schedule for corporate
- [ ] Select lunch_dinner reset schedule
- [ ] Disable corporate inventory
- [ ] Enable max portions per session
- [ ] Add new ingredient to tracking
- [ ] Remove ingredient from tracking
- [ ] Update ingredient max quantity
- [ ] Try adding duplicate ingredient (should fail)
- [ ] Try adding empty ingredient name (should fail)
- [ ] Save corporate inventory settings
- [ ] Verify settings persist after page reload
- [ ] Check real-time usage updates
- [ ] Test error handling (network errors, validation)
- [ ] Test mobile responsive design

---

## 🚀 Future Enhancements

Potential improvements you could add:

1. **Real-time Updates**
   - WebSocket integration for live usage updates
   - Notifications when approaching limits

2. **Analytics**
   - Historical usage charts
   - Peak usage time analysis
   - Ingredient consumption trends

3. **Bulk Operations**
   - Import/export ingredient lists
   - Preset templates for common setups

4. **Advanced Features**
   - Variable limits by day of week
   - Holiday-specific adjustments
   - Automatic reorder suggestions

---

## 🐛 Troubleshooting

### Component not showing inventory options

**Issue:** Inventory Management tab appears but shows "No Inventory Management Available"

**Solution:** Ensure backend returns `isCatering: true` or `isCorporate: true`

### Token errors

**Issue:** API calls returning 401 Unauthorized

**Solution:** Check that restaurant token is stored in sessionStorage:
```typescript
sessionStorage.getItem("restaurant_token")
```

### Data not loading

**Issue:** Inventory settings not appearing

**Solution:**
1. Check browser console for API errors
2. Verify backend endpoints are accessible
3. Ensure restaurant ID is valid

### Save not working

**Issue:** Changes not persisting

**Solution:**
1. Check network tab for failed requests
2. Verify request payload format
3. Ensure authentication token is valid
4. Check backend validation errors

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify all endpoints are accessible
3. Ensure backend is returning expected data structure
4. Check that TypeScript interfaces match backend response

---