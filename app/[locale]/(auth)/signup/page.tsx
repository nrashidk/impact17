import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { SignUpForm } from "./signup-form";

export default async function SignUpPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">{t("auth.signUp.title")}</h1>
        <div className="mt-8">
          <SignUpForm />
        </div>
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          {t("auth.signUp.alreadyHaveAccount")}{" "}
          <Link href="/signin" className="font-medium underline">
            {t("nav.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
