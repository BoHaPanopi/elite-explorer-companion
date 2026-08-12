export const SUPPORTED_VOICE_LOCALES = [
  "de-DE",
  "en-GB",
  "fr-FR",
  "it-IT",
  "es-ES",
] as const;

export type SupportedVoiceLocale = (typeof SUPPORTED_VOICE_LOCALES)[number];
export type CrewVoiceGender = "male" | "female";
export type CrewVoiceSlot = "M1" | "M2" | "W1" | "W2";

export type CrewVoiceProfile = Readonly<{
  id: string;
  locale: SupportedVoiceLocale;
  slot: CrewVoiceSlot;
  gender: CrewVoiceGender;
  baseVoiceName: string;
  pitch: number;
  rate: number;
  localProcessing: true;
  variantOfProfileId: string | null;
}>;

type ProfileDefinition = readonly [
  slot: CrewVoiceSlot,
  gender: CrewVoiceGender,
  baseVoiceName: string,
  pitch: number,
  rate: number,
  variantOfSlot?: CrewVoiceSlot,
];

const definitions: Record<SupportedVoiceLocale, readonly ProfileDefinition[]> = {
  "de-DE": [
    ["M1", "male", "Microsoft Stefan", 0, 0],
    ["M2", "male", "Microsoft Stefan", -4, -6, "M1"],
    ["W1", "female", "Microsoft Hedda", 0, 0],
    ["W2", "female", "Microsoft Katja", 0, 0],
  ],
  "en-GB": [
    ["M1", "male", "Microsoft George", 0, 0],
    ["M2", "male", "Microsoft George", -4, -6, "M1"],
    ["W1", "female", "Microsoft Hazel", 0, 0],
    ["W2", "female", "Microsoft Susan", 0, 0],
  ],
  "fr-FR": [
    ["M1", "male", "Microsoft Paul", 0, 0],
    ["M2", "male", "Microsoft Paul", -4, -6, "M1"],
    ["W1", "female", "Microsoft Hortense", 0, 0],
    ["W2", "female", "Microsoft Julie", 0, 0],
  ],
  "it-IT": [
    ["M1", "male", "Microsoft Cosimo", 0, 0],
    ["M2", "male", "Microsoft Cosimo", -4, -6, "M1"],
    ["W1", "female", "Microsoft Elsa", 0, 0],
    ["W2", "female", "Microsoft Elsa", -2, 6, "W1"],
  ],
  "es-ES": [
    ["M1", "male", "Microsoft Pablo", 0, 0],
    ["M2", "male", "Microsoft Pablo", -4, -6, "M1"],
    ["W1", "female", "Microsoft Helena", 0, 0],
    ["W2", "female", "Microsoft Laura", 0, 0],
  ],
};

export const CREW_VOICE_PROFILES: readonly CrewVoiceProfile[] = Object.freeze(
  SUPPORTED_VOICE_LOCALES.flatMap((locale) =>
    definitions[locale].map(([slot, gender, baseVoiceName, pitch, rate, variantOfSlot]) =>
      Object.freeze({
        id: `${locale}-${slot.toLowerCase()}`,
        locale,
        slot,
        gender,
        baseVoiceName,
        pitch,
        rate,
        localProcessing: true as const,
        variantOfProfileId: variantOfSlot
          ? `${locale}-${variantOfSlot.toLowerCase()}`
          : null,
      }),
    ),
  ),
);

export function getCrewVoiceProfile(
  locale: SupportedVoiceLocale,
  slot: CrewVoiceSlot,
): CrewVoiceProfile {
  const profile = CREW_VOICE_PROFILES.find(
    (candidate) => candidate.locale === locale && candidate.slot === slot,
  );
  if (!profile) throw new Error(`Crew voice profile is not defined: ${locale}/${slot}`);
  return profile;
}

export function normalizeVoiceLocale(locale: string | null | undefined): SupportedVoiceLocale | null {
  switch (locale) {
    case "de":
    case "de-DE":
      return "de-DE";
    case "en":
    case "uk":
    case "en-GB":
      return "en-GB";
    case "fr":
    case "fr-FR":
      return "fr-FR";
    case "it":
    case "it-IT":
      return "it-IT";
    case "es":
    case "es-ES":
      return "es-ES";
    default:
      return null;
  }
}

export const LOCAL_VOICE_VARIANT_NOTICE =
  "OGG uses only Windows voices installed locally on this PC. Some crew voices are local variants of the same Windows voice; pitch and speaking rate are adjusted only on this PC, and no speech text is sent to a cloud service.";
