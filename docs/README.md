# Documentation Index

Complete documentation for the Swift Food platform.

## 📖 Table of Contents

### 🚀 Getting Started
- **[Main README](../README.md)** - Project overview and quick start
- **[Project Structure](PROJECT_STRUCTURE.md)** - Complete folder organization guide

### 🏗️ Architecture
- **[Coding Standards](architecture/CODING_STANDARDS.md)** - Code quality guidelines
- **[Refactor Template](architecture/REFACTOR_TEMPLATE.md)** - Step-by-step refactoring process
- **[Architecture Overview](architecture/README.md)** - Quick architecture reference

### 🔧 Component Guides
- **[App Structure](../app/README.md)** - Next.js route organization
- **[Services Layer](../services/README.md)** - API and business logic services

## 📂 Document Locations

```
docs/
├── README.md                    # This file - Documentation index
├── PROJECT_STRUCTURE.md         # Complete project structure
└── architecture/
    ├── README.md                # Architecture quick reference
    ├── CODING_STANDARDS.md      # Code quality standards
    └── REFACTOR_TEMPLATE.md     # Refactoring guide
```

## 🎯 Quick Links by Task

### I want to...

**Add a new page**
→ Read: [App Structure](../app/README.md) → Route Groups section

**Create a reusable component**
→ Read: [Project Structure](PROJECT_STRUCTURE.md) → `/lib` section
→ Follow: [Coding Standards](architecture/CODING_STANDARDS.md) → Component section

**Add a new API service**
→ Read: [Services Layer](../services/README.md) → Adding New Services
→ Follow: [Coding Standards](architecture/CODING_STANDARDS.md) → Services section

**Refactor existing code**
→ Follow: [Refactor Template](architecture/REFACTOR_TEMPLATE.md)
→ Reference: [Coding Standards](architecture/CODING_STANDARDS.md)

**Understand the codebase structure**
→ Start: [Project Structure](PROJECT_STRUCTURE.md)
→ Then: [Architecture Overview](architecture/README.md)

## 🔄 Recent Updates

This documentation was reorganized on 2024-11-17 as part of a major codebase refactoring:

- ✅ Eliminated debug and temporary documentation
- ✅ Consolidated all docs into `/docs` folder
- ✅ Created clear hierarchy and index
- ✅ Updated all cross-references
- ✅ Removed outdated content

## 💡 Best Practices

1. **Always check docs before starting** - We have patterns for most tasks
2. **Follow the templates** - They ensure consistency
3. **Update docs when you change patterns** - Keep them current
4. **Ask if unclear** - Better to clarify than guess

## 📝 Contributing to Docs

When adding new documentation:

1. Place in appropriate section (`architecture/`, `guides/`, etc.)
2. Add entry to this index
3. Update cross-references in related docs
4. Follow markdown formatting standards
5. Include code examples where helpful
