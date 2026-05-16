import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { localeText } from "@/lib/i18n-fields";
import { SubmitForm } from "./submit-form";

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

export default async function SubmitPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string; actionSlug: string }>;
}) {
  const { locale, slug, actionSlug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  const action = await getAction(slug, actionSlug);
  if (!action) notFound();

  const title = localeText(action.titleEn, action.titleAr, locale);

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm text-zinc-500">
          {localeText(action.sdg.nameEn, action.sdg.nameAr, locale)}
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">
          {t("submit.title", { action: title })}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t("submit.intro")}</p>
        <div className="mt-8">
          <SubmitForm actionId={action.id} sdgSlug={action.sdg.slug} actionSlug={action.slug} />
        </div>
      </div>
    </div>
  );
}
