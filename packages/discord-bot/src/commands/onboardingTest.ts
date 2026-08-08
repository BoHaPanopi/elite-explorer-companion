import {
  PermissionFlagsBits,
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { sendOnboardingMessage } from "../services/onboardingService.js";
import {
  createOnboardingTestReply,
  createRuntimeReply,
} from "../services/messageService.js";

export const data = new SlashCommandBuilder()
  .setName("test-onboarding")
  .setDescription("Trigger the onboarding welcome flow for your own account.")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (interaction.replied || interaction.deferred) {
    return;
  }

  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: createRuntimeReply("guildOnly", interaction.locale),
      ephemeral: true,
    });
    return;
  }

  if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({
      content: createRuntimeReply("adminOnly", interaction.locale),
      ephemeral: true,
    });
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id);
  const result = await sendOnboardingMessage({
    member,
    localeHint: interaction.locale,
  });

  if (interaction.replied || interaction.deferred) {
    return;
  }

  await interaction.reply({
    content: createOnboardingTestReply(result, interaction.locale),
    ephemeral: true,
  });
}