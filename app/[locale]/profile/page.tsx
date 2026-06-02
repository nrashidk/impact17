import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { computeUserScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  if (!session?.user?.id) redirect("/signin");

  const score = await computeUserScore(session.user.id);

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <section aria-labelledby="profile-heading">
          <h1
            id="profile-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            {t("profile.title")}
          </h1>
          <dl className="mt-6 space-y-5">
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("profile.name")}</dt>
              <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-50">
                {session.user.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t("profile.email")}</dt>
              <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-50">
                {session.user.email ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <hr className="my-10 border-zinc-200 dark:border-zinc-800" />

        <section aria-labelledby="points-heading">
          <h2
            id="points-heading"
            className="text-xl sm:text-2xl font-bold tracking-tight"
          >
            {t("profile.myPointsSection")}
          </h2>
          <p
            className="mt-4 text-5xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400"
            aria-label={t("points.totalAria", { total: score.total })}
          >
            {score.total}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {t("points.subtitle")}
          </p>
          <dl className="mt-6 grid grid-cols-2 gap-4">
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
        </section>
      </div>
    </div>
  );
}
