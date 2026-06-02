// One-time verification endpoint for the +200 SDG completion bonus
// (Test B from CLAUDE.md). Inserts/updates Submission rows for the
// nrashidk@gmail.com user to bring SDG 1 to fully APPROVED, verifies
// the bonus applies, flips one row to REJECTED to verify the bonus is
// revoked, then rolls back to the snapshot taken at the start so the
// user's real submission history is unchanged.
//
// **DELETE THIS FILE after Test B is confirmed PASS.** It's a
// destructive admin tool gated behind ADMIN_SEED_SECRET; there is no
// reason for it to live in the codebase once the bonus revoke path
// is verified.
//
// Usage:
//   curl -X POST https://<deploy>/api/admin/test-b \
//     -H "Authorization: Bearer $ADMIN_SEED_SECRET"

import { NextResponse, type NextRequest } from "next/server";
import { Prisma, type SubmissionStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { computeUserScore, SDG_COMPLETION_BONUS } from "@/lib/scoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const TARGET_EMAIL = "nrashidk@gmail.com";
const TARGET_SDG_ID = 1;
const PLACEHOLDER_PHOTO = "/test-b-placeholder.jpg";
const PLACEHOLDER_TEXT = "Test B";

function unauthorized() {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

function redact(message: string): string {
  return message
    .replace(/postgres(ql)?:\/\/[^\s]+/gi, "postgres://[redacted]")
    .replace(/DATABASE_URL=[^\s]+/g, "DATABASE_URL=[redacted]");
}

function describeError(err: unknown): string {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return redact(`${err.code}: ${err.message}`);
  }
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return redact(err.message);
  }
  if (err instanceof Error) {
    return redact(err.message);
  }
  return redact(String(err));
}

export async function POST(request: NextRequest) {
  const startedAt = new Date().toISOString();

  // Auth — identical pattern to /api/admin/seed.
  const expected = process.env.ADMIN_SEED_SECRET;
  if (!expected || expected.length === 0) {
    return NextResponse.json(
      { success: false, error: "ADMIN_SEED_SECRET is not configured on the server" },
      { status: 500 },
    );
  }
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return unauthorized();
  if (header.slice("Bearer ".length).trim() !== expected) return unauthorized();

  // Rollback bookkeeping. `insertedIds` are rows we created (delete on rollback).
  // `updatedOriginals` maps a row id we modified to the status it had before we
  // touched it (restore on rollback).
  const insertedIds: string[] = [];
  const updatedOriginals = new Map<string, SubmissionStatus>();
  const rollbackErrors: string[] = [];

  const rollback = async () => {
    for (const [id, originalStatus] of updatedOriginals) {
      try {
        await prisma.submission.update({ where: { id }, data: { status: originalStatus } });
      } catch (e) {
        rollbackErrors.push(`update ${id} -> ${originalStatus}: ${describeError(e)}`);
      }
    }
    if (insertedIds.length > 0) {
      try {
        await prisma.submission.deleteMany({ where: { id: { in: insertedIds } } });
      } catch (e) {
        rollbackErrors.push(`deleteMany inserted: ${describeError(e)}`);
      }
    }
  };

  try {
    // STEP a — look up the user.
    const user = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
      select: { id: true, email: true, name: true, username: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: `User ${TARGET_EMAIL} not found` },
        { status: 404 },
      );
    }

    // SDG 1 actions, deterministic order.
    const sdg1Actions = await prisma.action.findMany({
      where: { sdgId: TARGET_SDG_ID },
      select: { id: true, slug: true },
      orderBy: { slug: "asc" },
    });
    if (sdg1Actions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No SDG 1 actions in DB — has the seed run?" },
        { status: 500 },
      );
    }

    // STEP b — snapshot existing SDG 1 submissions for the user.
    const snapshot = await prisma.submission.findMany({
      where: { userId: user.id, action: { sdgId: TARGET_SDG_ID } },
      select: { id: true, actionId: true, status: true, action: { select: { slug: true } } },
    });
    const existingByActionId = new Map(snapshot.map((s) => [s.actionId, s]));
    const preApprovedCount = snapshot.filter((s) => s.status === "APPROVED").length;
    const wasAlreadyComplete = preApprovedCount === sdg1Actions.length;

    // STEP c — BEFORE_SCORE.
    const beforeScore = await computeUserScore(user.id);

    // STEP d — bring all 10 SDG 1 actions to APPROVED.
    for (const action of sdg1Actions) {
      const existing = existingByActionId.get(action.id);
      if (existing) {
        if (existing.status !== "APPROVED") {
          updatedOriginals.set(existing.id, existing.status);
          await prisma.submission.update({
            where: { id: existing.id },
            data: { status: "APPROVED" },
          });
        }
      } else {
        const created = await prisma.submission.create({
          data: {
            userId: user.id,
            actionId: action.id,
            photoUrl: PLACEHOLDER_PHOTO,
            summary: PLACEHOLDER_TEXT,
            reflection: PLACEHOLDER_TEXT,
            status: "APPROVED",
          },
          select: { id: true },
        });
        insertedIds.push(created.id);
      }
    }

    // STEP e — AFTER_APPROVE_SCORE.
    const afterApprove = await computeUserScore(user.id);

    // STEP f — revoke the first SDG 1 action's submission to REJECTED.
    const firstAction = sdg1Actions[0];
    const firstSubmission = await prisma.submission.findFirst({
      where: { userId: user.id, actionId: firstAction.id },
      select: { id: true },
    });
    if (!firstSubmission) {
      throw new Error(
        "Internal: no submission found for the first SDG 1 action after approve step",
      );
    }
    // Track for rollback if we haven't already touched this row.
    if (!insertedIds.includes(firstSubmission.id) && !updatedOriginals.has(firstSubmission.id)) {
      // Was already APPROVED before step d and untouched until now.
      updatedOriginals.set(firstSubmission.id, "APPROVED");
    }
    await prisma.submission.update({
      where: { id: firstSubmission.id },
      data: { status: "REJECTED" },
    });
    const revokedSubmissionId = firstSubmission.id;
    const revokedActionSlug = firstAction.slug;

    // STEP g — AFTER_REVOKE_SCORE.
    const afterRevoke = await computeUserScore(user.id);

    // STEP h — rollback to the snapshot.
    await rollback();

    // STEP i — FINAL_SCORE_AFTER_ROLLBACK.
    const finalAfterRollback = await computeUserScore(user.id);

    // Verdict.
    // If SDG 1 was already complete pre-test, step d is a no-op so afterApprove
    // is expected to equal beforeScore (the +200 was already in the bonus); the
    // revoke step is what we observe transitioning the bonus out.
    const bonusAppliedCorrectly = wasAlreadyComplete
      ? afterApprove.sdgBonus === beforeScore.sdgBonus &&
        afterApprove.completedSdgCount === beforeScore.completedSdgCount
      : afterApprove.sdgBonus === beforeScore.sdgBonus + SDG_COMPLETION_BONUS &&
        afterApprove.completedSdgCount === beforeScore.completedSdgCount + 1;
    const bonusRevokedCorrectly =
      afterRevoke.sdgBonus === afterApprove.sdgBonus - SDG_COMPLETION_BONUS &&
      afterRevoke.completedSdgCount === afterApprove.completedSdgCount - 1;
    const rollbackClean =
      finalAfterRollback.total === beforeScore.total &&
      finalAfterRollback.actionPoints === beforeScore.actionPoints &&
      finalAfterRollback.sdgBonus === beforeScore.sdgBonus &&
      finalAfterRollback.approvedActionCount === beforeScore.approvedActionCount &&
      finalAfterRollback.completedSdgCount === beforeScore.completedSdgCount;

    let verdict: string;
    if (rollbackErrors.length > 0) {
      verdict = `FAIL: rollback had ${rollbackErrors.length} error(s)`;
    } else if (!bonusAppliedCorrectly) {
      verdict = wasAlreadyComplete
        ? "FAIL: SDG 1 was already complete pre-test but the score moved unexpectedly during the approve step"
        : `FAIL: +${SDG_COMPLETION_BONUS} bonus was not applied after approving all SDG ${TARGET_SDG_ID} actions`;
    } else if (!bonusRevokedCorrectly) {
      verdict = `FAIL: +${SDG_COMPLETION_BONUS} bonus was not revoked after flipping one submission to REJECTED`;
    } else if (!rollbackClean) {
      verdict = "FAIL: final score after rollback does not equal before-score";
    } else {
      verdict = "PASS";
    }

    return NextResponse.json({
      success: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        username: user.username ?? null,
      },
      targetSdgId: TARGET_SDG_ID,
      snapshotCount: snapshot.length,
      sdg1ActionCount: sdg1Actions.length,
      wasAlreadyComplete,
      snapshotStatuses: snapshot.map((s) => ({ actionSlug: s.action.slug, status: s.status })),
      writesPerformed: {
        inserted: insertedIds.length,
        updated: updatedOriginals.size,
        revokedSubmissionId,
        revokedActionSlug,
      },
      beforeScore,
      afterApprove,
      afterRevoke,
      finalAfterRollback,
      bonusAppliedCorrectly,
      bonusRevokedCorrectly,
      rollbackClean,
      rollbackErrors,
      verdict,
    });
  } catch (err) {
    // Best-effort rollback before returning the error.
    try {
      await rollback();
    } catch (rollbackErr) {
      rollbackErrors.push(`outer rollback: ${describeError(rollbackErr)}`);
    }
    return NextResponse.json(
      {
        success: false,
        error: describeError(err),
        attemptedRollback: {
          insertedCount: insertedIds.length,
          updatedCount: updatedOriginals.size,
        },
        rollbackErrors,
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
