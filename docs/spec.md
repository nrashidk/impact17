# Impact17 — Complete Product Specification

**Status:** FINAL. All decisions locked.

This document supersedes all previous Impact17 plans.

---

## 1. What Impact17 is

A bilingual (Arabic/English) public consumer web platform for taking verified action on the 17 UN Sustainable Development Goals. Users complete real-world sustainability actions, submit photo proof, earn badges, climb leaderboards, and engage socially. Launched and maintained personally by Nasser. *(Note: "climb leaderboards" and "engage socially" are gated — see the ACCEPTED DEVIATION (2026-05-19) notes in §2 and §8; the human-review system is a launch prerequisite and public/peer surfaces follow it.)*

**Core loop:**
Landing page (SDG wheel) → scroll to grid of 17 SDGs → click an SDG → see 10 actions → click an action → read "how to" steps → do it in real life → submit photo + summary + reflection + what you enjoyed + star rating → AI verifies → earn action badge. Complete all 10 actions in an SDG → SDG badge + 200-point bonus. Complete all 17 SDGs → headline achievement.

---

## 2. Locked decisions

### Product & scope
| Area | Decision |
|---|---|
| Product type | Real consumer product, public launch, maintained personally for years |
| Scope | All 17 SDGs in v1, ~170 actions |
| Completion goal | "Complete all 17 SDGs" is the headline user goal |
| Languages | Bilingual Arabic/English at launch; Nasser writes English, AI translates, Nasser edits Arabic |

### Actions & content
| Area | Decision |
|---|---|
| Content source | Existing 170-action list from the proposal document |
| Non-verifiable actions | ~60 weak actions ("promote respect", "speak kindly") rewritten as photo-verifiable equivalents ("write a kindness note and photograph it") |
| Duplicate actions | Each action credited to ONE primary SDG only; gaps from deduplication filled with new actions so every SDG has 10 distinct actions |
| Effort tiers | Every action tagged Easy / Medium / Hard; ~40% / 40% / 20% split per SDG |
| "How to do this" guide | 3–6 short bullet steps per action; **UAE-localised — names real UAE species, places, partners, and programmes (Goumbook, Sparklo, EAD, etc.)** |

### Verification & points
| Area | Decision |
|---|---|
| Verification | AI photo verification (Claude vision API) on every submission + perceptual hashing to block reused photos |
| Points | Effort-weighted: Easy = 5, Medium = 10, Hard = 20. Plus 200-point bonus per completed SDG |
| Failed verification | User sees why it failed and can resubmit |

### Social & engagement
| Area | Decision |
|---|---|
| Profiles | Public profiles with badge walls — **SUPERSEDED, see ACCEPTED DEVIATION (2026-05-19) below** |
| Reflections | Public |
| Social features | Full social: comments, follows, likes |
| Leaderboard | Weekly + all-time, both visible from launch — **SUPERSEDED, see ACCEPTED DEVIATION (2026-05-19) below** |
| Notifications | On (badge earned, weekly progress, social activity) |

> **ACCEPTED DEVIATION (2026-05-19):** The original intent above is retained for the record but is superseded. Public leaderboard, peer-visible standing/ranking, and public profiles (incl. public reflections and public badge walls) are **deferred until a human-review system exists and has been tested. That human-review system is a LAUNCH PREREQUISITE — a blocker that must be built and pass testing before launch, not a post-launch phase.** The points engine and a private, own-score-only view are in scope now; everything peer-visible is gated behind the human-review system. This is a deliberate, safety-driven decision and overrides the "visible from launch" intent. Authoritative cross-reference: CLAUDE.md → "Scoring & leaderboard (locked)" and the phase plan.

### Moderation & safety
| Area | Decision |
|---|---|
| Moderation system | Hybrid: AI pre-screen on every photo + reflection before visible, user reports, manual review queue for edge cases — **SUPERSEDED in part, see ACCEPTED DEVIATION (2026-05-19) below** |

> **ACCEPTED DEVIATION (2026-05-19):** The AI pre-screen on every photo + reflection at submission time is built and stands. However, the **user-report flow and the manual review queue are NOT yet built** — the original wording implies they exist; they do not. AI-uncertain submissions sit in a parked `IN_REVIEW` state with no admin UI. Building this human-review / moderation queue is the **launch-blocking prerequisite**: it must exist and be tested before launch and before any public/peer-visible surface or leaderboard ships. Authoritative cross-reference: CLAUDE.md → Critical Product Rule 2 & 6 and the phase plan.

### Account & infrastructure
| Area | Decision |
|---|---|
| Auth | Email/password + Google sign-in |
| Analytics | On |
| Monetisation | Not at launch |
| Launch | Soft launch |
| Domain | To be confirmed by Nasser (end of day) |
| Tech stack | Next.js + Tailwind (frontend); Django + DRF + PostgreSQL (backend); Claude API (verification + moderation) — matches existing Masary Manager stack |
| Hosting | Vercel (frontend) + DigitalOcean Droplet or Render (backend) |
| Build | Solo, ~15 hrs/week |

---

## 3. Resolved — final decisions

### Minor users
**Decision: Adults-only at launch (18+ age gate at sign-up). Parental consent flow added in v1.5.**
A self-confirm checkbox is not legally valid under UAE PDPL. Launch is 18+; verifiable parental consent flow comes in v1.5 once the core product is stable.

### Social safety tooling — ships in v1
Full social (comments, follows, likes) ships with full safety tooling in v1:
- Block and mute functions
- Harassment/abuse policy
- Report flow for behaviour (not just content)
- Manual review queue covers both content and behaviour reports

---

## 4. Page types

1. **Landing** — SDG wheel hero, scroll to 4-col grid of 17 SDGs, global stats bar, sign up CTA
2. **SDG page** — SDG header, grid of 10 actions, personal completion progress
3. **Action page** — title, effort badge, points, "how to" steps, submission form (photo + summary + reflection + enjoyment + rating)
4. **User dashboard** — profile, badge wall, points, suggested next actions, leaderboard preview
5. **Leaderboard** — weekly + all-time tabs
6. **Public profile** — badge wall, action count, public reflections, follow button
7. **Social/activity feed** — comments, likes, follows activity
8. **Moderation queue** (admin, Nasser only) — AI-flagged content + user reports

*Page-types ordering note (2026-05-19): page 8 (the human-review / moderation queue) is a **launch prerequisite** and must ship before pages 4's leaderboard preview, 5 (Leaderboard), 6 (Public profile), and 7 (Social feed) — all of which are gated per the ACCEPTED DEVIATION notes in §2 and §8. The dashboard (page 4) ships in a private own-score-only form without the leaderboard preview until then.*

---

## 5. Honest build estimate

| Scope component | Build time (solo, ~15 hrs/week) |
|---|---|
| Core platform (17 SDGs, AI verification, badges, leaderboard, public profiles) | 6 weeks |
| Full social (comments, follows, likes) | +2 weeks |
| Social safety tooling (block, mute, abuse policy, behaviour reports) | +1 week |
| 18+ age gate | included in core |
| **Total** | **~9 weeks** |

Parental consent flow for minors (v1.5) is +1 week, deferred — not in this estimate.

Plus content work in parallel: rewriting ~60 actions, filling deduplication gaps, assigning effort tiers, writing 170 "how to" guides, translating all to Arabic. This is the silent bottleneck — budget 30–40 hours.

---

## 6. Ongoing cost estimate (personal, post-launch)

| Item | At ~1,000 active users | At ~10,000 active users |
|---|---|---|
| Hosting | $20–50/mo | $150–400/mo |
| Database | $15–30/mo | $80–200/mo |
| Claude API (verification + moderation) | $30–80/mo | $300–800/mo |
| Email service | $10–20/mo | $50–150/mo |
| Domain + SSL | ~$30/yr | ~$30/yr |
| **Total** | **~$75–180/mo** | **~$580–1,550/mo** |

No revenue at launch by decision. These costs are personal and ongoing for years.

---

## 7. Risks on the record

These have been flagged and accepted, not solved:

1. **9th active workstream** alongside InvoLinks, Future Pathways, Kanz, uaeroots, Masary Manager, CEC-ECAE work, AI content factory, and family. Load is real.
2. **No competitive moat.** Existing platforms (AWorld — UN-partnered, Joulebug, Capture) already do verified SDG action. "Why Impact17 instead" is unanswered.
3. **Differentiation: UAE localisation is the moat.** Existing platforms (AWorld — UN-partnered, Joulebug, Capture) do verified SDG action globally but generically. Impact17's answer to "why this instead of AWorld" is UAE-localised content — real species, places, partners, programmes — marketed to a UAE audience the founder already reaches. This is structurally hard for a global platform to copy. It must be executed well in the catalogue or the advantage is lost.
4. **Scope grew at every fork** — all 17 SDGs, full social, public everything. Each defensible alone; stacked, it's an 9–11 week solo build for a product with no validated demand.
5. **Permanent personal maintenance + cost burden** with no monetisation plan.
6. **Moderation load is forever.** Full social + public reflections + minors (if added) = continuous moderation obligation, not a one-time build.

---

## 8. Recommended sequencing (not a scope cut — a reorder)

If the goal is to launch *and survive*:

1. **v1 (launch):** 17 SDGs, AI verification, badges, leaderboard, public profiles, adults-only. NO social features yet. — **SUPERSEDED, see ACCEPTED DEVIATION (2026-05-19) below**
2. **v1.5 (4–6 weeks post-launch):** Parental consent flow + minor users, once core is stable.
3. **v2 (validated demand):** Full social — comments, follows, likes — with safety tooling, once there are enough users for social to matter.

This launches in ~6 weeks instead of ~11, validates demand before the expensive social build, and defers the moderation burden until there are users to moderate. The vision is unchanged — only the order is.

You've chosen the all-at-once path. This section is here so the alternative is on the record.

> **ACCEPTED DEVIATION (2026-05-19):** v1 launch scope is narrowed and reordered. Leaderboard and public profiles are **removed from v1**. The **human-review / moderation queue is promoted to a v1 launch prerequisite** — it is the blocker that unblocks launch, NOT a post-launch phase. v1 ships with: 17 SDGs, AI verification + content moderation pre-screen, badges, a **private own-score-only** points view, and the human-review system itself — no public leaderboard, no peer-visible standing, no public profiles until that human-review system exists and has been tested (which gates them, and they may then follow). The original sequencing above is kept for the record but this note supersedes the v1 line. Authoritative cross-reference: CLAUDE.md → "Scoring & leaderboard (locked)" and phase plan; that gate governs.

---

## 9. Next steps — spec is final, build can begin

1. **Action catalogue rewrite** (English first) — the biggest content job:
   - Replace the ~60 non-photo-verifiable actions with photo-verifiable equivalents
   - Fill deduplication gaps so every SDG has 10 distinct actions
   - Assign Easy/Medium/Hard effort tier to all ~170
   - Write 3–6 step "how to" guide for each
   - Assign primary SDG to each action
2. **Data model + Django backend scaffold** — users, SDGs, actions, submissions, badges, points, social graph, moderation queue
3. **Arabic translation pass** — all action content + UI strings
4. **Frontend build** — 8 page types, mobile-first, RTL support
5. **AI integration** — Claude API for photo verification + content moderation pre-screen
6. **Social + safety build** — comments, follows, likes, block, mute, report flow
7. **Testing** — verification accuracy, moderation coverage, RTL layout, edge cases
8. **Soft launch**

**Recommended starting point:** the action catalogue rewrite. It's the bottleneck, it's needed before backend data modelling, and it can be done in parallel with nothing else blocking it.
