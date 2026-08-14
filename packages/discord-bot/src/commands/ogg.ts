import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { createStartupGreeting } from "ogg-core";
import {
  OGG_COMMAND_DESCRIPTION,
  OGG_DISCORD_GREETING_CONTEXT,
  OGG_DISCORD_SIGNATURE,
} from "../content/commandCopy.js";

export const data = new SlashCommandBuilder()
  .setName("ogg")
  .setDescription(OGG_COMMAND_DESCRIPTION);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Use ogg-core shared greeting with a placeholder context
  const lines = createStartupGreeting(OGG_DISCORD_GREETING_CONTEXT);
  await interaction.reply(`${lines.join("\n")}${OGG_DISCORD_SIGNATURE}`);
}
