import { SlashCommandBuilder } from "discord.js";
import type { ChatInputCommandInteraction } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("about")
  .setDescription("Learn about OGG and this bot.");

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await interaction.reply(
    [
      "**OGG — Old Guy of Grumpy**",
      "OGG is the voice and personality of the *Elite Explorer Companion* desktop app.",
      "This Discord bot is the companion counterpart — bringing OGG to your server.",
      "",
      "Built with o7.",
    ].join("\n"),
  );
}
