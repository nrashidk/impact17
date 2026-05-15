// One-time seed trigger. Protected by ADMIN_SEED_SECRET.
// Use:
//   curl -X POST https://<deploy>/api/admin/seed \
//     -H "Authorization: Bearer $ADMIN_SEED_SECRET"
//
// The handler is idempotent (upserts by slug) so re-triggering is safe.

import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { seedSdgs } from "@/scripts/seed-sdgs";
import { importContent } from "@/scripts/import-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || expected.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: "ADMIN_SEED_SECRET is not configured on the server",
      },
      { status: 500 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized();
  }
  const token = header.slice("Bearer ".length).trim();
  if (token !== expected) {
    return unauthorized();
  }

  try {
    const sdgs = await seedSdgs(prisma);
    const summary = await importContent(prisma);
    return NextResponse.json({
      success: true,
      sdgs,
      actions: summary.totalActions,
      breakdown: {
        easy: summary.byEffort.EASY,
        medium: summary.byEffort.MEDIUM,
        hard: summary.byEffort.HARD,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

function methodNotAllowed() {
  return NextResponse.json(
    { success: false, error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } },
  );
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
