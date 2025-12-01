# Security Audit Report - Swift Food Website

**Date:** December 1, 2025
**Scope:** `/Users/momo/VSCode/website` (Next.js Frontend)
**Auditor:** Security Review
**Total Vulnerabilities:** 25+

---

## Executive Summary

This audit identified **25+ security vulnerabilities** ranging from critical to low severity. The most serious issues involve:

1. **No restaurant ownership verification** - Any authenticated user can access any restaurant's settings/data via URL manipulation
2. **Sensitive data logged to console (111+ instances)** - Customer PII, passwords, and payment info exposed in browser console
3. **Tokens stored in localStorage** - Vulnerable to XSS attacks
4. **Over-fetching of sensitive data** - API responses include internal notes, Stripe account IDs, commission rates, and access tokens
5. **Exposed API keys in .env** - Google Maps API key exposed and should be rotated
6. **Timing attack vulnerability** - Unsafe token comparison in shared access
7. **SSRF in geocoding** - User-controlled addresses sent to Google Maps API
8. **Image upload without authentication** - Multiple files call upload endpoint without auth

---

## Critical Vulnerabilities

### 1. Missing Restaurant Ownership Verification (IDOR)

**Severity:** 🔴 CRITICAL

**Issue:** The URL `/restaurant/settings/[restaurantId]` accepts any restaurantId. There is no client-side or apparent backend verification that the logged-in user owns the restaurant.

**Affected Files:**
- `app/restaurant/settings/[restaurantId]/page.tsx` (line 27)
- `app/restaurant/menu/[restaurantId]/page.tsx` (line 65)
- `app/restaurant/promotions/[restaurantId]/page.tsx` (line 23)
- `app/restaurant/opening-hours/[restaurantId]/page.tsx` (line 98)
- `app/restaurant/analytics/[restaurantId]/page.tsx`

**Attack Scenario:**
```
1. User A logs in with valid credentials
2. User A navigates to /restaurant/settings/7390b43d-e430-4fda-b87b-a5f393985be7
3. This is User B's restaurant, but User A can view/edit it
4. User A can modify menu items, settings, pricing, etc.
```

**Evidence:**
```typescript
// app/restaurant/settings/[restaurantId]/page.tsx:27
const restaurantId = params.restaurantId as string; // No ownership check!

// app/restaurant/layout.tsx:23 - Only checks token exists, not ownership
const token = localStorage.getItem("access_token");
if (!token) {
  router.push("/restaurant/login");
}
```

**Recommended Solution:**

The cleanest fix is a **backend-first approach** with frontend validation as defense-in-depth:

**Backend (Priority - in `/backend/src/`):**
```typescript
// Create a guard decorator for restaurant ownership
@Injectable()
export class RestaurantOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const restaurantId = request.params.restaurantId;

    if (user.restaurantId !== restaurantId && user.role !== 'admin') {
      throw new ForbiddenException('Not authorized for this restaurant');
    }
    return true;
  }
}

// Apply to all restaurant controllers
@UseGuards(JwtAuthGuard, RestaurantOwnershipGuard)
@Controller('restaurant/:restaurantId')
```

**Frontend (Defense-in-depth - in `useAuth.ts`):**
```typescript
// Add to useAuth hook
const userRestaurantId = user?.restaurantId;

const canAccessRestaurant = (restaurantId: string) => {
  return userRestaurantId === restaurantId || user?.role === 'admin';
};
```

**Why this approach:**
- Backend guard is the real security layer - cannot be bypassed
- Single guard decorator applies to all restaurant routes
- Frontend check provides better UX (redirect before API error)
- No URL restructuring needed

---

### 2. Sensitive Data Logged to Console

**Severity:** 🔴 CRITICAL

**Issue:** Customer PII, passwords, payment info, and order details are logged to browser console via `console.log()`.

**Affected Files & Lines:**

| File | Lines | Data Exposed |
|------|-------|--------------|
| `services/api/catering.api.ts` | 104-109 | Full contact info, addresses, phone numbers |
| `services/api/catering.api.ts` | 249 | Contact info JSON |
| `services/api/catering.api.ts` | 280 | Consumer creation with random password |
| `services/api/restaurant.api.ts` | 188, 317, 336-367 | Order data, settings, API payloads |
| `context/CateringContext.tsx` | 97-101, 328, 379-385 | Cart items, promotions, pricing |
| `app/restaurant/dashboard/RestaurantDashboard.tsx` | 100 | Full catering order results |
| `app/(public)/event-order/view/[token]/page.tsx` | 62, 64, 70 | Debug logs |

**Evidence:**
```typescript
// services/api/catering.api.ts:104-109
console.log("=== CATERING SERVICE: Submit Order ===");
console.log("Event Details:", JSON.stringify(eventDetails, null, 2));
console.log("Contact Info:", JSON.stringify(contactInfo, null, 2)); // ADDRESSES, PHONES!
console.log("Payment Info:", JSON.stringify(paymentInfo, null, 2));

// services/api/catering.api.ts:280
console.log("consumer create data", JSON.stringify(createConsumerDto)); // CONTAINS PASSWORD!
```

**Recommended Solution:**

**Fastest approach - ESLint rule + one-time cleanup:**

1. **Add ESLint rule to prevent future console.logs:**
```javascript
// .eslintrc.js
rules: {
  'no-console': ['error', { allow: ['warn', 'error'] }]
}
```

2. **One-time removal script (run from project root):**
```bash
# Find all console.log statements
grep -rn "console.log" --include="*.ts" --include="*.tsx" services/ context/ app/ lib/

# Or use sed to comment them out for review:
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/console\.log/\/\/ REMOVED: console.log/g'
```

3. **For legitimate debugging needs, create a dev-only logger:**
```typescript
// lib/utils/logger.ts
const isDev = process.env.NODE_ENV === 'development';

export const devLog = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

// Usage: import { devLog } from '@/lib/utils/logger';
// devLog("Safe in dev only:", data);
```

**Why this approach:**
- ESLint prevents new console.logs from being committed
- One-time cleanup is simple search-and-delete
- Dev logger provides escape hatch for local debugging
- No production logs ever

---

### 3. Tokens Stored in localStorage (XSS Vulnerable)

**Severity:** 🔴 CRITICAL

**Issue:** Access tokens and refresh tokens are stored in `localStorage`, making them accessible to any JavaScript running on the page (including XSS payloads).

**Affected Files:**
- `lib/hooks/useAuth.ts` (lines 18-22)
- `lib/api-client/auth-client.ts` (lines 28, 80, 87)
- `app/restaurant/layout.tsx` (line 23)

**Evidence:**
```typescript
// lib/hooks/useAuth.ts:35-38
localStorage.setItem("access_token", tokens.access_token);
localStorage.setItem("refresh_token", tokens.refresh_token);
localStorage.setItem("user", JSON.stringify(profile)); // Full user object!
```

**Recommended Solution:**

**Option A: HttpOnly Cookies (Most Secure - Recommended)**

This requires backend changes but is the proper solution:

**Backend changes:**
```typescript
// In auth controller - set cookies instead of returning tokens
@Post('login')
async login(@Body() dto: LoginDto, @Res() res: Response) {
  const tokens = await this.authService.login(dto);

  res.cookie('access_token', tokens.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  res.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh', // Only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return res.json({ success: true }); // Don't return tokens in body
}
```

**Frontend changes:**
```typescript
// lib/api-client/auth-client.ts - remove token from headers
// Cookies are automatically sent with credentials: 'include'
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // This sends cookies automatically
  });
};

// Remove all localStorage token operations
// Auth state comes from /auth/me endpoint or cookie existence
```

**Option B: Short-lived tokens + Memory only (Simpler frontend change)**

If backend cookie changes aren't feasible immediately:

```typescript
// Store in memory only, not localStorage
let accessToken: string | null = null;

export const setToken = (token: string) => { accessToken = token; };
export const getToken = () => accessToken;
export const clearToken = () => { accessToken = null; };

// On page refresh, user must re-authenticate or use refresh token cookie
```

**Why Option A is best:**
- HttpOnly cookies cannot be accessed by JavaScript at all
- Immune to XSS token theft
- SameSite=strict prevents CSRF
- Industry standard approach

---

### 4. Access Tokens Exposed in API Responses

**Severity:** 🔴 CRITICAL

**Issue:** The `CateringOrderResponse` type includes access tokens for shared users directly in the response body.

**Affected File:** `types/api/catering.api.types.ts` (lines 196-205)

**Evidence:**
```typescript
// types/api/catering.api.types.ts:197-205
sharedAccessUsers?: {
  id: string;
  accessToken: string;  // ACCESS TOKEN IN RESPONSE!
  role: 'viewer' | 'editor' | 'manager';
  email: string;
  name: string;
  addedAt: string;
}[];
```

**Recommended Solution:**

**Backend fix - remove tokens from response DTOs:**

```typescript
// In catering-order.service.ts or response transformer
// Create a DTO that excludes sensitive fields

class SharedAccessUserPublicDto {
  id: string;
  role: 'viewer' | 'editor' | 'manager';
  email: string;
  name: string;
  addedAt: string;
  // NO accessToken field!
}

// When returning orders, map shared users
const publicOrder = {
  ...order,
  sharedAccessUsers: order.sharedAccessUsers?.map(user => ({
    id: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
    addedAt: user.addedAt,
    // Explicitly exclude accessToken
  }))
};
```

**For sharing access, use a separate secure flow:**
```typescript
// POST /catering-orders/:id/share
// Returns a one-time invitation link, not raw token
// Link expires after use or 24 hours
```

**Frontend type update:**
```typescript
// types/api/catering.api.types.ts - remove accessToken from type
sharedAccessUsers?: {
  id: string;
  role: 'viewer' | 'editor' | 'manager';
  email: string;
  name: string;
  addedAt: string;
  // accessToken removed
}[];
```

---

## High Severity Vulnerabilities

### 5. Weak Password Generation

**Severity:** 🟠 HIGH

**File:** `services/api/catering.api.ts` (line 266)

**Issue:** Random passwords generated using `Math.random()` which is not cryptographically secure.

```typescript
const randomPassword = Math.random().toString(36).slice(-10) + "A1";
```

**Recommended Solution:**

**Best approach - move password generation to backend:**
```typescript
// Backend handles password generation with crypto
// Frontend just sends user details, backend creates account with secure password

// If frontend generation is truly needed:
const generateSecurePassword = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('') + 'A1!';
};
```

**Why backend is better:** Frontend should never generate passwords. Backend uses Node's `crypto.randomBytes()` which is cryptographically secure.

---

### 6. Image Upload Without Authentication

**Severity:** 🟠 HIGH

**File:** `app/restaurant/settings/[restaurantId]/page.tsx` (line 132)

**Issue:** The `/image-upload` endpoint is called without requiring authentication.

**Recommended Solution:**

**Frontend - use fetchWithAuth for uploads:**
```typescript
// app/restaurant/settings/[restaurantId]/page.tsx
const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  // Use authenticated fetch instead of plain fetch
  const response = await fetchWithAuth(`${API_URL}/image-upload`, {
    method: 'POST',
    body: formData,
  });
};
```

**Backend - add auth guard:**
```typescript
@Post('image-upload')
@UseGuards(JwtAuthGuard)  // Add this guard
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  // ... existing logic
}
```

---

### 7. Stripe Account IDs Exposed

**Severity:** 🟠 HIGH

**File:** `types/api/catering.api.types.ts` (line 242)

**Issue:** `stripeAccountId` returned in `restaurantPayoutDetails` could be used for social engineering attacks.

```typescript
restaurantPayoutDetails?: {
  accountId: string;
  stripeAccountId: string;  // EXPOSED!
  earningsAmount: number;
};
```

**Recommended Solution:**

**Backend - create separate DTOs for different consumers:**

```typescript
// dto/catering-order-restaurant.dto.ts
// For restaurant owners viewing their own orders
class RestaurantPayoutPublicDto {
  earningsAmount: number;
  // stripeAccountId and accountId excluded
}

// Apply transformation in service
toRestaurantResponse(order: CateringOrder): CateringOrderRestaurantDto {
  return {
    ...order,
    restaurantPayoutDetails: order.restaurantPayoutDetails ? {
      earningsAmount: order.restaurantPayoutDetails.earningsAmount
      // Other fields excluded
    } : undefined
  };
}
```

**Why:** Stripe account IDs could be used in social engineering or to identify payment structure. Only expose what's needed for display.

---

### 8. Internal Notes Exposed to Frontend

**Severity:** 🟠 HIGH

**File:** `types/api/catering.api.types.ts` (lines 123, 189)

**Issue:** `internalNote` and `adminNotes` fields are included in client-facing API responses.

**Recommended Solution:**

**Backend - use class-transformer to exclude fields:**

```typescript
import { Exclude, Expose } from 'class-transformer';

class CateringOrderDto {
  @Exclude()  // Never sent to client
  internalNote: string;

  @Exclude()  // Never sent to client
  adminNotes: string;

  // Only expose for admin role
  @Expose({ groups: ['admin'] })
  get adminOnlyNotes() {
    return this.adminNotes;
  }
}

// In controller
@Get(':id')
async getOrder(@Param('id') id: string, @User() user) {
  const order = await this.service.findOne(id);
  const groups = user.role === 'admin' ? ['admin'] : [];
  return plainToClass(CateringOrderDto, order, { groups });
}
```

**Simpler alternative - manual exclusion:**
```typescript
// In service
getOrderForClient(order: CateringOrder) {
  const { internalNote, adminNotes, ...publicOrder } = order;
  return publicOrder;
}
```

---

### 9. Commission & Platform Revenue Exposed

**Severity:** 🟠 HIGH

**Files:**
- `types/api/catering.api.types.ts` (lines 172-176)
- `types/api/pricing.api.types.ts` (lines 34-46)

**Issue:** Business-sensitive data exposed:
```typescript
platformCommissionRevenue: number;
commissionRate: number;
commissionAmount: number;
restaurantNetAmount: number;
```

**Recommended Solution:**

**Backend - separate response DTOs by role:**

```typescript
// dto/pricing-response.dto.ts

// For customers - only what they need
class PricingCustomerDto {
  subtotal: number;
  tax: number;
  total: number;
  // Commission data excluded
}

// For restaurant owners - their earnings
class PricingRestaurantDto extends PricingCustomerDto {
  restaurantNetAmount: number;
  // Commission rate/amount still excluded
}

// For admin only
class PricingAdminDto extends PricingRestaurantDto {
  commissionRate: number;
  commissionAmount: number;
  platformCommissionRevenue: number;
}

// Controller selects DTO based on user role
@Get('pricing/:orderId')
getPricing(@Param('orderId') id: string, @User() user) {
  const pricing = this.pricingService.calculate(id);
  if (user.role === 'admin') return plainToClass(PricingAdminDto, pricing);
  if (user.role === 'restaurant_owner') return plainToClass(PricingRestaurantDto, pricing);
  return plainToClass(PricingCustomerDto, pricing);
}
```

---

### 10. Full User Profile in localStorage

**Severity:** 🟠 HIGH

**File:** `lib/hooks/useAuth.ts` (line 38)

**Issue:** Entire user profile stored as JSON in localStorage.

```typescript
localStorage.setItem("user", JSON.stringify(profile));
```

**Recommended Solution:**

**Store only essential display data:**

```typescript
// lib/hooks/useAuth.ts

// Define minimal user data for localStorage
interface StoredUser {
  id: string;
  name: string;
  email: string;
  restaurantId?: string;
  role: string;
}

const login = async (email: string, password: string) => {
  const tokens = await restaurantApi.login(credentials);
  // ... token handling

  const profile = await restaurantApi.getProfile();

  // Only store minimal required data
  const minimalUser: StoredUser = {
    id: profile.user.id,
    name: profile.user.name,
    email: profile.user.email,
    restaurantId: profile.user.restaurantId,
    role: profile.user.role,
  };
  localStorage.setItem("user", JSON.stringify(minimalUser));
};
```

**Even better - move to httpOnly cookie session:**
With the cookie-based auth from solution #3, user data comes from `/auth/me` endpoint on each page load. No localStorage needed.

---

## Medium Severity Vulnerabilities

### 11. Client-Side Only Route Protection

**Severity:** 🟡 MEDIUM

**File:** `app/restaurant/layout.tsx` (lines 16-31)

**Issue:** Auth check only verifies token exists, not validity or ownership.

```typescript
const token = localStorage.getItem("access_token");
if (!token) {
  router.push("/restaurant/login");
}
// No token validation, expiration check, or ownership verification!
```

**Recommended Solution:**

**Add token validation in layout:**
```typescript
// app/restaurant/layout.tsx
import { jwtDecode } from 'jwt-decode';

interface TokenPayload {
  exp: number;
  restaurantId?: string;
}

const validateAndGetUser = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    // Check expiration
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("access_token");
      return null;
    }
    return decoded;
  } catch {
    localStorage.removeItem("access_token");
    return null;
  }
};
```

**Note:** This is defense-in-depth only. Real security must come from backend validation.

---

### 12. No JWT Expiration Validation

**Severity:** 🟡 MEDIUM

**File:** `lib/api-client/auth-client.ts`

**Issue:** Token expiration not checked before use. Expired tokens sent to API.

**Recommended Solution:** (covered in #11 above - same token validation logic)

---

### 13. Redirect URL Stored in localStorage

**Severity:** 🟡 MEDIUM

**Files:**
- `app/restaurant/layout.tsx` (line 26)
- `app/restaurant/login/page.tsx` (line 16)

**Issue:** `redirect_after_login` stored in localStorage could enable open redirect attacks.

**Recommended Solution:**

**Validate redirect URL before using:**
```typescript
// app/restaurant/login/page.tsx
const ALLOWED_REDIRECT_PREFIXES = ['/restaurant/'];

const handleLoginSuccess = () => {
  const redirect = localStorage.getItem('redirect_after_login');
  localStorage.removeItem('redirect_after_login');

  // Validate redirect is internal and allowed
  if (redirect && ALLOWED_REDIRECT_PREFIXES.some(prefix => redirect.startsWith(prefix))) {
    router.push(redirect);
  } else {
    router.push('/restaurant/dashboard');
  }
};
```

---

### 14. No Rate Limiting on Token-Based Order Access

**Severity:** 🟡 MEDIUM

**File:** `app/(public)/event-order/view/[token]/page.tsx`

**Issue:** Order tokens can potentially be enumerated without rate limiting.

**Recommended Solution:**

**Backend - add rate limiting middleware:**
```typescript
// Use @nestjs/throttler
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// In app.module.ts
ThrottlerModule.forRoot({
  ttl: 60,    // 60 seconds
  limit: 10,  // 10 requests per ttl
}),

// On the token-based endpoint
@Get('view/:token')
@UseGuards(ThrottlerGuard)
@Throttle(5, 60) // 5 requests per 60 seconds for this endpoint
async getOrderByToken(@Param('token') token: string) {
  // ...
}
```

**Also use longer, more random tokens:**
```typescript
// Generate tokens with high entropy
const token = crypto.randomBytes(32).toString('hex'); // 64 char hex string
```

---

### 15. Frontend Price Calculations

**Severity:** 🟡 MEDIUM

**File:** `context/CateringContext.tsx`

**Issue:** Pricing and promotions calculated on frontend before submission. Backend must re-validate.

**Recommended Solution:**

**The frontend calculations are fine for display, but backend MUST recalculate:**

```typescript
// Backend - in catering-order.service.ts
async createOrder(dto: CreateCateringOrderDto) {
  // IGNORE frontend-calculated prices
  // Recalculate everything server-side
  const serverCalculatedPricing = await this.pricingService.calculate({
    items: dto.items,
    promoCode: dto.promoCode,
    restaurantId: dto.restaurantId,
  });

  // Use ONLY server-calculated values
  const order = this.orderRepo.create({
    ...dto,
    subtotal: serverCalculatedPricing.subtotal,
    tax: serverCalculatedPricing.tax,
    total: serverCalculatedPricing.total,
    discount: serverCalculatedPricing.discount,
  });

  return this.orderRepo.save(order);
}
```

**Key:** Never trust frontend-submitted price values. Always recalculate.

---

## Additional Critical Vulnerabilities (Final Sweep)

### 19. Exposed API Keys in Repository

**Severity:** 🔴 CRITICAL

**File:** `.env`

**Issue:** API keys are in the repository and exposed:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyAOOEuH5yivQTbw9NFT2sVO2IJX_B13iW4
```

**Risks:**
- Google Maps API key can be abused for DoS attacks
- Attackers can run up billing charges
- Key is in git history permanently

**Recommended Solution:**

1. **Immediately rotate the Google Maps API key** in Google Cloud Console
2. **Add API key restrictions:**
   - Restrict to your domains only (swiftfood.uk, localhost for dev)
   - Restrict to Maps JavaScript API, Geocoding API only
   - Set daily quota limits
3. **Add .env to .gitignore** (if not already)
4. **Use environment variables** in deployment platform (Vercel/Heroku) instead of committing

---

### 20. Timing Attack in Token Comparison

**Severity:** 🔴 CRITICAL

**File:** `app/(public)/event-order/view/[token]/page.tsx` (lines 50-53)

**Issue:**
```typescript
const currentUser = data.sharedAccessUsers?.find(
  (u) => u.accessToken === token
);
```

String comparison with `===` is vulnerable to timing attacks.

**Recommended Solution:**

**Cleanest fix - Backend returns role directly (no client-side token comparison needed):**

```typescript
// Backend: GET /catering-orders/view/:token
// Response includes the requester's role, no need to expose other users' tokens
{
  order: { ... },
  currentUserRole: 'viewer' | 'editor' | 'manager' | null,
  // sharedAccessUsers should NOT include accessToken field
}

// Frontend becomes simple:
const { order, currentUserRole } = await cateringService.getOrderByToken(token);
setCurrentUserRole(currentUserRole);
```

This eliminates the timing attack entirely by removing client-side token comparison.

---

### 21. SSRF Vulnerability in Geocoding

**Severity:** 🟠 HIGH

**File:** `services/api/catering.api.ts` (lines 331-355)

**Issue:** User-controlled address sent directly to Google Maps API with exposed API key.

**Recommended Solution:**

**Move geocoding to backend (cleanest approach):**

```typescript
// Frontend - simple POST request
async geocodeAddress(address: string): Promise<{ latitude: number; longitude: number }> {
  const response = await fetchWithAuth(`${API_BASE_URL}/geocode`, {
    method: 'POST',
    body: JSON.stringify({ address })
  });
  return response.json();
}

// Backend - handles validation, rate limiting, and API key security
@Post('geocode')
@UseGuards(JwtAuthGuard)
@Throttle(10, 60) // 10 requests per minute
async geocode(@Body('address') address: string) {
  if (!address || address.length > 255) {
    throw new BadRequestException('Invalid address');
  }
  // Google Maps API key stays on backend, never exposed to frontend
  return this.geocodingService.geocode(address);
}
```

**Benefits:**
- API key never exposed to frontend
- Server-side rate limiting prevents abuse
- Input validation happens server-side
- Can cache results to reduce API calls

---

### 22. Email Enumeration via URL

**Severity:** 🟠 HIGH

**File:** `services/api/catering.api.ts` (lines 251-252)

**Issue:** Email in URL is visible in browser history, server logs, and enables timing attacks.

**Recommended Solution:**

```typescript
// Frontend - use POST with body
const checkResponse = await fetchWithAuth(`${API_BASE_URL}/users/check-email`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: contactInfo.email })
});

// Backend - return consistent response to prevent enumeration
@Post('users/check-email')
async checkEmail(@Body('email') email: string) {
  const user = await this.userService.findByEmail(email);
  // Always return same structure, same response time
  return { exists: !!user, userId: user?.id || null };
}
```

---

### 23. Image Upload Without Auth (Multiple Files)

**Severity:** 🟠 HIGH

**Affected Files:**
- `app/restaurant/settings/[restaurantId]/page.tsx` (line 132)
- `lib/components/complain-form.tsx` (lines 86-91)

**Recommended Solution:**

**Frontend - replace `fetch()` with `fetchWithAuth()`:**
```typescript
// In all affected files, change:
const response = await fetch(`${API_BASE_URL}/image-upload`, { method: 'POST', body: formData });

// To:
const response = await fetchWithAuth(`${API_BASE_URL}/image-upload`, { method: 'POST', body: formData });
```

**Backend - add auth guard:**
```typescript
@Post('image-upload')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('image'))
async uploadImage(@UploadedFile() file: Express.Multer.File) {
  // existing logic
}
```

Simple 2-line changes on each side.

---

### 24. Missing Security Headers

**Severity:** 🟠 HIGH

**File:** `next.config.ts`

**Recommended Solution - add to existing next.config.ts:**

```typescript
async headers() {
  return [
    // Keep existing Apple merchant ID header
    {
      source: "/.well-known/apple-developer-merchantid-association",
      headers: [{ key: "Content-Type", value: "text/plain" }],
    },
    // Add security headers for all routes
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

**Note:** CSP is complex and may break Stripe/Maps. Start with the simpler headers above, test, then add CSP incrementally.

---

### 25. Excessive localStorage/sessionStorage Usage

**Severity:** 🟡 MEDIUM

**Files:** Multiple

**Data stored in sessionStorage (CateringContext.tsx):**
```typescript
const STORAGE_KEYS = {
  CURRENT_STEP: "catering_current_step",
  EVENT_DETAILS: "catering_event_details",
  SELECTED_ITEMS: "catering_selected_items",
  CONTACT_INFO: "catering_contact_info",  // Contains emails, phones, addresses!
  PROMO_CODES: "catering_promo_codes",
  SELECTED_RESTAURANTS: "catering_selected_restaurants",
  CORPORATE_USER: "catering_corporate_user",
  ORDER_SUBMITTED: "catering_order_submitted",
  RESTAURANT_PROMOTIONS: "catering_restaurant_promotions",
};
```

**Risk:** All this data is accessible via XSS attacks.

**Recommended Solution:**

For the catering flow, sessionStorage is acceptable (cleared on browser close), but:
1. Don't store full contact info - only store what's needed for form restoration
2. Clear storage after order submission
3. For tokens and auth - use httpOnly cookies instead

---

## Low Severity Vulnerabilities

### 16. No Content Security Policy

**Severity:** 🟢 LOW

**File:** `next.config.ts`

**Issue:** No CSP headers configured, increasing XSS risk.

**Recommended Solution:**

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self'",
              "connect-src 'self' https://swiftfoods-32981ec7b5a4.herokuapp.com https://api.stripe.com",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
            ].join('; ')
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};
```

---

### 17. Error Messages Not Sanitized

**Severity:** 🟢 LOW

**Issue:** API error messages displayed directly to users, potentially leaking backend details.

**Recommended Solution:**

```typescript
// lib/utils/error-handler.ts
const USER_FRIENDLY_ERRORS: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Please log in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  500: 'Something went wrong. Please try again later.',
};

export const getDisplayError = (error: unknown): string => {
  if (error instanceof Error && 'status' in error) {
    const status = (error as { status: number }).status;
    return USER_FRIENDLY_ERRORS[status] || 'An unexpected error occurred.';
  }
  return 'An unexpected error occurred.';
};

// Usage in components
catch (error) {
  setErrorMessage(getDisplayError(error));
  // Log full error to monitoring service, not console
  errorReportingService.log(error);
}
```

---

### 18. Session Storage Used for Caching

**Severity:** 🟢 LOW

**File:** `app/restaurant/settings/[restaurantId]/page.tsx` (line 52)

**Issue:** `sessionStorage.restaurantData` caches sensitive data.

**Recommended Solution:**

**Either remove caching or cache only non-sensitive fields:**

```typescript
// Only cache display data, not sensitive fields
const cacheRestaurantBasics = (restaurant: Restaurant) => {
  const safeCache = {
    id: restaurant.id,
    name: restaurant.name,
    logo: restaurant.logo,
    // Don't cache: pricing, payment details, internal settings
  };
  sessionStorage.setItem('restaurantBasics', JSON.stringify(safeCache));
};
```

**Or use React Query/SWR for caching:**
```typescript
// Automatic caching with proper invalidation
const { data: restaurant } = useQuery(['restaurant', id], () => fetchRestaurant(id));
```

---

## Files Requiring Immediate Attention

### Console.log Cleanup Required:

1. `services/api/catering.api.ts` - 25+ console statements
2. `services/api/restaurant.api.ts` - 15 console statements
3. `context/CateringContext.tsx` - 20+ console statements
4. `app/restaurant/dashboard/RestaurantDashboard.tsx` - line 100
5. `app/(public)/event-order/view/[token]/page.tsx` - lines 62, 64, 70
6. `app/restaurant/menu/[restaurantId]/page.tsx` - lines 47, 68
7. `app/restaurant/settings/[restaurantId]/page.tsx` - line 70
8. `lib/api-client/auth-client.ts` - line 48
9. `lib/components/modals/CorporateLoginModal.tsx` - line 74

---

## API Data Over-Fetching Summary

### CateringOrderResponse - Fields to Remove from Client Response:

| Field | Reason |
|-------|--------|
| `internalNote` | Internal use only |
| `adminNotes` | Admin only |
| `sharedAccessUsers[].accessToken` | Never expose tokens |
| `stripeAccountId` | Sensitive payment data |
| `platformCommissionRevenue` | Internal business data |
| `commissionRate` | Internal pricing data |
| `commissionAmount` | Internal pricing data |

### TokenPair - Concerns:

| Field | Reason |
|-------|--------|
| `adminMode` | Should not be in client token |

---

## Implementation Priority & Effort Matrix

| # | Issue | Effort | Impact | Priority |
|---|-------|--------|--------|----------|
| 1 | Backend ownership guard | 2 hours | Critical | **DO FIRST** |
| 2 | Remove console.logs (111 instances) | 1 hour | Critical | **DO FIRST** |
| 3 | Rotate Google Maps API key | 15 min | Critical | **DO FIRST** |
| 4 | Remove tokens from API responses | 1 hour | Critical | **DO FIRST** |
| 5 | Fix timing attack in token comparison | 30 min | Critical | **DO FIRST** |
| 6 | Filter internal notes from responses | 1 hour | High | Week 1 |
| 7 | HttpOnly cookie auth | 4-8 hours | Critical | Week 1 |
| 8 | Auth for image upload (all files) | 1 hour | High | Week 1 |
| 9 | Secure password generation | 30 min | High | Week 1 |
| 10 | Add ESLint no-console rule | 10 min | Medium | Week 1 |
| 11 | Add security headers | 1 hour | High | Week 1 |
| 12 | Fix email enumeration (POST not GET) | 1 hour | High | Week 1 |
| 13 | Rate limiting | 2 hours | Medium | Week 2 |
| 14 | Move geocoding to backend | 2 hours | Medium | Week 2 |

---

## Quick Wins (Can be done in 1-2 hours)

1. **Rotate Google Maps API key** - Go to Google Cloud Console now
2. **Remove console.logs** - `grep -rn "console.log" --include="*.ts" --include="*.tsx" services/ context/ app/ lib/` then delete
3. **Add ESLint rule** - Add `'no-console': ['error', { allow: ['warn', 'error'] }]`
4. **Add auth to image upload** - Change `fetch()` to `fetchWithAuth()` in affected files
5. **Validate redirect URLs** - Add prefix check in login page
6. **Add security headers** - Update next.config.ts

---

## Backend Changes Checklist

- [ ] Create `RestaurantOwnershipGuard` and apply to all restaurant routes
- [ ] Remove `accessToken` from `sharedAccessUsers` in response DTOs
- [ ] Remove `internalNote`, `adminNotes` from client responses
- [ ] Remove `stripeAccountId` from client responses
- [ ] Remove `commissionRate`, `commissionAmount`, `platformCommissionRevenue` from client responses
- [ ] Add `@UseGuards(JwtAuthGuard)` to image-upload endpoint
- [ ] Move password generation to backend
- [ ] Add `@nestjs/throttler` rate limiting
- [ ] Change `/users/email/{email}` to POST endpoint (prevent email enumeration)
- [ ] Move geocoding to backend with rate limiting
- [ ] Return user's role directly in token-based order endpoint (don't expose accessToken)

---

## Frontend Changes Checklist

- [ ] Remove all `console.log` statements (111 instances across 9+ files)
- [ ] Add ESLint `no-console` rule to prevent future occurrences
- [ ] Use `fetchWithAuth` for ALL image uploads (settings, menu, complain-form)
- [ ] Validate redirect URLs before navigation
- [ ] Store minimal user data in localStorage
- [ ] Add JWT expiration check in layout
- [ ] Update types to remove sensitive fields (after backend changes)
- [ ] Add security headers to next.config.ts
- [ ] Fix timing-safe comparison in event-order/view/[token]/page.tsx

---

## API Key Actions

- [ ] Rotate Google Maps API key in Google Cloud Console
- [ ] Add HTTP referrer restrictions (only swiftfood.uk, localhost)
- [ ] Restrict to only needed APIs (Maps JavaScript, Geocoding)
- [ ] Set daily quota limits
- [ ] Consider moving geocoding to backend (frontend doesn't need API key)

---

## Testing Checklist

- [ ] Verify User A cannot access User B's restaurant settings
- [ ] Confirm no sensitive data in browser console (Network + Console tabs)
- [ ] Test token expiration handling
- [ ] Verify image upload requires authentication
- [ ] Check API responses don't include internal notes/admin data
- [ ] Confirm commission/revenue data only visible to admins
- [ ] Test rate limiting on order token endpoint

---

## Conclusion

The application has **25+ security vulnerabilities**, with several critical issues that must be addressed immediately:

### Top 5 Most Urgent Fixes:

1. **Backend ownership guard** - The IDOR vulnerability you discovered where `/restaurant/settings/7390b43d-e430-4fda-b87b-a5f393985be7` is accessible without ownership verification

2. **Rotate Google Maps API key** - The key is exposed in the repository and can be abused

3. **Remove 111 console.log statements** - Customer PII, passwords, and payment info being logged

4. **Remove accessToken from API responses** - Tokens exposed in sharedAccessUsers array

5. **Add authentication to image upload** - Multiple files upload without any auth

### Vulnerability Summary:

| Severity | Count |
|----------|-------|
| 🔴 Critical | 6 |
| 🟠 High | 10 |
| 🟡 Medium | 6 |
| 🟢 Low | 3 |

### Effort Estimate:

- **Critical issues:** 4-6 hours
- **High issues:** 6-8 hours
- **Medium/Low issues:** 4-6 hours
- **Total:** 2-3 days of focused work

### Note on Backend vs Frontend:

Most security fixes require backend changes. Frontend changes are primarily:
- Removing console.logs (cleanup)
- Using fetchWithAuth for uploads (quick fix)
- Adding security headers (quick fix)
- Defense-in-depth validations (don't provide real security, just better UX)

The real security must come from the backend - especially the ownership guard and filtering sensitive data from responses.
