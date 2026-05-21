// Throwaway preview route to eyeball the SDG wheel in isolation before it is
// wired into the homepage. Removed in Phase 2.

import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { localeText } from "@/lib/i18n-fields";
import { SdgWheel } from "@/components/features/sdg-wheel";

async function getSdgs() {
  try {
    return await prisma.sdg.findMany({ orderBy: { number: "asc" } });
  } catch {
    return [];
  }
}

export default async function WheelPreviewPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const sdgs = await getSdgs();
  const wheelSdgs = sdgs.map((s) => ({
    number: s.number,
    slug: s.slug,
    name: localeText(s.nameEn, s.nameAr, locale),
    color: s.color,
  }));

  return (
    <div className="px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <SdgWheel sdgs={wheelSdgs} locale={locale} title="Impact17" />
      </div>
    </div>
  );
}
