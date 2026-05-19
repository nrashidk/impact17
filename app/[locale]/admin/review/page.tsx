// Internal-only human-review queue. Secret-gated via lib/review-auth.ts
// (the single reviewer-authorization source). NOT linked from any
// user-visible nav; returns 404 to anyone without the secret, matching the
// internal-only posture of /api/admin/scores.

import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { isAuthorizedReviewer } from "@/lib/review-auth";
import { approveSubmission, rejectSubmission } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { key } = await searchParams;
  const bearer = (await headers()).get("authorization");

  if (!isAuthorizedReviewer({ bearer, key })) {
    notFound();
  }

  const t = await getTranslations("review");

  const queue = await prisma.submission.findMany({
    where: { status: "IN_REVIEW" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      photoUrl: true,
      reflection: true,
      aiReason: true,
      aiConfidence: true,
      modStatus: true,
      modCategory: true,
      modReason: true,
      action: { select: { titleEn: true } },
    },
  });

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("count", { n: queue.length })}
        </p>

        {queue.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-500">{t("empty")}</p>
        ) : (
          <ul className="mt-8 space-y-8">
            {queue.map((s) => (
              <li key={s.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.photoUrl}
                  alt={t("photoAlt")}
                  className="max-h-80 w-full rounded-md object-contain bg-zinc-100 dark:bg-zinc-900"
                />
                <dl className="mt-4 space-y-2 text-sm">
                  <div>
                    <dt className="font-semibold">{t("action")}</dt>
                    <dd>{s.action.titleEn}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold">{t("reflection")}</dt>
                    <dd className="whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                      {s.reflection}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">{t("aiReason")}</dt>
                    <dd className="text-zinc-700 dark:text-zinc-300">
                      {s.aiReason ?? "—"}
                      {s.aiConfidence !== null
                        ? ` (${t("confidence")}: ${s.aiConfidence.toFixed(2)})`
                        : ""}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold">{t("moderation")}</dt>
                    <dd className="text-zinc-700 dark:text-zinc-300">
                      {s.modStatus}
                      {s.modCategory ? ` / ${s.modCategory}` : ""}
                      {s.modReason ? ` — ${s.modReason}` : ""}
                    </dd>
                  </div>
                </dl>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                  <form action={approveSubmission}>
                    <input type="hidden" name="key" value={key ?? ""} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="submissionId" value={s.id} />
                    <button
                      type="submit"
                      className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {t("approve")}
                    </button>
                  </form>
                  <form
                    action={rejectSubmission}
                    className="flex flex-1 flex-col gap-2 sm:flex-row"
                  >
                    <input type="hidden" name="key" value={key ?? ""} />
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="submissionId" value={s.id} />
                    <input
                      type="text"
                      name="reason"
                      required
                      maxLength={500}
                      placeholder={t("reasonPlaceholder")}
                      aria-label={t("reasonLabel")}
                      className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    />
                    <button
                      type="submit"
                      className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {t("reject")}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
