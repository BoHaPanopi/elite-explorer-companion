import type { Language } from "../i18n";
import type { TacticalTarget, ThreatLevel } from "../types/tactical";

export type TonyProfile = "helitony" | "helitony2";
export type TonyMessageType = "welcome" | "seasonal";
export type OggLanguageMode = "standard" | "tony";

type TonyGreetingContext = {
  bordcomputerName: string;
  commanderName: string;
  isReturning: boolean;
};

type TonyGreetingVariant = {
  online: string;
  ready: string;
  firstVisit: string;
  returning: string;
};

const greetingVariants: TonyGreetingVariant[] = [
  {
    online: "Onboard computer {computer} is online.",
    ready: "All systems are ready.",
    firstVisit: "Welcome to the cockpit, {commander}.",
    returning: "Welcome back to the cockpit, {commander}.",
  },
  {
    online: "Onboard computer {computer} reporting in.",
    ready: "Everything is up and running.",
    firstVisit: "Good to have you aboard, {commander}.",
    returning: "Good to have you back aboard, {commander}.",
  },
  {
    online: "Onboard computer {computer} is awake.",
    ready: "The ship is ready when you are.",
    firstVisit: "The cockpit is yours, {commander}.",
    returning: "The cockpit has been waiting for you, {commander}.",
  },
  {
    online: "Onboard computer {computer} is fully online.",
    ready: "All systems are behaving themselves.",
    firstVisit: "Welcome aboard, {commander}.",
    returning: "Welcome back aboard, {commander}.",
  },
  {
    online: "Onboard computer {computer} is ready.",
    ready: "The system check came back clean.",
    firstVisit: "Settle in, {commander}.",
    returning: "Settle back in, {commander}.",
  },
  {
    online: "Onboard computer {computer} is running.",
    ready: "The ship is in good order.",
    firstVisit: "Your seat is ready, {commander}.",
    returning: "Your seat is ready again, {commander}.",
  },
];

const tacticalComments: Record<ThreatLevel, string> = {
  green: "They have picked the wrong ship today.",
  yellow: "I would not underestimate that one.",
  orange: "Right. This is getting uncomfortable.",
  red: "That is our cue to leave. No need to make a ceremony of it.",
};

let lastGreetingVariantIndex = -1;

const welcomeMessages: Record<TonyProfile, string> = {
  helitony: `Welcome aboard, Tony.

Thank you for being the very first external Commander
to help shape the future of OGG.

Your friendship,
your support,
and your honest feedback
mean more to me than you probably realise.

Take your time,
enjoy the journey,
and welcome aboard.

Fly safe, my friend.

o7`,
  helitony2: `Welcome back, Tony.

Guardian of the Black...

The Fuel Rats chapter may be closed...

...yet Helitony2 is still quietly watching over the road between Colonia and Sagittarius A*.

Some habits are simply part of who we are.

Fly safe, my friend.

o7`,
};

export const seasonalMessage = `Tony...

Don't forget to put the Christmas tree
in the cockpit.

And this year...

don't forget to take it out again
after Christmas.

😄

Fly safe.

o7`;

export function resolveTonyProfile(commander: string | null | undefined): TonyProfile | null {
  const identity = commander?.toLocaleLowerCase("en-US");
  if (identity === "helitony") return "helitony";
  if (identity === "helitony2") return "helitony2";
  return null;
}

export function getTonyWelcomeMessage(profile: TonyProfile): string {
  return welcomeMessages[profile];
}

export function selectCommanderIdentity(
  journalCommander: string | null | undefined,
  persistedCommander: string | null | undefined,
): string | null {
  return journalCommander || persistedCommander || null;
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
}: TonyGreetingContext): string[] {
  const offset = 1 + Math.floor(Math.random() * (greetingVariants.length - 1));
  const index = lastGreetingVariantIndex < 0
    ? Math.floor(Math.random() * greetingVariants.length)
    : (lastGreetingVariantIndex + offset) % greetingVariants.length;
  lastGreetingVariantIndex = index;

  const variant = greetingVariants[index];
  const commander = commanderName.trim();
  const commanderReference = commander === "Commander"
    ? "Commander"
    : `Commander ${commander}`;

  return [
    variant.online.replace("{computer}", bordcomputerName),
    variant.ready,
    (isReturning ? variant.returning : variant.firstVisit)
      .replace("{commander}", commanderReference),
  ];
}

export function getTonyTacticalComment(level: ThreatLevel): string {
  return tacticalComments[level];
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
    ? `Mission target: ${target.pilotName}`
    : target.legalStatus === "Wanted"
      ? `Wanted pilot: ${target.pilotName}`
      : `Scan by ${target.pilotName}`;
  const missionText = target.missionTarget
    ? "Mission target"
    : target.legalStatus === "Wanted"
      ? "Wanted, not a mission target"
      : "Clean";
  const wingText = target.wingSize > 1
    ? ` · Wing of ${target.wingSize} ships`
    : "";
  const bountyText = target.bounty > 0
    ? ` · Expected bounty ${target.bounty.toLocaleString("en-US")} Cr`
    : "";
  const opponentWarning = level === "red" || level === "orange"
    ? `Pilot ${target.pilotName}. You scanned us. Consider this your first and final warning.`
    : `Pilot ${target.pilotName}. You scanned us. Before you do anything foolish, I would think that through once more.`;

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
