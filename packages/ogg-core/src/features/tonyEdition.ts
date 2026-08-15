import type { Language } from "../types/language.ts";
import type { TacticalTarget, ThreatLevel } from "ogg-core";
import {
  TONY_GREETING_VARIANTS,
  TONY_START_POOL,
  TONY_TACTICAL_TEXT,
  TONY_TACTICAL_COMMENTS,
  TONY_WELCOME_MESSAGES,
} from "../content/tony.ts";

export { seasonalMessage, TONY_START_POOL } from "../content/tony.ts";

export type TonyProfile = "helitony" | "helitony2";
export type TonyMessageType = "welcome" | "seasonal";
export type OggLanguageMode = "standard" | "tony";

type TonyGreetingContext = {
  bordcomputerName: string;
  commanderName: string;
  isReturning: boolean;
  random?: () => number;
};

let lastGreetingVariantIndex = -1;
let lastTonyStartIndex = -1;

export function resolveTonyProfile(commander: string | null | undefined): TonyProfile | null {
  const identity = commander?.trim().toLocaleLowerCase("en-US");
  if (identity === "helitony") return "helitony";
  if (identity === "helitony2") return "helitony2";
  return null;
}

export function getTonyWelcomeMessage(profile: TonyProfile): string {
  return TONY_WELCOME_MESSAGES[profile];
}

export function selectCommanderIdentity(
  journalCommander: string | null | undefined,
  persistedCommander: string | null | undefined,
): string | null {
  const journalIdentity = journalCommander?.trim();
  if (journalIdentity) return resolveTonyProfile(journalIdentity) ?? journalCommander ?? null;

  const persistedIdentity = persistedCommander?.trim();
  if (persistedIdentity) return resolveTonyProfile(persistedIdentity) ?? persistedCommander ?? null;

  return null;
}

export function resolveOggMode(
  commander: string | null | undefined,
  selectedLanguage: Language,
): {
  language: Language;
  mode: OggLanguageMode;
  tonyProfile: TonyProfile | null;
} {
  const tonyProfile = resolveTonyProfile(commander);
  return {
    language: tonyProfile ? "en" : selectedLanguage,
    mode: tonyProfile ? "tony" : "standard",
    tonyProfile,
  };
}

export function createTonyStartupGreeting({
  bordcomputerName,
  commanderName,
  isReturning,
  random = Math.random,
}: TonyGreetingContext): string[] {
  const offset = 1 + Math.floor(random() * (TONY_GREETING_VARIANTS.length - 1));
  const index = lastGreetingVariantIndex < 0
    ? Math.floor(Math.random() * TONY_GREETING_VARIANTS.length)
    : (lastGreetingVariantIndex + offset) % TONY_GREETING_VARIANTS.length;
  lastGreetingVariantIndex = index;

  const variant = TONY_GREETING_VARIANTS[index];
  void commanderName;
  void isReturning;
  const specialIndex = lastTonyStartIndex < 0
    ? Math.floor(random() * TONY_START_POOL.length)
    : (lastTonyStartIndex + 1 + Math.floor(random() * (TONY_START_POOL.length - 1))) % TONY_START_POOL.length;
  lastTonyStartIndex = specialIndex;

  return [
    variant.online.replace("{computer}", bordcomputerName),
    variant.ready,
    TONY_START_POOL[specialIndex]!,
  ];
}

export function getTonyTacticalComment(level: ThreatLevel): string {
  return TONY_TACTICAL_COMMENTS[level];
}

export function createTonyTacticalText(
  target: TacticalTarget,
  level: ThreatLevel,
): {
  title: string;
  detail: string;
  opponentWarning: string;
  oggComment: string;
} {
  const title = target.missionTarget
    ? TONY_TACTICAL_TEXT.missionTargetTitle.replace("{pilotName}", target.pilotName)
    : target.legalStatus === "Wanted"
      ? TONY_TACTICAL_TEXT.wantedPilotTitle.replace("{pilotName}", target.pilotName)
      : TONY_TACTICAL_TEXT.scanTitle.replace("{pilotName}", target.pilotName);
  const missionText = target.missionTarget
    ? TONY_TACTICAL_TEXT.missionTargetDetail
    : target.legalStatus === "Wanted"
      ? TONY_TACTICAL_TEXT.wantedDetail
      : TONY_TACTICAL_TEXT.cleanDetail;
  const wingText = target.wingSize > 1
    ? TONY_TACTICAL_TEXT.wingDetail.replace("{wingSize}", String(target.wingSize))
    : "";
  const bountyText = target.bounty > 0
    ? TONY_TACTICAL_TEXT.bountyDetail.replace("{bounty}", target.bounty.toLocaleString("en-US"))
    : "";
  const opponentWarning = level === "red" || level === "orange"
    ? TONY_TACTICAL_TEXT.severeOpponentWarning.replace("{pilotName}", target.pilotName)
    : TONY_TACTICAL_TEXT.standardOpponentWarning.replace("{pilotName}", target.pilotName);

  return {
    title,
    detail: `${missionText} · ${target.shipName} · ${target.combatRank}${wingText}${bountyText}`,
    opponentWarning,
    oggComment: getTonyTacticalComment(level),
  };
}

export function isTonySeason(date: Date): boolean {
  return date.getMonth() === 11 && date.getDate() >= 1 && date.getDate() <= 26;
}

export function tonyWelcomeStorageKey(profile: TonyProfile): string {
  return `ogg.tonyEdition.welcome.${profile}`;
}

export function tonySeasonalStorageKey(year: number): string {
  return `ogg.tonyEdition.seasonal.${year}`;
}
