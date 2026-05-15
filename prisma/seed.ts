import { PrismaClient } from "@prisma/client";
import { seedSdgs, SDG_SEED_DATA } from "../scripts/seed-sdgs";
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

    const missingArabicDescriptions = SDG_SEED_DATA.filter((s) => s.descriptionAr === "").map(
      (s) => s.id,
    );
    if (missingArabicDescriptions.length > 0) {
      console.log("");
      console.log(
        `⚠ Arabic descriptions missing for SDGs: ${missingArabicDescriptions.join(", ")}`,
      );
      console.log(
        "  Names (nameAr) are populated, but descriptions need an official UN translation pass.",
      );
    }
    console.log("");
    console.log("Action titles, descriptions, how-to steps, and reflection prompts are");
    console.log("English-only — titleAr / descriptionAr / howToStepsAr / reflectionPromptsAr");
    console.log("will be filled in by the Phase 6 translation pass.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
