import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-center">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{t("tagline")}</p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500">
          {t("unAttribution")}{" "}
          <a
            href="https://www.un.org/sustainabledevelopment"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            {t("unLinkLabel")}
          </a>
        </p>
      </div>
    </footer>
  );
}
