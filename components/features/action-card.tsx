import { Camera, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EffortBadge } from "./effort-badge";

type ActionCardProps = {
  sdgSlug: string;
  actionSlug: string;
  title: string;
  effort: "EASY" | "MEDIUM" | "HARD";
  points: number;
  verificationType: "PHOTO_PHYSICAL" | "PHOTO_ARTEFACT";
};

export function ActionCard({
  sdgSlug,
  actionSlug,
  title,
  effort,
  points,
  verificationType,
}: ActionCardProps) {
  const t = useTranslations();
  const isPhysical = verificationType === "PHOTO_PHYSICAL";
  const verificationLabel = isPhysical
    ? t("action.verificationPhysical")
    : t("action.verificationArtefact");

  return (
    <Link
      href={`/sdgs/${sdgSlug}/actions/${actionSlug}`}
      className="group block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <article className="flex flex-col gap-3 h-full">
        <h3 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        <div className="mt-auto flex items-center justify-between gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <EffortBadge effort={effort} />
            <span>{t("common.points", { count: points })}</span>
          </div>
          <span
            className="flex items-center gap-1 text-xs"
            aria-label={verificationLabel}
            title={verificationLabel}
          >
            {isPhysical ? (
              <Camera className="h-4 w-4" aria-hidden />
            ) : (
              <FileText className="h-4 w-4" aria-hidden />
            )}
          </span>
        </div>
      </article>
    </Link>
  );
}
