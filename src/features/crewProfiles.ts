import type { Language } from "../i18n";

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

const crewVariantsByRole: Record<CrewRole, CrewVariant[]> = {
  navigation: [
    {
      locale: "de",
      fullName: "Ole Wilhelm Knudsen",
      callSign: "Wilhelm",
      region: "Hanseat / norddeutsche Kueste",
    },
    {
      locale: "uk",
      fullName: "Antony William Hanam",
      callSign: "William",
      region: "West Sussex / Southern England",
    },
    {
      locale: "fr",
      fullName: "Guillaume Le Gall",
      callSign: "Guillaume",
      region: "Bretagne",
    },
    {
      locale: "it",
      fullName: "Guglielmo Parodi",
      callSign: "Guglielmo",
      region: "Genua / Ligurien",
    },
    {
      locale: "es",
      fullName: "Guillermo Souto",
      callSign: "Guillermo",
      region: "Galicien",
    },
  ],
  science: [
    {
      locale: "de",
      fullName: "Dr. Anna Kaeberer",
      callSign: "Anna",
      region: "Wiesbaden / Rhein-Main",
    },
    {
      locale: "uk",
      fullName: "Dr Anna Beckett",
      callSign: "Anna",
      region: "Cambridge / Cambridgeshire",
    },
    {
      locale: "fr",
      fullName: "Dr Claire Anne Fabre",
      callSign: "Anne",
      region: "Toulouse / Okzitanien",
    },
    {
      locale: "it",
      fullName: "Dott.ssa Anna Ferrari",
      callSign: "Anna",
      region: "Bologna / Emilia-Romagna",
    },
    {
      locale: "es",
      fullName: "Dra. Ana Sanchez Martin",
      callSign: "Ana",
      region: "Salamanca / Kastilien und Leon",
    },
  ],
  engineeringSystems: [
    {
      locale: "de",
      fullName: "Susanne Jungverdorben",
      callSign: "Susanne",
      region: "Ruhrgebiet",
    },
    {
      locale: "uk",
      fullName: "Karen Susan Makepeace",
      callSign: "Susan",
      region: "Birmingham / West Midlands",
    },
    {
      locale: "fr",
      fullName: "Suzanne Dubois",
      callSign: "Suzanne",
      region: "Lille / Nordfrankreich",
    },
    {
      locale: "it",
      fullName: "Susanna Macchina",
      callSign: "Susanna",
      region: "Turin / Piemont",
    },
    {
      locale: "es",
      fullName: "Susana Urrutia",
      callSign: "Susana",
      region: "Bilbao / Baskenland",
    },
  ],
  weaponsTactics: [
    {
      locale: "de",
      fullName: "Bastian Sauer",
      callSign: "Bastian",
      region: "Mitteldeutschland",
    },
    {
      locale: "uk",
      fullName: "Sebastian Gunn",
      callSign: "Sebastian",
      region: "Caithness / Schottland",
    },
    {
      locale: "fr",
      fullName: "Sebastien Oberst",
      callSign: "Sebastien",
      region: "Elsass",
    },
    {
      locale: "it",
      fullName: "Sebastiano Scuderi",
      callSign: "Sebastiano",
      region: "Sizilien",
    },
    {
      locale: "es",
      fullName: "Alvaro Sebastian Guerra Paz",
      callSign: "Sebastian",
      region: "Asturien",
    },
  ],
};

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
  const variants = crewVariantsByRole[role];

  return (
    variants.find((variant) => variant.locale === selectedLocale) ?? variants[0]
  );
}

export function getCrewVariants(role: CrewRole): CrewVariant[] {
  return crewVariantsByRole[role];
}
