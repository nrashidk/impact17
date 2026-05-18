// Photo-verification concern: the Zod fragment for the verification portion
// of the combined review response, the action-brief prompt builder (trusted
// catalogue context), and the confidence thresholds for the decision policy.

import { z } from "zod";

export const APPROVE_THRESHOLD = 0.8;
export const REVIEW_THRESHOLD = 0.5;

export const verificationResultSchema = z.object({
  match: z.boolean(),
  confidence: z.number().min(0).max(1),
  reason: z.string().max(500),
});

export type VerificationResult = z.infer<typeof verificationResultSchema>;

export const VERIFICATION_INSTRUCTIONS = `PHOTO VERIFICATION: Decide whether the photo is plausible, genuine proof that THIS specific action was carried out, using the action brief below as the trusted reference. match=true only if the photo credibly depicts the action or its concrete artefact/result. confidence is your calibrated certainty (0..1). Be skeptical of stock-looking, screenshotted, or unrelated images.`;

// The action brief is TRUSTED context from the locked catalogue.
export function buildActionBrief(action: {
  titleEn: string;
  descriptionEn: string | null;
  howToStepsEn: unknown;
}): string {
  const steps = Array.isArray(action.howToStepsEn)
    ? (action.howToStepsEn as unknown[]).filter((s): s is string => typeof s === "string")
    : [];
  const stepsText = steps.length
    ? steps.map((s, i) => `${i + 1}. ${s}`).join("\n")
    : "(no steps provided)";
  return [
    `Action title: ${action.titleEn}`,
    `Action description: ${action.descriptionEn ?? action.titleEn}`,
    `How to do it:\n${stepsText}`,
  ].join("\n\n");
}
