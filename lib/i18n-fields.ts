// Picks the locale-appropriate text from an English/Arabic pair, with
// English as the fallback when the Arabic value is empty or unset.

export function localeText(en: string, ar: string | null | undefined, locale: string): string {
  if (locale === "ar" && ar && ar.length > 0) return ar;
  return en;
}

export function localeJsonArray(en: unknown, ar: unknown, locale: string): string[] {
  const enArr = Array.isArray(en) ? (en as unknown[]) : [];
  const arArr = Array.isArray(ar) ? (ar as unknown[]) : [];
  const chosen = locale === "ar" && arArr.length > 0 ? arArr : enArr;
  return chosen.filter((x): x is string => typeof x === "string");
}
