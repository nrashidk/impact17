import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { SignInForm } from "./signin-form";

export default async function SignInPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">{t("auth.signIn.title")}</h1>
        <div className="mt-8">
          <SignInForm />
        </div>
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          {t("auth.signIn.noAccount")}{" "}
          <Link href="/signup" className="font-medium underline">
            {t("nav.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
