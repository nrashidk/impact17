# Impact17 — Project Context for Claude Code

This file is read by Claude Code at the start of every session. It defines what we're building, the conventions to follow, and what NOT to do. Keep it accurate as the project evolves.

---

## What this project is

Impact17 is a bilingual (Arabic/English) public consumer web platform where users complete real-world UN Sustainable Development Goal (SDG) actions, submit photo proof, earn badges, climb leaderboards, and engage socially. The platform serves UAE users primarily; content is UAE-localised throughout.

**Core user loop:** Land on the site → see all 17 SDGs → pick an SDG → pick one of 10 actions → read "how to" steps → do it in real life → submit photo + summary + reflection + enjoyment + 1-5 star rating → AI verifies photo → earn action badge → complete all 10 actions in an SDG → earn SDG badge + 200-point bonus → complete all 17 SDGs → headline achievement.

---

## Tech stack — non-negotiable

- **Framework:** Next.js 14+ App Router (TypeScript, strict mode)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (Neon or Supabase managed)
- **ORM:** Prisma
- **Auth:** NextAuth.js (credentials + Google provider)
- **AI:** Anthropic Claude API for photo verification AND content moderation
- **File storage:** UploadThing or direct to S3-compatible storage (DO Spaces)
- **Email:** Resend
- **Hosting:** Vercel
- **i18n:** next-intl (Arabic RTL support required)

Do not introduce new frameworks, ORMs, or auth libraries without explicit user approval.

---

## Repository structure

Single Next.js repo. Standard App Router layout:

```
/app                  — pages and API routes
  /[locale]           — i18n root (en, ar)
    /page.tsx         — landing
    /sdgs/[id]        — SDG detail
    /actions/[id]     — action detail + submission
    /dashboard        — user dashboard
    /leaderboard      — leaderboard
    /profile/[username] — public profile
    /admin            — moderation queue (admin-only)
  /api                — API routes
    /actions          — action CRUD
    /submissions      — submission + verification
    /badges           — badge logic
    /leaderboard      — leaderboard queries
    /moderation       — moderation queue
/components           — React components
  /ui                 — primitives (button, card, dialog)
  /features           — feature-specific components
/lib                  — utilities
  /db.ts              — Prisma client
  /auth.ts            — NextAuth config
  /claude.ts          — Anthropic API wrapper
  /verification.ts    — photo verification logic
  /moderation.ts      — content moderation logic
/prisma               — schema + migrations
  /schema.prisma
  /seed.ts
/messages             — i18n translations
  /en.json
  /ar.json
/content              — action catalogue source-of-truth (markdown)
  /sdg-01.md          — SDG 1 actions
  ...
  /sdg-17.md
/scripts              — one-off scripts (seed, content import)
```

---

## Critical product rules

These are decisions already locked. Do not relitigate or "improve" them without asking.

1. **All 17 SDGs in v1.** 170 total actions, 10 per SDG. Catalogue is locked content (see `/content` folder).
2. **AI photo verification on every submission.** Use Claude vision via the Anthropic API. Match the photo against the action description; return JSON with `match`, `confidence`, `reason`. High confidence → auto-approve, medium → manual review queue, low → reject with reason.
3. **Adults-only at launch.** Age gate at sign-up: date of birth required, under-18 cannot register. Parental consent flow comes in v1.5 — DO NOT build it now.
4. **Effort-weighted points:** Easy = 5, Medium = 10, Hard = 20. SDG completion bonus = 200.
5. **One action = one SDG.** Each action has exactly one primary SDG. Do not multi-credit.
6. **Hybrid moderation:** EVERY photo and EVERY reflection runs through Claude API for content moderation before becoming visible. Plus user reports. Plus a manual review queue in `/admin`.
7. **Bilingual at launch.** English and Arabic. Every UI string lives in `/messages`. Arabic RTL must work everywhere. Test layouts in both.
8. **Public profiles, public reflections, full social** (comments, follows, likes) — but with full safety tooling in v1: block, mute, report, abuse policy page.
9. **Perceptual hashing** on every uploaded photo to block reuse. Use `imghash` or equivalent.
10. **UAE-localised content** in the catalogue. The how-to steps name real UAE species, places, partners, programmes. Do not generalise them.

---

## Scoring & leaderboard (locked)

- **Points engine and private/own-score display are in scope.** A signed-in user may see ONLY their own total — no rank, no comparison, no peer data.
- **A public or peer-visible leaderboard is gated behind the human-review system and must NOT ship before that system exists.** No public leaderboard, peer ranking, top-user highlights, rank-implying badges, points in public profiles, or notifications referencing standing. (This intentionally defers the "leaderboard" part of the original Phase 3 plan — recorded as an accepted deviation.)
- **The admin score view is internal-only** (secret-gated tooling) and must not feed, surface, or leak into any user-visible element.
- **Score must be recomputable from APPROVED submissions**, so a fraudulent submission's points are revoked automatically when its status changes. Never a one-way / incrementing counter.

---

## Code conventions

- **TypeScript strict mode.** No `any` without justification in a comment.
- **Server Components by default.** Use Client Components only where interactivity is needed.
- **Server Actions for mutations** where possible; API routes only for things that need to be callable externally (webhooks, AI callbacks).
- **Zod for runtime validation** on every API input.
- **No global state libraries.** React state + URL state. If something needs persistence, it's in the database.
- **Database queries through Prisma only.** No raw SQL except for genuinely complex aggregations (leaderboard).
- **Mobile-first.** Every component designed for ~375px width first, then scales up.
- **Accessibility from day one.** Semantic HTML, keyboard navigation, alt text, ARIA where needed.

---

## What NOT to do

- **Do not** invent new SDG actions or modify the locked catalogue without asking. The catalogue in `/content/sdg-*.md` is source of truth.
- **Do not** add features not in the spec (gamification mechanics, social features, gimmicks). Stick to spec.
- **Do not** build the parental consent flow yet — that's v1.5.
- **Do not** introduce a state management library, GraphQL, tRPC, or microservices.
- **Do not** add analytics tools beyond Vercel Analytics + PostHog (open source) without asking.
- **Do not** skip the moderation step "for now" — every photo and reflection runs through moderation before going public, no exceptions.
- **Do not** skip Arabic — every English string needs an Arabic counterpart in `/messages/ar.json`.
- **Do not** hardcode strings — use `next-intl` from day one.

---

## Working agreement with Claude Code

- **One feature at a time.** When asked to build something, do that one thing well. Don't proactively rewrite unrelated code.
- **Ask before architectural decisions.** If a request requires a structural choice (new dependency, new pattern, new directory), pause and ask.
- **Run the migration after every schema change.** `npx prisma migrate dev --name <change>`.
- **Run typecheck before declaring done.** `npx tsc --noEmit`.
- **Run lint before declaring done.** `npm run lint`.
- **No `--force` flags** on database operations without explicit user consent.
- **Commit messages:** conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`).
- **Test changes manually after building.** Don't claim something works without verification.

---

## Current build phase

**Status: Phase 3 in progress** (submission flow → AI verification + content moderation → badges/points → dashboard). Phases 1 and 2 are shipped. Deviations from the original plan, accepted and on the record: auth uses NextAuth credentials + Google (not magic-link); username is collected in a post-signup step; photo storage uses Vercel Blob (not UploadThing/S3) after UploadThing failed repeatedly on Vercel; AI photo verification + content moderation run as one combined Claude vision call scheduled post-redirect via `after()`.

**Phase 1 — Foundation.** ✅ Done. Project, schema, content import, read-only SDG browsing.

**Phase 2 — Auth + Submissions.** ✅ Done. Sign-up with age gate, credentials + Google auth, action submission form, photo upload (Vercel Blob), Claude vision verification + moderation. Badge issuance is the remaining Phase 3 sub-step.

**Phase 3 — Leaderboard + Profiles.** Points calculation, weekly + all-time leaderboards, public profile pages, badge wall.

**Phase 4 — Social.** Comments, follows, likes, block, mute, report flow, abuse policy.

**Phase 5 — Moderation tooling.** Admin queue UI, content moderation API integration on every reflection and photo, perceptual hashing for reused photos.

**Phase 6 — Polish + soft launch.** Arabic translation pass, accessibility audit, performance pass, soft launch.

Do not skip phases or jump ahead. Each phase ships, gets tested, then the next phase starts.

---

## Reference documents

The catalogue source files (in `/content`) and the product spec (in `/docs/spec.md`) are authoritative. If anything in this CLAUDE.md contradicts the spec, the spec wins — and you should flag the contradiction so this file can be corrected.
