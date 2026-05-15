"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { signInAction, googleSignInAction, type SignInState } from "../actions";
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

export function SignInForm() {
  const t = useTranslations();
  const [state, formAction] = useActionState<SignInState | undefined, FormData>(
    signInAction,
    undefined,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.signIn.email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.signIn.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(`auth.errors.${state.error}`)}
          </p>
        )}

        <SubmitButton label={t("auth.signIn.submit")} />
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <span className="w-full border-t border-zinc-200 dark:border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-zinc-500">or</span>
        </div>
      </div>

      <form action={googleSignInAction}>
        <Button type="submit" variant="outline" className="w-full">
          {t("auth.google.continueWith")}
        </Button>
      </form>
    </div>
  );
}
