import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Impact17
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            {t("home")}
          </Link>
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            {t("sdgs")}
          </Link>
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            {t("leaderboard")}
          </Link>
          <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-50">
            {t("profile")}
          </Link>
        </nav>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  );
}
