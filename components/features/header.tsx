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
        <nav className="hidden sm:flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
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
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                className="hidden sm:inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
