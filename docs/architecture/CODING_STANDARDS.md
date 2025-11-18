# Coding Standards & Architecture Guidelines

## 📋 Table of Contents
1. [File Organization](#file-organization)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Standards](#typescript-standards)
4. [Component Architecture](#component-architecture)
5. [Service Layer](#service-layer)
6. [Custom Hooks](#custom-hooks)
7. [DTOs & Types](#dtos--types)
8. [Testing Standards](#testing-standards)

---

## 🗂️ File Organization

### Directory Structure Template

Every feature should follow this structure:

```
feature-name/
├── types/
│   └── feature.dto.ts          # All DTOs and interfaces
├── services/
│   └── feature.service.ts      # API calls and business logic
├── hooks/
│   ├── useFeature.ts           # Main feature hook
│   └── useFeatureValidation.ts # Validation logic
├── utils/
│   ├── feature.utils.ts        # Pure utility functions
│   └── feature.constants.ts    # Constants and config
├── components/
│   ├── index.ts                # Component exports
│   ├── FeatureHeader.tsx       # Sub-components
│   ├── FeatureForm.tsx
│   └── FeatureList.tsx
├── FeatureMain.tsx             # Main orchestrator component
├── README.md                   # Feature documentation
└── ARCHITECTURE.md             # Architecture details
```

### File Size Limits

| File Type | Max Lines | Action if Exceeded |
|-----------|-----------|-------------------|
| Component | 200 | Split into sub-components |
| Hook | 150 | Extract logic to service/utils |
| Service | 300 | Split into multiple services |
| Utils | 200 | Split by concern |
| DTO file | 300 | Split into multiple DTO files |

---

## 📝 Naming Conventions

### Variables

#### ❌ BAD - Vague Names
```typescript
const data = await fetch(...);
const result = calculate();
const temp = items.filter(...);
const val = input.value;
const arr = [...];
const obj = {...};
```

#### ✅ GOOD - Descriptive Names
```typescript
const orderData = await fetchOrder();
const calculatedPrice = calculateTotalPrice();
const activeMenuItems = menuItems.filter(...);
const customerEmail = emailInput.value;
const menuItemIds = [...];
const pricingBreakdown = {...};
```

### Naming Rules

1. **Boolean variables**: Start with `is`, `has`, `should`, `can`
   ```typescript
   // ✅ Good
   const isLoading = true;
   const hasPermission = checkPermission();
   const shouldShowModal = status === 'pending';
   const canSubmit = isValid && !isSubmitting;

   // ❌ Bad
   const loading = true;
   const permission = checkPermission();
   const showModal = status === 'pending';
   ```

2. **Arrays**: Use plural nouns
   ```typescript
   // ✅ Good
   const menuItems = [];
   const orderIds = [];
   const activePromotions = [];

   // ❌ Bad
   const menuItem = []; // Confusing - singular for array
   const orderId = []; // Same issue
   const promotion = []; // Not clear it's an array
   ```

3. **Objects**: Use descriptive nouns
   ```typescript
   // ✅ Good
   const pricingBreakdown = { gross: 100, net: 80 };
   const customerDetails = { name: '', email: '' };
   const orderSummary = { total: 0, items: [] };

   // ❌ Bad
   const data = { gross: 100, net: 80 };
   const details = { name: '', email: '' };
   const summary = { total: 0, items: [] };
   ```

4. **Functions**: Use verb + noun
   ```typescript
   // ✅ Good
   function calculateOrderTotal() {}
   function validateEmailAddress() {}
   function fetchMenuItems() {}
   function transformOrderData() {}

   // ❌ Bad
   function order() {} // What does this do?
   function email() {} // Validate? Send? Format?
   function items() {} // Get? Filter? Transform?
   ```

5. **Constants**: SCREAMING_SNAKE_CASE
   ```typescript
   // ✅ Good
   const MAX_ORDER_ITEMS = 50;
   const DEFAULT_COMMISSION_RATE = 20;
   const API_TIMEOUT_MS = 5000;

   // ❌ Bad
   const maxOrderItems = 50;
   const defaultCommissionRate = 20;
   ```

6. **Avoid Single Letter Variables** (except in very short loops)
   ```typescript
   // ✅ Good
   menuItems.forEach((menuItem, index) => {
     console.log(menuItem.name);
   });

   // ❌ Bad
   menuItems.forEach((i, idx) => {
     console.log(i.name); // What is 'i'?
   });

   // ✅ OK for simple math/iteration
   for (let i = 0; i < 10; i++) {
     // Simple counter is fine
   }
   ```

---

## 🔷 TypeScript Standards

### No `any` Types

```typescript
// ❌ NEVER DO THIS
function processData(data: any) {
  return data.items.map((item: any) => item.price);
}

// ✅ ALWAYS DO THIS
interface OrderData {
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
}

function processOrderData(orderData: OrderData): number[] {
  return orderData.items.map((item) => item.price);
}
```

### Use DTOs for All Data Structures

```typescript
// ❌ Bad - Inline types
const order: {
  id: string;
  total: number;
  items: {
    name: string;
    price: number;
  }[];
} = {...};

// ✅ Good - Dedicated DTOs
interface OrderDto {
  id: string;
  total: number;
  items: OrderItemDto[];
}

interface OrderItemDto {
  name: string;
  price: number;
}

const order: OrderDto = {...};
```

### Type Everything

```typescript
// ❌ Bad - Implicit any
const [data, setData] = useState();
const result = await fetch('/api/orders');

// ✅ Good - Explicit types
const [orderData, setOrderData] = useState<OrderDto | null>(null);
const orderResponse = await fetch('/api/orders');
const orders: OrderDto[] = await orderResponse.json();
```

### Use Discriminated Unions for Complex State

```typescript
// ❌ Bad - Multiple booleans
interface State {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: OrderDto;
  error?: string;
}

// ✅ Good - Discriminated union
type OrderState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: OrderDto }
  | { status: 'error'; error: string };
```

---

## 🧩 Component Architecture

### Layer Separation

```
┌─────────────────────────────────┐
│     Orchestrator Component      │  ← Composition only
│     (FeatureMain.tsx)           │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼─────┐
│ Custom │      │Presentational│  ← UI only, no logic
│ Hooks  │      │ Components  │
└───┬────┘      └─────────────┘
    │
┌───▼────┐
│Services│                          ← Business logic
└───┬────┘
    │
┌───▼────┐
│ Utils  │                          ← Pure functions
└────────┘
```

### Component Rules

1. **Presentational Components**: UI only
   ```typescript
   // ✅ Good - Pure presentation
   interface OrderHeaderProps {
     orderId: string;
     orderDate: string;
     orderStatus: OrderStatus;
   }

   export function OrderHeader({ orderId, orderDate, orderStatus }: OrderHeaderProps) {
     return (
       <div>
         <h1>Order {orderId}</h1>
         <p>{formatDate(orderDate)}</p>
         <StatusBadge status={orderStatus} />
       </div>
     );
   }
   ```

2. **Container Components**: Logic coordination
   ```typescript
   // ✅ Good - Coordinates logic and presentation
   export function OrderContainer() {
     const { order, isLoading, error } = useOrder(orderId);
     const { handleStatusChange } = useOrderActions();

     if (isLoading) return <LoadingSpinner />;
     if (error) return <ErrorMessage error={error} />;
     if (!order) return <NotFound />;

     return (
       <>
         <OrderHeader {...order} />
         <OrderDetails order={order} />
         <OrderActions onStatusChange={handleStatusChange} />
       </>
     );
   }
   ```

3. **No Business Logic in Components**
   ```typescript
   // ❌ Bad - Calculation logic in component
   function OrderSummary({ items }: { items: OrderItem[] }) {
     const total = items.reduce((sum, item) => {
       const basePrice = item.price * item.quantity;
       const commission = basePrice * 0.20;
       return sum + basePrice - commission;
     }, 0);

     return <div>Total: £{total}</div>;
   }

   // ✅ Good - Logic in service/util
   function OrderSummary({ items }: { items: OrderItem[] }) {
     const totalAmount = calculateOrderTotal(items);

     return <div>Total: {formatCurrency(totalAmount)}</div>;
   }
   ```

---

## 🔧 Service Layer

### Service Structure

```typescript
// feature.service.ts

/**
 * FeatureService
 * Handles all business logic and API calls for Feature
 */
class FeatureService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL;

  /**
   * Fetch feature data
   * @param id - Feature identifier
   * @returns Promise with feature data
   */
  async getFeature(id: string): Promise<FeatureDto> {
    const response = await fetch(`${this.baseUrl}/features/${id}`);

    if (!response.ok) {
      throw new FeatureServiceError('Failed to fetch feature', response.status);
    }

    return response.json();
  }

  /**
   * Calculate feature pricing
   * Pure business logic - no side effects
   */
  calculatePricing(data: FeatureDataDto): PricingBreakdownDto {
    // Business logic here
    return {
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  }
}

export const featureService = new FeatureService();
```

### Service Rules

1. **One service per domain**: Don't mix concerns
   - ✅ `OrderService`, `MenuService`, `PaymentService`
   - ❌ `DataService`, `ApiService`, `HelperService`

2. **No UI logic**: Services don't know about React
3. **Error handling**: Always throw typed errors
4. **Pure functions**: Business logic should be pure when possible

---

## 🪝 Custom Hooks

### Hook Structure

```typescript
// useFeature.ts

interface UseFeatureParams {
  featureId: string;
  options?: FeatureOptions;
}

interface UseFeatureReturn {
  feature: FeatureDto | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Custom hook for managing feature data
 */
export function useFeature({ featureId, options }: UseFeatureParams): UseFeatureReturn {
  const [feature, setFeature] = useState<FeatureDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchFeature = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await featureService.getFeature(featureId);
      setFeature(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [featureId]);

  useEffect(() => {
    fetchFeature();
  }, [fetchFeature]);

  return {
    feature,
    isLoading,
    error,
    refetch: fetchFeature,
  };
}
```

### Hook Rules

1. **Name with `use` prefix**: `useFeature`, `useValidation`
2. **Return objects**, not arrays (easier to extend)
3. **Type params and return values**
4. **Document with JSDoc**
5. **Single responsibility**: One hook = one concern

---

## 📦 DTOs & Types

### DTO File Organization

```typescript
// feature.dto.ts

/**
 * Base feature entity
 */
export interface FeatureDto {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Feature creation payload
 */
export interface CreateFeatureDto {
  name: string;
  description: string;
}

/**
 * Feature update payload
 */
export interface UpdateFeatureDto {
  name?: string;
  description?: string;
}

/**
 * Feature list response with pagination
 */
export interface FeatureListDto {
  features: FeatureDto[];
  pagination: PaginationDto;
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

### DTO Rules

1. **Suffix with `Dto`**: `OrderDto`, `CreateOrderDto`
2. **One file per domain**: All order DTOs in `order.dto.ts`
3. **No logic**: DTOs are pure data structures
4. **Document fields**: Use JSDoc for complex fields
5. **Use enums** for fixed values

---

## 🧪 Testing Standards

### Test File Structure

```typescript
// Feature.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import { Feature } from './Feature';
import { featureService } from './services/feature.service';

// Mock services
jest.mock('./services/feature.service');

describe('Feature Component', () => {
  const mockFeatureData = {
    id: '123',
    name: 'Test Feature',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading spinner when fetching data', () => {
      render(<Feature featureId="123" />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should display feature data when loaded', async () => {
      (featureService.getFeature as jest.Mock).mockResolvedValue(mockFeatureData);

      render(<Feature featureId="123" />);

      await waitFor(() => {
        expect(screen.getByText('Test Feature')).toBeInTheDocument();
      });
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', async () => {
      (featureService.getFeature as jest.Mock).mockRejectedValue(new Error('Failed'));

      render(<Feature featureId="123" />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });
});
```

### Test Utils

```typescript
// utils/test.utils.ts

/**
 * Test utilities for pure functions
 */
describe('calculateOrderTotal', () => {
  it('should calculate total correctly', () => {
    const items = [
      { price: 10, quantity: 2 }, // 20
      { price: 15, quantity: 1 }, // 15
    ];

    expect(calculateOrderTotal(items)).toBe(35);
  });

  it('should handle empty array', () => {
    expect(calculateOrderTotal([])).toBe(0);
  });
});
```

---

## 📋 Checklist Before Committing

- [ ] No files > 200 lines (for components)
- [ ] No `any` types used
- [ ] All functions have descriptive names
- [ ] All variables have descriptive names
- [ ] All DTOs properly defined
- [ ] Business logic in services/utils, not components
- [ ] Components are presentational
- [ ] Custom hooks for complex state
- [ ] Tests written for critical paths
- [ ] Documentation added for complex logic
- [ ] No duplicate code
- [ ] Constants extracted to const files
- [ ] Error handling implemented
- [ ] Loading states handled

---

## 🚫 Anti-Patterns to Avoid

### 1. God Components
```typescript
// ❌ One component doing everything
function Dashboard() {
  // 500 lines of mixed logic
}

// ✅ Composed from smaller parts
function Dashboard() {
  return (
    <>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardOrders />
    </>
  );
}
```

### 2. Prop Drilling
```typescript
// ❌ Passing props through many levels
<App>
  <Header user={user} />
  <Content>
    <Sidebar user={user} />
    <Main>
      <Profile user={user} />
    </Main>
  </Content>
</App>

// ✅ Use Context or composition
const UserContext = createContext<User | null>(null);

<UserContext.Provider value={user}>
  <App />
</UserContext.Provider>
```

### 3. Inline Objects/Functions
```typescript
// ❌ Creates new reference on every render
<Component
  config={{ option: 'value' }}
  onClick={() => handleClick()}
/>

// ✅ Stable references
const config = useMemo(() => ({ option: 'value' }), []);
const handleClickCallback = useCallback(() => handleClick(), []);

<Component config={config} onClick={handleClickCallback} />
```

---

## 📚 Resources

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Best Practices](https://react.dev/learn)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
