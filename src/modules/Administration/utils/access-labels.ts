import enMessages from 'utils/locales/en.json';
import arMessages from 'utils/locales/ar.json';

export function getBilingualLabel(key: string, locale: string) {
  const normalizedKey = key.toLowerCase().replace(/\s+/g, '-');
  const englishLabel = (enMessages as Record<string, string>)[normalizedKey] ?? key;
  const arabicLabel = (arMessages as Record<string, string>)[normalizedKey] ?? key;
  const first = locale.startsWith('ar') ? arabicLabel : englishLabel;
  const second = locale.startsWith('ar') ? englishLabel : arabicLabel;

  if (!second || second === first) {
    return first;
  }

  return `${first} (${second})`;
}

export function getBilingualPermissionLabel(arabic: string, english: string, locale: string) {
  const first = locale.startsWith('ar') ? arabic : english;
  const second = locale.startsWith('ar') ? english : arabic;

  if (!second || second === first) {
    return first;
  }

  return `${first} (${second})`;
}

export function getBilingualRoleLabel(arabic: string, english: string, fallback: string, locale: string) {
  const first = locale.startsWith('ar') ? (arabic || english || fallback) : (english || arabic || fallback);
  const second = locale.startsWith('ar') ? (english || fallback) : (arabic || fallback);

  if (!second || second === first) {
    return first;
  }

  return `${first} (${second})`;
}
