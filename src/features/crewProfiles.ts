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

const crewVariantsByRole: Record<CrewRole, CrewVariant[]> = {
  navigation: [
    {
      locale: "de",
      fullName: "Ole Wilhelm Knudsen",
      callSign: "Wilhelm",
      region: "Hanseat / norddeutsche Kueste",
      portraitFileName: "ole.png",
    },
    {
      locale: "uk",
      fullName: "Antony William Hanam",
      callSign: "William",
      region: "West Sussex / Southern England",
      portraitFileName: "william.png",
    },
    {
      locale: "fr",
      fullName: "Guillaume Le Gall",
      callSign: "Guillaume",
      region: "Bretagne",
      portraitFileName: "guillaume.png",
    },
    {
      locale: "it",
      fullName: "Guglielmo Parodi",
      callSign: "Guglielmo",
      region: "Genua / Ligurien",
      portraitFileName: "guglielmo.png",
    },
    {
      locale: "es",
      fullName: "Guillermo Souto",
      callSign: "Guillermo",
      region: "Galicien",
      portraitFileName: "guillermo.png",
    },
  ],
  science: [
    {
      locale: "de",
      fullName: "Dr. Anna Kaeberer",
      callSign: "Anna",
      region: "Wiesbaden / Rhein-Main",
      portraitFileName: "kaeberer.png",
    },
    {
      locale: "uk",
      fullName: "Dr Anna Beckett",
      callSign: "Anna",
      region: "Cambridge / Cambridgeshire",
      portraitFileName: "beckett.png",
    },
    {
      locale: "fr",
      fullName: "Dr Claire Anne Fabre",
      callSign: "Anne",
      region: "Toulouse / Okzitanien",
      portraitFileName: "fabre.png",
    },
    {
      locale: "it",
      fullName: "Dott.ssa Anna Ferrari",
      callSign: "Anna",
      region: "Bologna / Emilia-Romagna",
      portraitFileName: "ferrari.png",
    },
    {
      locale: "es",
      fullName: "Dra. Ana Sanchez Martin",
      callSign: "Ana",
      region: "Salamanca / Kastilien und Leon",
      portraitFileName: "sanchez-martin.png",
    },
  ],
  engineeringSystems: [
    {
      locale: "de",
      fullName: "Susanne Jungverdorben",
      callSign: "Susanne",
      region: "Ruhrgebiet",
      portraitFileName: "susanne.png",
    },
    {
      locale: "uk",
      fullName: "Karen Susan Makepeace",
      callSign: "Susan",
      region: "Birmingham / West Midlands",
      portraitFileName: "karen.png",
    },
    {
      locale: "fr",
      fullName: "Suzanne Dubois",
      callSign: "Suzanne",
      region: "Lille / Nordfrankreich",
      portraitFileName: "suzanne.png",
    },
    {
      locale: "it",
      fullName: "Susanna Macchina",
      callSign: "Susanna",
      region: "Turin / Piemont",
      portraitFileName: "susanna.png",
    },
    {
      locale: "es",
      fullName: "Susana Urrutia",
      callSign: "Susana",
      region: "Bilbao / Baskenland",
      portraitFileName: "susana.png",
    },
  ],
  weaponsTactics: [
    {
      locale: "de",
      fullName: "Bastian Sauer",
      callSign: "Bastian",
      region: "Mitteldeutschland",
      portraitFileName: "bastian.png",
    },
    {
      locale: "uk",
      fullName: "Sebastian Gunn",
      callSign: "Sebastian",
      region: "Caithness / Schottland",
      portraitFileName: "sebastian.png",
    },
    {
      locale: "fr",
      fullName: "Sebastien Oberst",
      callSign: "Sebastien",
      region: "Elsass",
      portraitFileName: "sebastien.png",
    },
    {
      locale: "it",
      fullName: "Sebastiano Scuderi",
      callSign: "Sebastiano",
      region: "Sizilien",
      portraitFileName: "sebastiano.png",
    },
    {
      locale: "es",
      fullName: "Alvaro Sebastian Guerra Paz",
      callSign: "Sebastian",
      region: "Asturien",
      portraitFileName: "alvaro.png",
    },
  ],
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
  const variants = crewVariantsByRole[role];

  return (
    variants.find((variant) => variant.locale === selectedLocale) ?? variants[0]
  );
}

export function getCrewVariants(role: CrewRole): CrewVariant[] {
  return crewVariantsByRole[role];
}

export function resolveCrewPortraitSource(fileName: string): string | null {
  return portraitSourcesByFileName.get(fileName) ?? null;
}
