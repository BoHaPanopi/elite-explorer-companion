import type { Collection, Guild, GuildEmoji, Message } from "discord.js";

export type OggEmojiKey =
  | "eyebrow"
  | "grim"
  | "eyeRoll"
  | "grin"
  | "facepalmStatic"
  | "facepalmAnimated";

export type OggReactionKey = OggEmojiKey;

type OggEmojiDefinition = {
  key: OggEmojiKey;
  name: string;
  animated: boolean;
};

type OggReactionDecision = {
  key: OggReactionKey;
  reason: string;
};

export type OggEmojiResolution = {
  resolved: Partial<Record<OggEmojiKey, ResolvedOggEmoji>>;
  missing: OggEmojiKey[];
};

export type ResolvedOggEmoji = OggEmojiDefinition & {
  id: string;
  emoji: GuildEmoji;
};

export type OggReactionAttempt = {
  key: OggReactionKey;
  emojiName: string;
  emojiId: string | null;
  animated: boolean;
  ok: boolean;
  reason: string;
  error: string | null;
};

type ReactionContext = {
  id: string;
  content: string;
  authorBot: boolean;
  system: boolean;
  joinedTimestamp: number | null;
};

const OGG_EMOJI_DEFINITIONS: readonly OggEmojiDefinition[] = [
  { key: "eyebrow", name: "Augenbraue_OGG", animated: false },
  { key: "grim", name: "Grimmiger_OGG_Masterformat", animated: false },
  { key: "eyeRoll", name: "OGG_Augenrollen", animated: false },
  { key: "grin", name: "OGG_Grinsen2", animated: false },
  { key: "facepalmStatic", name: "OGG_Facepalm_5_Finger", animated: false },
  { key: "facepalmAnimated", name: "OGG_Facepalm", animated: true },
] as const;

const EMOJI_CACHE_TTL_MS = 5 * 60 * 1000;
const NEW_MEMBER_FACEPALM_GRACE_MS = 7 * 24 * 60 * 60 * 1000;
const RARE_FACEPALM_BUCKET = 17;
const RARE_FACEPALM_MODULO = 29;

const emojiCache = new Map<string, { expiresAt: number; resolution: OggEmojiResolution }>();

const eyebrowPatterns = [
  /\b(angeblich|allegedly|trust me|sure thing|ganz sicher|totally)\b/i,
  /\b(source\?|beleg\?|wirklich\?)\b/i,
  /\b(works on my machine)\b/i,
];

const grimPatterns = [
  /\b(rm -rf|drop(?:ped)? (?:the )?(?:prod|production|database|table)|force ?push(?:ed)? main|deleted production)\b/i,
  /\b(geheimnis|secret|token|credential|apikey|api key).{0,24}\b(leak|geleakt|public|committed|push(?:ed)?)\b/i,
  /\b(prod(?:uction)?).{0,24}\b(broke|kaputt|down|dead)\b/i,
];

const eyeRollPatterns = [
  /\b(not again|again\b|schon wieder|wieder mal|same issue|same bug|as usual|wie immer)\b/i,
  /\b(still broken|immer noch kaputt|nochmal passiert)\b/i,
];

const grinPatterns = [
  /\b(called it|told you|wie gesagt|hab ich doch gesagt|fixed it|läuft wieder|works now|na also)\b/i,
  /\b(mission accomplished|problem solved|issue closed|case closed)\b/i,
];

const staticFacepalmPatterns = [
  /\b(oops|ups|peinlich|embarrassing|wrong branch|falscher branch|accidentally|versehentlich)\b/i,
  /\b(sent|posted|deployed|merged).{0,24}\b(wrong|falsch|prod|production|main)\b/i,
  /\b(unnötiges chaos|needless chaos|chaos)\b/i,
];

const animatedFacepalmPatterns = [
  /\b(rm -rf \/|format c:|dropped production|deleted production database|pushed secrets|committed secrets)\b/i,
  /\b(deployed).{0,24}\b(broken hotfix twice|totally broken|catastrophic)\b/i,
];

const helpRequestPatterns = [
  /\b(help|hilfe|support|frage|question|kann jemand helfen|can someone help|how do i|wie kann ich)\b/i,
  /\?$/,
];

function normalizeContent(content: string): string {
  return content.replace(/\s+/g, " ").trim();
}

function matchesAnyPattern(content: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(content));
}

function isEarnestHelpRequest(content: string): boolean {
  return matchesAnyPattern(content, helpRequestPatterns);
}

function isNewMember(joinedTimestamp: number | null, now = Date.now()): boolean {
  if (!joinedTimestamp) {
    return false;
  }

  return now - joinedTimestamp < NEW_MEMBER_FACEPALM_GRACE_MS;
}

export function shouldUseRareAnimatedFacepalm(seed: string): boolean {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 33 + char.charCodeAt(0)) % RARE_FACEPALM_MODULO;
  }

  return hash === RARE_FACEPALM_BUCKET;
}

export function selectOggReaction(context: ReactionContext): OggReactionDecision | null {
  if (context.authorBot || context.system) {
    return null;
  }

  const content = normalizeContent(context.content);

  if (!content) {
    return null;
  }

  const helpRequest = isEarnestHelpRequest(content);
  const newMember = isNewMember(context.joinedTimestamp);
  const facepalmAllowed = !helpRequest && !newMember;

  if (facepalmAllowed && matchesAnyPattern(content, animatedFacepalmPatterns)) {
    if (shouldUseRareAnimatedFacepalm(context.id)) {
      return {
        key: "facepalmAnimated",
        reason: "rare severe blunder",
      };
    }

    return {
      key: "facepalmStatic",
      reason: "severe blunder downgraded to static facepalm",
    };
  }

  if (facepalmAllowed && matchesAnyPattern(content, staticFacepalmPatterns)) {
    return {
      key: "facepalmStatic",
      reason: "clear avoidable mistake",
    };
  }

  if (matchesAnyPattern(content, eyeRollPatterns)) {
    return {
      key: "eyeRoll",
      reason: "repeated annoying situation",
    };
  }

  if (matchesAnyPattern(content, grimPatterns)) {
    return {
      key: "grim",
      reason: "obvious technical blunder",
    };
  }

  if (matchesAnyPattern(content, eyebrowPatterns)) {
    return {
      key: "eyebrow",
      reason: "mild skepticism",
    };
  }

  if (matchesAnyPattern(content, grinPatterns)) {
    return {
      key: "grin",
      reason: "dry success acknowledgment",
    };
  }

  return null;
}

export function buildOggEmojiResolution(
  emojis: Iterable<GuildEmoji>,
): OggEmojiResolution {
  const resolved: Partial<Record<OggEmojiKey, ResolvedOggEmoji>> = {};

  for (const definition of OGG_EMOJI_DEFINITIONS) {
    const match = Array.from(emojis).find(
      (emoji) => emoji.name === definition.name && emoji.animated === definition.animated,
    );

    if (match) {
      resolved[definition.key] = {
        ...definition,
        id: match.id,
        emoji: match,
      };
    }
  }

  const missing = OGG_EMOJI_DEFINITIONS
    .map((definition) => definition.key)
    .filter((key) => !resolved[key]);

  return {
    resolved,
    missing,
  };
}

export async function resolveOggEmojiResolution(guild: Guild): Promise<OggEmojiResolution> {
  const cached = emojiCache.get(guild.id);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.resolution;
  }

  const emojis = await guild.emojis.fetch();
  const resolution = buildOggEmojiResolution(emojis.values());

  emojiCache.set(guild.id, {
    expiresAt: Date.now() + EMOJI_CACHE_TTL_MS,
    resolution,
  });

  return resolution;
}

export async function applyOggReaction(message: Message): Promise<OggReactionAttempt | null> {
  if (!message.inGuild()) {
    return null;
  }

  const decision = selectOggReaction({
    id: message.id,
    content: message.content,
    authorBot: message.author.bot,
    system: message.system,
    joinedTimestamp: message.member?.joinedTimestamp ?? null,
  });

  if (!decision) {
    return null;
  }

  const resolution = await resolveOggEmojiResolution(message.guild);
  const emoji = resolution.resolved[decision.key];

  if (!emoji) {
    return {
      key: decision.key,
      emojiName: OGG_EMOJI_DEFINITIONS.find((definition) => definition.key === decision.key)?.name ?? decision.key,
      emojiId: null,
      animated: decision.key === "facepalmAnimated",
      ok: false,
      reason: `${decision.reason}; emoji missing on guild`,
      error: null,
    };
  }

  try {
    await message.react(emoji.emoji);
    return {
      key: emoji.key,
      emojiName: emoji.name,
      emojiId: emoji.id,
      animated: emoji.animated,
      ok: true,
      reason: decision.reason,
      error: null,
    };
  } catch (error) {
    return {
      key: emoji.key,
      emojiName: emoji.name,
      emojiId: emoji.id,
      animated: emoji.animated,
      ok: false,
      reason: decision.reason,
      error: formatDiscordError(error),
    };
  }
}

export async function runOggEmojiReactionTechnicalTest(
  message: Message,
): Promise<OggReactionAttempt[]> {
  if (!message.inGuild()) {
    return [];
  }

  const resolution = await resolveOggEmojiResolution(message.guild);
  const keys: OggReactionKey[] = ["eyebrow", "facepalmAnimated"];
  const attempts: OggReactionAttempt[] = [];

  for (const key of keys) {
    const emoji = resolution.resolved[key];
    const definition = OGG_EMOJI_DEFINITIONS.find((entry) => entry.key === key)!;

    if (!emoji) {
      attempts.push({
        key,
        emojiName: definition.name,
        emojiId: null,
        animated: definition.animated,
        ok: false,
        reason: "emoji not found on guild",
        error: null,
      });
      continue;
    }

    try {
      await message.react(emoji.emoji);
      attempts.push({
        key,
        emojiName: emoji.name,
        emojiId: emoji.id,
        animated: emoji.animated,
        ok: true,
        reason: "reaction added",
        error: null,
      });
    } catch (error) {
      attempts.push({
        key,
        emojiName: emoji.name,
        emojiId: emoji.id,
        animated: emoji.animated,
        ok: false,
        reason: "discord rejected reaction",
        error: formatDiscordError(error),
      });
    }
  }

  return attempts;
}

export function listResolvedOggEmojiIds(resolution: OggEmojiResolution): Record<OggEmojiKey, string | null> {
  return {
    eyebrow: resolution.resolved.eyebrow?.id ?? null,
    grim: resolution.resolved.grim?.id ?? null,
    eyeRoll: resolution.resolved.eyeRoll?.id ?? null,
    grin: resolution.resolved.grin?.id ?? null,
    facepalmStatic: resolution.resolved.facepalmStatic?.id ?? null,
    facepalmAnimated: resolution.resolved.facepalmAnimated?.id ?? null,
  };
}

export async function getResolvedOggEmojiIds(guild: Guild): Promise<Record<OggEmojiKey, string | null>> {
  const resolution = await resolveOggEmojiResolution(guild);
  return listResolvedOggEmojiIds(resolution);
}

export function clearOggEmojiCache(): void {
  emojiCache.clear();
}

function formatDiscordError(error: unknown): string {
  if (error instanceof Error) {
    return error.toString();
  }

  return String(error);
}

export function getOggEmojiDefinitions(): readonly OggEmojiDefinition[] {
  return OGG_EMOJI_DEFINITIONS;
}