const MOJIBAKE_PATTERNS = [
  /â€”/,
  /â€/,
  /Ã/,
  /Â/,
  /[�]/,
  /\?\?\?/
];

export function isCorruptedLocalizedText(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }

  return MOJIBAKE_PATTERNS.some((pattern) => pattern.test(value));
}

export function resolveLocalizedText(
  locale: string,
  arabic: string | null | undefined,
  english: string | null | undefined,
  fallback = '-'
): string {
  const isArabicLocale = locale.toLowerCase().startsWith('ar');
  const preferred = isArabicLocale ? arabic : english;
  const secondary = isArabicLocale ? english : arabic;

  if (preferred && !isCorruptedLocalizedText(preferred)) {
    return preferred;
  }

  if (secondary && !isCorruptedLocalizedText(secondary)) {
    return secondary;
  }

  return fallback;
}
