# 🚀 Quick Start: Restaurant Inventory Management

## What Was Added

Your restaurant dashboard now has a complete **Inventory Management** system with two features:

### 1. 🍽️ Catering Daily Portions
- Limits total catering orders per day
- Auto-resets at midnight
- Real-time usage tracking

### 2. 🏢 Corporate Session Inventory
- Limits portions per session (lunch/dinner)
- Tracks specific ingredients (chicken, lobster, etc.)
- Flexible reset schedules

---

## Where to Find It

1. Go to: `/restaurant/settings/:restaurantId`
2. Click the **"Inventory Management"** tab
3. Configure your settings

---

## Quick Setup Guide

### For Catering Restaurants

1. Navigate to Inventory Management tab
2. See the blue "Catering Daily Portions Limit" section
3. Set your maximum portions per day (e.g., 150)
4. Click "Save Catering Limit"
5. View real-time usage with progress bar

**Example:**
```
Maximum: 200 portions/day
Used: 75 portions (37.5%)
Remaining: 125 portions
```

### For Corporate Restaurants

1. Navigate to Inventory Management tab
2. See the purple "Corporate Session Inventory" section
3. Choose reset schedule:
   - **Daily** - Reset at midnight
   - **Lunch & Dinner** - Reset at 12:00 and 18:00
   - **Disabled** - No tracking

4. **Optional:** Enable max portions per session
   - Check "Enable"
   - Set number (e.g., 100)

5. **Optional:** Enable ingredient tracking
   - Check "Enable"
   - Add ingredients (e.g., "chicken" - max 15)
   - Click "+ Add" for each ingredient

6. Click "Save Corporate Inventory"

**Example Configuration:**
```
Reset: Lunch & Dinner
Max Portions: 100 per session
Limited Ingredients:
  - Chicken: 15
  - Lobster: 2
  - Beef: 10
```

---

## Files You Need to Know

### TypeScript Types
📄 `/types/inventory.types.ts` - All interface definitions

### Component
📄 `/app/restaurant/settings/components/InventoryManagement.tsx` - Main UI component

### API Functions
📄 `/app/api/restaurantApi.ts` - API integration (see bottom of file)

### Settings Page
📄 `/app/restaurant/settings/[restaurantId]/page.tsx` - Settings page with tabs

---

## API Endpoints

### Get Catering Status
```typescript
GET /restaurant/:restaurantId/catering-portions-availability
```

### Update Catering Limit
```typescript
PATCH /restaurant/:restaurantId/catering-portions-limit
Body: { maximumCateringPortionsPerDay: 200 }
```

### Update Corporate Inventory
```typescript
PATCH /restaurant/:restaurantId
Body: {
  sessionResetPeriod: "lunch_dinner",
  maxPortionsPerSession: 100,
  limitedIngredientsPerSession: {
    "chicken": 15,
    "lobster": 2
  }
}
```

---

## Visual Preview

### Catering Section
```
┌──────────────────────────────────────┐
│ 🍽️ Catering Daily Portions Limit   │
│                                      │
│ Today's Usage                        │
│ ▓▓▓▓▓░░░░░░░  30 / 150 (20%)       │
│ Remaining: 120 portions              │
│                                      │
│ Maximum: [150] portions              │
│ ⏰ Resets daily at midnight          │
│                                      │
│ [Save Catering Limit]               │
└──────────────────────────────────────┘
```

### Corporate Section
```
┌──────────────────────────────────────┐
│ 🏢 Corporate Session Inventory      │
│                                      │
│ Session Reset:                       │
│ ○ Daily                             │
│ ● Lunch & Dinner                    │
│ ○ Disabled                          │
│                                      │
│ Max Portions: ☑ [100]               │
│                                      │
│ Ingredients: ☑ Enable                │
│ • Chicken    [15]  [X]              │
│ • Lobster    [2]   [X]              │
│ • [Add new...]                      │
│                                      │
│ [Save Corporate Inventory]          │
└──────────────────────────────────────┘
```

---

## Common Use Cases

### Scenario 1: Catering Restaurant with Daily Limit
```typescript
// Restaurant wants max 200 catering portions/day
Settings:
  - maximumCateringPortionsPerDay: 200

Result:
  - System accepts orders until 200 portions ordered
  - Rejects orders that would exceed 200
  - Resets to 0 at midnight every day
```

### Scenario 2: Corporate Office with Lunch Service
```typescript
// Corporate cafeteria, lunch only, limited chicken
Settings:
  - sessionResetPeriod: "daily"
  - maxPortionsPerSession: null (no limit)
  - limitedIngredientsPerSession: {
      "chicken": 20,
      "salmon": 15
    }

Result:
  - No overall portion limit
  - Max 20 chicken orders per day
  - Max 15 salmon orders per day
  - Resets at midnight
```

### Scenario 3: Corporate with Lunch & Dinner
```typescript
// Corporate cafeteria, both lunch and dinner service
Settings:
  - sessionResetPeriod: "lunch_dinner"
  - maxPortionsPerSession: 100
  - limitedIngredientsPerSession: {
      "lobster": 5,
      "beef": 25
    }

Result:
  - Max 100 portions per session (lunch AND dinner)
  - Max 5 lobster per session
  - Max 25 beef per session
  - Resets at 12:00 (lunch) and 18:00 (dinner)
```

---

## Color Coding

### Progress Bars
- 🟢 **Green** (0-70% used) - Plenty available
- 🟡 **Yellow** (70-90% used) - Running low
- 🔴 **Red** (>90% used) - Almost full

### Sections
- 🔵 **Blue** - Catering features
- 🟣 **Purple** - Corporate features

---

## Tips & Best Practices

### 1. Set Realistic Limits
```typescript
// Consider your capacity
maximumCateringPortionsPerDay: 150  // Can you handle this?

// Account for prep time
limitedIngredientsPerSession: {
  "lobster": 5  // Limited supply, set low
  "chicken": 50  // Common item, set high
}
```

### 2. Choose Right Reset Schedule
```typescript
// Corporate cafeteria open 9-5, lunch only
sessionResetPeriod: "daily"

// Corporate cafeteria with lunch (12-2) and dinner (6-8)
sessionResetPeriod: "lunch_dinner"

// No inventory tracking needed
sessionResetPeriod: null
```

### 3. Monitor Usage
- Check the progress bars regularly
- Adjust limits based on actual demand
- Use the analytics to see patterns

### 4. Ingredient Naming
```typescript
// Use clear, consistent names
✅ "chicken", "beef", "salmon", "lobster"
❌ "Chicken Breast", "CHICKEN", "chkn"

// Lowercase, simple, unique
```

---

## Testing Your Setup

1. **Save settings** - Make sure no errors appear
2. **Reload page** - Settings should persist
3. **Check progress bar** - Should show current usage
4. **Place test order** - Usage should increase
5. **Wait for reset** - Usage should reset to 0

---

## Troubleshooting

### "No Inventory Management Available" message?
- Your restaurant needs `isCatering: true` or `isCorporate: true`
- Contact backend team to enable these flags

### Settings not saving?
- Check browser console for errors
- Ensure you're logged in (valid token)
- Verify backend endpoints are working

### Progress bar not updating?
- Refresh the page
- Check if backend is updating `cateringPortionsToday`
- Verify API is returning current data

---

## Next Steps

1. ✅ Configure your inventory limits
2. ✅ Test with actual orders
3. ✅ Monitor usage patterns
4. ✅ Adjust limits as needed
5. ✅ Train staff on the system

---

## Questions?

Refer to the full documentation:
📖 `/docs/INVENTORY_MANAGEMENT.md`

Check the TypeScript interfaces:
📄 `/types/inventory.types.ts`

Review the component code:
💻 `/app/restaurant/settings/components/InventoryManagement.tsx`

---

**That's it! Your inventory management system is ready to use. 🎉**
