import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { HELP_COMMAND_DESCRIPTION, HELP_REPLY_LINES } from "../content/commandCopy.js";

export const data = new SlashCommandBuilder()
  .setName("help")
  .setDescription(HELP_COMMAND_DESCRIPTION);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(
    HELP_REPLY_LINES.join("\n"),
  );
}
