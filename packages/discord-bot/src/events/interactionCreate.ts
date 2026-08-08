import type { Interaction } from "discord.js";
import { isAcceptRulesInteraction, handleAcceptRules } from "../services/rulesService.js";

export async function handleInteractionCreate(
  interaction: Interaction,
): Promise<void> {
  if (!interaction.isButton()) {
    return;
  }

  if (!isAcceptRulesInteraction(interaction.customId)) {
    return;
  }

  await handleAcceptRules(interaction);
}