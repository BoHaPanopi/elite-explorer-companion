import {
  DISCORD_COMMANDER_ROLE_ID,
  DISCORD_RULES_CHANNEL_ID,
  DISCORD_WELCOME_CHANNEL_ID,
} from "./env.js";

export const OGG_COLOR = "#0099FF";
export const ACCEPT_RULES_CUSTOM_ID = "ogg:onboarding:accept-rules";

export {
  DISCORD_COMMANDER_ROLE_ID,
  DISCORD_RULES_CHANNEL_ID,
  DISCORD_WELCOME_CHANNEL_ID,
};

export function createAcceptRulesCustomId(userId: string): string {
  return `${ACCEPT_RULES_CUSTOM_ID}:${userId}`;
}

export function parseAcceptRulesCustomId(customId: string): string | null {
  const prefix = `${ACCEPT_RULES_CUSTOM_ID}:`;

  if (!customId.startsWith(prefix)) {
    return null;
  }

  const userId = customId.slice(prefix.length).trim();
  return userId.length > 0 ? userId : null;
}