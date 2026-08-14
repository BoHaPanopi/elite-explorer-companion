import type { Language } from "../i18n";
import { CREW_VARIANTS_BY_ROLE } from "../content/crewProfiles.ts";

export type CrewLocale = "de" | "uk" | "fr" | "it" | "es";

export type CrewRole =
  | "navigation"
  | "science"
  | "engineeringSystems"
  | "weaponsTactics";

export type CrewVariant = {
  locale: CrewLocale;
  fullName: string;
  callSign: string;
  region: string;
  portraitFileName: string;
};

export type CrewSelectionMap = Partial<Record<CrewRole, CrewLocale>>;

export const crewRoleOrder: CrewRole[] = [
  "navigation",
  "science",
  "engineeringSystems",
  "weaponsTactics",
];

export const crewRoleLabels: Record<CrewRole, string> = {
  navigation: "Navigation",
  science: "Science",
  engineeringSystems: "Engineering & Systems",
  weaponsTactics: "Weapons & Tactics",
};

const portraitModules = import.meta.glob("../assets/*.png", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const portraitSourcesByFileName = new Map(
  Object.entries(portraitModules).map(([path, src]) => {
    const fileName = path.slice(path.lastIndexOf("/") + 1);
    return [fileName, src];
  }),
);

function storageKey(role: CrewRole): string {
  return `eec.crew.selection.${role}`;
}

export function defaultCrewLocaleForUiLanguage(language: Language): CrewLocale {
  if (language === "en") return "uk";
  return language;
}

export function readCrewSelections(): CrewSelectionMap {
  const selections: CrewSelectionMap = {};

  for (const role of crewRoleOrder) {
    const saved = localStorage.getItem(storageKey(role));
    if (saved === "de" || saved === "uk" || saved === "fr" || saved === "it" || saved === "es") {
      selections[role] = saved;
    }
  }

  return selections;
}

export function persistCrewSelection(role: CrewRole, locale: CrewLocale): void {
  localStorage.setItem(storageKey(role), locale);
}

export function resolveCrewSelection(
  role: CrewRole,
  language: Language,
  selections: CrewSelectionMap,
): CrewVariant {
  const fallback = defaultCrewLocaleForUiLanguage(language);
  const selectedLocale = selections[role] ?? fallback;
  const variants = CREW_VARIANTS_BY_ROLE[role];

  return (
    variants.find((variant) => variant.locale === selectedLocale) ?? variants[0]
  );
}

export function isCrewLocaleActive(
  role: CrewRole,
  locale: CrewLocale,
  language: Language,
  selections: CrewSelectionMap,
): boolean {
  return resolveCrewSelection(role, language, selections).locale === locale;
}

export function getCrewVariants(role: CrewRole): CrewVariant[] {
  return CREW_VARIANTS_BY_ROLE[role];
}

export function resolveCrewPortraitSource(fileName: string): string | null {
  return portraitSourcesByFileName.get(fileName) ?? null;
}
