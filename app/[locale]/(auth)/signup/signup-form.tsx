"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { signUpAction, googleSignInAction, type SignUpState } from "../actions";
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

export function SignUpForm() {
  const t = useTranslations();
  const [state, formAction] = useActionState<SignUpState | undefined, FormData>(
    signUpAction,
    undefined,
  );

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">{t("auth.signUp.name")}</Label>
          <Input id="name" name="name" required maxLength={80} autoComplete="name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">{t("auth.signUp.username")}</Label>
          <Input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={20}
            pattern="[A-Za-z0-9\-]{3,20}"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t("auth.signUp.email")}</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{t("auth.signUp.dob")}</Label>
          <Input id="dateOfBirth" name="dateOfBirth" type="date" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("auth.signUp.password")}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("auth.signUp.confirmPassword")}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>

        {state?.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {t(`auth.errors.${state.error}`)}
          </p>
        )}

        <SubmitButton label={t("auth.signUp.submit")} />
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
