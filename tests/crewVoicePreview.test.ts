import assert from "node:assert/strict";
import test from "node:test";

import { resolveCrewVoicePreview } from "../src/features/crewVoicePreview.ts";
import {
  CREW_VOICE_PROFILES,
  getCrewVoiceProfile,
  SUPPORTED_VOICE_LOCALES,
} from "../src/voices/crewVoiceProfiles.ts";

test("all 20 approved local crew voice profiles are defined", () => {
  assert.equal(CREW_VOICE_PROFILES.length, 20);
  for (const locale of SUPPORTED_VOICE_LOCALES) {
    const profiles = CREW_VOICE_PROFILES.filter((profile) => profile.locale === locale);
    assert.deepEqual(profiles.map((profile) => profile.slot), ["M1", "M2", "W1", "W2"]);
    assert.equal(profiles.filter((profile) => profile.gender === "male").length, 2);
    assert.equal(profiles.filter((profile) => profile.gender === "female").length, 2);
    assert.ok(profiles.every((profile) => profile.localProcessing));
  }
});

test("all male M2 profiles are transparent local variants with the approved parameters", () => {
  for (const locale of SUPPORTED_VOICE_LOCALES) {
    const m1 = getCrewVoiceProfile(locale, "M1");
    const m2 = getCrewVoiceProfile(locale, "M2");
    assert.equal(m2.baseVoiceName, m1.baseVoiceName);
    assert.equal(m2.variantOfProfileId, m1.id);
    assert.equal(m2.pitch, -4);
    assert.equal(m2.rate, -6);
  }
});

test("Italian W2 is exactly the approved Elsa local variant", () => {
  const w1 = getCrewVoiceProfile("it-IT", "W1");
  const w2 = getCrewVoiceProfile("it-IT", "W2");
  assert.equal(w2.baseVoiceName, "Microsoft Elsa");
  assert.equal(w2.pitch, -2);
  assert.equal(w2.rate, 6);
  assert.equal(w2.variantOfProfileId, w1.id);
});

test("crew roles resolve to their fixed local profiles in every official locale", () => {
  const localeMap = { de: "de-DE", uk: "en-GB", fr: "fr-FR", it: "it-IT", es: "es-ES" } as const;
  const roleSlots = {
    navigation: "M2",
    science: "W2",
    engineeringSystems: "W1",
    weaponsTactics: "M1",
  } as const;
  for (const [crewLocale, voiceLocale] of Object.entries(localeMap)) {
    for (const [role, slot] of Object.entries(roleSlots)) {
      const preview = resolveCrewVoicePreview(role, crewLocale as keyof typeof localeMap);
      assert.ok(preview);
      assert.equal(preview.options.locale, voiceLocale);
      assert.equal(preview.profileId, `${voiceLocale}-${slot.toLowerCase()}`);
      assert.match(preview.options.voice ?? "", /^Microsoft /);
    }
  }
});

test("Anna, Susanne, Willi, and Sebastian retain their fixed high/dark mappings", () => {
  for (const locale of SUPPORTED_VOICE_LOCALES) {
    assert.equal(getCrewVoiceProfile(locale, "W2").gender, "female", `${locale} Anna`);
    assert.equal(getCrewVoiceProfile(locale, "W1").gender, "female", `${locale} Susanne`);
    assert.equal(getCrewVoiceProfile(locale, "M2").gender, "male", `${locale} Willi`);
    assert.equal(getCrewVoiceProfile(locale, "M1").gender, "male", `${locale} Sebastian`);
  }
});
