import type { Message } from "discord.js";
import { applyOggReaction } from "../services/oggEmojiService.js";

export async function handleMessageCreate(message: Message): Promise<void> {
  const result = await applyOggReaction(message);

  if (!result || result.ok || !result.error) {
    return;
  }

  console.warn(
    `[OGG REACTIONS] Failed to add ${result.emojiName} (${result.emojiId ?? "missing"}) to message ${message.id}: ${result.error}`,
  );
}