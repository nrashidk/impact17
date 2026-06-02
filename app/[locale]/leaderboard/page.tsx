import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computeUserScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  const currentUserId = session?.user?.id ?? null;

  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true },
  });

  const withScores = await Promise.all(
    users.map(async (u) => ({
      ...u,
      total: (await computeUserScore(u.id)).total,
    })),
  );

  withScores.sort((a, b) => b.total - a.total);

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("leaderboard.title")}</h1>

        <div
          role="note"
          className="mt-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
        >
          {t("leaderboard.demoBanner")}
        </div>

        {withScores.length === 0 ? (
          <p className="mt-8 text-center text-zinc-500 dark:text-zinc-400">
            {t("leaderboard.empty")}
          </p>
        ) : (
          <div className="mt-8 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900">
                <tr>
                  <th
                    scope="col"
                    className="w-16 px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                  >
                    {t("leaderboard.rank")}
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                  >
                    {t("leaderboard.name")}
                  </th>
                  <th
                    scope="col"
                    className="w-24 px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                  >
                    {t("leaderboard.points")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {withScores.map((u, idx) => {
                  const isMe = currentUserId !== null && u.id === currentUserId;
                  return (
                    <tr key={u.id} className={isMe ? "bg-emerald-50 dark:bg-emerald-950/30" : ""}>
                      <td className="px-4 py-3 text-sm tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-3 text-sm">
                        {u.name ?? u.username ?? t("leaderboard.anonymous")}
                      </td>
                      <td className="px-4 py-3 text-end text-sm tabular-nums">{u.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
