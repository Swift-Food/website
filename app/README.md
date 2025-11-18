# App Directory Structure

This directory is organized using **Next.js Route Groups** to match the user journey through the website. Route groups (folders with parentheses) organize code without affecting URLs.

## Structure Overview

```
app/
├── (public)/              # 🌐 Public customer-facing pages
│   ├── page.tsx           # Homepage → /
│   ├── markets/           # Browse food markets → /markets
│   ├── catering-form/     # Order catering → /catering-form
│   ├── event-order/       # View event orders → /event-order
│   └── payment/           # Payment flows → /payment/*
│
├── (legal)/               # 📄 Legal & policy pages
│   ├── terms/             # Terms & Conditions → /terms
│   ├── privacy/           # Privacy Policy → /privacy
│   ├── partners-privacy-policy/  → /partners-privacy-policy
│   ├── swift-partner-policy/     → /swift-partner-policy
│   ├── swift-partner-standards/  → /swift-partner-standards
│   └── content-rights-swift/     → /content-rights-swift
│
├── (support)/             # 💬 Support & help pages
│   ├── contact/           # Contact us → /contact
│   ├── faq/               # FAQ → /faq
│   └── consumer-complaints/ → /consumer-complaints
│
├── restaurant/            # 🍴 Restaurant partner portal
│   ├── login/             # Restaurant login → /restaurant/login
│   ├── dashboard/         # Restaurant dashboard → /restaurant/dashboard
│   ├── menu/              # Menu management → /restaurant/menu
│   ├── promotions/        # Promotions → /restaurant/promotions
│   ├── analytics/         # Analytics → /restaurant/analytics
│   ├── settings/          # Settings → /restaurant/settings
│   └── opening-hours/     # Opening hours → /restaurant/opening-hours
│
├── rider/                 # 🚴 Rider portal
│   └── ...                # Rider-related pages → /rider/*
│
├── api/                   # 🔌 API routes
│   └── ...                # API endpoints → /api/*
│
├── _shared/               # 🔧 Shared code (not a route)
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── constants/         # App constants
│   └── service/           # Service layer
│
├── layout.tsx             # Root layout
└── README.md              # This file
```

## Route Groups Explained

Folders wrapped in parentheses like `(public)` are **route groups**:
- ✅ They organize code for developers
- ✅ They have NO impact on the URL structure
- ✅ They allow logical grouping by user journey

Example:
- File: `app/(public)/markets/page.tsx`
- URL: `/markets` (the `(public)` part is ignored)

## User Journey

### 1. **Public Users** → `(public)`
Homepage → Browse markets → Order catering → Complete payment

### 2. **Restaurant Partners** → `restaurant/`
Login → Dashboard → Manage menu → View orders → Analytics

### 3. **Riders** → `rider/`
Rider-specific functionality

### 4. **Support** → `(support)`
Contact, FAQ, complaints

### 5. **Legal** → `(legal)`
Terms, privacy, policies

## Import Paths

All shared code is imported via the `@/app/_shared` path:

```typescript
// Components
import { Button } from '@/app/_shared/components/ui/Button';

// Hooks
import { useAuth } from '@/app/_shared/hooks/useAuth';

// Types
import { User } from '@/app/_shared/types/user.types';

// Utils
import { formatCurrency } from '@/app/_shared/utils/format';
```

## Benefits

1. **Clear organization** - Easy to find files based on user journey
2. **No URL changes** - All existing URLs work exactly the same
3. **Scalability** - Easy to add new features to the right group
4. **Maintainability** - New developers understand the structure immediately

## Adding New Pages

When adding a new page, ask:
- Is it public-facing? → Add to `(public)`
- Is it for restaurants? → Add to `restaurant/`
- Is it legal/policy? → Add to `(legal)`
- Is it support/help? → Add to `(support)`
- Is it shared code? → Add to `_shared/`
