# Project Structure Guide

This is a **Next.js 13+ App Router** project with a clean, industry-standard folder structure.

## 📁 Root Directory Structure

```
website/
├── app/                   # Next.js App Router (routes & pages)
├── lib/                   # Shared library code
├── services/              # Service layer (API & business logic)
├── types/                 # TypeScript type definitions
├── context/               # React Context providers
├── features/              # Feature-specific modules
├── public/                # Static assets
├── docs/                  # Documentation
└── [config files]         # package.json, tsconfig.json, etc.
```

## 🗂️ Detailed Breakdown

### `/app` - Next.js App Router
Contains all routes and pages. Organized by user journey using route groups.

```
app/
├── (public)/              # Public customer pages
│   ├── page.tsx           # Homepage → /
│   ├── markets/           # → /markets
│   ├── catering-form/     # → /catering-form
│   ├── event-order/       # → /event-order
│   └── payment/           # → /payment/*
│
├── (legal)/               # Legal & policy pages
│   ├── terms/             # → /terms
│   ├── privacy/           # → /privacy
│   └── ...
│
├── (support)/             # Support pages
│   ├── contact/           # → /contact
│   ├── faq/               # → /faq
│   └── consumer-complaints/
│
├── restaurant/            # Restaurant portal → /restaurant/*
│   ├── dashboard/
│   ├── menu/
│   └── ...
│
├── rider/                 # Rider portal → /rider/*
│
├── api/                   # Next.js API routes → /api/*
│   └── .well-known/       # Authentication endpoints
│
├── layout.tsx             # Root layout
└── README.md              # App structure docs
```

**Note**: Folders in parentheses `(folder)` are **route groups** - they organize code but don't affect URLs.

### `/lib` - Shared Library Code
All reusable code that's used across the application.

```
lib/
├── components/            # Reusable UI components
│   ├── buttons/          # Button variants
│   ├── cards/            # Card components
│   ├── catering/         # Catering-specific components
│   ├── containers/       # Layout containers
│   ├── modals/           # Modal dialogs
│   ├── navbar.tsx        # Navigation bar
│   ├── footer.tsx        # Footer
│   └── ...
│
├── hooks/                # Custom React hooks
│   └── ...
│
├── utils/                # Utility functions
│   ├── format.utils.ts   # Formatting helpers
│   ├── validation.utils.ts
│   └── index.ts
│
├── constants/            # App-wide constants
│   ├── allergens.ts      # Allergen definitions
│   └── data.ts           # Other constants
│
└── api-client/           # API client utilities
    └── auth-client.ts    # Authentication client
```

**Import pattern**:
```typescript
import { Button } from '@/lib/components/buttons/Button';
import { formatCurrency } from '@/lib/utils/format.utils';
import { allergens } from '@/lib/constants/allergens';
```

### `/services` - Service Layer
All services organized by purpose.

```
services/
├── api/                   # Backend API communication
│   ├── catering.api.ts   # Catering API calls
│   ├── restaurant.api.ts # Restaurant API calls
│   ├── promotion.api.ts  # Promotions API
│   ├── menu.api.ts       # Menu management API
│   ├── refund.api.ts     # Refund API
│   └── index.ts
│
├── business/             # Business logic & calculations
│   ├── validation.service.ts
│   ├── pricing.service.ts
│   ├── contact-pricing.service.ts
│   ├── order-submission.service.ts
│   └── index.ts
│
├── utilities/            # Utility services
│   ├── mail.service.ts
│   └── index.ts
│
├── index.ts
└── README.md
```

**Import pattern**:
```typescript
import { cateringService } from '@/services/api/catering.api';
import { validationService } from '@/services/business/validation.service';
```

### `/types` - TypeScript Types
All TypeScript type definitions.

```
types/
├── catering.types.ts     # Catering-related types
├── restaurant.types.ts   # Restaurant types
├── promotion.types.ts    # Promotion types
├── menuItem.ts           # Menu item types
├── inventory.types.ts    # Inventory types
├── refund.types.ts       # Refund types
└── shared/               # Shared/common types
    └── common.dto.ts
```

**Import pattern**:
```typescript
import { CateringOrder } from '@/types/catering.types';
import { Restaurant } from '@/types/restaurant.types';
```

### `/context` - React Contexts
React Context providers for global state.

```
context/
├── CateringContext.tsx        # Catering order state
└── CateringFilterContext.tsx  # Filter state
```

**Import pattern**:
```typescript
import { useCatering } from '@/context/CateringContext';
```

### `/features` - Feature Modules
Self-contained feature modules with their own components, hooks, and logic.

```
features/
└── contact-details/
    ├── components/       # Feature-specific components
    ├── hooks/            # Feature-specific hooks
    ├── types/            # Feature-specific types
    └── ...
```

**Import pattern**:
```typescript
import { ContactForm } from '@/features/contact-details/components/ContactForm';
```

### `/public` - Static Assets
Public static files served directly.

```
public/
├── images/
├── fonts/
└── ...
```

### `/docs` - Documentation
Project documentation.

```
docs/
└── architecture/
    ├── README.md
    ├── CODING_STANDARDS.md
    └── REFACTOR_TEMPLATE.md
```

## 🎯 Import Path Aliases

Configured in `tsconfig.json`:

```typescript
@/app/*        → app/*
@/lib/*        → lib/*
@/services/*   → services/*
@/types/*      → types/*
@/context/*    → context/*
@/features/*   → features/*
@/public/*     → public/*
```

## 📝 File Naming Conventions

### Components
- React components: `PascalCase.tsx`
- Example: `Button.tsx`, `ContactForm.tsx`

### Services
- API services: `{domain}.api.ts`
- Business services: `{purpose}.service.ts`
- Example: `catering.api.ts`, `validation.service.ts`

### Types
- Type files: `{domain}.types.ts`
- Example: `catering.types.ts`, `restaurant.types.ts`

### Utilities
- Utility files: `{purpose}.utils.ts`
- Example: `format.utils.ts`, `validation.utils.ts`

### Contexts
- Context files: `{Name}Context.tsx`
- Example: `CateringContext.tsx`

## 🚀 Quick Reference

### Adding a New Page
1. Determine user journey (public, restaurant, legal, etc.)
2. Create in appropriate route group in `/app`
3. Example: New FAQ page → `/app/(support)/faq/page.tsx`

### Adding a Reusable Component
1. Create in `/lib/components/{category}/`
2. Export from index file if needed
3. Import using `@/lib/components/{category}/{Component}`

### Adding a New API Service
1. Create in `/services/api/{name}.api.ts`
2. Export service instance
3. Add to `/services/api/index.ts`

### Adding Business Logic
1. Create in `/services/business/{name}.service.ts`
2. Export service
3. Add to `/services/business/index.ts`

### Adding Types
1. Add to existing type file or create new in `/types/`
2. Import using `@/types/{name}.types`

## ✅ Benefits of This Structure

1. **Clear Separation of Concerns**
   - Routes in `/app`
   - Shared code in `/lib`
   - Services in `/services`
   - Types in `/types`

2. **Easy Navigation**
   - Everything has a logical place
   - No hunting through random folders

3. **Scalable**
   - Easy to add new features
   - Clear patterns to follow

4. **Industry Standard**
   - Follows Next.js best practices
   - Familiar to other developers

5. **No Duplication**
   - Single source of truth for everything
   - Eliminated all duplicate folders

## 🔄 Recent Changes

**Consolidated Structure** (Latest):
- Moved all components from `/components/shared` → `/lib/components`
- Moved all constants from `/constants` → `/lib/constants`
- Moved hooks from `/app/_shared/hooks` → `/lib/hooks`
- Moved utils from `/app/_shared/utils` → `/lib/utils`
- Moved API client from `/app/api/client.ts` → `/lib/api-client/auth-client.ts`
- Moved restaurant API from `/app/api/restaurantApi.ts` → `/services/api/restaurant.api.ts`
- Deleted all duplicate folders

**Before this cleanup**, there were duplicates in:
- ❌ `/components/shared` (deleted)
- ❌ `/app/_shared` (deleted)
- ❌ `/constants` (deleted)
- ❌ Multiple service locations (consolidated)

Now everything is in **one clear location**! 🎉
