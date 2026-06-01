import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { localeText } from "@/lib/i18n-fields";
import { SdgCard, SdgCardSkeleton } from "@/components/features/sdg-card";
import { SdgContextCard } from "@/components/features/sdg-context-card";
import { UaeRibbon } from "@/components/features/uae-ribbon";

// Fallback palette in official UN SDG order, used only when the database has
// no rows yet (e.g., immediately after deploy, before the admin seed has run).
const FALLBACK_COLORS: readonly string[] = [
  "#E5243B",
  "#DDA63A",
  "#4C9F38",
  "#C5192D",
  "#FF3A21",
  "#26BDE2",
  "#FCC30B",
  "#A21942",
  "#FD6925",
  "#DD1367",
  "#FD9D24",
  "#BF8B2E",
  "#3F7E44",
  "#0A97D9",
  "#56C02B",
  "#00689D",
  "#19486A",
];

async function getSdgs() {
  try {
    return await prisma.sdg.findMany({
      orderBy: { number: "asc" },
      include: { _count: { select: { actions: true } } },
    });
  } catch {
    return [];
  }
}

export default async function LandingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const sdgs = await getSdgs();

  return (
    <div className="flex flex-col">
      <section className="px-6 pt-12 sm:pt-16 pb-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{t("title")}</h1>
      </section>

      <section className="px-6 py-8 sm:py-12" aria-labelledby="cards-heading">
        <div className="mx-auto max-w-6xl">
          <h2
            id="cards-heading"
            className="mb-6 text-center text-xl sm:text-2xl font-semibold tracking-tight"
          >
            {t("cards.heading")}
          </h2>
          <UaeRibbon className="hidden md:block w-full mb-6" />
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <li>
              <SdgContextCard
                question={t("cards.sdg.question")}
                answer={t("cards.sdg.answer")}
              />
            </li>
            <li>
              <SdgContextCard
                question={t("cards.action.question")}
                answer={t("cards.action.answer")}
              />
            </li>
            <li>
              <SdgContextCard
                question={t("cards.future.question")}
                answer={t("cards.future.answer")}
              />
            </li>
          </ul>
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="sdg-grid-heading">
        <div className="mx-auto max-w-6xl">
          <h2
            id="sdg-grid-heading"
            className="mb-6 text-center text-xl sm:text-2xl font-semibold tracking-tight"
          >
            {t("chooseGoal")}
          </h2>
          {sdgs.length === 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {FALLBACK_COLORS.map((color, idx) => (
                <li key={idx + 1}>
                  <SdgCardSkeleton number={idx + 1} color={color} />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sdgs.map((sdg) => (
                <li key={sdg.id}>
                  <SdgCard
                    number={sdg.number}
                    slug={sdg.slug}
                    name={localeText(sdg.nameEn, sdg.nameAr, locale)}
                    color={sdg.color}
                    actionCount={sdg._count.actions}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
