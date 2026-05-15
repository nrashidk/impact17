# Impact17 — Claude Code Prompt Sequence

## How to use this file

These are the prompts you paste into Claude Code, in order, after the repo and CLAUDE.md are set up. Each prompt produces one reviewable chunk of work. Do not skip ahead. Run, review, commit, then next.

**Before you start:**
1. Create empty GitHub repo named `impact17`
2. Clone it locally
3. Put `CLAUDE.md` in the root (the one from the other file)
4. Put the catalogue markdown files in `/content/` (one per SDG, named `sdg-01.md` through `sdg-17.md`)
5. Open the repo in Claude Code (`claude` command in the terminal at the repo root)
6. Paste **Prompt 1** below

---

## Prompt 1 — Project Foundation

```
Set up a new Next.js 14 project for Impact17 in this empty repository.

Read CLAUDE.md first and follow its conventions strictly.

Tasks for this prompt only:

1. Initialize a Next.js 14 project with TypeScript (strict), Tailwind CSS, and App Router. Use `npx create-next-app@latest` with these flags.

2. Set up the directory structure exactly as described in CLAUDE.md (app, components, lib, prisma, messages, content, scripts).

3. Install and configure:
   - Prisma with PostgreSQL provider
   - next-intl for i18n with English and Arabic locales (RTL support for Arabic)
   - NextAuth v5 (auth.js) — scaffold only, no providers wired yet
   - Anthropic SDK (npm: @anthropic-ai/sdk)
   - Zod
   - shadcn/ui — initialise it and add Button, Card, Dialog, Input, Textarea, and Form components only
   - ESLint + Prettier

4. Create the Prisma schema with these models for Phase 1:
   - User (id, email, name, username, dateOfBirth, createdAt, profileImage, points default 0)
   - Sdg (id 1-17, number, slug, nameEn, nameAr, color, descriptionEn, descriptionAr, iconUrl)
   - Action (id, sdgId, slug, titleEn, titleAr, descriptionEn, descriptionAr, howToStepsEn json, howToStepsAr json, effortTier enum [EASY, MEDIUM, HARD], points int, verificationType enum [PHOTO_PHYSICAL, PHOTO_ARTEFACT], primarySdgId)
   - (Submission, Badge, Comment, Follow, Like, Block, Report — schemas only, not used in Phase 1)

5. Set up next-intl with /messages/en.json and /messages/ar.json. Put placeholder UI strings for: home.title, home.subtitle, home.cta, nav.home, nav.sdgs, nav.leaderboard, nav.profile.

6. Create a basic layout:
   - Root layout with locale switcher
   - Header with logo placeholder and nav
   - Footer

7. Make a landing page at /[locale]/page.tsx that:
   - Shows a hero with "Impact17" and a tagline
   - Below the hero, shows a grid placeholder for the 17 SDGs (just colored cards with the SDG number for now — no data yet, no real cards)
   - Works in both English and Arabic, with RTL flipping correctly in Arabic

8. Set up the .env file structure with placeholders:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - ANTHROPIC_API_KEY
   - RESEND_API_KEY

9. Create a README with quick-start instructions.

10. Commit as "feat: project foundation" using conventional commits.

After these tasks, run `npx tsc --noEmit` and `npm run lint` and confirm both pass.

Do NOT:
- Build pages beyond the landing placeholder
- Wire up auth providers
- Import the SDG catalogue yet
- Add features not listed
- Modify CLAUDE.md

When done, stop and tell me what was built and what's next.
```

---

## Prompt 2 — Import the SDG Catalogue

*Run after Prompt 1 is complete and committed.*

```
Phase 1 continues. Import the SDG catalogue from /content/ into the database.

Read CLAUDE.md again if needed.

Tasks:

1. The /content folder contains 17 markdown files (sdg-01.md to sdg-17.md), each containing 10 actions following the format from the Impact17 catalogue. Write a script at /scripts/import-content.ts that:
   - Parses each markdown file
   - Extracts: action title, effort tier, points, verification type, "how to" steps, reflection prompts, primary SDG, whether it's a rewritten action
   - Creates Sdg and Action records via Prisma
   - Is idempotent — running it twice doesn't create duplicates

2. The 17 SDGs themselves need seed data: number, slug (e.g., "no-poverty"), nameEn, nameAr, official UN color hex, short descriptionEn, descriptionAr, and the standard UN icon URL. Use accurate UN information. Hardcode this in /scripts/seed-sdgs.ts.

3. Create /prisma/seed.ts that calls both scripts in order: SDGs first, then content.

4. Wire it up so `npx prisma db seed` runs everything.

5. Add an npm script `db:reset` that drops, migrates, and seeds.

6. Run the seed and confirm all 17 SDGs and 170 actions are in the database. Print a summary.

7. Commit as "feat: import SDG catalogue".

Do NOT:
- Build any frontend that uses this data yet (that's the next prompt)
- Translate the content to Arabic (that's Phase 6)
- Modify the catalogue content

Stop when done and confirm: how many SDGs, how many actions, any parsing issues to flag.
```

---

## Prompt 3 — SDG Browse Pages (Read-Only)

*Run after Prompt 2 is complete and seeded.*

```
Phase 1 final task: build the read-only browsing experience.

Tasks:

1. Replace the placeholder cards on the landing page with real SDG cards pulled from the database. Each card shows: SDG number, name (locale-aware), color, icon, action count.

2. Build /[locale]/sdgs/[slug]/page.tsx:
   - Header showing SDG number, name, description, color banner
   - Grid of 10 action cards for that SDG
   - Each action card shows: title, effort tier badge (Easy/Medium/Hard), points, primary-SDG indicator
   - Locale-aware throughout

3. Build /[locale]/actions/[slug]/page.tsx:
   - Title, effort tier, points
   - "How to do this" section showing the steps
   - Reflection prompts shown as preview only
   - Big "Sign in to submit" CTA (not functional yet — auth is Phase 2)

4. Add navigation: clicking an SDG card on the landing page goes to its SDG page; clicking an action card goes to its action page; back links work.

5. Mobile-first responsive design throughout. Test at 375px, 768px, 1280px.

6. Make sure Arabic RTL flips correctly on all three page types.

7. Add basic empty/loading/error states.

8. Run typecheck and lint. Commit as "feat: SDG browse pages".

Do NOT:
- Implement submission yet
- Implement auth yet
- Add social features
- Build the dashboard yet

Phase 1 is complete after this. Stop and confirm what works.
```

---

## What comes next (preview, do not paste yet)

After Phase 1 is shipped and you can browse all 17 SDGs and 170 actions in both languages:

- **Prompt 4:** Auth setup — credentials + Google, age gate at sign-up (block <18)
- **Prompt 5:** Action submission form — photo upload, summary, reflection, enjoyment, rating
- **Prompt 6:** Claude vision verification — wire up the AI verification step
- **Prompt 7:** Badge logic — award badges on successful submission, SDG bonus on completion
- **Prompt 8:** User dashboard — badges, points, suggested actions
- **Prompt 9:** Leaderboard — weekly + all-time
- **Prompt 10:** Public profile pages
- **Prompts 11–14:** Social features in order — likes first, then comments, then follows, then block/mute/report
- **Prompt 15:** Content moderation integration — Claude API for every photo and reflection
- **Prompt 16:** Perceptual hashing for photo reuse
- **Prompt 17:** Admin moderation queue
- **Prompt 18:** Arabic translation pass for UI strings
- **Prompt 19:** Accessibility + performance audit
- **Prompt 20:** Soft launch checklist (legal pages, analytics, error tracking)

I'll draft each of these when you reach that phase. Don't paste them in advance — the codebase will have evolved by the time you get there and the prompts need to match what's actually there.

---

## Rules for using Claude Code well

1. **One prompt at a time, then review and commit before the next.** If you batch prompts, you batch bugs.
2. **Read the diff.** Don't blindly accept code. Even fast review catches structural issues.
3. **Test manually after every prompt.** "It compiles" is not the same as "it works."
4. **Push back when Claude Code over-builds.** It will sometimes add features you didn't ask for. Tell it to remove them.
5. **Keep CLAUDE.md updated.** When you make a decision (e.g., "we're using Resend for email"), add it. The file is the project's memory across sessions.
6. **Branch per phase.** `git checkout -b phase-1` etc. Merge to main only when the phase is genuinely done.
7. **Don't accept "I think this works."** Make Claude Code run typecheck, lint, and manual smoke tests before declaring done.
8. **When something breaks, paste the actual error.** Don't describe it. Paste the stack trace verbatim.

---

## If something goes sideways

- **Claude Code drifts from the spec:** point it back to CLAUDE.md explicitly.
- **It introduces a library you don't want:** say so, ask it to remove it.
- **It generates code that doesn't compile:** paste the error, ask it to fix only that error.
- **It tries to refactor unrelated code:** stop it. Tell it to revert and stick to the prompt.
- **A prompt is too big and the output is messy:** kill it, split into smaller prompts.
