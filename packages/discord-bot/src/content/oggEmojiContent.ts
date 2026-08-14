import type { OggEmojiDefinition } from "../services/oggEmojiService.ts";

export const OGG_EMOJI_DEFINITIONS: readonly OggEmojiDefinition[] = [
  { key: "eyebrow", name: "Augenbraue_OGG", animated: false },
  { key: "grim", name: "Grimmiger_OGG_Masterformat", animated: false },
  { key: "eyeRoll", name: "OGG_Augenrollen", animated: false },
  { key: "grin", name: "OGG_Grinsen2", animated: false },
  { key: "facepalmStatic", name: "OGG_Facepalm_5_Finger", animated: false },
  { key: "facepalmAnimated", name: "OGG_Facepalm", animated: true },
] as const;

export const eyebrowPatterns = [
  /\b(angeblich|allegedly|trust me|sure thing|ganz sicher|totally)\b/i,
  /\b(source\?|beleg\?|wirklich\?)\b/i,
  /\b(works on my machine)\b/i,
];
export const grimPatterns = [
  /\b(rm -rf|drop(?:ped)? (?:the )?(?:prod|production|database|table)|force ?push(?:ed)? main|deleted production)\b/i,
  /\b(geheimnis|secret|token|credential|apikey|api key).{0,24}\b(leak|geleakt|public|committed|push(?:ed)?)\b/i,
  /\b(prod(?:uction)?).{0,24}\b(broke|kaputt|down|dead)\b/i,
];

export const eyeRollPatterns = [
  /\b(not again|again\b|schon wieder|wieder mal|same issue|same bug|as usual|wie immer)\b/i,
  /\b(still broken|immer noch kaputt|nochmal passiert)\b/i,
];

export const grinPatterns = [
  /\b(called it|told you|wie gesagt|hab ich doch gesagt|fixed it|läuft wieder|works now|na also)\b/i,
  /\b(mission accomplished|problem solved|issue closed|case closed)\b/i,
];

export const staticFacepalmPatterns = [
  /\b(oops|ups|peinlich|embarrassing|wrong branch|falscher branch|accidentally|versehentlich)\b/i,
  /\b(sent|posted|deployed|merged).{0,24}\b(wrong|falsch|prod|production|main)\b/i,
  /\b(unnötiges chaos|needless chaos|chaos)\b/i,
];

export const animatedFacepalmPatterns = [
  /\b(rm -rf \/|format c:|dropped production|deleted production database|pushed secrets|committed secrets)\b/i,
  /\b(deployed).{0,24}\b(broken hotfix twice|totally broken|catastrophic)\b/i,
];

export const helpRequestPatterns = [
  /\b(help|hilfe|support|frage|question|kann jemand helfen|can someone help|how do i|wie kann ich)\b/i,
  /\?$/,
];
