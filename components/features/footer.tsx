import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 text-sm text-zinc-600 dark:text-zinc-400 text-center">
        {t.rich("tagline", {
          strong: (chunks) => <strong className="font-semibold">{chunks}</strong>,
        })}
      </div>
    </footer>
  );
}
