# Impact17

Bilingual (Arabic/English) UAE-focused web platform for verified action on the 17 UN Sustainable Development Goals.

See `CLAUDE.md` for project context and conventions, and `docs/spec.md` for the product specification.

## Tech

- Next.js 16 (App Router, TypeScript strict)
- Tailwind CSS 4
- Prisma 6 + PostgreSQL
- next-intl (English + Arabic, with RTL)
- NextAuth.js v5 (scaffold; providers wired in Phase 2)
- Anthropic Claude SDK (used in later phases)
- shadcn/ui components (Button, Card, Dialog, Input, Textarea, Form)

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Then fill in DATABASE_URL and other secrets in .env

# 3. Generate the Prisma client and run migrations
npx prisma generate
npx prisma migrate dev

# 4. Run the dev server
npm run dev
```

Open <http://localhost:3000>. You'll be redirected to `/en` or `/ar` based on your browser's Accept-Language. Use the locale switcher in the header to toggle.

## Scripts

| Command                | What it does                     |
| ---------------------- | -------------------------------- |
| `npm run dev`          | Start the dev server (Turbopack) |
| `npm run build`        | Production build                 |
| `npm run start`        | Run the production build         |
| `npm run lint`         | ESLint                           |
| `npm run format`       | Prettier write                   |
| `npm run format:check` | Prettier check                   |
| `npx tsc --noEmit`     | Type-check without emitting      |

## Layout

```
app/[locale]/        — locale-scoped pages and layout
components/ui/       — shadcn/ui primitives
components/features/ — feature components (header, footer, locale switcher)
content/             — locked SDG action catalogue (17 markdown files)
docs/                — product spec
i18n/                — next-intl routing, navigation, request config
lib/                 — Prisma client, NextAuth scaffold, cn() helper
messages/            — en.json, ar.json
prisma/              — schema
proxy.ts             — locale routing proxy (Next 16's renamed middleware)
```

## Current phase

**Phase 1 — Foundation.** Landing page placeholder, schema, i18n bootstrap. No auth, no submissions, no AI yet. See `CLAUDE.md` for the full phase plan.
