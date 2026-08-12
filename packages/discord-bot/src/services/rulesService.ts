import type { ButtonInteraction } from "discord.js";
import { DISCORD_COMMANDER_ROLE_ID, parseAcceptRulesCustomId } from "../config/discord.js";
import { createAcceptButton } from "../ui/acceptButton.js";
import { createRulesReply } from "./messageService.js";

export function isAcceptRulesInteraction(customId: string): boolean {
  return parseAcceptRulesCustomId(customId) !== null;
}

export async function handleAcceptRules(
  interaction: ButtonInteraction,
): Promise<void> {
  const targetUserId = parseAcceptRulesCustomId(interaction.customId);

  if (!targetUserId) {
    return;
  }

  if (!interaction.inCachedGuild()) {
    await replyEphemeral(
      interaction,
      createRulesReply("genericFailure", interaction.locale),
    );
    return;
  }

  if (interaction.user.id !== targetUserId) {
    await replyEphemeral(
      interaction,
      createRulesReply("notTargetUser", interaction.locale),
    );
    return;
  }

  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);

  if (!member) {
    await replyEphemeral(
      interaction,
      createRulesReply("genericFailure", interaction.locale),
    );
    return;
  }

  const role = await interaction.guild.roles
    .fetch(DISCORD_COMMANDER_ROLE_ID)
    .catch(() => null);

  if (!role) {
    console.warn(
      `[ONBOARDING] Commander role ${DISCORD_COMMANDER_ROLE_ID} was not found.`,
    );
    await replyEphemeral(
      interaction,
      createRulesReply("roleMissing", interaction.locale),
    );
    return;
  }

  if (member.roles.cache.has(role.id)) {
    await disableAcceptButton(interaction);
    await replyEphemeral(
      interaction,
      createRulesReply("alreadyAccepted", interaction.locale),
    );
    return;
  }

  try {
    await member.roles.add(role);
  } catch (error) {
    console.warn(
      `[ONBOARDING] Failed to assign commander role ${role.id} to ${interaction.user.tag}.`,
      error,
    );
    await replyEphemeral(
      interaction,
      createRulesReply("roleAssignFailed", interaction.locale),
    );
    return;
  }

  await disableAcceptButton(interaction);
  await replyEphemeral(
    interaction,
    createRulesReply("accepted", interaction.locale),
  );
}

async function disableAcceptButton(interaction: ButtonInteraction): Promise<void> {
  const targetUserId = parseAcceptRulesCustomId(interaction.customId);

  if (!targetUserId || !interaction.message.editable) {
    return;
  }

  try {
    await interaction.message.edit({
      components: [
        createAcceptButton(interaction.customId, "Accept Rules", true),
      ],
    });
  } catch (error) {
    console.warn("[ONBOARDING] Failed to disable accept button.", error);
  }
}

async function replyEphemeral(
  interaction: ButtonInteraction,
  content: string,
): Promise<void> {
  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content, ephemeral: true }).catch(() => undefined);
    return;
  }

  await interaction.reply({ content, ephemeral: true }).catch(() => undefined);
}