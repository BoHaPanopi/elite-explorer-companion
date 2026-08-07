import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { createStartupGreeting } from "ogg-core";

export const data = new SlashCommandBuilder()
  .setName("ogg")
  .setDescription("Summon OGG for a greeting.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Use ogg-core shared greeting with a placeholder context
  const lines = createStartupGreeting({
    bordcomputerName: "OGG",
    commanderName: "Commander",
    isReturning: false,
  });
  await interaction.reply(lines.join("\n"));
}
