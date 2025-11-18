# Testing Checklist - Constants Consolidation & Code Cleanup

**Status:** ✅ Build passing, dev server running

## What Changed

### 1. **Constants Consolidation**
- Created centralized constants in `/lib/constants/`
  - `api.ts` - API URLs and endpoints
  - `stripe.ts` - Stripe configuration
  - `google-maps.ts` - Google Maps configuration
  - `app.ts` - Application constants
  - `allergens.ts` - Allergen list
  - `index.ts` - Central export

### 2. **Fixed Broken Imports**
- Updated all components to use `@/lib/components/` paths
- Updated all services to use `@/services/` paths
- Fixed Google Maps script loading (was loading multiple times)

### 3. **Google Maps Loader**
- Created singleton loader at `/lib/utils/google-maps-loader.ts`
- Prevents "multiple script tags" error
- Used by: Step1EventDetails, Step3ContactDetails, useAddressAutocomplete

## Quick Test Commands

```bash
# 1. Homepage (already tested ✅)
curl -I http://localhost:3000
# Expected: 200 OK

# 2. Event ordering page (already tested ✅)
curl -I http://localhost:3000/event-order
# Expected: 200 OK

# 3. Contact page
curl -I http://localhost:3000/contact
# Expected: 200 OK

# 4. Restaurant dashboard
curl -I http://localhost:3000/restaurant/dashboard
# Expected: 200 OK (redirects to login if not authenticated)
```

## Manual Testing Flows

### 🎯 **Priority 1: Event Catering Flow**
Tests: Google Maps, Stripe, API endpoints

1. Go to http://localhost:3000/event-order
2. Select a restaurant
3. Add menu items to cart
4. Click "Continue to Event Details"
5. Fill form and **test Google Maps autocomplete** (should work, no console errors)
6. Continue to Contact Details
7. **Test Google Maps autocomplete again** (should work, no duplicate script errors)
8. Try applying a promo code
9. For corporate orders: test Stripe payment modal

**What to check:**
- ✅ No "Google Maps loaded multiple times" error in console
- ✅ Address autocomplete works smoothly
- ✅ Stripe payment modal loads (corporate)
- ✅ API calls succeed (check Network tab)

### 🎯 **Priority 2: Forms**
Tests: Mail service

- Contact form: http://localhost:3000/contact
- Rider signup: http://localhost:3000/rider
- Restaurant signup: http://localhost:3000/restaurant
- Complaints: http://localhost:3000/consumer-complaints

**What to check:**
- ✅ Forms submit without errors
- ✅ No import errors in console

### 🎯 **Priority 3: Restaurant Dashboard**
Tests: API constants, image upload

1. Login to restaurant dashboard
2. Navigate to Menu Management
3. Try editing a menu item
4. Test image upload
5. Check Opening Hours page
6. Check Settings page

**What to check:**
- ✅ All pages load
- ✅ Image uploads work
- ✅ API calls use correct endpoints
- ✅ No 404s in Network tab

## Files Changed

### Constants Created
- `/lib/constants/api.ts`
- `/lib/constants/stripe.ts`
- `/lib/constants/google-maps.ts`
- `/lib/constants/app.ts`
- `/lib/constants/index.ts`

### Utilities Created
- `/lib/utils/google-maps-loader.ts`

### Components Updated (to use constants)
- `lib/components/PaymentMethodSelector.tsx`
- `lib/components/catering/Step1EventDetails.tsx`
- `lib/components/catering/Step3ContactDetails.tsx`
- `lib/components/catering/Step2MenuItems.tsx`
- `features/contact-details/hooks/useAddressAutocomplete.ts`

### Services Updated
- `services/api/catering.api.ts`
- `services/api/restaurant.api.ts`
- `services/utilities/mail.service.ts`

### Dashboard Pages Updated
- `app/restaurant/settings/[restaurantId]/page.tsx`
- `app/restaurant/opening-hours/[restaurantId]/page.tsx`
- `app/restaurant/menu/[restaurantId]/page.tsx`
- `app/restaurant/menu/[restaurantId]/new/page.tsx`
- `app/restaurant/menu/[restaurantId]/edit/[itemId]/page.tsx`
- `app/restaurant/dashboard/catering/receiptUtils.tsx`

### Layout Files Fixed
- `app/layout.tsx`
- `app/(public)/page.tsx`

### Hooks Updated
- `lib/hooks/useAuth.ts`

## Known Issues Fixed

1. ✅ Google Maps script loading multiple times → Fixed with singleton loader
2. ✅ Broken relative imports after reorganization → All updated to @/ paths
3. ✅ Scattered environment variables → Centralized in constants
4. ✅ Build errors → All resolved

## Browser Console Check

Open http://localhost:3000/event-order in browser and check console:
- ❌ Should NOT see: "Google Maps loaded multiple times"
- ✅ Should see: Normal app logs only

## Next Steps (If Issues Found)

1. Check browser console (F12) → Developer Tools → Console tab
2. Check Network tab → Look for failed requests (red)
3. Check terminal running `npm run dev` → Server-side errors
4. Report specific error message + URL where it occurred
