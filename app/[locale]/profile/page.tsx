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
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("profile.title")}</h1>

        <dl className="mt-8 space-y-5">
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
          <div>
            <dt className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("profile.totalPoints")}
            </dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              {score.total}
            </dd>
          </div>
        </dl>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("profile.completedSdgs")}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{score.completedSdgCount}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t("profile.verifiedActions")}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{score.approvedActionCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
