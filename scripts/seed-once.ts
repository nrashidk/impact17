// One-shot seed runner intended to be triggered from a protected admin route
// (wired up in a later phase). Exposes a callable function that runs the
// SDG seed and the catalogue import using the shared Prisma client.
//
// Safety:
// - The function refuses to run unless `SEED_ALLOW=1` is set in the runtime
//   environment. This avoids accidental re-seeding from a misconfigured
//   admin route in production.
// - It uses `upsert` everywhere, so a successful run on an already-seeded
//   database is a no-op for unchanged rows.

import { prisma } from "../lib/db";
import { seedSdgs } from "./seed-sdgs";
import { importContent, type ImportSummary } from "./import-content";

export type SeedResult = {
  sdgsSeeded: number;
  import: ImportSummary;
};

export async function runSeedOnce(): Promise<SeedResult> {
  if (process.env.SEED_ALLOW !== "1") {
    throw new Error("Refusing to run seed: set SEED_ALLOW=1 to allow this operation");
  }
  const sdgsSeeded = await seedSdgs(prisma);
  const importSummary = await importContent(prisma);
  return { sdgsSeeded, import: importSummary };
}
