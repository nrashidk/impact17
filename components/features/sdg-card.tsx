import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type SdgCardProps = {
  number: number;
  slug: string;
  name: string;
  color: string;
  actionCount: number;
};

export function SdgCard({ number, slug, name, color, actionCount }: SdgCardProps) {
  const t = useTranslations("sdg");
  return (
    <Link
      href={`/sdgs/${slug}`}
      className="group block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`SDG ${number}: ${name}`}
    >
      <article
        className="aspect-[4/3] flex flex-col justify-between p-4 text-white"
        style={{ backgroundColor: color }}
      >
        <div className="text-5xl font-bold leading-none">{number}</div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{name}</h2>
          <p className="mt-1 text-xs opacity-90">{t("actionCount", { count: actionCount })}</p>
        </div>
      </article>
    </Link>
  );
}

export function SdgCardSkeleton({ number, color }: { number: number; color: string }) {
  const t = useTranslations("common");
  return (
    <div
      className="aspect-[4/3] rounded-lg flex flex-col justify-between p-4 text-white opacity-70"
      style={{ backgroundColor: color }}
      aria-label={`SDG ${number}: coming soon`}
    >
      <div className="text-5xl font-bold leading-none">{number}</div>
      <div className="text-xs">{t("comingSoon")}</div>
    </div>
  );
}
