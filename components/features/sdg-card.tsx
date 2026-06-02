import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type SdgCardProps = {
  number: number;
  slug: string;
  name: string;
  // Retained for prop-API stability with the page. The official SDG card image
  // already carries the goal colour, so the value is no longer rendered.
  color: string;
  actionCount: number;
};

export function SdgCard({ number, slug, name, actionCount }: SdgCardProps) {
  const t = useTranslations("sdg");
  const padded = String(number).padStart(2, "0");
  return (
    <Link
      href={`/sdgs/${slug}`}
      className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`SDG ${number}: ${name}`}
    >
      <div className="overflow-hidden rounded-lg shadow-sm transition-shadow group-hover:shadow-md">
        <Image
          src={`/sdg-cards/sdg-${padded}.png`}
          alt={`SDG ${number}: ${name}`}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
          className="block h-auto w-full"
        />
      </div>
      <p className="mt-2 text-center text-xs text-zinc-600 dark:text-zinc-400">
        {t("actionCount", { count: actionCount })}
      </p>
    </Link>
  );
}

export function SdgCardSkeleton({ number }: { number: number; color: string }) {
  const t = useTranslations("common");
  const padded = String(number).padStart(2, "0");
  return (
    <div className="opacity-70" aria-label={`SDG ${number}: coming soon`}>
      <div className="overflow-hidden rounded-lg shadow-sm">
        <Image
          src={`/sdg-cards/sdg-${padded}.png`}
          alt={`SDG ${number}`}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
          className="block h-auto w-full"
        />
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-500">
        {t("comingSoon")}
      </p>
    </div>
  );
}
