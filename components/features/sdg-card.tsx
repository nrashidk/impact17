import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
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

function imageSrc(locale: string, number: number): string {
  const padded = String(number).padStart(2, "0");
  return locale === "ar" ? `/sdg-cards/ar/sdg-${padded}.png` : `/sdg-cards/sdg-${padded}.png`;
}

const badgeClasses =
  "absolute bottom-3 end-3 rounded-md bg-black/30 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm";

export function SdgCard({ number, slug, name, actionCount }: SdgCardProps) {
  const t = useTranslations("sdg");
  const locale = useLocale();
  const src = imageSrc(locale, number);
  return (
    <Link
      href={`/sdgs/${slug}`}
      className="group block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`SDG ${number}: ${name}`}
    >
      <div className="relative overflow-hidden rounded-lg shadow-sm transition-shadow group-hover:shadow-md">
        <Image
          src={src}
          alt={`SDG ${number}: ${name}`}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
          className="block h-auto w-full"
        />
        <span className={badgeClasses}>{t("actionCount", { count: actionCount })}</span>
      </div>
    </Link>
  );
}

export function SdgCardSkeleton({ number }: { number: number; color: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const src = imageSrc(locale, number);
  return (
    <div className="opacity-70" aria-label={`SDG ${number}: coming soon`}>
      <div className="relative overflow-hidden rounded-lg shadow-sm">
        <Image
          src={src}
          alt={`SDG ${number}`}
          width={800}
          height={800}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw"
          className="block h-auto w-full"
        />
        <span className={badgeClasses}>{t("comingSoon")}</span>
      </div>
    </div>
  );
}
