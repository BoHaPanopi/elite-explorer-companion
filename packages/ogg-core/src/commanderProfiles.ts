import type { Language } from "./types/language.ts";

export type CommanderProfileId = string;

export type CommanderProfile = {
  id: CommanderProfileId;
  preferredLanguage?: Language;
};

const commanderProfileRegistry: Record<string, CommanderProfile> = {
  helitony: {
    id: "helitony",
    preferredLanguage: "en",
  },
  helitony2: {
    id: "helitony2",
    preferredLanguage: "en",
  },
};

export function resolveCommanderProfile(
  commanderName: string | null | undefined,
): CommanderProfile | null {
  if (!commanderName) return null;
  const normalized = commanderName.toLocaleLowerCase("en-US").trim();
  return commanderProfileRegistry[normalized] ?? null;
}

export const commanderProfiles = commanderProfileRegistry;
