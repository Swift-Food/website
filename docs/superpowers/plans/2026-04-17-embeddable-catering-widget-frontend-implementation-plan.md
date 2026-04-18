# Embeddable Catering Widget — Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract the existing `swiftfood.uk` catering ordering flow into a standalone, framework-agnostic React library (`@swift/catering-widget`) living in a sibling repo, wired to the existing public catering backend endpoints. Backend partner-auth work is out of scope; the publishable-key/session-token surface is present as an interface and internally stubbed.

**Architecture:** New monorepo `../catering-widget/` (sibling of `website/`) with npm workspaces. One library package (`packages/catering-widget/`) plus two example host apps (`examples/next-app`, `examples/vite-app`) and Storybook for component iteration. Existing catering code in `website/` is **copied**, not moved — `swiftfood.uk` keeps its current flow unchanged. Widget internals: a single public `<CateringWidget>` component, split `State`/`Config` contexts, namespaced localStorage wrapper, internal API client with a stubbed `POST /widget/session` handshake (returns a synthetic token until the backend exists), typed endpoint methods pointing at the existing `api.swiftfood.uk` routes, and a compiled CSS bundle scoped under `.swift-catering-widget`.

**Tech Stack:** React 19, TypeScript 5, tsup (ESM + CJS + dts), Tailwind CSS 4, DaisyUI 5, Vitest + Testing Library, MSW for API mocking in tests/Storybook, Storybook 8, npm workspaces.

**Scope exclusions (deliberate):** Backend partner model, `/widget/session` handler, admin partner endpoints, CORS changes, order attribution column, halkin-specific flow (deposit, linked coworking order, questionnaire, admin review), `npm pack` smoke test, actual NPM publishing, migrating `swiftfood.uk/event-order` onto the widget. These are follow-up plans.

**Paths in this plan are absolute or relative to the widget repo root** (`/Users/thadoos/Coding/AllRestaurantApps/catering-widget/`), except where an existing `website/` file is referenced for porting — those use absolute paths.

---

## Reference map: what gets copied from `website/`

These files will be copied verbatim in Phase D, then edited in place. Line counts shown so the engineer knows what they're dealing with:

| Source (in `website/`) | Copied to (in widget repo) | Lines |
|---|---|---|
| `lib/components/catering/` (25 files + `contact/`, `modals/`, `dashboard/`, `hooks/` subdirs) | `packages/catering-widget/src/components/` | ~6000 |
| `context/CateringContext.tsx` | `packages/catering-widget/src/state/CateringStateContext.tsx` | 563 |
| `services/api/catering.api.ts` | `packages/catering-widget/src/api/endpoints/*.ts` (split) | 1083 |
| `types/catering.types.ts` | `packages/catering-widget/src/types/internal.ts` (partial) | — |
| `lib/utils/menuPdfUtils.ts` + `lib/components/pdf/CateringMenuPdf.tsx` | `packages/catering-widget/src/pdf/` | — |
| `lib/utils/catering-min-order-validation.ts` | `packages/catering-widget/src/utils/` | — |
| `lib/constants/api.ts` | Replaced by internal compile-time constant | — |
| `lib/api-client/auth-client.ts` | **Not copied.** Replaced by the internal API client | — |

`website/` is not modified at any point.

---

## File structure (target)

```
/Users/thadoos/Coding/AllRestaurantApps/catering-widget/
├── .gitignore
├── .npmrc
├── package.json                         # workspace root
├── tsconfig.base.json                   # shared TS config
├── README.md
├── packages/
│   └── catering-widget/
│       ├── package.json                 # the library
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── vitest.config.ts
│       ├── tailwind.config.ts
│       ├── postcss.config.cjs
│       ├── .storybook/
│       │   ├── main.ts
│       │   └── preview.tsx
│       ├── src/
│       │   ├── index.ts                 # public entry — re-exports
│       │   ├── CateringWidget.tsx       # public component
│       │   ├── config/
│       │   │   └── CateringConfigContext.tsx
│       │   ├── state/
│       │   │   ├── CateringStateContext.tsx
│       │   │   ├── navigation.ts        # WidgetView state machine
│       │   │   └── navigation.test.ts
│       │   ├── storage/
│       │   │   ├── storage.ts
│       │   │   └── storage.test.ts
│       │   ├── api/
│       │   │   ├── client.ts
│       │   │   ├── client.test.ts
│       │   │   ├── sessionToken.ts
│       │   │   ├── sessionToken.test.ts
│       │   │   ├── baseUrl.ts
│       │   │   └── endpoints/
│       │   │       ├── catering.ts
│       │   │       ├── menu.ts
│       │   │       ├── restaurants.ts
│       │   │       ├── bundles.ts
│       │   │       └── pricing.ts
│       │   ├── types/
│       │   │   ├── public.ts            # Theme, InitialData, OrderCompleteResult, etc.
│       │   │   └── internal.ts          # ported catering.types.ts
│       │   ├── components/              # copied from website/lib/components/catering/
│       │   │   └── (all the files)
│       │   ├── utils/
│       │   ├── pdf/
│       │   └── styles/
│       │       └── index.css            # Tailwind entry
│       ├── stories/
│       │   ├── CateringWidget.stories.tsx
│       │   └── (sub-component stories)
│       └── dist/                        # build output; gitignored
├── examples/
│   ├── next-app/
│   │   ├── package.json
│   │   ├── next.config.mjs
│   │   ├── tsconfig.json
│   │   └── app/
│   │       ├── layout.tsx
│   │       ├── globals.css
│   │       └── catering/page.tsx
│   └── vite-app/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           └── App.tsx
```

---

## Phase A — Monorepo & library scaffolding

### Task A1: Create sibling repo and workspace root

**Files:**
- Create: `/Users/thadoos/Coding/AllRestaurantApps/catering-widget/.gitignore`
- Create: `/Users/thadoos/Coding/AllRestaurantApps/catering-widget/package.json`
- Create: `/Users/thadoos/Coding/AllRestaurantApps/catering-widget/tsconfig.base.json`
- Create: `/Users/thadoos/Coding/AllRestaurantApps/catering-widget/README.md`
- Create: `/Users/thadoos/Coding/AllRestaurantApps/catering-widget/.npmrc`

- [ ] **Step 1: Create repo directory and init git**

```bash
mkdir -p /Users/thadoos/Coding/AllRestaurantApps/catering-widget
cd /Users/thadoos/Coding/AllRestaurantApps/catering-widget
git init -b main
```

- [ ] **Step 2: Write `.gitignore`**

```
node_modules
dist
.DS_Store
*.log
.env
.env.local
coverage
storybook-static
.turbo
.vscode
.idea
```

- [ ] **Step 3: Write workspace root `package.json`**

```json
{
  "name": "swift-catering-widget-monorepo",
  "private": true,
  "version": "0.0.0",
  "workspaces": [
    "packages/*",
    "examples/*"
  ],
  "scripts": {
    "build": "npm run build -w @swift/catering-widget",
    "dev": "npm run dev -w @swift/catering-widget",
    "test": "npm run test -w @swift/catering-widget",
    "storybook": "npm run storybook -w @swift/catering-widget",
    "example:next": "npm run dev -w @swift/catering-widget-example-next",
    "example:vite": "npm run dev -w @swift/catering-widget-example-vite"
  },
  "engines": {
    "node": ">=20"
  }
}
```

- [ ] **Step 4: Write `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": false
  }
}
```

- [ ] **Step 5: Write minimal `README.md`**

```markdown
# @swift/catering-widget

Embeddable Swift Food catering flow for partner websites.

## Packages

- `packages/catering-widget` — the library
- `examples/next-app` — Next.js host app demo
- `examples/vite-app` — Vite host app demo

## Quick start

```
npm install
npm run storybook
```

## Status

Early development. Public API is not yet stable; do not depend on it externally.
```

- [ ] **Step 6: Write `.npmrc`** (enables workspace protocol with npm)

```
save-exact=true
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: init workspace root for catering-widget monorepo"
```

---

### Task A2: Create the library package skeleton

**Files:**
- Create: `packages/catering-widget/package.json`
- Create: `packages/catering-widget/tsconfig.json`
- Create: `packages/catering-widget/src/index.ts`

- [ ] **Step 1: Create library directory**

```bash
mkdir -p packages/catering-widget/src
```

- [ ] **Step 2: Write `packages/catering-widget/package.json`**

```json
{
  "name": "@swift/catering-widget",
  "version": "0.0.0",
  "description": "Swift Food catering widget for partner sites",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    },
    "./dist/styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup && npm run build:css",
    "build:css": "tailwindcss -i src/styles/index.css -o dist/styles.css --minify",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "storybook": "storybook dev -p 6006",
    "storybook:build": "storybook build"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@react-pdf/renderer": "^4.3.1",
    "dayjs": "^1.11.13",
    "jwt-decode": "^4.0.0",
    "lucide-react": "^0.544.0",
    "react-day-picker": "^9.8.0",
    "react-hook-form": "^7.64.0",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/google.maps": "^3.58.1",
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "daisyui": "^5.0.43",
    "jsdom": "^25.0.1",
    "msw": "^2.7.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwindcss": "^4.1.14",
    "@tailwindcss/cli": "^4.1.14",
    "tsup": "^8.3.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 3: Write `packages/catering-widget/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["@types/google.maps", "node"],
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "stories/**", "**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"]
}
```

- [ ] **Step 4: Write placeholder `src/index.ts`** (real exports added later)

```ts
export const __WIDGET_VERSION__ = "0.0.0";
```

- [ ] **Step 5: Install from the repo root**

```bash
cd /Users/thadoos/Coding/AllRestaurantApps/catering-widget
npm install
```

Expected: workspaces link, no errors. If peer-dep warnings appear for react/react-dom, that's fine — we declare react as peer and install it as dev.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold @swift/catering-widget package"
```

---

### Task A3: tsup build config + smoke build

**Files:**
- Create: `packages/catering-widget/tsup.config.ts`

- [ ] **Step 1: Write `tsup.config.ts`**

```ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["react", "react-dom"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".mjs" };
  },
});
```

- [ ] **Step 2: Run the build**

```bash
cd packages/catering-widget
npm run build
```

Expected: `dist/index.mjs`, `dist/index.cjs`, `dist/index.d.ts` produced (CSS step may fail until Phase C — that's fine). If CSS step fails, run `npx tsup` directly to confirm JS build works.

- [ ] **Step 3: Verify output**

```bash
ls -la dist/
```

Expected: `index.mjs`, `index.cjs`, `index.d.ts` (and `.map` files) present.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add tsup build config"
```

---

### Task A4: Vitest setup + smoke test

**Files:**
- Create: `packages/catering-widget/vitest.config.ts`
- Create: `packages/catering-widget/src/test-setup.ts`
- Create: `packages/catering-widget/src/smoke.test.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 2: Write `test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write smoke test at `src/smoke.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { __WIDGET_VERSION__ } from "./index";

describe("smoke", () => {
  it("exports the version constant", () => {
    expect(__WIDGET_VERSION__).toBe("0.0.0");
  });
});
```

- [ ] **Step 4: Run**

```bash
npm test
```

Expected: 1 passing test.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add vitest with smoke test"
```

---

## Phase B — Core infrastructure modules (TDD)

### Task B1: Public types

**Files:**
- Create: `packages/catering-widget/src/types/public.ts`

- [ ] **Step 1: Write `src/types/public.ts`**

```ts
export interface Theme {
  primary?: string;
  radius?: string;
  font?: string;
}

export interface InitialData {
  eventName?: string;
  eventDate?: string;
  eventTime?: string;
  guestCount?: number;
  deliveryAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    lat?: number;
    lng?: number;
  };
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    organization?: string;
  };
}

export interface MealSessionItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  selectedAddons?: { name: string; price: number; quantity: number }[];
}

export interface MealSession {
  sessionName: string;
  sessionDate: string;
  eventTime: string;
  orderItems: MealSessionItem[];
}

export interface OrderSummary {
  eventName?: string;
  eventDate: string;
  total: number;
  currency: string;
  itemCount: number;
  restaurants: { id: string; name: string }[];
  deliveryAddress: { line1: string; city: string; postcode: string };
  contactEmail: string;
  mealSessions: MealSession[];
}

export interface OrderCompleteResult {
  orderId: string;
  accessToken: string;
  summary: OrderSummary;
}

export type WidgetErrorCode =
  | "session_failed"
  | "network_error"
  | "submit_failed"
  | "invalid_publishable_key"
  | "unknown";

export interface WidgetError {
  code: WidgetErrorCode;
  message: string;
  cause?: unknown;
}

export interface CateringWidgetProps {
  publishableKey: string;
  theme?: Theme;
  initialData?: InitialData;
  onReady?: () => void;
  onOrderComplete?: (result: OrderCompleteResult) => void;
  onError?: (error: WidgetError) => void;
}
```

- [ ] **Step 2: Re-export from `src/index.ts`**

Replace the current content of `src/index.ts` with:

```ts
export type {
  CateringWidgetProps,
  Theme,
  InitialData,
  MealSession,
  MealSessionItem,
  OrderSummary,
  OrderCompleteResult,
  WidgetError,
  WidgetErrorCode,
} from "./types/public";
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 4: Delete the smoke test file** (types-only module; further tests added for real modules next)

```bash
rm src/smoke.test.ts
```

**Note:** after this step, `npm test` will report "no tests found" until Task B2 adds the storage test. That's expected — don't treat it as a failure.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add public widget types"
```

---

### Task B2: Namespaced storage module

**Files:**
- Create: `packages/catering-widget/src/storage/storage.ts`
- Create: `packages/catering-widget/src/storage/storage.test.ts`

**Why separate module:** every `localStorage` call in the widget routes through here, prefixed by `swift:${partnerId}:catering:`. Until a real partnerId exists (post-backend), we use `"stub"` as the partner namespace.

- [ ] **Step 1: Write the failing test**

```ts
// src/storage/storage.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { createStorage, type Storage } from "./storage";

describe("createStorage", () => {
  let storage: Storage;

  beforeEach(() => {
    localStorage.clear();
    storage = createStorage("abc");
  });

  it("prefixes keys with swift:<partnerId>:catering:", () => {
    storage.setItem("foo", "bar");
    expect(localStorage.getItem("swift:abc:catering:foo")).toBe("bar");
  });

  it("returns null for missing keys", () => {
    expect(storage.getItem("nope")).toBeNull();
  });

  it("reads a value written through itself", () => {
    storage.setItem("cart", JSON.stringify({ items: 3 }));
    expect(storage.getItem("cart")).toBe('{"items":3}');
  });

  it("removeItem deletes only the namespaced key", () => {
    localStorage.setItem("unrelated", "keep me");
    storage.setItem("foo", "bar");
    storage.removeItem("foo");
    expect(storage.getItem("foo")).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep me");
  });

  it("clear() removes only keys in this namespace", () => {
    localStorage.setItem("unrelated", "keep me");
    storage.setItem("a", "1");
    storage.setItem("b", "2");
    storage.clear();
    expect(storage.getItem("a")).toBeNull();
    expect(storage.getItem("b")).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("keep me");
  });

  it("does not collide across different partnerIds", () => {
    const other = createStorage("xyz");
    storage.setItem("k", "from-abc");
    other.setItem("k", "from-xyz");
    expect(storage.getItem("k")).toBe("from-abc");
    expect(other.getItem("k")).toBe("from-xyz");
  });

  it("uses in-memory storage when explicitly opted in via driver: 'memory'", () => {
    const s = createStorage("abc", { driver: "memory" });
    s.setItem("k", "v");
    expect(s.getItem("k")).toBe("v");
    expect(localStorage.getItem("swift:abc:catering:k")).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

```bash
npm test -- storage
```

Expected: FAIL — "Cannot find module './storage'".

- [ ] **Step 3: Implement `src/storage/storage.ts`**

```ts
export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

interface CreateStorageOptions {
  driver?: "localStorage" | "memory";
}

export function createStorage(
  partnerId: string,
  opts: CreateStorageOptions = {}
): Storage {
  const prefix = `swift:${partnerId}:catering:`;
  const driver = opts.driver ?? detectDriver();

  if (driver === "memory") {
    const mem = new Map<string, string>();
    return {
      getItem: (k) => mem.get(prefix + k) ?? null,
      setItem: (k, v) => void mem.set(prefix + k, v),
      removeItem: (k) => void mem.delete(prefix + k),
      clear: () => {
        for (const k of Array.from(mem.keys())) {
          if (k.startsWith(prefix)) mem.delete(k);
        }
      },
    };
  }

  return {
    getItem: (k) => localStorage.getItem(prefix + k),
    setItem: (k, v) => localStorage.setItem(prefix + k, v),
    removeItem: (k) => localStorage.removeItem(prefix + k),
    clear: () => {
      const toRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) toRemove.push(k);
      }
      for (const k of toRemove) localStorage.removeItem(k);
    },
  };
}

function detectDriver(): "localStorage" | "memory" {
  try {
    if (typeof localStorage === "undefined") return "memory";
    const probe = "__swift_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return "localStorage";
  } catch {
    return "memory";
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test -- storage
```

Expected: all 7 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add namespaced storage module"
```

---

### Task B3: Session token stub + cache

**Files:**
- Create: `packages/catering-widget/src/api/sessionToken.ts`

**Why this exists as a stub:** the real backend endpoint `POST /widget/session` does not exist yet. The widget's API client is built to call it, cache the JWT, and refresh on 401. Until the endpoint ships, this module returns a synthetic token with a 30-minute expiry. The *shape* matches production; only the fetch is a stub. When the backend lands, swapping in a real `fetch` call is a one-file change.

**Why no tests at this layer:** the module is a deliberate throwaway stub, and its only real behaviours (cache, invalidate, refresh-on-expiry) are exercised end-to-end by the API client tests in Task B4. Testing `Date.now()` math at two layers is duplication. When the real handshake lands — real fetch, real error paths — tests get written then, against the real module.

- [ ] **Step 1: Implement `src/api/sessionToken.ts`**

```ts
export interface SessionToken {
  token: string;
  expiresAt: string;
}

export interface SessionTokenClient {
  getToken(): Promise<SessionToken>;
  invalidate(): void;
}

interface Options {
  publishableKey: string;
}

const EXPIRY_MS = 30 * 60 * 1000;

export function createSessionTokenClient(opts: Options): SessionTokenClient {
  let cached: SessionToken | null = null;
  let counter = 0;

  const fetchToken = async (): Promise<SessionToken> => {
    // STUB: real implementation will POST to /widget/session with
    // { publishableKey: opts.publishableKey } and read the response.
    // For now, mint a synthetic token locally.
    if (!opts.publishableKey) {
      throw new Error("publishableKey is required");
    }
    counter += 1;
    return {
      token: `stub_${opts.publishableKey}_${counter}`,
      expiresAt: new Date(Date.now() + EXPIRY_MS).toISOString(),
    };
  };

  const isExpired = (t: SessionToken): boolean =>
    Date.parse(t.expiresAt) <= Date.now();

  return {
    async getToken() {
      if (!cached || isExpired(cached)) {
        cached = await fetchToken();
      }
      return cached;
    },
    invalidate() {
      cached = null;
    },
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add session-token stub with cache and expiry"
```

---

### Task B4: API client with 401 retry

**Files:**
- Create: `packages/catering-widget/src/api/baseUrl.ts`
- Create: `packages/catering-widget/src/api/client.ts`
- Create: `packages/catering-widget/src/api/client.test.ts`

**Context:** the real catering endpoints (`/menu-item/catering`, `/catering-orders`, `/pricing/catering-verify-cart`, `/catering-bundles`, etc.) already exist on `api.swiftfood.uk` and accept public (unauthenticated) requests today. The client attaches `Authorization: Bearer <stub-token>` on every call — the backend will ignore the header on endpoints that have no guard, so this is harmless and keeps the full shape ready for when the widget session guard ships.

- [ ] **Step 1: Write `src/api/baseUrl.ts`**

```ts
export const DEFAULT_API_BASE_URL = "https://api.swiftfood.uk";

export function resolveBaseUrl(override?: string): string {
  if (override) return override.replace(/\/$/, "");
  const envUrl =
    typeof process !== "undefined" &&
    (process.env?.SWIFT_WIDGET_API_URL as string | undefined);
  return (envUrl ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");
}
```

- [ ] **Step 2: Write the failing test**

```ts
// src/api/client.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createApiClient } from "./client";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("apiClient", () => {
  it("attaches Authorization: Bearer <token> to every request", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = createApiClient({ publishableKey: "pk_live_x" });
    await client.request("/menu-item/catering", { method: "GET" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toMatch(/^Bearer stub_/);
  });

  it("sends Content-Type: application/json for POST bodies", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = createApiClient({ publishableKey: "pk_live_x" });
    await client.request("/catering-orders", {
      method: "POST",
      body: JSON.stringify({ foo: 1 }),
    });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers["Content-Type"]).toBe("application/json");
  });

  it("on 401 invalidates the token, refreshes, and retries once", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: "expired" }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = createApiClient({ publishableKey: "pk_live_x" });
    const res = await client.request("/menu-item/catering", { method: "GET" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstToken = fetchMock.mock.calls[0][1].headers.Authorization;
    const secondToken = fetchMock.mock.calls[1][1].headers.Authorization;
    expect(firstToken).not.toBe(secondToken);
    expect(res.status).toBe(200);
  });

  it("does not retry twice on a second 401", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, { error: "x" }))
      .mockResolvedValueOnce(jsonResponse(401, { error: "x" }));
    const client = createApiClient({ publishableKey: "pk_live_x" });
    const res = await client.request("/any", { method: "GET" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(401);
  });

  it("prepends baseUrl correctly", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, {}));
    const client = createApiClient({
      publishableKey: "pk_live_x",
      baseUrl: "http://localhost:3001",
    });
    await client.request("/menu-item/catering");
    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://localhost:3001/menu-item/catering"
    );
  });

  it("parses JSON bodies via requestJson()", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { hello: "world" }));
    const client = createApiClient({ publishableKey: "pk_live_x" });
    const data = await client.requestJson<{ hello: string }>("/x");
    expect(data).toEqual({ hello: "world" });
  });

  it("requestJson throws a WidgetError on non-2xx", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { msg: "boom" }));
    const client = createApiClient({ publishableKey: "pk_live_x" });
    await expect(client.requestJson("/x")).rejects.toMatchObject({
      code: "network_error",
    });
  });
});
```

- [ ] **Step 3: Run to verify failure**

```bash
npm test -- client
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `src/api/client.ts`**

```ts
import { createSessionTokenClient, type SessionTokenClient } from "./sessionToken";
import { resolveBaseUrl } from "./baseUrl";
import type { WidgetError } from "../types/public";

export interface ApiClientOptions {
  publishableKey: string;
  baseUrl?: string;
}

export interface ApiClient {
  request(path: string, init?: RequestInit): Promise<Response>;
  requestJson<T>(path: string, init?: RequestInit): Promise<T>;
}

export function createApiClient(opts: ApiClientOptions): ApiClient {
  const baseUrl = resolveBaseUrl(opts.baseUrl);
  const sessionClient: SessionTokenClient = createSessionTokenClient({
    publishableKey: opts.publishableKey,
  });

  const requestOnce = async (
    path: string,
    init: RequestInit
  ): Promise<Response> => {
    const { token } = await sessionClient.getToken();
    const headers: Record<string, string> = {
      ...(init.headers as Record<string, string> | undefined),
      Authorization: `Bearer ${token}`,
    };
    if (init.body && !("Content-Type" in headers)) {
      headers["Content-Type"] = "application/json";
    }
    return fetch(`${baseUrl}${path}`, { ...init, headers });
  };

  const request = async (
    path: string,
    init: RequestInit = {}
  ): Promise<Response> => {
    const first = await requestOnce(path, init);
    if (first.status !== 401) return first;
    sessionClient.invalidate();
    return requestOnce(path, init);
  };

  const requestJson = async <T>(
    path: string,
    init: RequestInit = {}
  ): Promise<T> => {
    const res = await request(path, init);
    if (!res.ok) {
      const err: WidgetError = {
        code: "network_error",
        message: `Request failed: ${res.status} ${res.statusText}`,
      };
      throw err;
    }
    return (await res.json()) as T;
  };

  return { request, requestJson };
}
```

- [ ] **Step 5: Run**

```bash
npm test -- client
```

Expected: all 7 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add API client with 401 retry and JSON helper"
```

---

### Task B5: Port internal types

**Files:**
- Create: `packages/catering-widget/src/types/internal.ts`

This task runs before the endpoint modules (Task B6) because those modules import the types defined here. If you flip the order, Task B6's typecheck step fails with missing types.

- [ ] **Step 1: Copy `website/types/catering.types.ts` into the widget**

```bash
cp /Users/thadoos/Coding/AllRestaurantApps/website/types/catering.types.ts \
   packages/catering-widget/src/types/internal.ts
```

- [ ] **Step 2: Review the copied file**

Read the file. Remove any types that pull in `@/` imports (those won't resolve). For each `@/`-prefixed import, either:
- Inline the referenced type if small, or
- Copy the source type into `internal.ts`.

Do NOT add type re-exports from third-party packages that aren't widget deps (e.g., if the file imports anything Stripe-related, delete those types — the widget does not handle payment).

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: clean. If errors remain, inline or delete until clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: port internal catering types"
```

---

### Task B6: Typed endpoint modules

**Files:**
- Create: `packages/catering-widget/src/api/endpoints/restaurants.ts`
- Create: `packages/catering-widget/src/api/endpoints/menu.ts`
- Create: `packages/catering-widget/src/api/endpoints/bundles.ts`
- Create: `packages/catering-widget/src/api/endpoints/pricing.ts`
- Create: `packages/catering-widget/src/api/endpoints/catering.ts`
- Create: `packages/catering-widget/src/api/endpoints/index.ts`

**Approach — port, don't invent.** The existing `website/services/api/catering.api.ts` (1083 lines) is the **source of truth** for every URL, every query param, every request/response shape. Do not guess. The work is mechanical: for each method the widget needs, copy its path and body shape verbatim, then rewire the call from `fetchWithAuth` to `client.requestJson`. Methods are split across files by resource.

- [ ] **Step 1: Inventory the methods the widget needs**

Open `website/services/api/catering.api.ts` and scan for exported methods. Bucket each one into:

- **Keep (widget uses it):** menu search, restaurant listing, bundle listing, pricing verification, order submission, promo code application.
- **Exclude (not widget-relevant):** anything that calls Stripe, anything that requires user auth (saved cards, corporate user endpoints, order history by user), anything tied to admin/restaurant-owner flows.

Produce a written list mapping each kept method to its destination file (`restaurants.ts` / `menu.ts` / `bundles.ts` / `pricing.ts` / `catering.ts`).

Use the Grep tool on `website/services/api/catering.api.ts` to find method declarations (pattern: `async\s+\w+\s*\(`). Record each method name, its HTTP verb, its URL path, its request body shape (if POST/PUT), and its return type.

- [ ] **Step 2: Port one method end-to-end as a template**

Pick the simplest kept method — typically a plain GET that lists something. Copy the path and types verbatim from the source, then translate the fetch call.

Pattern:

```ts
// BEFORE — in website/services/api/catering.api.ts
async listForCatering(): Promise<CateringRestaurantSummary[]> {
  const res = await fetchWithAuth(`${API_BASE_URL}/restaurants/catering`);
  if (!res.ok) throw new Error(...);
  return res.json();
}

// AFTER — in packages/catering-widget/src/api/endpoints/restaurants.ts
import type { ApiClient } from "../client";
import type { CateringRestaurantSummary } from "../../types/internal";

export function createRestaurantsApi(client: ApiClient) {
  return {
    listForCatering: (): Promise<CateringRestaurantSummary[]> =>
      client.requestJson<CateringRestaurantSummary[]>("/restaurants/catering"),
  };
}
```

Key rules:
- **Path:** literal copy from the source, including any hyphens, plurals, or quirks. Do not rewrite for consistency.
- **Query params:** copy the key names and encoding behavior verbatim. If the source uses `URLSearchParams`, match it.
- **Request body:** copy the exact field names the source sends. If the backend expects `restaurantId` (camelCase), don't "clean it up" to snake_case.
- **Return type:** use the exact type the source returned. Types come from `../../types/internal` (ported in Task B5).
- **No base URL:** `client.requestJson` prepends the base URL itself. Don't re-prepend `API_BASE_URL`.
- **Error handling:** drop the manual `!res.ok` check — `client.requestJson` throws a `WidgetError` automatically.

- [ ] **Step 3: Port the remaining methods, one file at a time**

Go through the inventory from Step 1 and port each method using the pattern from Step 2. One commit per file is fine. Order: start with the simplest GET-only files (`restaurants.ts`, `bundles.ts`), then `menu.ts`, then the POST-bearing files (`pricing.ts`, `catering.ts`).

When a method takes a request body, mirror the body shape exactly. Example for a POST:

```ts
// AFTER
verifyCart: (payload: CateringVerifyCartPayload): Promise<CateringPricingResult> =>
  client.requestJson<CateringPricingResult>("/pricing/catering-verify-cart", {
    method: "POST",
    body: JSON.stringify(payload),
  }),
```

The `CateringVerifyCartPayload` and `CateringPricingResult` types come from `../../types/internal`. If the source used an inline type or an untyped payload, define a named interface in `internal.ts` so the widget's port is typed end-to-end.

- [ ] **Step 4: Write `src/api/endpoints/index.ts`**

```ts
import type { ApiClient } from "../client";
import { createRestaurantsApi } from "./restaurants";
import { createMenuApi } from "./menu";
import { createBundlesApi } from "./bundles";
import { createPricingApi } from "./pricing";
import { createCateringApi } from "./catering";

export function createApiEndpoints(client: ApiClient) {
  return {
    restaurants: createRestaurantsApi(client),
    menu: createMenuApi(client),
    bundles: createBundlesApi(client),
    pricing: createPricingApi(client),
    catering: createCateringApi(client),
  };
}

export type ApiEndpoints = ReturnType<typeof createApiEndpoints>;
```

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

Expected: no errors. Internal types (`CateringMenuItem`, `CateringCategory`, etc.) are already available from Task B5.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add typed API endpoint modules"
```

---

### Task B7: Navigation state machine

**Files:**
- Create: `packages/catering-widget/src/state/navigation.ts`
- Create: `packages/catering-widget/src/state/navigation.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/state/navigation.test.ts
import { describe, it, expect } from "vitest";
import { navReducer, initialView, type NavAction } from "./navigation";

describe("navReducer", () => {
  it("starts on restaurant-list", () => {
    expect(initialView).toEqual({ kind: "restaurant-list" });
  });

  it("OPEN_RESTAURANT moves to restaurant-menu", () => {
    const next = navReducer(initialView, {
      kind: "OPEN_RESTAURANT",
      restaurantId: "r1",
    });
    expect(next).toEqual({ kind: "restaurant-menu", restaurantId: "r1" });
  });

  it("BACK_TO_LIST from menu returns to list", () => {
    const onMenu = navReducer(initialView, {
      kind: "OPEN_RESTAURANT",
      restaurantId: "r1",
    });
    expect(navReducer(onMenu, { kind: "BACK_TO_LIST" })).toEqual({
      kind: "restaurant-list",
    });
  });

  it("GO_TO_CHECKOUT from any view lands on checkout", () => {
    const go: NavAction = { kind: "GO_TO_CHECKOUT" };
    expect(navReducer({ kind: "restaurant-list" }, go).kind).toBe("checkout");
    expect(
      navReducer({ kind: "restaurant-menu", restaurantId: "r2" }, go).kind
    ).toBe("checkout");
  });

  it("BACK_TO_LIST from checkout returns to list", () => {
    expect(
      navReducer({ kind: "checkout" }, { kind: "BACK_TO_LIST" })
    ).toEqual({ kind: "restaurant-list" });
  });

  it("unknown action returns prior state", () => {
    const s = { kind: "checkout" as const };
    // @ts-expect-error — testing exhaustive default
    expect(navReducer(s, { kind: "NOPE" })).toBe(s);
  });
});
```

- [ ] **Step 2: Verify failure**

```bash
npm test -- navigation
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/state/navigation.ts`**

```ts
export type WidgetView =
  | { kind: "restaurant-list" }
  | { kind: "restaurant-menu"; restaurantId: string }
  | { kind: "checkout" };

export type NavAction =
  | { kind: "OPEN_RESTAURANT"; restaurantId: string }
  | { kind: "BACK_TO_LIST" }
  | { kind: "GO_TO_CHECKOUT" };

export const initialView: WidgetView = { kind: "restaurant-list" };

export function navReducer(state: WidgetView, action: NavAction): WidgetView {
  switch (action.kind) {
    case "OPEN_RESTAURANT":
      return { kind: "restaurant-menu", restaurantId: action.restaurantId };
    case "BACK_TO_LIST":
      return { kind: "restaurant-list" };
    case "GO_TO_CHECKOUT":
      return { kind: "checkout" };
    default:
      return state;
  }
}
```

- [ ] **Step 4: Run**

```bash
npm test -- navigation
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add widget view navigation state machine"
```

---

### Task B8: Config context

**Files:**
- Create: `packages/catering-widget/src/config/CateringConfigContext.tsx`

- [ ] **Step 1: Implement the config context**

```tsx
// src/config/CateringConfigContext.tsx
import { createContext, useContext, type ReactNode } from "react";
import type {
  Theme,
  InitialData,
  OrderCompleteResult,
  WidgetError,
} from "../types/public";
import type { ApiEndpoints } from "../api/endpoints";
import type { Storage } from "../storage/storage";

export interface CateringConfig {
  publishableKey: string;
  partnerId: string;
  theme?: Theme;
  initialData?: InitialData;
  onReady?: () => void;
  onOrderComplete?: (result: OrderCompleteResult) => void;
  onError?: (error: WidgetError) => void;
  api: ApiEndpoints;
  storage: Storage;
}

const CateringConfigContext = createContext<CateringConfig | null>(null);

export function CateringConfigProvider({
  value,
  children,
}: {
  value: CateringConfig;
  children: ReactNode;
}) {
  return (
    <CateringConfigContext.Provider value={value}>
      {children}
    </CateringConfigContext.Provider>
  );
}

export function useCateringConfig(): CateringConfig {
  const ctx = useContext(CateringConfigContext);
  if (!ctx) {
    throw new Error(
      "useCateringConfig must be used inside <CateringWidget>. " +
        "If you see this error, a component was rendered outside the widget tree."
    );
  }
  return ctx;
}

export function useApiClient(): ApiEndpoints {
  return useCateringConfig().api;
}

export function useStorage(): Storage {
  return useCateringConfig().storage;
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add CateringConfigContext with api/storage hooks"
```

---

### Task B9: Port state context (minus localStorage)

**Files:**
- Create: `packages/catering-widget/src/state/CateringStateContext.tsx`

**Approach:** copy the existing `website/context/CateringContext.tsx`, then systematically replace every direct `localStorage.*` call with a `storage.*` call obtained from `useStorage()`.

- [ ] **Step 1: Copy the source file**

```bash
cp /Users/thadoos/Coding/AllRestaurantApps/website/context/CateringContext.tsx \
   packages/catering-widget/src/state/CateringStateContext.tsx
```

- [ ] **Step 2: Rename the context, provider, and hook**

Open `src/state/CateringStateContext.tsx`. Rename:
- `CateringContext` → `CateringStateContext`
- `CateringProvider` → `CateringStateProvider`
- `useCatering` → `useCateringState`

- [ ] **Step 3: Replace every `localStorage.*` call**

Every call site identified in the reference map:
- `localStorage.getItem(KEY)` → `storage.getItem(KEY)`
- `localStorage.setItem(KEY, VAL)` → `storage.setItem(KEY, VAL)`
- `localStorage.removeItem(KEY)` → `storage.removeItem(KEY)`
- `Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))` → `storage.clear()` (since our storage namespaces all keys under the widget prefix, `clear()` only wipes widget keys — which is exactly what this code wanted).

`storage` is obtained via `const storage = useStorage();` inside the provider body.

- [ ] **Step 4: Fix `@/` imports**

Replace:
- `@/types/catering.types` → `../types/internal`
- `@/services/...` — remove; the service is now injected via config
- any other `@/...` path — either copy the file in or inline the usage

- [ ] **Step 5: Remove `STORAGE_KEYS` external-facing semantics**

The key names continue to exist as constants, but they're now relative (the namespacing is added by the storage module). Keep the enum as-is; its values (`"catering_current_step"`, etc.) become the unprefixed portion.

- [ ] **Step 6: Integrate the navigation state machine**

Remove the existing ad-hoc navigation state (likely named `currentStep` or similar) from the ported context, and replace it with the `WidgetView` reducer from Task B7. Inside `CateringStateProvider`:

```tsx
import { useReducer } from "react";
import { navReducer, initialView, type WidgetView, type NavAction } from "./navigation";

// inside the provider body:
const [view, dispatchView] = useReducer(navReducer, initialView);

// expose via the context value:
const value = {
  // ... existing fields
  view,
  dispatchView,
};
```

And update the context's TypeScript shape to include:

```ts
export interface CateringStateContextValue {
  // ... existing fields
  view: WidgetView;
  dispatchView: (action: NavAction) => void;
}
```

Persist `view` through storage so a refresh restores the same screen:

```tsx
useEffect(() => {
  storage.setItem("view", JSON.stringify(view));
}, [view, storage]);
```

And on initial load, hydrate `view` from storage by using a lazy initializer on `useReducer`.

- [ ] **Step 7: Typecheck**

```bash
npm run typecheck
```

Expected: clean. Fix any residual `@/` import or type error.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: port catering state context with namespaced storage and navigation"
```

---

## Phase C — Styling pipeline

### Task C1: Tailwind + DaisyUI build config

**Files:**
- Create: `packages/catering-widget/tailwind.config.ts`
- Create: `packages/catering-widget/postcss.config.cjs`
- Create: `packages/catering-widget/src/styles/index.css`

Tailwind 4 uses a CSS-first config (`@import "tailwindcss"` + `@theme`), but we still want a `content` entry so tree-shaking scans our source. For a library that produces a standalone CSS file, the CLI approach is simplest: `tailwindcss -i src/styles/index.css -o dist/styles.css`.

- [ ] **Step 1: Write `src/styles/index.css`**

```css
@import "tailwindcss";
@plugin "daisyui";

/* All widget styles are scoped under .swift-catering-widget so they do not
   bleed into host pages. The root class is applied by <CateringWidget>. */
@layer base {
  .swift-catering-widget {
    /* Theme CSS custom properties, overridable per instance via the theme prop. */
    --swift-primary: #ff5a1f;
    --swift-radius: 0.5rem;
    --swift-font: ui-sans-serif, system-ui, sans-serif;
    font-family: var(--swift-font);
    color: #111;
  }
}

@layer components {
  .swift-catering-widget .swift-btn-primary {
    background-color: var(--swift-primary);
    border-radius: var(--swift-radius);
    color: white;
    padding: 0.5rem 1rem;
  }
}
```

- [ ] **Step 2: Write `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Run the CSS build**

```bash
npm run build:css
```

Expected: `dist/styles.css` exists and contains the `.swift-catering-widget` rules plus the Tailwind reset.

- [ ] **Step 4: Full build smoke**

```bash
npm run build
```

Expected: both JS and CSS produced in `dist/`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add tailwind + daisyui css pipeline"
```

---

### Task C2: Google Maps API key

**Files:**
- Create: `packages/catering-widget/src/config/googleMaps.ts`

The ported address-autocomplete field in `Step3ContactDetails.tsx` uses the Google Maps JavaScript API, which is loaded with an API key. Today `website/` reads `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` from env — the widget cannot depend on that because the host's env is not ours.

**Approach:** bake Swift's public Maps key in as a compile-time constant in the widget. The Maps key is restricted server-side by allowed referrers and bundle-level usage quotas, so shipping it to partner browsers is no different from shipping it to `swiftfood.uk` browsers.

- [ ] **Step 1: Write `src/config/googleMaps.ts`**

```ts
// Swift Food's public Google Maps API key. Restricted via Google Cloud
// Console to the referrers where the widget is allowed to load.
const PLACEHOLDER = "__REPLACE_AT_BUILD_TIME__";

export const GOOGLE_MAPS_API_KEY =
  process.env.SWIFT_WIDGET_GOOGLE_MAPS_KEY ?? PLACEHOLDER;

// Runtime guard: if the widget ships with an empty or unreplaced key,
// the Maps script will silently fail to load — which is maddening to
// debug. Warn loudly at module evaluation so the bundle log shows it.
if (
  typeof window !== "undefined" &&
  (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === PLACEHOLDER)
) {
  // eslint-disable-next-line no-console
  console.warn(
    "[@swift/catering-widget] Google Maps API key was not injected at build " +
      "time. The address-autocomplete field will not work. Set " +
      "SWIFT_WIDGET_GOOGLE_MAPS_KEY before running the widget build."
  );
}
```

The final value is injected by `tsup` at build time. Update `tsup.config.ts`:

```ts
// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  external: ["react", "react-dom"],
  env: {
    SWIFT_WIDGET_GOOGLE_MAPS_KEY:
      process.env.SWIFT_WIDGET_GOOGLE_MAPS_KEY ?? "",
  },
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".mjs" };
  },
});
```

- [ ] **Step 2: In the ported `Step3ContactDetails.tsx`, replace every reference to the env var**

Find any usage like `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and replace with:

```ts
import { GOOGLE_MAPS_API_KEY } from "../config/googleMaps";
```

- [ ] **Step 3: Document the env requirement**

Add to `packages/catering-widget/README.md` (create if not present):

```markdown
## Build-time configuration

Set `SWIFT_WIDGET_GOOGLE_MAPS_KEY` before building the library so the Maps
script loads with the correct key. CI publishes with the production key;
local development can use a restricted dev key.
```

- [ ] **Step 4: Verify the build still succeeds**

```bash
SWIFT_WIDGET_GOOGLE_MAPS_KEY=dev_placeholder npm run build
grep -l "dev_placeholder" dist/
```

Expected: the string appears somewhere in the bundle.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: inject google maps api key at build time"
```

---

## Phase D — Port existing components

**This is the largest chunk of mechanical work.** Expect ~30 files to copy + edit. Tasks are bundled by intent; each commit represents a clean, passing typecheck.

### Task D1: Copy component tree verbatim

**Files:**
- Copy: `website/lib/components/catering/**` → `packages/catering-widget/src/components/`
- Copy: `website/lib/utils/menuPdfUtils.ts` → `packages/catering-widget/src/utils/menuPdfUtils.ts`
- Copy: `website/lib/utils/catering-min-order-validation.ts` → `packages/catering-widget/src/utils/catering-min-order-validation.ts`
- Copy: `website/lib/components/pdf/CateringMenuPdf.tsx` → `packages/catering-widget/src/pdf/CateringMenuPdf.tsx`

- [ ] **Step 1: Copy the component directory**

```bash
mkdir -p packages/catering-widget/src/components
cp -R /Users/thadoos/Coding/AllRestaurantApps/website/lib/components/catering/. \
      packages/catering-widget/src/components/
```

- [ ] **Step 2: Copy the util files and PDF renderer**

```bash
mkdir -p packages/catering-widget/src/utils packages/catering-widget/src/pdf
cp /Users/thadoos/Coding/AllRestaurantApps/website/lib/utils/menuPdfUtils.ts \
   packages/catering-widget/src/utils/
cp /Users/thadoos/Coding/AllRestaurantApps/website/lib/utils/catering-min-order-validation.ts \
   packages/catering-widget/src/utils/
cp /Users/thadoos/Coding/AllRestaurantApps/website/lib/components/pdf/CateringMenuPdf.tsx \
   packages/catering-widget/src/pdf/
```

- [ ] **Step 3: Typecheck (expect a cascade of errors — that's fine)**

```bash
npm run typecheck
```

Expected: many errors about `@/...` imports, `next/navigation`, `next/image`, and `useCatering` being renamed. Do **not** fix here — this is a snapshot commit so subsequent edits have a clean diff.

- [ ] **Step 4: Commit the raw copy**

```bash
git add -A
git commit -m "chore: copy catering components from website into widget (unchanged)"
```

---

### Task D2: Sweep — replace `@/` imports with relative paths

**Files:** every `.ts`/`.tsx` file under `packages/catering-widget/src/components/`, `src/utils/`, `src/pdf/`.

Mapping table:

| Old import | New import |
|---|---|
| `@/context/CateringContext` | `../state/CateringStateContext` (adjust `..` depth) |
| `@/types/catering.types` | `../types/internal` |
| `@/services/api/catering.api` | **remove**; use `useApiClient()` from config |
| `@/lib/utils/menuPdfUtils` | `../utils/menuPdfUtils` |
| `@/lib/utils/catering-min-order-validation` | `../utils/catering-min-order-validation` |
| `@/lib/components/pdf/CateringMenuPdf` | `../pdf/CateringMenuPdf` |
| `@/lib/constants/api` | **remove**; the API client owns base URL |
| `@/lib/api-client/auth-client` | **remove**; replaced by API client via hook |
| `@/app/...` | copy the referenced file into widget OR inline its logic |

- [ ] **Step 1: Do a repo-wide grep first to see the full import set**

```bash
cd packages/catering-widget
```

Use Grep tool to list every `from "@/` in `src/`.

- [ ] **Step 2: Apply the mapping file-by-file**

For each file, open it and replace imports per the table. When replacing a `cateringService.foo(...)` call:

```tsx
// before
import { cateringService } from "@/services/api/catering.api";
// ...
const data = await cateringService.submitOrder(payload);

// after
import { useApiClient } from "../config/CateringConfigContext";
// at the top of the component function body:
const api = useApiClient();
// ...
const data = await api.catering.submitOrder(payload);
```

If the call happens outside a React component (e.g., in a utility), the utility must accept an `api` argument instead.

- [ ] **Step 3: Rename `useCatering` → `useCateringState` throughout**

Use Grep + Edit to replace all `useCatering(` call sites and the corresponding import path.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: fewer errors; remaining ones are `next/navigation` and `next/image`. Those are the next task.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: rewire catering components to internal imports"
```

---

### Task D3: Remove `next/navigation` usage

**Files:** `CateringOrderBuilder.tsx`, `Menu.tsx`, `Step3ContactDetails.tsx`, `Step2MenuItems.tsx` (all in `src/components/`).

Per the spec (design §3.1), replace `useRouter` / `useSearchParams` with internal navigation + host callbacks.

- [ ] **Step 1: `Step3ContactDetails.tsx` — submit path**

Find the code that, after successful order submission, calls something like:

```tsx
router.push(`/event-order/view/${accessToken}`);
```

Replace with:

```tsx
import { useCateringConfig } from "../config/CateringConfigContext";
// ...
const { onOrderComplete } = useCateringConfig();
// after submit succeeds:
onOrderComplete?.({
  orderId,
  accessToken,
  summary: buildOrderSummary(state),  // see below
});
```

`buildOrderSummary` is a new pure helper that constructs the `OrderSummary` from the current state. Write it inline at the bottom of the file:

```tsx
function buildOrderSummary(state: /* context state type */): OrderSummary {
  return {
    eventName: state.eventDetails?.eventName,
    eventDate: state.eventDetails?.eventDate ?? "",
    total: state.pricing?.total ?? 0,
    currency: "GBP",
    itemCount: state.mealSessions.reduce(
      (n, s) => n + s.orderItems.reduce((m, i) => m + i.quantity, 0),
      0
    ),
    restaurants: state.selectedRestaurants.map((r) => ({ id: r.id, name: r.name })),
    deliveryAddress: {
      line1: state.contactInfo.addressLine1 ?? "",
      city: state.contactInfo.city ?? "",
      postcode: state.contactInfo.postcode ?? "",
    },
    contactEmail: state.contactInfo.email ?? "",
    mealSessions: state.mealSessions.map((s) => ({
      sessionName: s.sessionName,
      sessionDate: s.sessionDate,
      eventTime: s.eventTime,
      orderItems: s.orderItems.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        selectedAddons: i.selectedAddons,
      })),
    })),
  };
}
```

Field names must match whatever the state context actually exposes — the engineer reads the context file to confirm before committing. Delete the `router` + `searchParams` imports and calls.

- [ ] **Step 2: `Menu.tsx` — navigation between views**

Replace URL-based navigation with `dispatchView` from the state context (wired up in Task B9 Step 6). The host URL must not change.

```tsx
// before
import { useRouter } from "next/navigation";
const router = useRouter();
// ...
onClick={() => router.push(`/event-order/menu/${restaurantId}`)}

// after
import { useCateringState } from "../state/CateringStateContext";
const { dispatchView } = useCateringState();
// ...
onClick={() => dispatchView({ kind: "OPEN_RESTAURANT", restaurantId })}
```

For "go to checkout" transitions: `dispatchView({ kind: "GO_TO_CHECKOUT" })`.
For "back to list": `dispatchView({ kind: "BACK_TO_LIST" })`.

If a component previously read from `searchParams` to derive which restaurant was selected, it now reads `view.restaurantId` from the state context (type-narrowing on `view.kind === "restaurant-menu"`).

- [ ] **Step 3: `CateringOrderBuilder.tsx`, `Step2MenuItems.tsx` — remove `useSearchParams`**

If `useSearchParams` was being read for widget-internal state (unlikely but check), port that state into the state context. If unused (per design §3.1, it was unused for catering), just delete the hook call and import.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: no `next/navigation` errors remain. Any residual errors likely relate to the shape of `state` in `buildOrderSummary` — fix by aligning field names with the state context.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor: replace next/navigation with internal state + callbacks"
```

---

### Task D4: Replace `next/image` with plain `<img>`

**Files:** `EventPhotosDisplay.tsx`, `MenuItemModal.tsx`, `MenuItemCard.tsx`, `modals/BundleDetailModal.tsx`.

`next/image` does image optimization via the Next server. The widget cannot require that. Use a plain `<img>` with the original `src` — partner hosts' Next servers won't proxy images, but image URLs are already absolute (coming from the backend).

- [ ] **Step 1: For each file, replace the import and the element**

```tsx
// before
import Image from "next/image";
<Image src={url} width={w} height={h} alt={alt} className={cls} />

// after
<img src={url} width={w} height={h} alt={alt} className={cls} loading="lazy" />
```

Keep `width`/`height`/`alt`/`className` attributes. Add `loading="lazy"` for parity with Next's default behaviour.

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor: replace next/image with plain <img> tags"
```

---

### Task D5: Remove Stripe Elements corporate-user path from `Step3ContactDetails.tsx`

Design §3 notes that `Step3ContactDetails.tsx` contains a corporate-user Stripe Elements modal. The widget does not handle payment.

- [ ] **Step 1: Identify and delete the Stripe code**

Grep within `Step3ContactDetails.tsx` for `@stripe/`, `useStripe`, `Elements`, `CardElement`, `PaymentElement`, `confirmCardPayment`. Delete:
- All imports from `@stripe/*`
- The corporate-user payment modal component (or branch if inline)
- Any state related to the Stripe flow (`stripeClientSecret`, etc.)
- Any corporate-user auth detection logic that was there only to gate the payment modal — the widget is guest-only

Replace the payment-confirm button with a standard "Submit order" button that calls `api.catering.submitOrder(payload)` and then invokes `onOrderComplete` on success.

- [ ] **Step 2: Drop `@stripe/*` from `packages/catering-widget/package.json`**

Not listed — confirm.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove corporate-user stripe path from checkout"
```

---

### Task D6: Fold any remaining direct `fetchWithAuth` / service singleton usage into the API client hook

After D2 most should already be gone, but sweep once more.

- [ ] **Step 1: Grep for leftovers**

Use Grep to search `packages/catering-widget/src/` for: `fetchWithAuth`, `cateringService`, `API_BASE_URL`.

- [ ] **Step 2: For each hit, replace with `useApiClient()`** (inside components) or an `api` parameter (inside utilities).

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: route all API calls through the widget API client"
```

---

## Phase E — Public `<CateringWidget>` component

### Task E1: Write the top-level component

**Files:**
- Create: `packages/catering-widget/src/CateringWidget.tsx`
- Modify: `packages/catering-widget/src/index.ts`

- [ ] **Step 1: Write `src/CateringWidget.tsx`**

```tsx
import { useEffect, useMemo, useState, type CSSProperties, type ReactElement } from "react";
import type { CateringWidgetProps, WidgetError } from "./types/public";
import {
  CateringConfigProvider,
  type CateringConfig,
} from "./config/CateringConfigContext";
import { createApiClient } from "./api/client";
import { createApiEndpoints } from "./api/endpoints";
import { createStorage } from "./storage/storage";
import { CateringStateProvider } from "./state/CateringStateContext";
import { CateringOrderBuilder } from "./components/CateringOrderBuilder";

const STUB_PARTNER_ID = "stub";

export function CateringWidget(props: CateringWidgetProps): ReactElement {
  const {
    publishableKey,
    theme,
    initialData,
    onReady,
    onOrderComplete,
    onError,
  } = props;

  // Partner id will eventually come from /widget/session response.
  // Until the backend exists, we use a constant.
  const partnerId = STUB_PARTNER_ID;

  const [config] = useState<CateringConfig>(() => {
    const apiClient = createApiClient({ publishableKey });
    return {
      publishableKey,
      partnerId,
      theme,
      initialData,
      onReady,
      onOrderComplete,
      onError,
      api: createApiEndpoints(apiClient),
      storage: createStorage(partnerId),
    };
  });

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const style = useMemo<CSSProperties>(() => {
    const vars: Record<string, string> = {};
    if (theme?.primary) vars["--swift-primary"] = theme.primary;
    if (theme?.radius) vars["--swift-radius"] = theme.radius;
    if (theme?.font) vars["--swift-font"] = theme.font;
    return vars as CSSProperties;
  }, [theme]);

  return (
    <div className="swift-catering-widget" style={style}>
      <CateringConfigProvider value={config}>
        <CateringStateProvider>
          <CateringOrderBuilder />
        </CateringStateProvider>
      </CateringConfigProvider>
    </div>
  );
}
```

`<CateringOrderBuilder>` internally reads `view` from the state context (Task B9 Step 6) and renders the list / menu / checkout views accordingly. The top-level widget component does not need to know about view transitions.

- [ ] **Step 2: Update `src/index.ts` to export the component**

Replace the content of `src/index.ts` with:

```ts
export { CateringWidget } from "./CateringWidget";

export type {
  CateringWidgetProps,
  Theme,
  InitialData,
  MealSession,
  MealSessionItem,
  OrderSummary,
  OrderCompleteResult,
  WidgetError,
  WidgetErrorCode,
} from "./types/public";
```

- [ ] **Step 3: Typecheck + build**

```bash
npm run typecheck
npm run build
```

Expected: clean typecheck, `dist/index.mjs` + `.cjs` + `.d.ts` produced, `dist/styles.css` produced.

- [ ] **Step 4: Verify `dist/index.d.ts` contains the public types**

```bash
grep -E "CateringWidget|CateringWidgetProps|Theme|InitialData|OrderCompleteResult|WidgetError" dist/index.d.ts
```

Expected: each symbol appears at least once.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add public <CateringWidget> component"
```

---

### Task E2: Apply `initialData` on first mount only

**Files:**
- Modify: `packages/catering-widget/src/state/CateringStateContext.tsx`

Per design §10: pre-fill applies only when no persisted state exists. If the user previously started an order, the stored state wins.

- [ ] **Step 1: Inside the state provider, locate the init effect**

When loading persisted state at mount, decide between persisted state and `initialData`. Fold `initialData` into the state-context provider, e.g., by accepting it as a prop from `CateringConfigContext`:

```tsx
import { useCateringConfig } from "../config/CateringConfigContext";

export function CateringStateProvider({ children }: { children: ReactNode }) {
  const { initialData, storage } = useCateringConfig();
  // inside the initial-state loader:
  const loaded = loadFromStorage(storage);
  const isFirstMount = loaded == null;
  const starting = isFirstMount
    ? applyInitialData(initialData, emptyState)
    : loaded;
  // ... use `starting` as initial state
}
```

Where `applyInitialData` maps the `InitialData` shape onto the internal state. Only fields present in `initialData` override defaults; absent fields stay empty.

- [ ] **Step 2: Ensure re-renders of the widget don't re-apply `initialData`**

After first mount, subsequent changes to the `initialData` prop are ignored. Easy implementation: capture it inside a `useState` initializer (or a ref) so later re-renders can't influence state.

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: apply initialData pre-fill on first mount only"
```

---

### Task E3: Route errors through `onError`

**Files:**
- Modify: `packages/catering-widget/src/components/Step3ContactDetails.tsx` (and anywhere the widget throws)

- [ ] **Step 1: In every `catch (err)` around an API call**

Map the error to a `WidgetError`:

```tsx
import type { WidgetError } from "../types/public";
const { onError } = useCateringConfig();
// ...
try {
  await api.catering.submitOrder(payload);
} catch (err) {
  const widgetErr: WidgetError =
    (err && typeof err === "object" && "code" in (err as object))
      ? (err as WidgetError)
      : { code: "submit_failed", message: "Order submission failed", cause: err };
  onError?.(widgetErr);
  // keep the existing user-facing toast/error-UI behavior
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: surface widget errors through onError callback"
```

---

## Phase F — Storybook

### Task F1: Install Storybook

**Files:**
- Create: `packages/catering-widget/.storybook/main.ts`
- Create: `packages/catering-widget/.storybook/preview.tsx`
- Modify: `packages/catering-widget/package.json` (devDependencies)

- [ ] **Step 1: Install Storybook via CLI inside the package**

```bash
cd packages/catering-widget
npx storybook@latest init --type react --builder vite --skip-install
cd ../..
npm install
```

Expected: adds `@storybook/react-vite` and related dev-deps, creates `.storybook/` with default config.

- [ ] **Step 2: Overwrite `.storybook/main.ts`**

```ts
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  docs: { autodocs: "tag" },
};
export default config;
```

- [ ] **Step 3: Overwrite `.storybook/preview.tsx`**

```tsx
import type { Preview } from "@storybook/react";
import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
  },
};

export default preview;
```

- [ ] **Step 4: Remove Storybook's example stubs and prepare `stories/` for our own**

Storybook 8's init typically creates example files under `stories/` at the package root (and sometimes under `src/stories/` depending on the template). Wipe both possible locations, then re-create an empty `stories/` so F3 and F4 have a target:

```bash
rm -rf packages/catering-widget/stories packages/catering-widget/src/stories
mkdir -p packages/catering-widget/stories
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: install storybook with vite builder"
```

---

### Task F2: Set up MSW for request mocking

**Files:**
- Create: `packages/catering-widget/stories/msw-handlers.ts`
- Modify: `packages/catering-widget/.storybook/preview.tsx`
- Modify: `packages/catering-widget/package.json`

- [ ] **Step 1: Add MSW addon**

```bash
cd packages/catering-widget
npm install --save-dev msw-storybook-addon msw
```

- [ ] **Step 2: Init the MSW service worker for Storybook**

```bash
npx msw init public/ --save
```

If `public/` doesn't exist, create it. The worker file will be served by Storybook Vite from `public/`.

- [ ] **Step 3: Write `stories/msw-handlers.ts`**

```ts
import { http, HttpResponse } from "msw";

export const DEFAULT_HANDLERS = [
  http.get("https://api.swiftfood.uk/restaurants/catering", () =>
    HttpResponse.json([
      { id: "r1", name: "Oak & Olive", slug: "oak-olive", cuisines: ["Italian"] },
      { id: "r2", name: "Spice Lab", slug: "spice-lab", cuisines: ["Indian"] },
    ])
  ),
  http.get("https://api.swiftfood.uk/menu-item/catering", () =>
    HttpResponse.json([
      { id: "m1", name: "Wood-fired pizza", price: 9.5, minQuantity: 8 },
      { id: "m2", name: "Grilled halloumi", price: 6.0, minQuantity: 8 },
    ])
  ),
  http.post("https://api.swiftfood.uk/catering-orders", async () =>
    HttpResponse.json({
      orderId: "order_mock_123",
      accessToken: "tok_mock_abc",
    })
  ),
  http.post("https://api.swiftfood.uk/pricing/catering-verify-cart", () =>
    HttpResponse.json({
      subtotal: 120,
      deliveryFee: 10,
      serviceFee: 5,
      total: 135,
      currency: "GBP",
    })
  ),
];
```

The full handler list depends on which endpoints the widget actually calls — the engineer mirrors every endpoint the client hits.

- [ ] **Step 4: Wire MSW into `preview.tsx`**

```tsx
import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import "../src/styles/index.css";
import { DEFAULT_HANDLERS } from "../stories/msw-handlers";

initialize();

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    msw: { handlers: DEFAULT_HANDLERS },
  },
  loaders: [mswLoader],
};

export default preview;
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: add MSW for storybook API mocking"
```

---

### Task F3: Top-level widget story

**Files:**
- Create: `packages/catering-widget/stories/CateringWidget.stories.tsx`

- [ ] **Step 1: Write the stories file**

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { CateringWidget } from "../src/CateringWidget";

const meta: Meta<typeof CateringWidget> = {
  title: "CateringWidget",
  component: CateringWidget,
};
export default meta;

type Story = StoryObj<typeof CateringWidget>;

export const Default: Story = {
  args: {
    publishableKey: "pk_test_story",
    onOrderComplete: (r) => console.log("order complete", r),
    onError: (e) => console.error("widget error", e),
  },
};

export const Themed: Story = {
  args: {
    publishableKey: "pk_test_story",
    theme: { primary: "#0a7ea4", radius: "12px" },
  },
};

export const Prefilled: Story = {
  args: {
    publishableKey: "pk_test_story",
    initialData: {
      eventName: "Alice's Birthday",
      eventDate: "2026-07-12",
      guestCount: 40,
      deliveryAddress: {
        line1: "1 Test Lane",
        city: "London",
        postcode: "E1 6AN",
      },
      contact: { name: "Alice", email: "alice@example.com" },
    },
  },
};
```

- [ ] **Step 2: Run Storybook**

```bash
npm run storybook
```

Expected: `localhost:6006` opens; the three stories render the widget. The widget uses mocked API data from MSW and shows the restaurant list → menu → checkout flow. The engineer clicks through to verify the full flow works visually.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add storybook story for CateringWidget top-level"
```

---

### Task F4: Sub-component stories

**Files:**
- Create: `packages/catering-widget/stories/RestaurantCatalogue.stories.tsx`
- Create: `packages/catering-widget/stories/MenuBrowserColumn.stories.tsx`
- Create: `packages/catering-widget/stories/SessionEditor.stories.tsx`

Per design §dev workflow: stories for the key sub-components enable component-level iteration.

- [ ] **Step 1: For each of the three target components**

Write a stories file that mounts the component with:
- Minimal required props
- Mock data (hardcoded arrays, not API calls)
- `<CateringConfigProvider>` and `<CateringStateProvider>` wrappers

Example template:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { RestaurantCatalogue } from "../src/components/RestaurantCatalogue";
import { CateringConfigProvider } from "../src/config/CateringConfigContext";
import { CateringStateProvider } from "../src/state/CateringStateContext";
import { createStorage } from "../src/storage/storage";
import { createApiEndpoints } from "../src/api/endpoints";
import { createApiClient } from "../src/api/client";

const api = createApiEndpoints(createApiClient({ publishableKey: "pk_test" }));

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <CateringConfigProvider
      value={{
        publishableKey: "pk_test",
        partnerId: "stub",
        api,
        storage: createStorage("stub"),
      }}
    >
      <CateringStateProvider>{children}</CateringStateProvider>
    </CateringConfigProvider>
  );
}

const meta: Meta<typeof RestaurantCatalogue> = {
  title: "sub-components/RestaurantCatalogue",
  component: RestaurantCatalogue,
  decorators: [(Story) => <Wrap><Story /></Wrap>],
};
export default meta;

export const Default: StoryObj<typeof RestaurantCatalogue> = { args: {} };
```

- [ ] **Step 2: Open Storybook and verify each story renders**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add storybook stories for key sub-components"
```

---

## Phase G — Example host apps

### Task G1: `examples/next-app` scaffold

**Files:**
- Create: `examples/next-app/package.json`
- Create: `examples/next-app/next.config.mjs`
- Create: `examples/next-app/tsconfig.json`
- Create: `examples/next-app/app/layout.tsx`
- Create: `examples/next-app/app/globals.css`
- Create: `examples/next-app/app/catering/page.tsx`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p examples/next-app/app/catering
```

- [ ] **Step 2: Write `examples/next-app/package.json`**

```json
{
  "name": "@swift/catering-widget-example-next",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "next dev -p 3100",
    "build": "next build",
    "start": "next start -p 3100"
  },
  "dependencies": {
    "@swift/catering-widget": "*",
    "next": "^16.0.7",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Write `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@swift/catering-widget"],
  reactStrictMode: true,
};
export default nextConfig;
```

(`transpilePackages` lets Next consume the library directly from the workspace source during development.)

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write `app/layout.tsx`**

```tsx
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Write `app/globals.css`**

```css
/* Host page styles — deliberately minimal to verify widget CSS isolation */
body { margin: 0; font-family: system-ui, sans-serif; }
```

- [ ] **Step 7: Write `app/catering/page.tsx`**

```tsx
"use client";
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";

export default function Page() {
  return (
    <main style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Example Next host — catering</h1>
      <CateringWidget
        publishableKey="pk_test_next_example"
        onOrderComplete={({ orderId }) => {
          alert(`Order complete: ${orderId}`);
        }}
        onError={(e) => console.error("widget error", e)}
      />
    </main>
  );
}
```

- [ ] **Step 8: Install from repo root to link workspaces**

```bash
cd /Users/thadoos/Coding/AllRestaurantApps/catering-widget
npm install
```

- [ ] **Step 9: Build the library first, then run Next**

The Next example imports from `dist/`. Run these in two terminals:

```bash
# Terminal 1 — library watch build
cd packages/catering-widget
npm run dev
# and in another shell: npm run build:css -- --watch

# Terminal 2 — next app
cd examples/next-app
npm run dev
```

Visit `http://localhost:3100/catering`. Expected: the widget mounts and attempts `POST /widget/session` (the stub runs locally; no network) plus real calls to `api.swiftfood.uk`. If staging is reachable, the restaurant list populates; if not, the widget shows its error state via `onError`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add next-app example host"
```

---

### Task G2: `examples/vite-app` scaffold

**Files:**
- Create: `examples/vite-app/package.json`
- Create: `examples/vite-app/vite.config.ts`
- Create: `examples/vite-app/tsconfig.json`
- Create: `examples/vite-app/index.html`
- Create: `examples/vite-app/src/main.tsx`
- Create: `examples/vite-app/src/App.tsx`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p examples/vite-app/src
```

- [ ] **Step 2: Write `examples/vite-app/package.json`**

```json
{
  "name": "@swift/catering-widget-example-vite",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3200",
    "build": "vite build",
    "preview": "vite preview --port 3200"
  },
  "dependencies": {
    "@swift/catering-widget": "*",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.6.0",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 3: Write `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowImportingTsExtensions": false,
    "noEmit": true,
    "isolatedModules": true
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Write `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Vite host — catering</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Write `src/main.tsx`**

```tsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 7: Write `src/App.tsx`**

```tsx
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";

export default function App() {
  return (
    <main style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem" }}>
      <h1>Example Vite host — catering</h1>
      <CateringWidget
        publishableKey="pk_test_vite_example"
        onOrderComplete={({ orderId }) => alert(`Order complete: ${orderId}`)}
        onError={(e) => console.error(e)}
      />
    </main>
  );
}
```

- [ ] **Step 8: Install + run**

```bash
cd /Users/thadoos/Coding/AllRestaurantApps/catering-widget
npm install
cd packages/catering-widget && npm run build && cd ../..
cd examples/vite-app && npm run dev
```

Visit `http://localhost:3200`. Expected: widget mounts and renders identically to the Next example, proving framework-agnosticism.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add vite-app example host"
```

---

### Task G3: Write the partner-facing README

**Files:**
- Create (or overwrite): `packages/catering-widget/README.md`

This README is what NPM and GitHub display as the package's homepage. It's the first thing a partner developer reads after deciding to evaluate the widget. The monorepo-root `README.md` (Task A1) is internal-only; this one is external.

**Audience:** a mid-level React developer at a partner who has a publishable key in hand and wants to get an order flowing in under an hour (design doc's stated goal).

**Do not put in this README:**
- How the widget is built internally (storage namespacing, session-token caching, state machine). The partner doesn't care.
- How to contribute. This is not a contributors' doc; internal devs use the monorepo root README.
- Backend architecture, partner provisioning flow. Those are Swift-internal.

- [ ] **Step 1: Write `packages/catering-widget/README.md`**

Structure it with the following sections, in order. Content for each section:

````markdown
# @swift/catering-widget

The Swift Food catering flow, embeddable in any React app. Restaurant browsing, multi-session order building, contact details, and submission — one component, one CSS file, one publishable key.

```bash
npm install @swift/catering-widget
```

## Quick start

```tsx
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";

export default function CateringPage() {
  return (
    <CateringWidget
      publishableKey="pk_live_..."
      onOrderComplete={({ orderId }) => {
        window.location.href = `/thanks?order=${orderId}`;
      }}
    />
  );
}
```

That's a working integration. Defaults: Swift-hosted backend, `localStorage` persistence, neutral theme.

## Requirements

- React 18+ and React-DOM 18+ as peer dependencies
- A publishable key from Swift (see [Getting a publishable key](#getting-a-publishable-key))
- At least one origin registered with Swift where the widget will load

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `publishableKey` | `string` | yes | Your `pk_live_...` or `pk_test_...` key from Swift. |
| `theme` | `Theme` | no | Primary color, border radius, and font overrides. |
| `initialData` | `InitialData` | no | Pre-populate event, address, and contact fields. Applied only on first mount. |
| `onReady` | `() => void` | no | Fires when the widget has initialized. |
| `onOrderComplete` | `(result: OrderCompleteResult) => void` | no | Fires after a successful order submission. |
| `onError` | `(error: WidgetError) => void` | no | Fires on unrecoverable errors (bad key, network, submit failure). |

## Examples

### Next.js with router-based navigation

```tsx
"use client";
import { CateringWidget } from "@swift/catering-widget";
import "@swift/catering-widget/dist/styles.css";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  return (
    <CateringWidget
      publishableKey={process.env.NEXT_PUBLIC_SWIFT_KEY!}
      onOrderComplete={({ orderId, accessToken }) => {
        router.push(`/orders/${orderId}?token=${accessToken}`);
      }}
    />
  );
}
```

### Theming

```tsx
<CateringWidget
  publishableKey="pk_live_..."
  theme={{
    primary: "#0a7ea4",  // CSS color; applied via --swift-primary
    radius: "12px",      // CSS length; applied via --swift-radius
    font: "Inter, sans-serif",
  }}
/>
```

### Pre-filling known event details

```tsx
<CateringWidget
  publishableKey="pk_live_..."
  initialData={{
    eventName: "Alice's Birthday",
    eventDate: "2026-07-12",          // ISO date
    eventTime: "19:00",
    guestCount: 40,
    deliveryAddress: {
      line1: "1 Example Lane",
      city: "London",
      postcode: "E1 6AN",
    },
    contact: { name: "Alice", email: "alice@example.com" },
  }}
  onOrderComplete={/* ... */}
/>
```

Every field in `initialData` is optional. Fields remain editable after pre-fill. `initialData` is only applied on first mount — if the user has a half-finished order in progress (persisted in `localStorage`), the persisted state wins.

## Types

Every public type is exported from the package entry:

```ts
import {
  CateringWidget,
  type CateringWidgetProps,
  type Theme,
  type InitialData,
  type OrderCompleteResult,
  type OrderSummary,
  type MealSession,
  type MealSessionItem,
  type WidgetError,
} from "@swift/catering-widget";
```

See the generated `dist/index.d.ts` for the full shapes — your IDE picks them up automatically.

## Callbacks

### `onOrderComplete(result)`

Fires when an order has been successfully submitted. The `result` object contains:

- `orderId: string` — Swift's order ID.
- `accessToken: string` — a token the customer can use to view the order on Swift's hosted view page.
- `summary: OrderSummary` — structured breakdown of the submitted order (total, meal sessions, restaurants, delivery address, contact email). Useful for rendering your own thank-you view or triggering analytics.

### `onError(error)`

Fires on errors the widget can't recover from. `error.code` is one of:

- `invalid_publishable_key` — the key was rejected by Swift's backend.
- `session_failed` — the widget session handshake failed.
- `network_error` — a backend request failed or returned a non-2xx.
- `submit_failed` — the order submission itself failed.
- `unknown` — anything else; see `error.cause` for details.

## What the widget handles for you

- Restaurant browsing and menu exploration
- Multi-session meal building (multiple dates/times per order)
- Contact details and delivery address
- Promo codes and pricing preview
- Google Maps address autocomplete
- Order submission to Swift's API
- State persistence in `localStorage` (namespaced; does not conflict with your own storage)

## What you're responsible for

- Getting a publishable key from Swift and putting it in your environment.
- Registering your site's origin(s) with Swift — each domain where you embed the widget must be allowlisted.
- Rendering `<CateringWidget>` wherever you want the flow to live.
- Navigating after `onOrderComplete` (thank-you page, analytics, etc.).
- Page chrome around the widget (header, footer, SEO, page layout).

## What you're **not** responsible for

- Payment. Swift sends a payment link to the customer by email after reviewing the order. The widget does not embed Stripe or any other payment UI.
- Loading Google Maps — the widget handles this internally.
- Making API calls to Swift. The widget has its own internal client.
- Session or auth management. The widget runs the publishable-key handshake for you.

## Getting a publishable key

Contact Swift at [partners@swiftfood.uk](mailto:partners@swiftfood.uk) with:

1. Your company name.
2. The origin(s) where the widget will be embedded (e.g. `https://yoursite.com`, `https://staging.yoursite.com`, and optionally `http://localhost:3000` for development).
3. A technical contact for integration support.

Swift provisions a partner record and returns a publishable key (format: `pk_live_...` or `pk_test_...`) out of band. Store it in your environment:

```bash
# .env.local (Next.js)
NEXT_PUBLIC_SWIFT_KEY=pk_live_abc123
```

The key is public (it ships in the browser bundle). This is intentional and safe — Swift's backend validates the key against the request's origin, so a stolen key cannot be used from a non-allowlisted domain.

## Troubleshooting

**Widget doesn't render / screen is blank**
Check that you've imported the stylesheet: `import "@swift/catering-widget/dist/styles.css";`.

**Errors mentioning `invalid_publishable_key` or `session_failed`**
Either the key is wrong, the key is inactive, or your current origin isn't in the allowlist Swift registered for you. Verify your env var is set, and contact Swift to confirm your allowed origins.

**Widget works on `localhost` but not in production**
Your production origin isn't registered. Ask Swift to add it.

**TypeScript errors importing types**
Ensure your `tsconfig.json` has `"moduleResolution": "bundler"` or `"node16"`/`"nodenext"` so the package's `exports` map is honored.

## Browser support

Modern evergreen browsers (Chrome, Firefox, Safari, Edge) on desktop and mobile. No IE support.

## Versioning

`@swift/catering-widget` follows [semver](https://semver.org/). The public API for semver purposes is everything exported from the package entry — `CateringWidget`, its props, and the re-exported types. Internal modules are not considered public and can change without a major version bump.

- **Patch** — bug fixes, no behavior change to the public API.
- **Minor** — new backward-compatible features.
- **Major** — breaking change to the public API.

Check the CHANGELOG for what's in each release.

## Support

- Technical integration questions: [partners@swiftfood.uk](mailto:partners@swiftfood.uk)
- Bug reports: include your publishable key prefix (first 8 chars), the browser, and a reproducible example

## License

Proprietary. Distributed for use by authorized Swift Food partners only.
````

- [ ] **Step 2: Verify the README renders as expected**

Open the file in a Markdown preview (VS Code: `Cmd+Shift+V`). Check:
- All code blocks have language tags
- The props table renders as a table
- No dead links
- The tone matches the "skilled developer, first hour with the widget" audience

- [ ] **Step 3: Confirm the README is included in the published tarball**

```bash
cd packages/catering-widget
npm pack --dry-run 2>&1 | grep README.md
```

Expected: `README.md` appears in the file list. NPM auto-includes the package's `README.md` even though `files` only lists `dist`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: add partner-facing README for @swift/catering-widget"
```

---

## Phase H — Final verification

### Task H1: End-to-end walkthrough in both examples

- [ ] **Step 1: Run the full dev pipeline**

```bash
cd /Users/thadoos/Coding/AllRestaurantApps/catering-widget
cd packages/catering-widget && npm run build && cd ../..
```

Then in three terminals:
```bash
cd packages/catering-widget && npm run dev                # Terminal 1: JS watch
cd packages/catering-widget && npm run build:css -- --watch # Terminal 2: CSS watch
cd examples/next-app && npm run dev                       # Terminal 3
```

- [ ] **Step 2: Walk the flow in Next example**

In the browser at `localhost:3100/catering`:
1. Widget mounts, restaurant list loads (from staging or MSW — depending on what the engineer has configured)
2. Click a restaurant → menu loads
3. Add items to a meal session
4. Switch to checkout → contact form appears
5. Fill contact fields, submit → `onOrderComplete` fires → alert shows orderId

- [ ] **Step 3: Repeat at `localhost:3200` (vite example)**

Same flow. Confirm parity.

- [ ] **Step 4: Run Storybook and click through each story**

```bash
cd packages/catering-widget && npm run storybook
```

Verify each story renders and the top-level `CateringWidget` story walks through the MSW-mocked flow.

- [ ] **Step 5: Run the test suite**

```bash
cd packages/catering-widget && npm test
```

Expected: all Phase B tests (storage, sessionToken, api client, navigation) pass.

- [ ] **Step 6: Final typecheck + build**

```bash
npm run typecheck
npm run build
```

Expected: clean typecheck; `dist/` contains `index.mjs`, `index.cjs`, `index.d.ts`, `styles.css`.

- [ ] **Step 7: Inspect `dist/index.d.ts` one last time**

```bash
grep -E "^export" dist/index.d.ts
```

Expected: public types (`CateringWidget`, `CateringWidgetProps`, `Theme`, `InitialData`, `OrderCompleteResult`, `OrderSummary`, `MealSession`, `MealSessionItem`, `WidgetError`, `WidgetErrorCode`) all exported. Nothing internal leaking.

- [ ] **Step 8: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: final e2e verification pass"
```

---

## Out of scope (explicitly)

Anything in these sections of the design doc is **not** part of this plan; track as separate follow-ups:

- **Backend section (lines 720–940):** partner table, `POST /widget/session`, guards, dynamic CORS, order attribution, rate limiting, admin endpoints.
- **`npm pack` smoke test (Layer 3 of dev workflow).**
- **NPM publishing:** account, org, `publishConfig`, auth, CI workflow, semver release process.
- **Rollout steps 3–6:** pilot partner provisioning, internal admin UI, migrating `swiftfood.uk/event-order` onto the widget, deprecating the backend public-access path.
- **Halkin (§Halkin considerations):** deposit step, linked coworking order, questionnaire, admin review, session-token auth. The widget ships focused on the standard catering flow.

When any of the above becomes active work, it gets its own spec + plan.

---

## Known post-MVP improvements

These are acceptable in the MVP but should be addressed before a wider partner release. Track as follow-ups; not part of this plan.

### Lazy-load `@react-pdf/renderer`

**Current state.** The widget statically imports `@react-pdf/renderer` (~500KB–1MB minified) at the top of the PDF module. Every partner's page pays that cost on first load even though most end-users never click "Download PDF."

**Improvement.** Replace the top-level import with a dynamic `import()` inside the download handler:

```tsx
async function handleDownloadPdf(order: Order) {
  const [{ pdf }, { CateringMenuPdf }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("../pdf/CateringMenuPdf"),
  ]);
  const blob = await pdf(<CateringMenuPdf order={order} />).toBlob();
  // trigger download
}
```

**Build-config change required.** `tsup.config.ts` currently sets `splitting: false`. Switch to `splitting: true` so the ESM build emits a separate chunk for the dynamic import. (CJS doesn't support code-splitting — CJS consumers continue to bundle everything, which is acceptable since modern React hosts use ESM.)

**Rationale for deferring.** Premature optimization during the MVP. The cost is a one-time bundle bloat on partner sites, not a broken feature. Worth measuring first; revisit when (a) a partner complains about widget load time, or (b) we're preparing the first public/stable release. Changing this post-MVP is a small, contained refactor.
