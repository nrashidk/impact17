import { notFound } from "next/navigation";
import { ArrowLeft, Camera, FileText } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { localeText, localeJsonArray } from "@/lib/i18n-fields";
import { EffortBadge } from "@/components/features/effort-badge";
import { Button } from "@/components/ui/button";

async function getAction(sdgSlug: string, actionSlug: string) {
  try {
    return await prisma.action.findFirst({
      where: { slug: actionSlug, sdg: { slug: sdgSlug } },
      include: { sdg: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string; actionSlug: string }>;
}): Promise<Metadata> {
  const { locale, slug, actionSlug } = await params;
  const action = await getAction(slug, actionSlug);
  if (!action) return { title: "Not found" };
  return { title: localeText(action.titleEn, action.titleAr, locale) };
}

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string; actionSlug: string }>;
}) {
  const { locale, slug, actionSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const action = await getAction(slug, actionSlug);
  if (!action) notFound();

  const sdgName = localeText(action.sdg.nameEn, action.sdg.nameAr, locale);
  const title = localeText(action.titleEn, action.titleAr, locale);
  const steps = localeJsonArray(action.howToStepsEn, action.howToStepsAr, locale);
  const prompts = localeJsonArray(action.reflectionPromptsEn, action.reflectionPromptsAr, locale);
  const isPhysical = action.verificationType === "PHOTO_PHYSICAL";

  return (
    <div className="flex flex-col">
      <header
        className="px-6 py-10 sm:py-14 text-white"
        style={{ backgroundColor: action.sdg.color }}
      >
        <div className="mx-auto max-w-3xl">
          <Link
            href={`/sdgs/${action.sdg.slug}`}
            className="inline-flex items-center gap-2 text-sm font-medium opacity-90 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
            {t("action.backToSdg", { name: sdgName })}
          </Link>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight">{title}</h1>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <EffortBadge effort={action.effortTier} className="bg-white/90 text-zinc-900" />
            <span className="font-medium">{t("common.points", { count: action.points })}</span>
            <span
              className="flex items-center gap-1 opacity-90"
              aria-label={
                isPhysical ? t("action.verificationPhysical") : t("action.verificationArtefact")
              }
            >
              {isPhysical ? (
                <Camera className="h-4 w-4" aria-hidden />
              ) : (
                <FileText className="h-4 w-4" aria-hidden />
              )}
            </span>
          </div>
        </div>
      </header>

      <section className="px-6 py-10" aria-labelledby="how-to-heading">
        <div className="mx-auto max-w-3xl">
          <h2 id="how-to-heading" className="text-2xl font-bold tracking-tight">
            {t("action.howTo")}
          </h2>
          <ol className="mt-4 list-decimal ltr:pl-6 rtl:pr-6 rtl:pl-0 space-y-3 text-base text-zinc-700 dark:text-zinc-300">
            {steps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {prompts.length > 0 && (
        <section className="px-6 pb-10" aria-labelledby="reflection-heading">
          <div className="mx-auto max-w-3xl">
            <h2 id="reflection-heading" className="text-2xl font-bold tracking-tight">
              {t("action.reflectionPrompts")}
            </h2>
            <ul className="mt-4 ltr:pl-6 rtl:pr-6 rtl:pl-0 list-disc space-y-2 text-base text-zinc-700 dark:text-zinc-300">
              {prompts.map((prompt, idx) => (
                <li key={idx} className="leading-relaxed">
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-3xl">
          <Button size="lg" disabled className="w-full sm:w-auto">
            {t("action.signInToSubmit")}
          </Button>
        </div>
      </section>
    </div>
  );
}
