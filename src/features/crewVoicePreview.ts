import type { CrewLocale, CrewRole } from "./crewProfiles";
import type { SpeechOptions } from "../services/SpeechService";

export type CrewVoicePreview = {
  text: string;
  options: Pick<SpeechOptions, "voice" | "rate" | "pitch" | "volume">;
};

const WILLI_VOICE_OPTIONS = Object.freeze({
  voice: "de-DE-FlorianMultilingualNeural",
  rate: 0.9,
  pitch: -15,
  volume: 1,
});

const ANNA_EMMA_OPTIONS = Object.freeze({
  voice: "en-US-EmmaMultilingualNeural",
  rate: 1.05,
  pitch: 0,
  volume: 1,
});

const ANNA_SONIA_OPTIONS = Object.freeze({
  voice: "en-GB-SoniaNeural",
  rate: 1.05,
  pitch: 0,
  volume: 1,
});

const WILLI_NAV_PREVIEWS: Record<CrewLocale, CrewVoicePreview> = {
  de: {
    text: "Kurs steht. Nächstes System ist ausgewählt.",
    options: WILLI_VOICE_OPTIONS,
  },
  uk: {
    text: "Course is set. The next system is selected.",
    options: WILLI_VOICE_OPTIONS,
  },
  fr: {
    text: "Cap défini. Le prochain système est sélectionné.",
    options: WILLI_VOICE_OPTIONS,
  },
  it: {
    text: "Rotta impostata. Il prossimo sistema è selezionato.",
    options: WILLI_VOICE_OPTIONS,
  },
  es: {
    text: "Rumbo fijado. El próximo sistema está seleccionado.",
    options: WILLI_VOICE_OPTIONS,
  },
};

const ANNA_SCIENCE_PREVIEWS: Record<CrewLocale, CrewVoicePreview> = {
  de: {
    text: "Die Daten sind interessant. Das sollten wir uns genauer ansehen.",
    options: ANNA_EMMA_OPTIONS,
  },
  uk: {
    text: "The data is interesting. We should take a closer look.",
    options: ANNA_SONIA_OPTIONS,
  },
  fr: {
    text: "Les données sont intéressantes. Nous devrions les examiner de plus près.",
    options: ANNA_EMMA_OPTIONS,
  },
  it: {
    text: "I dati sono interessanti. Dovremmo esaminarli più attentamente.",
    options: ANNA_EMMA_OPTIONS,
  },
  es: {
    text: "Los datos son interesantes. Deberíamos examinarlos más detenidamente.",
    options: ANNA_EMMA_OPTIONS,
  },
};

export const ANNA_TO_OGG_REFERENCE_SENTENCE_DE =
  "Ach OGG … du hast dich wirklich kein bisschen verändert.";

export function resolveCrewVoicePreview(
  role: CrewRole,
  locale: CrewLocale,
): CrewVoicePreview | null {
  if (role === "navigation") return WILLI_NAV_PREVIEWS[locale];
  if (role === "science") return ANNA_SCIENCE_PREVIEWS[locale];
  return null;
}