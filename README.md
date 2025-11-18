# Swift Food Platform

A Next.js food delivery and catering platform connecting restaurants, riders, and customers.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
website/
├── app/              # Next.js App Router (routes & pages)
├── lib/              # Shared library code
├── services/         # Service layer (API & business logic)
├── types/            # TypeScript definitions
├── context/          # React Context providers
├── features/         # Feature modules
└── docs/             # Documentation
```

See [PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) for detailed architecture.

## 📚 Documentation

### Getting Started
- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete folder structure guide
- **[Coding Standards](docs/architecture/CODING_STANDARDS.md)** - How to write clean code
- **[Refactor Template](docs/architecture/REFACTOR_TEMPLATE.md)** - Step-by-step refactoring guide

### Architecture
- **[App Structure](app/README.md)** - Route organization
- **[Services Architecture](services/README.md)** - Service layer patterns

## 🎯 Key Features

- **Customer Ordering** - Browse markets, order food, track deliveries
- **Restaurant Portal** - Menu management, orders, analytics, inventory
- **Catering Orders** - Event catering with custom menus
- **Rider Management** - Delivery coordination
- **Corporate Accounts** - Bulk ordering with wallet payment

## 🛠️ Tech Stack

- **Framework:** Next.js 13+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Payments:** Stripe
- **State:** React Context
- **Forms:** React Hook Form

## 📖 Development Guide

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

See [CODING_STANDARDS.md](docs/architecture/CODING_STANDARDS.md) for complete guidelines.

## 🔗 Import Path Aliases

```typescript
@/app/*        → app/*
@/lib/*        → lib/*
@/services/*   → services/*
@/types/*      → types/*
@/context/*    → context/*
@/features/*   → features/*
```

## 🏗️ Recent Refactoring

This codebase has been recently refactored to follow industry best practices:

- ✅ Clean separation of concerns (routes, lib, services, types)
- ✅ No duplicate code or folders
- ✅ Organized by user journey
- ✅ Consistent naming conventions
- ✅ Comprehensive TypeScript types

## 📝 Contributing

Please follow the [Coding Standards](docs/architecture/CODING_STANDARDS.md) when contributing.

## 📄 License

Proprietary - Swift Food Ltd.
