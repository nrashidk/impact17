"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { completeProfileAction, type CompleteProfileState } from "../../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {label}
    </Button>
  );
}

export function CompleteProfileForm({
  needsDob,
  initialUsername,
}: {
  needsDob: boolean;
  initialUsername: string;
}) {
  const t = useTranslations();
  const [state, formAction] = useActionState<CompleteProfileState | undefined, FormData>(
    completeProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="username">{t("auth.complete.username")}</Label>
        <Input
          id="username"
          name="username"
          required
          defaultValue={initialUsername}
          minLength={3}
          maxLength={20}
          pattern="[A-Za-z0-9\-]{3,20}"
          autoComplete="username"
          aria-describedby="username-hint"
        />
        <p id="username-hint" className="text-xs text-zinc-500">
          {t("auth.complete.usernameHint")}
        </p>
      </div>

      {needsDob && (
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{t("auth.signUp.dob")}</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
        </div>
      )}

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {t(`auth.errors.${state.error}`)}
        </p>
      )}

      <SubmitButton label={t("auth.signUp.submit")} />
    </form>
  );
}
