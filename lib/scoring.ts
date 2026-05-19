// Scoring engine. A user's score is ALWAYS recomputed from their APPROVED
// submissions — never a stored running total. If a submission's status later
// changes away from APPROVED (e.g. human review flips it to REJECTED), its
// points vanish automatically on the next recompute with no manual fixup.
//
// Point rule (locked in CLAUDE.md / spec):
//   - Effort-weighted action points: each distinct APPROVED action counts
//     its Action.points (Easy=5, Medium=10, Hard=20).
//   - SDG completion bonus: +200 for each SDG where every one of its actions
//     has an APPROVED submission by this user.
// Only APPROVED submissions contribute; PENDING/IN_REVIEW/REJECTED = 0.

import { prisma } from "@/lib/db";

export const SDG_COMPLETION_BONUS = 200;

export type UserScore = {
  total: number;
  actionPoints: number;
  sdgBonus: number;
  approvedActionCount: number;
  completedSdgCount: number;
};

// Pure recompute over source rows. No counters, no caching.
export async function computeUserScore(userId: string): Promise<UserScore> {
  const approved = await prisma.submission.findMany({
    where: { userId, status: "APPROVED" },
    select: { actionId: true, action: { select: { points: true, sdgId: true } } },
  });

  // Dedupe by actionId so an action is only ever scored once, even if more
  // than one APPROVED row somehow exists for it.
  const distinctByAction = new Map<string, { points: number; sdgId: number }>();
  for (const s of approved) {
    if (!distinctByAction.has(s.actionId)) {
      distinctByAction.set(s.actionId, {
        points: s.action.points,
        sdgId: s.action.sdgId,
      });
    }
  }

  let actionPoints = 0;
  const approvedPerSdg = new Map<number, number>();
  for (const { points, sdgId } of distinctByAction.values()) {
    actionPoints += points;
    approvedPerSdg.set(sdgId, (approvedPerSdg.get(sdgId) ?? 0) + 1);
  }

  // Total actions per SDG, from the catalogue (not hardcoded to 10).
  const totals = await prisma.action.groupBy({
    by: ["sdgId"],
    _count: { _all: true },
  });
  const totalPerSdg = new Map<number, number>();
  for (const row of totals) {
    totalPerSdg.set(row.sdgId, row._count._all);
  }

  let completedSdgCount = 0;
  for (const [sdgId, approvedCount] of approvedPerSdg) {
    const total = totalPerSdg.get(sdgId);
    if (total !== undefined && total > 0 && approvedCount >= total) {
      completedSdgCount += 1;
    }
  }

  const sdgBonus = completedSdgCount * SDG_COMPLETION_BONUS;

  return {
    total: actionPoints + sdgBonus,
    actionPoints,
    sdgBonus,
    approvedActionCount: distinctByAction.size,
    completedSdgCount,
  };
}
