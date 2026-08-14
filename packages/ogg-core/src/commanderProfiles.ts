import type { Language } from "./types/language.ts";
import { COMMANDER_PROFILE_REGISTRY } from "./content/commanderProfiles.ts";

export type CommanderProfileId = string;

export type CommanderProfile = {
  id: CommanderProfileId;
  preferredLanguage?: Language;
};

export function resolveCommanderProfile(
  commanderName: string | null | undefined,
): CommanderProfile | null {
  if (!commanderName) return null;
  const normalized = commanderName.toLocaleLowerCase("en-US").trim();
  return COMMANDER_PROFILE_REGISTRY[normalized] ?? null;
}

export const commanderProfiles = COMMANDER_PROFILE_REGISTRY;
