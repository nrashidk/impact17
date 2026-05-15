import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

const SDG_COLORS: readonly string[] = [
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

export default async function LandingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col">
      <section className="px-6 py-16 sm:py-24 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-4 mx-auto max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <button
          type="button"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-zinc-900 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {t("cta")}
        </button>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SDG_COLORS.map((color, idx) => {
              const number = idx + 1;
              return (
                <li
                  key={number}
                  className="aspect-square flex items-center justify-center rounded-md text-white text-3xl font-bold shadow-sm"
                  style={{ backgroundColor: color }}
                  aria-label={`SDG ${number}`}
                >
                  {number}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
