"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { reviewSubmission } from "@/lib/submission-review";

const submitSchema = z.object({
  actionId: z.string().min(1),
  sdgSlug: z.string().min(1),
  actionSlug: z.string().min(1),
  photoUrl: z
    .string()
    .url()
    .refine((u) => /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//.test(u), {
      message: "invalidPhoto",
    }),
  summary: z.string().trim().min(10).max(2000),
  reflection: z.string().trim().min(10).max(2000),
  enjoyment: z.string().trim().max(500).optional().default(""),
  rating: z.coerce.number().int().min(1).max(5),
});

export type SubmitState = {
  error?:
    | "notSignedIn"
    | "profileIncomplete"
    | "actionNotFound"
    | "alreadyInFlight"
    | "invalidPhoto"
    | "validation";
};

export async function submitAction(
  _prev: SubmitState | undefined,
  formData: FormData,
): Promise<SubmitState> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return { error: "notSignedIn" };
  if (!user.username || !user.dateOfBirth) return { error: "profileIncomplete" };

  const parsed = submitSchema.safeParse({
    actionId: formData.get("actionId"),
    sdgSlug: formData.get("sdgSlug"),
    actionSlug: formData.get("actionSlug"),
    photoUrl: formData.get("photoUrl"),
    summary: formData.get("summary"),
    reflection: formData.get("reflection"),
    enjoyment: formData.get("enjoyment") ?? "",
    rating: formData.get("rating"),
  });
  if (!parsed.success) {
    const isPhoto = parsed.error.issues.some((i) => i.path[0] === "photoUrl");
    return { error: isPhoto ? "invalidPhoto" : "validation" };
  }

  const action = await prisma.action.findUnique({
    where: { id: parsed.data.actionId },
    select: { id: true },
  });
  if (!action) return { error: "actionNotFound" };

  // One in-flight submission per action: a prior REJECTED one may be redone.
  const existing = await prisma.submission.findFirst({
    where: {
      userId: user.id,
      actionId: action.id,
      status: { in: ["PENDING", "APPROVED", "IN_REVIEW"] },
    },
    select: { id: true },
  });
  if (existing) return { error: "alreadyInFlight" };

  const created = await prisma.submission.create({
    data: {
      userId: user.id,
      actionId: action.id,
      photoUrl: parsed.data.photoUrl,
      photoHash: null,
      summary: parsed.data.summary,
      reflection: parsed.data.reflection,
      enjoyment: parsed.data.enjoyment || null,
      rating: parsed.data.rating,
      status: "PENDING",
    },
    select: { id: true },
  });

  // Run AI verification + content moderation after the response is sent.
  // The submission stays PENDING until this completes.
  after(() => reviewSubmission(created.id));

  redirect(`/sdgs/${parsed.data.sdgSlug}/actions/${parsed.data.actionSlug}/submit/success`);
}
