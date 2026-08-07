import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { getOggQuote } from "ogg-core";

export const data = new SlashCommandBuilder()
  .setName("quote")
  .setDescription("Return an OGG saying.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(`*"${getOggQuote()}"*`);
}
