import type { Language } from "../i18n";

type JumpRangeSnapshot = {
  currentJumpRange: number | null;
  maxJumpRange: number | null;
};

const jumpRangeLocales: Record<Language, string> = {
  de: "de-DE",
  en: "en-US",
  fr: "fr-FR",
  it: "it-IT",
  es: "es-ES",
};

const jumpRangeLabels: Record<Language, string> = {
  de: "akt",
  en: "cur",
  fr: "act",
  it: "att",
  es: "act",
};

const jumpRangeUnits: Record<Language, string> = {
  de: "Lj",
  en: "ly",
  fr: "al",
  it: "al",
  es: "al",
};

export function selectDisplayedCurrentJumpRange(snapshot: JumpRangeSnapshot | null): number | null {
  const value = snapshot?.currentJumpRange;
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : null;
}

export function formatCurrentJumpRange(value: number | null, language: Language): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  const formatted = new Intl.NumberFormat(jumpRangeLocales[language], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

  return `${jumpRangeLabels[language]}: ${formatted} ${jumpRangeUnits[language]}`;
}