import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";
import { ABOUT_COMMAND_DESCRIPTION, ABOUT_REPLY_LINES } from "../content/commandCopy.js";

export const data = new SlashCommandBuilder()
  .setName("about")
  .setDescription(ABOUT_COMMAND_DESCRIPTION);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(
    ABOUT_REPLY_LINES.join("\n"),
  );
}
