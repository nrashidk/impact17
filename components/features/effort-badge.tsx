import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const STYLES: Record<"EASY" | "MEDIUM" | "HARD", string> = {
  EASY: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100",
  MEDIUM: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  HARD: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
};

export function EffortBadge({
  effort,
  className,
}: {
  effort: "EASY" | "MEDIUM" | "HARD";
  className?: string;
}) {
  const t = useTranslations("effort");
  const label = effort === "EASY" ? t("easy") : effort === "MEDIUM" ? t("medium") : t("hard");
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[effort],
        className,
      )}
    >
      {label}
    </span>
  );
}
