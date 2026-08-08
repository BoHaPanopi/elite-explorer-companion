import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export function createAcceptButton(
  customId: string,
  label: string,
  disabled = false,
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(label)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
  );
}