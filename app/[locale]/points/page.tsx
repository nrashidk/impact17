import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { computeUserScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function PointsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  // Own score only. No peer data, no rank, no comparison.
  const score = await computeUserScore(session.user.id);

  return (
    <div className="px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold tracking-tight">{t("points.title")}</h1>
        <p
          className="mt-6 text-5xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
          aria-label={t("points.totalAria", { total: score.total })}
        >
          {score.total}
        </p>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("points.subtitle")}</p>
        <dl className="mt-8 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <dt className="text-xs text-zinc-500">{t("points.actionPoints")}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{score.actionPoints}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <dt className="text-xs text-zinc-500">{t("points.sdgBonus")}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{score.sdgBonus}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <dt className="text-xs text-zinc-500">{t("points.approvedActions")}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{score.approvedActionCount}</dd>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <dt className="text-xs text-zinc-500">{t("points.completedSdgs")}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums">{score.completedSdgCount}</dd>
          </div>
        </dl>
        <div className="mt-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {t("submit.backToSdg")}
          </Link>
        </div>
      </div>
    </div>
  );
}
