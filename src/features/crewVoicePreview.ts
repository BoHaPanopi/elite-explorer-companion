import type { CrewLocale, CrewRole } from "./crewProfiles";
import type { SpeechOptions } from "../services/SpeechService";
import { CREW_VOICE_PREVIEW_TEXTS } from "../content/crewVoicePreview.ts";

export { ANNA_TO_OGG_REFERENCE_SENTENCE_DE } from "../content/crewVoicePreview.ts";
import {
  getCrewVoiceProfile,
  normalizeVoiceLocale,
  type CrewVoiceSlot,
} from "../voices/crewVoiceProfiles.ts";

export type CrewVoicePreview = {
  text: string;
  profileId: string;
  options: Pick<SpeechOptions, "voice" | "voiceGender" | "rate" | "pitch" | "volume" | "locale">;
};

const roleVoiceSlot: Record<CrewRole, CrewVoiceSlot> = {
  navigation: "M2",
  science: "W2",
  engineeringSystems: "W1",
  weaponsTactics: "M1",
};

export function resolveCrewVoicePreview(
  role: CrewRole,
  locale: CrewLocale,
): CrewVoicePreview | null {
  const voiceLocale = normalizeVoiceLocale(locale);
  if (!voiceLocale) return null;
  const profile = getCrewVoiceProfile(voiceLocale, roleVoiceSlot[role]);
  return {
    text: CREW_VOICE_PREVIEW_TEXTS[role][locale],
    profileId: profile.id,
    options: {
      voice: profile.baseVoiceName,
      voiceGender: profile.gender,
      locale: profile.locale,
      rate: profile.rate,
      pitch: profile.pitch,
      volume: 1,
    },
  };
}
