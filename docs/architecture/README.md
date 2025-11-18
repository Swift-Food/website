# Architecture & Refactoring Guide

## 🚀 Quick Start

You now have:

### 1. **Shared Libraries** (Use These Everywhere!)

```typescript
// UI Components
import { Button } from '@/components/shared/ui';
import { Input } from '@/components/shared/form';

// Services
import { validationService, pricingService } from '@/services/core';

// Utils
import { formatCurrency, formatDate, isValidEmail } from '@/lib/utils';
```

### 2. **Standards**
- **[CODING_STANDARDS.md](./CODING_STANDARDS.md)** - How to write clean code
- **[REFACTOR_TEMPLATE.md](./REFACTOR_TEMPLATE.md)** - Step-by-step refactoring guide

### 3. **Example Architecture**
See `/app/restaurant/dashboard/catering/` for a complete, production-ready example of clean architecture.

## 📋 Refactoring Checklist

For every component you touch:

- [ ] Rename vague variables (`data` → `orderData`)
- [ ] Extract inline validation to `validationService`
- [ ] Extract pricing logic to `pricingService`
- [ ] Use shared `Button` and `Input` components
- [ ] Use `formatCurrency()` instead of inline formatting
- [ ] Replace `any` with proper types
- [ ] Split if >200 lines

## 🎯 Priority Files

### Critical (Do These First)
1. Step3ContactDetails.tsx (1,743 lines) - Payment/forms
2. Step2MenuItems.tsx (1,265 lines) - Cart management
3. Menu Item Edit/New pages (1,200 lines each) - 95% duplicate code

### High Priority
4. Step1EventDetails.tsx (1,064 lines)
5. CateringContext.tsx (709 lines)
6. cateringServices.tsx (771 lines)

## 💡 Quick Wins (Do These Now!)

### Rename Variables (15 mins per file)
```bash
# Find all vague variables
grep -r "const data = " .
grep -r "const item = " .
grep -r "const val = " .
```

Replace with descriptive names using REFACTOR_TEMPLATE.md

### Use Shared Components (5 mins)
```typescript
// ❌ Before
<button className="bg-pink-600 px-4 py-2...">Submit</button>

// ✅ After
<Button variant="primary">Submit</Button>
```

### Use Shared Services (10 mins)
```typescript
// ❌ Before
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) { ... }

// ✅ After
import { validationService } from '@/services/core';
const errors = validationService.validateContactDetails(formData);
```

## 📁 File Structure

```
/
├── components/shared/          # Reusable UI components
│   ├── ui/                    # Button, Modal, etc.
│   └── form/                  # Input, Select, etc.
├── services/core/             # Business logic services
│   ├── validation.service.ts
│   ├── pricing.service.ts
│   └── index.ts
├── lib/
│   ├── hooks/                # Custom hooks
│   └── utils/                # Pure utility functions
├── types/shared/             # Shared DTOs
│   └── common.dto.ts
└── docs/architecture/        # This folder
    ├── CODING_STANDARDS.md
    ├── REFACTOR_TEMPLATE.md
    └── README.md (this file)
```

## 🎓 Learn By Example

**Best refactored file**: `/app/restaurant/dashboard/catering/CateringOrderCard.refactored.tsx`

Compare with the old version to see the transformation.

## ⚡ Remember

1. **Small files** - Max 200 lines per component
2. **Descriptive names** - No `data`, `item`, `val`, `temp`
3. **Type everything** - Zero `any` types
4. **Reuse shared code** - Don't duplicate
5. **Services for logic** - Components for UI only

---

**Need help?** Check the template. **Still stuck?** Follow the example in `/app/restaurant/dashboard/catering/`
