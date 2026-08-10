import {
  SlashCommandBuilder,
  type ChatInputCommandInteraction,
  type GuildTextBasedChannel,
  type Message,
} from "discord.js";
import {
  getResolvedOggEmojiIds,
  runOggEmojiReactionTechnicalTest,
} from "../services/oggEmojiService.js";
import { createRuntimeReply } from "../services/messageService.js";

export const data = new SlashCommandBuilder()
  .setName("test-ogg-reactions")
  .setDescription("Resolve the live OGG emoji IDs and test one static plus one animated reaction.")
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName("message_id")
      .setDescription("Existing message ID in this channel. Leave empty to let OGG create a test message."),
  );

export async function execute(
  interaction: ChatInputCommandInteraction,
): Promise<void> {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: createRuntimeReply("guildOnly", interaction.locale),
      ephemeral: true,
    });
    return;
  }

  const channel = interaction.channel;

  if (!channel?.isTextBased() || channel.isDMBased()) {
    await interaction.reply({
      content: "This command needs a guild text channel.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const targetMessage = await resolveTargetMessage(
    interaction.options.getString("message_id"),
    channel,
  );

  if (!targetMessage) {
    await interaction.editReply("Target message could not be found in this channel.");
    return;
  }

  const ids = await getResolvedOggEmojiIds(interaction.guild);
  const attempts = await runOggEmojiReactionTechnicalTest(targetMessage);

  await interaction.editReply([
    `Target message: ${targetMessage.id}`,
    `Emoji IDs: ${JSON.stringify(ids)}`,
    ...attempts.map(formatAttempt),
  ].join("\n"));
}

async function resolveTargetMessage(
  requestedMessageId: string | null,
  channel: GuildTextBasedChannel,
): Promise<Message | null> {
  if (requestedMessageId) {
    return channel.messages.fetch(requestedMessageId).catch(() => null);
  }

  return channel.send("OGG emoji reaction technical test.");
}

function formatAttempt(result: Awaited<ReturnType<typeof runOggEmojiReactionTechnicalTest>>[number]): string {
  const prefix = result.key === "eyebrow" ? "Test A" : "Test B";
  const status = result.ok ? "OK" : "FAILED";
  const details = [
    `${prefix} ${status}`,
    `emoji=${result.emojiName}`,
    `id=${result.emojiId ?? "null"}`,
  ];

  if (result.error) {
    details.push(`discord=${result.error}`);
  }

  return details.join(" | ");
}