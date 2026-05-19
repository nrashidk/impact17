// One-off local scoring test harness. Run against DATABASE_URL.
//
//   npx tsx scripts/test-scoring.ts user@example.com
//   npx tsx scripts/test-scoring.ts user@example.com --cleanup
//
// Seeds APPROVED submissions for a user: one single action, plus every
// action in whichever SDG has the fewest actions (computed, not hardcoded),
// so you can watch /points and verify the recompute. --cleanup removes all
// of that user's Submission rows. NEVER calls any external API.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function arg(): { email: string; cleanup: boolean } {
  const args = process.argv.slice(2);
  const cleanup = args.includes("--cleanup");
  const email = args.find((a) => !a.startsWith("--"));
  if (!email) {
    console.error("Usage: npx tsx scripts/test-scoring.ts <email> [--cleanup]");
    process.exit(1);
  }
  return { email, cleanup };
}

async function main() {
  const { email, cleanup } = arg();

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true },
  });
  if (!user) {
    console.error(`No user with email ${email}`);
    process.exit(1);
  }

  if (cleanup) {
    const del = await prisma.submission.deleteMany({
      where: { userId: user.id },
    });
    console.log(`Cleanup: deleted ${del.count} Submission row(s) for ${user.email} (${user.id})`);
    return;
  }

  // SDG with the fewest actions (tie-break: lowest sdgId), computed.
  const grouped = await prisma.action.groupBy({
    by: ["sdgId"],
    _count: { _all: true },
  });
  if (grouped.length === 0) {
    console.error("No actions in DB — seed the catalogue first.");
    process.exit(1);
  }
  grouped.sort((a, b) =>
    a._count._all !== b._count._all ? a._count._all - b._count._all : a.sdgId - b.sdgId,
  );
  const smallestSdgId = grouped[0].sdgId;
  const smallestCount = grouped[0]._count._all;

  const sdg = await prisma.sdg.findUnique({
    where: { id: smallestSdgId },
    select: { slug: true, number: true },
  });

  const sdgActions = await prisma.action.findMany({
    where: { sdgId: smallestSdgId },
    select: { id: true, points: true },
    orderBy: { id: "asc" },
  });

  // A single action from a DIFFERENT SDG (so it adds points but no bonus).
  const singleAction = await prisma.action.findFirst({
    where: { sdgId: { not: smallestSdgId } },
    select: { id: true, points: true, sdgId: true },
    orderBy: { id: "asc" },
  });
  if (!singleAction) {
    console.error("Need actions in more than one SDG for the single-action case.");
    process.exit(1);
  }

  const targets = [
    { id: singleAction.id, points: singleAction.points, kind: "single" },
    ...sdgActions.map((a) => ({
      id: a.id,
      points: a.points,
      kind: "smallest-sdg" as const,
    })),
  ];

  let created = 0;
  let skipped = 0;
  let singleSubmissionId = "";
  for (const target of targets) {
    const existing = await prisma.submission.findFirst({
      where: { userId: user.id, actionId: target.id, status: "APPROVED" },
      select: { id: true },
    });
    if (existing) {
      skipped += 1;
      if (target.kind === "single") singleSubmissionId = existing.id;
      continue;
    }
    const row = await prisma.submission.create({
      data: {
        userId: user.id,
        actionId: target.id,
        photoUrl: "https://example.invalid/test-scoring-placeholder.jpg",
        summary: "test-scoring harness seeded submission",
        reflection: "test-scoring harness seeded submission",
        rating: 5,
        status: "APPROVED",
        modStatus: "CLEAN",
        aiMatch: true,
        aiConfidence: 1,
        aiReason: "seeded by scripts/test-scoring.ts",
        processingStartedAt: new Date(),
      },
      select: { id: true },
    });
    created += 1;
    if (target.kind === "single") singleSubmissionId = row.id;
  }

  const singleActionPoints = singleAction.points;
  const sdgActionPoints = sdgActions.reduce((s, a) => s + a.points, 0);
  const expectedActionPoints = singleActionPoints + sdgActionPoints;
  const expectedTotal = expectedActionPoints + 200; // 1 SDG completed → +200

  console.log("=== test-scoring ===");
  console.log(`user email:           ${user.email}`);
  console.log(`user id:              ${user.id}`);
  console.log(
    `single test actionId: ${singleAction.id} (sdgId ${singleAction.sdgId}, ${singleActionPoints} pts)`,
  );
  console.log(
    `chosen SDG slug:      ${sdg?.slug ?? "(unknown)"} (number ${sdg?.number ?? "?"}, sdgId ${smallestSdgId})`,
  );
  console.log(`chosen SDG action count: ${smallestCount}`);
  console.log(`submissions created:  ${created} (skipped existing: ${skipped})`);
  console.log("");
  console.log("Expected /points after this run:");
  console.log(
    `  actionPoints     = ${expectedActionPoints} (single ${singleActionPoints} + SDG ${sdgActionPoints})`,
  );
  console.log(`  sdgBonus         = 200 (chosen SDG fully approved)`);
  console.log(`  completedSdgs    = 1`);
  console.log(`  total            = ${expectedTotal}`);
  console.log("");
  console.log("Flip the single-action submission to REJECTED (paste into Neon):");
  console.log(`  UPDATE "Submission" SET status='REJECTED' WHERE id='${singleSubmissionId}';`);
  console.log(
    `  -- after this, /points total should drop by ${singleActionPoints} to ${expectedTotal - singleActionPoints}`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
