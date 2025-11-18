# Services Architecture

All services are organized by purpose into three clear categories.

## Structure

```
services/
├── api/                    # 🔌 Backend API Communication
│   ├── catering.api.ts    # Catering orders, menu items, pricing
│   ├── promotion.api.ts   # Promotions and discounts
│   ├── menu.api.ts        # Menu management
│   ├── refund.api.ts      # Refund processing
│   └── index.ts           # Exports all API services
│
├── business/              # 💼 Business Logic
│   ├── validation.service.ts         # Form validation rules
│   ├── pricing.service.ts            # General pricing calculations
│   ├── contact-pricing.service.ts    # Contact form pricing logic
│   ├── order-submission.service.ts   # Order submission workflow
│   └── index.ts                      # Exports all business services
│
├── utilities/             # 🔧 Helper Services
│   ├── mail.service.ts    # Email sending
│   └── index.ts           # Exports all utilities
│
└── index.ts              # Main export - imports all categories
```

## Service Categories

### 1. API Services (`/api`)
**Purpose**: Communicate with backend APIs

**Responsibilities**:
- Make HTTP requests to backend
- Handle authentication
- Parse responses
- Handle API errors

**Example**:
```typescript
import { cateringService } from '@/services/api/catering.api';

const orders = await cateringService.getCateringOrders(restaurantId);
```

### 2. Business Services (`/business`)
**Purpose**: Contain business logic and rules

**Responsibilities**:
- Business calculations
- Data validation
- Workflow orchestration
- Data transformation

**Example**:
```typescript
import { validationService } from '@/services/business/validation.service';

const errors = validationService.validateContactDetails(formData);
```

### 3. Utility Services (`/utilities`)
**Purpose**: Common helper functionality

**Responsibilities**:
- Email sending
- File uploads
- Date formatting
- Generic helpers

**Example**:
```typescript
import { mailService } from '@/services/utilities/mail.service';

await mailService.sendOrderConfirmation(email, order);
```

## Import Patterns

### Individual Service
```typescript
import { cateringService } from '@/services/api/catering.api';
import { validationService } from '@/services/business/validation.service';
```

### Category Import
```typescript
import { cateringService, promotionService } from '@/services/api';
import { validationService, pricingService } from '@/services/business';
```

### Everything (not recommended)
```typescript
import * from '@/services';
```

## Naming Conventions

### API Services
- File: `{domain}.api.ts`
- Export: `{domain}Service`
- Example: `catering.api.ts` → `cateringService`

### Business Services
- File: `{purpose}.service.ts`
- Export: `{purpose}Service`
- Example: `validation.service.ts` → `validationService`

### Utility Services
- File: `{utility}.service.ts`
- Export: `{utility}Service`
- Example: `mail.service.ts` → `mailService`

## Adding New Services

### API Service
1. Create file in `services/api/{name}.api.ts`
2. Export service instance: `export const {name}Service = new {Name}Service()`
3. Add export to `services/api/index.ts`

### Business Service
1. Create file in `services/business/{name}.service.ts`
2. Export service instance or class
3. Add export to `services/business/index.ts`

### Utility Service
1. Create file in `services/utilities/{name}.service.ts`
2. Export service instance or functions
3. Add export to `services/utilities/index.ts`

## Migration Guide

### Old Paths → New Paths

```typescript
// ❌ Old
import { cateringService } from '@/services/cateringServices';
import { validationService } from '@/services/core';
import { mailService } from '@/app/_shared/service/mail';

// ✅ New
import { cateringService } from '@/services/api/catering.api';
import { validationService } from '@/services/business/validation.service';
import { mailService } from '@/services/utilities/mail.service';
```

## Benefits

1. **Clear Separation**: API vs Business Logic vs Utilities
2. **Easy to Find**: Know exactly where a service lives
3. **No Duplication**: Single source of truth for each service
4. **Scalable**: Easy to add new services to the right category
5. **Testable**: Each category can be tested independently
