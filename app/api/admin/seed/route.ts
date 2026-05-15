// One-time seed trigger. Protected by ADMIN_SEED_SECRET.
// Use:
//   curl -X POST https://<deploy>/api/admin/seed \
//     -H "Authorization: Bearer $ADMIN_SEED_SECRET"
//
// The handler is idempotent (upserts by slug) so re-triggering is safe.

import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { seedSdgs } from "@/scripts/seed-sdgs";
import { importContent } from "@/scripts/import-content";

// Route segment config.
// `maxDuration = 300` lifts the serverless function timeout to 5 minutes
// (Vercel Hobby tier ceiling). The seed touches 17 SDGs + 170 actions in
// sequential upserts, which from a cold Neon connection can exceed the
// default 10-second timeout.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

// Strip any postgres connection URLs that might appear in an error message
// before returning it to the caller. Prisma errors don't usually include
// credentials, but redact defensively in case underlying Postgres errors do.
function redact(message: string): string {
  return message
    .replace(/postgres(ql)?:\/\/[^\s]+/gi, "postgres://[redacted]")
    .replace(/DATABASE_URL=[^\s]+/g, "DATABASE_URL=[redacted]");
}

function describeError(err: unknown): { message: string; code?: string } {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return { code: err.code, message: redact(err.message) };
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      code: err.errorCode,
      message: redact(err.message),
    };
  }
  if (err instanceof Prisma.PrismaClientRustPanicError) {
    return { code: "PRISMA_PANIC", message: redact(err.message) };
  }
  if (err instanceof Error) {
    return { message: redact(err.message) };
  }
  return { message: redact(String(err)) };
}

export async function POST(request: NextRequest) {
  const startedAt = new Date().toISOString();
  console.log(`[admin/seed] admin seed triggered at ${startedAt}`);

  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || expected.length === 0) {
    console.error("[admin/seed] ADMIN_SEED_SECRET is not configured");
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
    console.log("[admin/seed] seeding 17 SDGs…");
    const sdgs = await seedSdgs(prisma);
    console.log(`[admin/seed]   ${sdgs} SDGs upserted`);

    console.log("[admin/seed] importing 170 actions…");
    const summary = await importContent(prisma);
    console.log(`[admin/seed]   ${summary.totalActions} actions upserted`);

    const finishedAt = new Date().toISOString();
    console.log(`[admin/seed] success — finished at ${finishedAt}`);
    return NextResponse.json({
      success: true,
      sdgs,
      actions: summary.totalActions,
      breakdown: {
        easy: summary.byEffort.EASY,
        medium: summary.byEffort.MEDIUM,
        hard: summary.byEffort.HARD,
      },
      startedAt,
      finishedAt,
    });
  } catch (err) {
    const { code, message } = describeError(err);
    console.error(`[admin/seed] FAILED${code ? ` [${code}]` : ""}: ${message}`);
    return NextResponse.json(
      {
        success: false,
        error: message,
        ...(code ? { code } : {}),
      },
      { status: 500 },
    );
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
