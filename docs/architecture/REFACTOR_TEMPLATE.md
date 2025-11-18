# Refactoring Template - Apply to Any File

## Quick Process

For ANY component >200 lines:

### 1. Create Feature Folder
```bash
mkdir -p feature-name/{types,services,hooks,utils,components}
```

### 2. Extract Types First
```typescript
// types/feature.dto.ts
export interface FeatureFormData {
  // All form fields with DESCRIPTIVE names
  customerEmail: string;  // NOT: email
  deliveryAddress: string; // NOT: address
  orderTotal: number;     // NOT: total
}
```

### 3. Extract Pure Functions
```typescript
// utils/feature.utils.ts
export function calculateFeatureTotal(items: Item[]): number {
  // Pure calculation - no state, no API calls
}
```

### 4. Extract API/Business Logic
```typescript
// services/feature.service.ts
class FeatureService {
  async fetchData(id: string): Promise<Data> {
    // API calls here
  }
}
```

### 5. Extract State Logic
```typescript
// hooks/useFeature.ts
export function useFeature() {
  const [data, setData] = useState<Data | null>(null);
  // Complex state management
  return { data, ... };
}
```

### 6. Create Small Components
```typescript
// components/FeatureSection.tsx (MAX 50 lines)
export function FeatureSection({ data }: Props) {
  return <div>...</div>;
}
```

### 7. Main Component = Glue
```typescript
// FeatureMain.tsx (MAX 100 lines)
export function Feature() {
  const { data } = useFeature();
  return (
    <>
      <FeatureHeader data={data} />
      <FeatureBody data={data} />
      <FeatureFooter />
    </>
  );
}
```

## Variable Renaming Cheatsheet

### ❌ NEVER USE → ✅ USE INSTEAD

| Bad | Good |
|-----|------|
| `data` | `orderData`, `menuItemData`, `userData` |
| `item` | `menuItem`, `orderItem`, `cartItem` |
| `val` | `emailValue`, `priceValue` |
| `temp` | `temporaryOrder`, `draftEmail` |
| `result` | `calculationResult`, `apiResponse` |
| `res` | `orderResponse`, `paymentResponse` |
| `err` | `validationError`, `networkError` |
| `i`, `idx` | `menuItemIndex`, `orderIndex` |
| `arr` | `menuItems`, `orderIds` |
| `obj` | `pricingBreakdown`, `orderSummary` |
| `flag` | `isLoading`, `hasErrors` |
| `check` | `isValid`, `shouldSubmit` |

## Before/After Example

### ❌ Before (Bad)
```typescript
function Component() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const calc = (items: any) => {
    let total = 0;
    items.forEach((i: any) => {
      total += i.price * i.qty;
    });
    return total;
  };

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => setData(d));
  }, []);

  return <div>{loading ? 'Loading...' : data?.name}</div>;
}
```

### ✅ After (Good)
```typescript
// types/order.dto.ts
export interface OrderData {
  id: string;
  customerName: string;
  totalAmount: number;
}

// utils/order.utils.ts
export function calculateOrderTotal(orderItems: OrderItem[]): number {
  return orderItems.reduce((total, orderItem) => {
    return total + orderItem.unitPrice * orderItem.quantity;
  }, 0);
}

// hooks/useOrder.ts
export function useOrder(orderId: string) {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoadingOrder(true);
      try {
        const response = await orderService.getOrder(orderId);
        setOrderData(response);
      } catch (error) {
        setOrderError(error as Error);
      } finally {
        setIsLoadingOrder(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return { orderData, isLoadingOrder, orderError };
}

// OrderDisplay.tsx
export function OrderDisplay({ orderId }: { orderId: string }) {
  const { orderData, isLoadingOrder, orderError } = useOrder(orderId);

  if (isLoadingOrder) return <LoadingSpinner />;
  if (orderError) return <ErrorMessage error={orderError} />;
  if (!orderData) return null;

  return <div>{orderData.customerName}</div>;
}
```

## Apply This Now

1. Pick your worst file
2. Follow steps 1-7 above
3. Keep old file as `.legacy.tsx`
4. Test refactored version
5. Delete legacy when confident

Done!
