import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { getOggQuote } from "ogg-core";
import { QUOTE_COMMAND_DESCRIPTION } from "../content/commandCopy.js";

export const data = new SlashCommandBuilder()
  .setName("quote")
  .setDescription(QUOTE_COMMAND_DESCRIPTION);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(`*"${getOggQuote()}"*`);
}
