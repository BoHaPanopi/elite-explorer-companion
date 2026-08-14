export const ABOUT_COMMAND_DESCRIPTION = "Learn about OGG and this bot.";

export const ABOUT_REPLY_LINES = [
  "**OGG — Old Guy of Grumpy**",
  "OGG is the voice and personality of the *Elite Explorer Companion* desktop app.",
  "This Discord bot is the companion counterpart — bringing OGG to your server.",
  "",
  "Built with o7.",
] as const;

export const HELP_COMMAND_DESCRIPTION = "List all available OGG commands.";

export const HELP_REPLY_LINES = [
  "**Available OGG commands:**",
  "`/ogg` — Summon OGG for a greeting.",
  "`/quote` — Return a space-themed quote.",
  "`/about` — Learn about OGG and this bot.",
  "`/help` — Show this message.",
  "`/test-onboarding` — Trigger the Discord onboarding flow for yourself (admin only).",
] as const;

export const OGG_COMMAND_DESCRIPTION = "Summon OGG for a greeting.";
export const OGG_DISCORD_GREETING_CONTEXT = Object.freeze({
  bordcomputerName: "OGG",
  commanderName: "Commander",
  isReturning: false,
});
export const OGG_DISCORD_SIGNATURE = "\n\nOGG\n\no7";

export const QUOTE_COMMAND_DESCRIPTION = "Return an OGG saying.";
