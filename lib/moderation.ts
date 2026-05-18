// Content-moderation concern: the fixed category enum the model must choose
// from (stable CODES, never prose, so the UI localises them) and the Zod
// fragment for the moderation portion of the combined review response.

import { z } from "zod";

// Keep in sync with submit.modCategory.* in messages/{en,ar}.json.
export const MOD_CATEGORIES = [
  "sexual",
  "violence",
  "hate",
  "harassment",
  "self_harm",
  "illegal",
  "spam",
  "pii",
  "other",
] as const;

export type ModerationCategory = (typeof MOD_CATEGORIES)[number];

export const moderationResultSchema = z.object({
  flagged: z.boolean(),
  // "none" only valid when flagged === false.
  category: z.enum([...MOD_CATEGORIES, "none"]),
  reason: z.string().max(500),
});

export type ModerationResult = z.infer<typeof moderationResultSchema>;

export const MODERATION_INSTRUCTIONS = `CONTENT MODERATION: Impact17 is a public, all-ages platform. Independently of verification, judge whether the PHOTO or the user's written text is unsafe for a public all-ages audience. Flag if it contains any of: sexual content (sexual), graphic violence or gore (violence), hateful content targeting protected groups (hate), harassment or bullying of a person (harassment), self-harm or suicide content (self_harm), depiction or solicitation of clearly illegal activity (illegal), spam or advertising (spam), exposed personal data of others — full names with contact info, IDs, plates, faces of bystanders used to identify them (pii), or otherwise clearly inappropriate (other). If safe, flagged=false and category="none".`;
