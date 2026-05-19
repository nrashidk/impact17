"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { isAuthorizedReviewer } from "@/lib/review-auth";

const approveSchema = z.object({
  key: z.string().min(1),
  locale: z.string().min(1),
  submissionId: z.string().min(1),
});

const rejectSchema = approveSchema.extend({
  reason: z.string().trim().min(1).max(500),
});

export async function approveSubmission(formData: FormData) {
  const parsed = approveSchema.safeParse({
    key: formData.get("key"),
    locale: formData.get("locale"),
    submissionId: formData.get("submissionId"),
  });
  if (!parsed.success) return;
  if (!isAuthorizedReviewer({ key: parsed.data.key })) return;

  // Only act on rows still in the queue. Score is live-recomputed from
  // APPROVED submissions, so this status change alone grants the points.
  await prisma.submission.updateMany({
    where: { id: parsed.data.submissionId, status: "IN_REVIEW" },
    data: { status: "APPROVED" },
  });

  redirect(`/${parsed.data.locale}/admin/review?key=${encodeURIComponent(parsed.data.key)}`);
}

export async function rejectSubmission(formData: FormData) {
  const parsed = rejectSchema.safeParse({
    key: formData.get("key"),
    locale: formData.get("locale"),
    submissionId: formData.get("submissionId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return;
  if (!isAuthorizedReviewer({ key: parsed.data.key })) return;

  await prisma.submission.updateMany({
    where: { id: parsed.data.submissionId, status: "IN_REVIEW" },
    data: { status: "REJECTED", modReason: parsed.data.reason },
  });

  redirect(`/${parsed.data.locale}/admin/review?key=${encodeURIComponent(parsed.data.key)}`);
}
