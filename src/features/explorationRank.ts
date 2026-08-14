import type { Language } from "ogg-core";
import type { RankCategory } from "./missionProfile";

const RANK_NAMES: Record<Language, readonly string[]> = {
  de: ["Ziellos", "Weitgehend ziellos", "Scout", "Landvermesser", "Wegbereiter", "Pfadfinder", "Ranger", "Pionier", "Elite", "Elite I", "Elite II", "Elite III", "Elite IV", "Elite V"],
  en: ["Aimless", "Mostly Aimless", "Scout", "Surveyor", "Trailblazer", "Pathfinder", "Ranger", "Pioneer", "Elite", "Elite I", "Elite II", "Elite III", "Elite IV", "Elite V"],
  fr: ["Sans but", "Presque sans but", "Éclaireur", "Topographe", "Pionnier", "Explorateur", "Ranger", "Pionnier confirmé", "Élite", "Élite I", "Élite II", "Élite III", "Élite IV", "Élite V"],
  it: ["Senza meta", "Quasi senza meta", "Esploratore", "Topografo", "Apripista", "Pathfinder", "Ranger", "Pioniere", "Élite", "Élite I", "Élite II", "Élite III", "Élite IV", "Élite V"],
  es: ["Sin rumbo", "Casi sin rumbo", "Explorador", "Topógrafo", "Pionero", "Buscador", "Ranger", "Pionero experto", "Élite", "Élite I", "Élite II", "Élite III", "Élite IV", "Élite V"],
};

export function explorationRankName(level: number | null | undefined, language: Language): string | null {
  if (level == null || !Number.isInteger(level) || level < 0) return null;
  return RANK_NAMES[language][level] ?? `Explore ${level}`;
}

const CAREER_RANK_NAMES: Record<Exclude<RankCategory, "explore">, readonly string[]> = {
  exobiologist: ["Directionless", "Mostly Directionless", "Compiler", "Collector", "Cataloguer", "Taxonomist", "Ecologist", "Geneticist", "Elite", "Elite I", "Elite II", "Elite III", "Elite IV", "Elite V"],
  trade: ["Penniless", "Mostly Penniless", "Peddler", "Dealer", "Merchant", "Broker", "Entrepreneur", "Tycoon", "Elite", "Elite I", "Elite II", "Elite III", "Elite IV", "Elite V"],
  combat: ["Harmless", "Mostly Harmless", "Novice", "Competent", "Expert", "Master", "Dangerous", "Deadly", "Elite", "Elite I", "Elite II", "Elite III", "Elite IV", "Elite V"],
};

export function careerRankName(category: RankCategory, level: number | null | undefined, language: Language): string | null {
  if (category === "explore") return explorationRankName(level, language);
  if (level == null || !Number.isInteger(level) || level < 0) return null;
  return CAREER_RANK_NAMES[category][level] ?? `${category} ${level}`;
}
