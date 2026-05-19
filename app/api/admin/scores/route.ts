// Internal admin monitoring ONLY. Protected by ADMIN_SEED_SECRET (same Bearer
// pattern as /api/admin/seed; there is no user role system yet).
//
// This output must NEVER feed any user-visible surface — no leaderboard, no
// rank, no "top contributor", no profile element. It exists solely so the
// operator can monitor scores while the public/peer leaderboard stays gated
// behind the not-yet-built human-review system.

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { computeUserScore } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(request: NextRequest) {
  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || expected.length === 0) {
    return NextResponse.json(
      { error: "ADMIN_SEED_SECRET is not configured on the server" },
      { status: 500 },
    );
  }
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return unauthorized();
  if (header.slice("Bearer ".length).trim() !== expected) return unauthorized();

  const users = await prisma.user.findMany({
    select: { id: true, username: true },
    orderBy: { createdAt: "asc" },
  });

  const scores = [];
  for (const u of users) {
    const score = await computeUserScore(u.id);
    scores.push({
      userId: u.id,
      username: u.username,
      total: score.total,
      actionPoints: score.actionPoints,
      sdgBonus: score.sdgBonus,
      approvedActionCount: score.approvedActionCount,
      completedSdgCount: score.completedSdgCount,
    });
  }

  return NextResponse.json({ count: scores.length, scores });
}

function methodNotAllowed() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
