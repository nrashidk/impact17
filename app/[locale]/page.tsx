import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { localeText } from "@/lib/i18n-fields";
import { SdgCard, SdgCardSkeleton } from "@/components/features/sdg-card";

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
      <section className="px-6 pt-12 sm:pt-16 pb-8 flex flex-col items-center text-center">
        <Image
          src="/sdg-wheel.png"
          alt={t("wheelAlt")}
          width={448}
          height={448}
          priority
          className="w-full max-w-xs sm:max-w-md h-auto"
        />
        <h1 className="mt-6 text-3xl sm:text-4xl font-bold tracking-tight">{t("title")}</h1>
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
