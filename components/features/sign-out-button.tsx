"use client";

import { signOutAction } from "@/app/[locale]/(auth)/actions";

export function SignOutButton({
  label,
  className = "text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50",
}: {
  label: string;
  className?: string;
}) {
  return (
    <form action={signOutAction}>
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
