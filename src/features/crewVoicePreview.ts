import type { CrewLocale, CrewRole } from "./crewProfiles";
import type { SpeechOptions } from "../services/SpeechService";
import {
  getCrewVoiceProfile,
  normalizeVoiceLocale,
  type CrewVoiceSlot,
} from "../voices/crewVoiceProfiles.ts";

export type CrewVoicePreview = {
  text: string;
  profileId: string;
  options: Pick<SpeechOptions, "voice" | "rate" | "pitch" | "volume" | "locale">;
};

const roleVoiceSlot: Record<CrewRole, CrewVoiceSlot> = {
  navigation: "M2",
  science: "W2",
  engineeringSystems: "W1",
  weaponsTactics: "M1",
};

const previewTexts: Record<CrewRole, Record<CrewLocale, string>> = {
  navigation: {
    de: "Kurs steht. Nächstes System ist ausgewählt.",
    uk: "Course is set. The next system is selected.",
    fr: "Cap défini. Le prochain système est sélectionné.",
    it: "Rotta impostata. Il prossimo sistema è selezionato.",
    es: "Rumbo fijado. El próximo sistema está seleccionado.",
  },
  science: {
    de: "Die Daten sind interessant. Das sollten wir uns genauer ansehen.",
    uk: "The data is interesting. We should take a closer look.",
    fr: "Les données sont intéressantes. Nous devrions les examiner de plus près.",
    it: "I dati sono interessanti. Dovremmo esaminarli più attentamente.",
    es: "Los datos son interesantes. Deberíamos examinarlos más detenidamente.",
  },
  engineeringSystems: {
    de: "Alle Systeme arbeiten innerhalb der normalen Parameter.",
    uk: "All systems are operating within normal parameters.",
    fr: "Tous les systèmes fonctionnent selon les paramètres normaux.",
    it: "Tutti i sistemi funzionano entro i parametri normali.",
    es: "Todos los sistemas funcionan dentro de los parámetros normales.",
  },
  weaponsTactics: {
    de: "Taktische Systeme sind bereit.",
    uk: "Tactical systems are ready.",
    fr: "Les systèmes tactiques sont prêts.",
    it: "I sistemi tattici sono pronti.",
    es: "Los sistemas tácticos están listos.",
  },
};

export const ANNA_TO_OGG_REFERENCE_SENTENCE_DE =
  "Ach OGG … du hast dich wirklich kein bisschen verändert.";

export function resolveCrewVoicePreview(
  role: CrewRole,
  locale: CrewLocale,
): CrewVoicePreview | null {
  const voiceLocale = normalizeVoiceLocale(locale);
  if (!voiceLocale) return null;
  const profile = getCrewVoiceProfile(voiceLocale, roleVoiceSlot[role]);
  return {
    text: previewTexts[role][locale],
    profileId: profile.id,
    options: {
      voice: profile.baseVoiceName,
      locale: profile.locale,
      rate: profile.rate,
      pitch: profile.pitch,
      volume: 1,
    },
  };
}
