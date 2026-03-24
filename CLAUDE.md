# Swift Food Platform — Claude Code Context

## Project Overview
Swift is a food delivery and catering SaaS platform built with Next.js 16 App Router, TypeScript, Tailwind CSS, and DaisyUI.

**Portals:**
- Customer: `app/(public)/`
- Restaurant: `app/restaurant/`
- Rider: `app/rider/`
- Legal/Support: `app/(legal)/`, `app/(support)/`
- API routes: `app/api/`

## Architecture Rules
- Read `docs/architecture/CODING_STANDARDS.md` before making any structural changes
- Service layer goes in `services/` — never in components or hooks
  - API clients → `services/api/`
  - Business logic → `services/business/`
- Reusable UI components go in `lib/components/`
- Custom hooks go in `lib/hooks/`
- TypeScript types go in `types/`
- Import aliases: `@/app`, `@/lib`, `@/services`, `@/types`, `@/context`, `@/features`

## Tech Stack
- Next.js 16 App Router (TypeScript)
- Tailwind CSS 4 + DaisyUI 5
- Stripe for payments
- Google Maps API
- Netlify deployment

## OpenRecall — persistent knowledge across sessions

You have access to OpenRecall via MCP tools. Use them as follows:

### At the start of every task
Call `recall_search` with the task topic before doing anything else.

### When the user corrects you
Immediately call `recall_record` to make the correction permanent.

```
recall_record(
    correction="human: [what they said]",
    what_was_wrong="[what you did wrong]",
    learning="[the correct approach going forward]",
    scope="[category, e.g. nextjs, tailwind, stripe, deployment]",
    task="[what you were doing when corrected]",
    confidence=0.95
)
```

### When you learn something project-specific
Record facts about this codebase that won't be obvious next session.

```
recall_record(
    learning="[what you discovered]",
    scope="[category]",
    confidence=0.8
)
```

