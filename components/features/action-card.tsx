import { Camera, CheckCircle2, FileText } from "lucide-react";
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
  completed?: boolean;
};

export function ActionCard({
  sdgSlug,
  actionSlug,
  title,
  effort,
  points,
  verificationType,
  completed = false,
}: ActionCardProps) {
  const t = useTranslations();
  const isPhysical = verificationType === "PHOTO_PHYSICAL";
  const verificationLabel = isPhysical
    ? t("action.verificationPhysical")
    : t("action.verificationArtefact");
  const completedLabel = t("action.completed.badge");

  return (
    <Link
      href={`/sdgs/${sdgSlug}/actions/${actionSlug}`}
      className="group block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <article className="flex flex-col gap-3 h-full">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
            {title}
          </h3>
          {completed && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
              aria-label={completedLabel}
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
              <span>{completedLabel}</span>
            </span>
          )}
        </div>
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
