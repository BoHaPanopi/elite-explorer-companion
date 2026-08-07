import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription("List all available OGG commands.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(
    [
      "**Available OGG commands:**",
      "`/ogg` — Summon OGG for a greeting.",
      "`/quote` — Return a space-themed quote.",
      "`/about` — Learn about OGG and this bot.",
      "`/help` — Show this message.",
    ].join("\n"),
  );
}
