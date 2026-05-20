import { PrismaClient } from "@prisma/client";
import { seedSdgs } from "../scripts/seed-sdgs";
import { importContent } from "../scripts/import-content";

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log("Seeding SDGs…");
    const sdgCount = await seedSdgs(prisma);
    console.log(`  ✓ ${sdgCount} SDGs upserted`);

    console.log("Importing action catalogue…");
    const summary = await importContent(prisma);
    console.log(`  ✓ ${summary.totalActions} actions upserted`);
    console.log(
      `    by effort:        EASY=${summary.byEffort.EASY}, MEDIUM=${summary.byEffort.MEDIUM}, HARD=${summary.byEffort.HARD}`,
    );
    console.log(
      `    by verification:  PHOTO_PHYSICAL=${summary.byVerification.PHOTO_PHYSICAL}, PHOTO_ARTEFACT=${summary.byVerification.PHOTO_ARTEFACT}`,
    );
    console.log(`    rewritten:        ${summary.rewrittenCount}`);

    console.log("");
    console.log("Action titleAr / howToStepsAr / reflectionPromptsAr are populated from");
    console.log("the /content/sdg-NN-ar.md files alongside their English counterparts.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
