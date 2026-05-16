"use client";

import { useActionState, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { submitAction, type SubmitState } from "./submit-action";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function SubmitButton({ label, disabled }: { label: string; disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={disabled || pending} className="w-full">
      {label}
    </Button>
  );
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const t = useTranslations("submit");
  return (
    <div role="radiogroup" aria-label={t("ratingLabel")} className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={t("ratingStar", { n })}
          onClick={() => onChange(n)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              e.preventDefault();
              onChange(Math.min(5, value + 1));
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              e.preventDefault();
              onChange(Math.max(1, value - 1));
            }
          }}
          className="rounded p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Star
            className={cn(
              "h-7 w-7",
              n <= value ? "fill-amber-400 text-amber-400" : "text-zinc-300 dark:text-zinc-600",
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

export function SubmitForm({
  actionId,
  sdgSlug,
  actionSlug,
}: {
  actionId: string;
  sdgSlug: string;
  actionSlug: string;
}) {
  const t = useTranslations();
  const [state, formAction] = useActionState<SubmitState | undefined, FormData>(
    submitAction,
    undefined,
  );
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("submissionPhoto", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.ufsUrl ?? "";
      setPhotoUrl(url);
      setUploadError(null);
    },
    onUploadError: (error) => {
      // Surface the real error for debugging; keep the UI message friendly.
      console.error("[uploadthing] client upload error", {
        message: error?.message,
        cause: (error as { cause?: unknown })?.cause,
        data: (error as { data?: unknown })?.data,
        error,
      });
      setUploadError(t("submit.uploadFailed"));
      setPhotoUrl("");
    },
  });

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="actionId" value={actionId} />
      <input type="hidden" name="sdgSlug" value={sdgSlug} />
      <input type="hidden" name="actionSlug" value={actionSlug} />
      <input type="hidden" name="photoUrl" value={photoUrl} />
      <input type="hidden" name="rating" value={rating || ""} />

      <div className="space-y-2">
        <Label htmlFor={fileInputId}>{t("submit.photo")}</Label>
        <Input
          id={fileInputId}
          ref={fileRef}
          type="file"
          accept="image/*"
          disabled={isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setUploadError(null);
              void startUpload([file]);
            }
          }}
        />
        <p className="text-xs text-zinc-500">{t("submit.photoHint")}</p>
        {isUploading && (
          <p className="text-xs text-zinc-500" role="status">
            {t("submit.uploading")}
          </p>
        )}
        {photoUrl && (
          <p className="text-xs font-medium text-emerald-600" role="status">
            {t("submit.uploaded")}
          </p>
        )}
        {uploadError && (
          <p className="text-xs font-medium text-destructive" role="alert">
            {uploadError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">{t("submit.summary")}</Label>
        <Textarea id="summary" name="summary" required minLength={10} maxLength={2000} rows={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reflection">{t("submit.reflection")}</Label>
        <Textarea
          id="reflection"
          name="reflection"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="enjoyment">{t("submit.enjoyment")}</Label>
        <Textarea id="enjoyment" name="enjoyment" maxLength={500} rows={2} />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium leading-none">{t("submit.rating")}</span>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {t(`submit.errors.${state.error}`)}
        </p>
      )}

      <SubmitButton
        label={t("submit.submitButton")}
        disabled={!photoUrl || rating < 1 || isUploading}
      />
    </form>
  );
}
