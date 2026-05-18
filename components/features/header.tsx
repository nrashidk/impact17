import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { LocaleSwitcher } from "./locale-switcher";
import { SignOutButton } from "./sign-out-button";

export async function Header({ locale }: { locale: string }) {
  const t = await getTranslations("nav");
  const session = await auth();

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
        </nav>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link
                href="/points"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {t("points")}
              </Link>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {session.user.name ?? session.user.username ?? session.user.email}
              </span>
              <SignOutButton label={t("signOut")} />
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
              >
                {t("signUp")}
              </Link>
            </>
          )}
          <LocaleSwitcher currentLocale={locale} />
        </div>
      </div>
    </header>
  );
}
