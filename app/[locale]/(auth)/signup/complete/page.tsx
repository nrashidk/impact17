import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { CompleteProfileForm } from "./complete-form";

export default async function CompleteProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  if (session.user.dateOfBirth && session.user.username) {
    redirect("/");
  }

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">{t("auth.complete.title")}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {t("auth.complete.subtitle")}
        </p>
        <div className="mt-8">
          <CompleteProfileForm initialUsername={session.user.username ?? ""} />
        </div>
      </div>
    </div>
  );
}
