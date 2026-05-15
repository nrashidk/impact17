// Parses the 17 per-SDG catalogue markdown files in /content/ and imports them
// into the Action table. Idempotent — upserts by slug.
//
// Catalogue format (per action block):
//   ## N.M — Title
//   - **Effort:** Easy|Medium|Hard | **Points:** 5|10|20 | **Verification:** <text> [*(rewritten)*]
//   - **How to do this:**
//     - Step 1
//     - Step 2
//     ...
//   - **Reflection prompts:** Q1? Q2? Q3?
//
// Wording is preserved verbatim — no paraphrasing.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient, EffortTier, VerificationType } from "@prisma/client";

// Resolved relative to the process working directory. Locally this is the
// project root; on Vercel it is the deployment root. The content/ folder is
// listed in next.config.ts → outputFileTracingIncludes so the serverless
// function bundle includes the 17 markdown files.
const CONTENT_DIR = path.resolve(process.cwd(), "content");

type ParsedAction = {
  sdgId: number;
  actionIndex: number;
  title: string;
  effort: EffortTier;
  points: number;
  verificationText: string;
  verificationType: VerificationType;
  howToSteps: string[];
  reflectionPrompts: string;
  isRewritten: boolean;
};

const EFFORT_POINTS: Record<EffortTier, number> = {
  EASY: 5,
  MEDIUM: 10,
  HARD: 20,
};

// Verification text keywords that signal a created artefact (poster, written
// guide, log, etc.) vs a real-world physical activity (planted tree, clean-up,
// donation point, etc.). Matched case-insensitively against the verification
// text. First match wins → PHOTO_ARTEFACT. Otherwise → PHOTO_PHYSICAL.
const ARTEFACT_KEYWORDS: readonly string[] = [
  "poster",
  "guide",
  "infographic",
  "presentation",
  "case study",
  "written",
  "log",
  "tracker",
  "checklist",
  "audit",
  "summary",
  "design",
  "drawing",
  "model",
  "map",
  "artwork",
  "research",
  "calculation",
  "notes",
  "reflection",
  "cv",
  "campaign piece",
  "screenshot",
  "data",
  "tickets",
  "results",
  "challenge log",
  "month-long tracker",
  "marker",
  "transparency project",
  "career map",
  "profile",
];

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['`"]/g, "")
    .replace(/[‘’“”]/g, "")
    .replace(/[—–]/g, " ")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function classifyVerification(verificationText: string): VerificationType {
  const lower = verificationText.toLowerCase();
  for (const kw of ARTEFACT_KEYWORDS) {
    if (lower.includes(kw)) return "PHOTO_ARTEFACT";
  }
  return "PHOTO_PHYSICAL";
}

function parseEffort(raw: string): EffortTier {
  const normalised = raw.trim().toUpperCase();
  if (normalised === "EASY" || normalised === "MEDIUM" || normalised === "HARD") {
    return normalised;
  }
  throw new Error(`Unknown effort tier: "${raw}"`);
}

// Splits the file into action blocks keyed by "## N.M — Title".
function splitActions(
  sdgId: number,
  fileText: string,
): ReadonlyArray<{
  actionIndex: number;
  title: string;
  body: string;
}> {
  const headingPattern = new RegExp(`^## ${sdgId}\\.(\\d+) — ([^\\n]+)$`, "gm");
  const matches = Array.from(fileText.matchAll(headingPattern));
  const blocks: { actionIndex: number; title: string; body: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const next = matches[i + 1];
    const start = (match.index ?? 0) + match[0].length;
    const end = next?.index ?? fileText.length;
    blocks.push({
      actionIndex: Number(match[1]),
      title: match[2].trim(),
      body: fileText.slice(start, end),
    });
  }
  return blocks;
}

function parseActionBody(
  body: string,
): Pick<
  ParsedAction,
  | "effort"
  | "points"
  | "verificationText"
  | "verificationType"
  | "howToSteps"
  | "reflectionPrompts"
  | "isRewritten"
> {
  const metaMatch = body.match(
    /-\s+\*\*Effort:\*\*\s*([A-Za-z]+)\s*\|\s*\*\*Points:\*\*\s*(\d+)\s*\|\s*\*\*Verification:\*\*\s*([^\n]+)/,
  );
  if (!metaMatch) {
    throw new Error("Could not parse meta line");
  }
  const effort = parseEffort(metaMatch[1]);
  const points = Number(metaMatch[2]);
  let verificationLine = metaMatch[3].trim();
  const rewrittenMatch = verificationLine.match(/\s*\*\(rewritten\)\*\s*$/i);
  const isRewritten = Boolean(rewrittenMatch);
  if (rewrittenMatch) {
    verificationLine = verificationLine.slice(0, rewrittenMatch.index).trim();
  }

  // How-to steps: bullets nested under "- **How to do this:**"
  const howToMatch = body.match(/-\s+\*\*How to do this:\*\*\s*\n((?:\s{2,}-\s+[^\n]+\n?)+)/);
  if (!howToMatch) {
    throw new Error("Could not parse how-to block");
  }
  const howToSteps = howToMatch[1]
    .split("\n")
    .map((line) => line.replace(/^\s+-\s+/, "").trim())
    .filter((line) => line.length > 0);

  // Reflection prompts: single line after "- **Reflection prompts:**"
  const reflMatch = body.match(/-\s+\*\*Reflection prompts:\*\*\s*([^\n]+)/);
  if (!reflMatch) {
    throw new Error("Could not parse reflection prompts");
  }
  const reflectionPrompts = reflMatch[1].trim();

  if (EFFORT_POINTS[effort] !== points) {
    throw new Error(
      `Effort/points mismatch: ${effort} should be ${EFFORT_POINTS[effort]} points, got ${points}`,
    );
  }

  return {
    effort,
    points,
    verificationText: verificationLine,
    verificationType: classifyVerification(verificationLine),
    howToSteps,
    reflectionPrompts,
    isRewritten,
  };
}

export async function parseAllActions(): Promise<ParsedAction[]> {
  const files = (await readdir(CONTENT_DIR)).filter((f) => /^sdg-\d{2}\.md$/.test(f)).sort();
  if (files.length !== 17) {
    throw new Error(`Expected 17 catalogue files, found ${files.length}`);
  }
  const all: ParsedAction[] = [];
  for (const filename of files) {
    const sdgId = Number(filename.match(/^sdg-(\d{2})\.md$/)![1]);
    const text = await readFile(path.join(CONTENT_DIR, filename), "utf-8");
    const blocks = splitActions(sdgId, text);
    if (blocks.length !== 10) {
      throw new Error(`${filename}: expected 10 actions, got ${blocks.length}`);
    }
    for (const block of blocks) {
      try {
        const parsed = parseActionBody(block.body);
        all.push({
          sdgId,
          actionIndex: block.actionIndex,
          title: block.title,
          ...parsed,
        });
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        throw new Error(
          `${filename} action ${sdgId}.${block.actionIndex} ("${block.title}"): ${reason}`,
        );
      }
    }
  }
  return all;
}

export type ImportSummary = {
  totalActions: number;
  byEffort: Record<EffortTier, number>;
  byVerification: Record<VerificationType, number>;
  rewrittenCount: number;
};

export async function importContent(prisma: PrismaClient): Promise<ImportSummary> {
  const actions = await parseAllActions();

  // Slug uniqueness check (the @unique constraint would error, but a pre-check
  // gives a clearer message).
  const slugs = new Map<string, string>();
  for (const a of actions) {
    const slug = slugify(a.title);
    const existing = slugs.get(slug);
    if (existing) {
      throw new Error(
        `Slug collision: "${slug}" is generated by both "${existing}" and "${a.sdgId}.${a.actionIndex} ${a.title}"`,
      );
    }
    slugs.set(slug, `${a.sdgId}.${a.actionIndex} ${a.title}`);
  }

  const summary: ImportSummary = {
    totalActions: 0,
    byEffort: { EASY: 0, MEDIUM: 0, HARD: 0 },
    byVerification: { PHOTO_PHYSICAL: 0, PHOTO_ARTEFACT: 0 },
    rewrittenCount: 0,
  };

  for (const a of actions) {
    const slug = slugify(a.title);
    await prisma.action.upsert({
      where: { slug },
      create: {
        sdgId: a.sdgId,
        slug,
        titleEn: a.title,
        titleAr: "",
        descriptionEn: a.title,
        descriptionAr: "",
        howToStepsEn: a.howToSteps,
        howToStepsAr: [],
        reflectionPromptsEn: [a.reflectionPrompts],
        reflectionPromptsAr: [],
        effortTier: a.effort,
        points: a.points,
        verificationType: a.verificationType,
        primarySdgId: a.sdgId,
      },
      update: {
        sdgId: a.sdgId,
        titleEn: a.title,
        descriptionEn: a.title,
        howToStepsEn: a.howToSteps,
        reflectionPromptsEn: [a.reflectionPrompts],
        effortTier: a.effort,
        points: a.points,
        verificationType: a.verificationType,
        primarySdgId: a.sdgId,
      },
    });
    summary.totalActions += 1;
    summary.byEffort[a.effort] += 1;
    summary.byVerification[a.verificationType] += 1;
    if (a.isRewritten) summary.rewrittenCount += 1;
  }

  return summary;
}
