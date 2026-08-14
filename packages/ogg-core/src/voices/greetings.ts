import {
  OGG_START_POOL,
  OGG_START_SUFFIX_POOL,
  PANOPI_START_LINE,
} from "../content/startupGreetings.ts";

export { OGG_START_POOL, OGG_START_SUFFIX_POOL, PANOPI_START_LINE } from "../content/startupGreetings.ts";

export type GreetingContext = {
  bordcomputerName: string;
  commanderName: string;
  isReturning: boolean;
  random?: () => number;
};

let lastStartIndex = -1;
let lastSuffixIndex = -1;

function chooseNonRepeating<T>(pool: readonly T[], lastIndex: number, random: () => number): [T, number] {
  const index = lastIndex < 0
    ? Math.floor(random() * pool.length)
    : (lastIndex + 1 + Math.floor(random() * (pool.length - 1))) % pool.length;
  return [pool[index]!, index];
}

function isPanopi(commanderName: string): boolean {
  return commanderName.trim().toLocaleLowerCase("de-DE") === "panopi";
}

export function createStartupGreeting({ commanderName, random = Math.random }: GreetingContext): string[] {
  const name = commanderName.trim();
  const [start, nextStartIndex] = chooseNonRepeating(OGG_START_POOL, lastStartIndex, random);
  lastStartIndex = nextStartIndex;
  const greeting = isPanopi(name)
    ? PANOPI_START_LINE
    : start.replace("{Name}", name);

  // A suffix is deliberately independent from the base greeting pool.
  if (random() >= 0.35) return [greeting];
  const [suffix, nextSuffixIndex] = chooseNonRepeating(OGG_START_SUFFIX_POOL, lastSuffixIndex, random);
  lastSuffixIndex = nextSuffixIndex;
  return [greeting, suffix];
}
