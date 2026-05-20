import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { localeText } from "@/lib/i18n-fields";
import { ActionCard } from "@/components/features/action-card";

async function getSdg(slug: string) {
  try {
    return await prisma.sdg.findUnique({
      where: { slug },
      include: {
        actions: { orderBy: { id: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const sdg = await getSdg(slug);
  if (!sdg) return { title: "Not found" };
  return { title: localeText(sdg.nameEn, sdg.nameAr, locale) };
}

export default async function SdgDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const sdg = await getSdg(slug);
  if (!sdg) notFound();

  const name = localeText(sdg.nameEn, sdg.nameAr, locale);
  const description = localeText(sdg.descriptionEn, sdg.descriptionAr, locale);

  const session = await auth();
  const userId = session?.user?.id;
  let completedActionIds: Set<string> = new Set();
  if (userId && sdg.actions.length > 0) {
    const approved = await prisma.submission.findMany({
      where: {
        userId,
        status: "APPROVED",
        actionId: { in: sdg.actions.map((a) => a.id) },
      },
      select: { actionId: true },
    });
    completedActionIds = new Set(approved.map((s) => s.actionId));
  }

  return (
    <div className="flex flex-col">
      <header className="px-6 py-12 sm:py-16 text-white" style={{ backgroundColor: sdg.color }}>
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded ltr:rtl:[&>svg]:rotate-180"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t("sdg.backToAll")}
          </Link>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-6xl sm:text-7xl font-bold leading-none">{sdg.number}</span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{name}</h1>
          </div>
          {description && (
            <p className="mt-4 max-w-2xl text-base sm:text-lg opacity-95">{description}</p>
          )}
        </div>
      </header>

      <section className="px-6 py-12" aria-labelledby="actions-heading">
        <div className="mx-auto max-w-6xl">
          <h2 id="actions-heading" className="text-2xl font-bold tracking-tight mb-6">
            {t("sdg.actions")}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sdg.actions.map((action) => (
              <li key={action.id}>
                <ActionCard
                  sdgSlug={sdg.slug}
                  actionSlug={action.slug}
                  title={localeText(action.titleEn, action.titleAr, locale)}
                  effort={action.effortTier}
                  points={action.points}
                  verificationType={action.verificationType}
                  completed={completedActionIds.has(action.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
