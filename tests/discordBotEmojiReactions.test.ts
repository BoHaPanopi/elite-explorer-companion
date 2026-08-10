import assert from "node:assert/strict";
import test from "node:test";

import {
  applyOggReaction,
  buildOggEmojiResolution,
  clearOggEmojiCache,
  selectOggReaction,
  shouldUseRareAnimatedFacepalm,
} from "../packages/discord-bot/src/services/oggEmojiService.ts";

function emoji(id: string, name: string, animated: boolean) {
  return {
    id,
    name,
    animated,
  };
}

test("resolves both the static and animated OGG emojis from guild data", () => {
  const resolution = buildOggEmojiResolution([
    emoji("1001", "Augenbraue_OGG", false),
    emoji("1002", "Grimmiger_OGG_Masterformat", false),
    emoji("1003", "OGG_Augenrollen", false),
    emoji("1004", "OGG_Grinsen2", false),
    emoji("1005", "OGG_Facepalm_5_Finger", false),
    emoji("1006", "OGG_Facepalm", true),
  ] as any);

  assert.equal(resolution.resolved.eyebrow?.id, "1001");
  assert.equal(resolution.resolved.facepalmStatic?.id, "1005");
  assert.equal(resolution.resolved.facepalmAnimated?.id, "1006");
  assert.deepEqual(resolution.missing, []);
});

test("selects at most one reaction even when multiple rules match", () => {
  const result = selectOggReaction({
    id: "message-42",
    content: "oops, wrong branch, not again",
    authorBot: false,
    system: false,
    joinedTimestamp: null,
  });

  assert.ok(result);
  assert.equal(result?.key, "facepalmStatic");
});

test("ignores the bot's own messages", () => {
  const result = selectOggReaction({
    id: "message-43",
    content: "oops, wrong branch",
    authorBot: true,
    system: false,
    joinedTimestamp: null,
  });

  assert.equal(result, null);
});

test("keeps animated facepalm rare and deterministic", () => {
  const seeds = Array.from({ length: 200 }, (_, index) => `message-${index}`);
  const hits = seeds.filter((seed) => shouldUseRareAnimatedFacepalm(seed));

  assert.ok(hits.length > 0);
  assert.ok(hits.length < 20);
  assert.equal(
    shouldUseRareAnimatedFacepalm(seeds[17]!),
    shouldUseRareAnimatedFacepalm(seeds[17]!),
  );
});

test("blocks facepalm reactions for earnest help requests and new users", () => {
  const helpResult = selectOggReaction({
    id: "message-44",
    content: "Can someone help? I accidentally used the wrong branch.",
    authorBot: false,
    system: false,
    joinedTimestamp: null,
  });

  const newUserResult = selectOggReaction({
    id: "message-45",
    content: "oops wrong branch",
    authorBot: false,
    system: false,
    joinedTimestamp: Date.now(),
  });

  assert.equal(helpResult, null);
  assert.equal(newUserResult, null);
});

test("missing emoji does not crash the bot", async () => {
  clearOggEmojiCache();

  const message = {
    id: "message-46",
    content: "oops wrong branch",
    system: false,
    inGuild: () => true,
    author: { bot: false },
    member: { joinedTimestamp: null },
    guild: {
      id: "guild-1",
      emojis: {
        fetch: async () => new Map([["1001", emoji("1001", "Augenbraue_OGG", false)]]),
      },
    },
    react: async () => undefined,
  } as any;

  const result = await applyOggReaction(message);

  assert.ok(result);
  assert.equal(result?.ok, false);
  assert.equal(result?.emojiId, null);
  assert.equal(result?.error, null);
});