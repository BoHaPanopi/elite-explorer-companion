import type { Message } from "discord.js";
import {
  applyOggReaction,
  resolveOggEmojiResolution,
  selectOggReaction,
} from "../services/oggEmojiService.js";

export async function handleMessageCreate(message: Message): Promise<void> {
  if (!message.inGuild()) {
    return;
  }

  const channelName = "name" in message.channel ? message.channel.name : "unknown";
  const content = message.content ?? "";
  const decision = selectOggReaction({
    id: message.id,
    content,
    authorBot: message.author.bot,
    system: message.system,
    joinedTimestamp: message.member?.joinedTimestamp ?? null,
  });

  let resolvedEmojiId: string | null = null;
  let resolvedEmojiName: string | null = null;

  if (decision) {
    const resolution = await resolveOggEmojiResolution(message.guild);
    const resolved = resolution.resolved[decision.key];
    resolvedEmojiId = resolved?.id ?? null;
    resolvedEmojiName = resolved?.name ?? null;
  }

  console.log(
    `[OGG REACTIONS][IN] messageId=${message.id} channelId=${message.channelId} channelName=${channelName} author=${message.author.username} authorBot=${message.author.bot} system=${message.system} content=${JSON.stringify(content)} contentLength=${content.length} decision=${decision ? JSON.stringify(decision) : "null"} resolvedEmojiName=${resolvedEmojiName ?? "null"} resolvedEmojiId=${resolvedEmojiId ?? "null"}`,
  );

  const result = await applyOggReaction(message);

  console.log(
    `[OGG REACTIONS][OUT] messageId=${message.id} reactResult=${result ? JSON.stringify(result) : "null"}`,
  );

  if (!result || result.ok || !result.error) {
    return;
  }

  console.warn(
    `[OGG REACTIONS] Failed to add ${result.emojiName} (${result.emojiId ?? "missing"}) to message ${message.id}: ${result.error}`,
  );
}