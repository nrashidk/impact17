import { CheckCircle2, Clock, Search, XCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const MOD_CATEGORIES = [
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

export default async function SubmitSuccessPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string; actionSlug: string }>;
}) {
  const { locale, slug, actionSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const submission = await prisma.submission.findFirst({
    where: {
      userId: session.user.id,
      action: { slug: actionSlug, sdg: { slug } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      modStatus: true,
      modCategory: true,
      aiReason: true,
    },
  });

  type View = {
    icon: "ok" | "pending" | "review" | "rejected";
    title: string;
    body: string;
    showResubmit: boolean;
  };

  let view: View;
  if (!submission || submission.status === "PENDING") {
    view = {
      icon: "pending",
      title: t("submit.status.pendingTitle"),
      body: t("submit.status.pendingBody"),
      showResubmit: false,
    };
  } else if (submission.status === "APPROVED") {
    view = {
      icon: "ok",
      title: t("submit.status.approvedTitle"),
      body: t("submit.status.approvedBody"),
      showResubmit: false,
    };
  } else if (submission.status === "IN_REVIEW") {
    view = {
      icon: "review",
      title: t("submit.status.inReviewTitle"),
      body: t("submit.status.inReviewBody"),
      showResubmit: false,
    };
  } else {
    // REJECTED
    let body: string;
    if (submission.modStatus === "FLAGGED") {
      const cat = submission.modCategory;
      body =
        cat && (MOD_CATEGORIES as readonly string[]).includes(cat)
          ? t("submit.status.rejectedModerationReason", {
              category: t(`submit.modCategory.${cat}`),
            })
          : t("submit.status.rejectedModerationGeneric");
    } else {
      body = t("submit.status.rejectedVerification", {
        reason: submission.aiReason ?? "—",
      });
    }
    view = {
      icon: "rejected",
      title: t("submit.status.rejectedTitle"),
      body,
      showResubmit: true,
    };
  }

  const Icon =
    view.icon === "ok"
      ? CheckCircle2
      : view.icon === "rejected"
        ? XCircle
        : view.icon === "review"
          ? Search
          : Clock;
  const iconColor =
    view.icon === "ok"
      ? "text-emerald-500"
      : view.icon === "rejected"
        ? "text-destructive"
        : "text-amber-500";

  return (
    <div className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <Icon className={`mx-auto h-12 w-12 ${iconColor}`} aria-hidden />
        <h1 className="mt-4 text-2xl font-bold tracking-tight">{view.title}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{view.body}</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          {view.showResubmit && (
            <Link
              href={`/sdgs/${slug}/actions/${actionSlug}/submit`}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {t("submit.tryAgain")}
            </Link>
          )}
          <Link
            href={`/sdgs/${slug}`}
            className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t("submit.backToSdg")}
          </Link>
        </div>
      </div>
    </div>
  );
}
