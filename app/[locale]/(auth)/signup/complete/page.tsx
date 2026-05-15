import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { suggestUsername } from "../../actions";
import { CompleteProfileForm } from "./complete-form";

export default async function CompleteProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signin");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, username: true, dateOfBirth: true },
  });
  if (!dbUser) {
    redirect("/signin");
  }
  if (dbUser.username && dbUser.dateOfBirth) {
    redirect("/");
  }

  const needsDob = !dbUser.dateOfBirth;
  const suggested = dbUser.username ?? (await suggestUsername(dbUser.name));

  const title = needsDob
    ? t("auth.complete.titleGoogleUser")
    : t("auth.complete.titleCredentialsUser");
  const subtitle = needsDob
    ? t("auth.complete.subtitleGoogleUser")
    : t("auth.complete.subtitleCredentialsUser");

  return (
    <div className="px-6 py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        <div className="mt-8">
          <CompleteProfileForm needsDob={needsDob} initialUsername={suggested} />
        </div>
      </div>
    </div>
  );
}
