"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const t = useTranslations("locale");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function onChange(nextLocale: Locale) {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
      <span className="sr-only">{t("switchTo")}</span>
      <select
        aria-label={t("switchTo")}
        value={currentLocale}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
      >
        {routing.locales.map((loc) => (
          <option key={loc} value={loc}>
            {loc === "en" ? t("english") : t("arabic")}
          </option>
        ))}
      </select>
    </label>
  );
}
