export function getDocumentDisplayNumber(displayNumber?: string | null, canonicalNumber?: string | null) {
  const localized = displayNumber?.trim();
  if (localized) {
    return localized;
  }

  const canonical = canonicalNumber?.trim();
  return canonical || '-';
}
