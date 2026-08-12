import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ANNA_TO_OGG_REFERENCE_SENTENCE_DE,
  resolveCrewVoicePreview,
} from "../src/features/crewVoicePreview.ts";

const appPath = join(process.cwd(), "src", "App.tsx");
const dialogPath = join(process.cwd(), "src", "components", "CrewConfigDialog.tsx");

const roles = [
  "navigation",
  "science",
  "engineeringSystems",
  "weaponsTactics",
] as const;
const locales = ["de", "uk", "fr", "it", "es"] as const;

const williTexts = {
  de: "Kurs steht. Nächstes System ist ausgewählt.",
  uk: "Course is set. The next system is selected.",
  fr: "Cap défini. Le prochain système est sélectionné.",
  it: "Rotta impostata. Il prossimo sistema è selezionato.",
  es: "Rumbo fijado. El próximo sistema está seleccionado.",
} as const;

const annaTexts = {
  de: "Die Daten sind interessant. Das sollten wir uns genauer ansehen.",
  uk: "The data is interesting. We should take a closer look.",
  fr: "Les données sont intéressantes. Nous devrions les examiner de plus près.",
  it: "I dati sono interessanti. Dovremmo esaminarli più attentamente.",
  es: "Los datos son interesantes. Deberíamos examinarlos más detenidamente.",
} as const;

test("Willi uses the approved Florian multilingual voice and fixed parameters in all five locales", () => {
  for (const locale of locales) {
    const preview = resolveCrewVoicePreview("navigation", locale);

    assert.ok(preview);
    assert.equal(preview.text, williTexts[locale]);
    assert.deepEqual(preview.options, {
      voice: "de-DE-FlorianMultilingualNeural",
      rate: 0.9,
      pitch: -15,
      volume: 1,
    });
  }
});

test("Anna Science uses approved Emma mapping for DE/FR/IT/ES and Sonia for EN with fixed parameters", () => {
  const emmaOptions = {
    voice: "en-US-EmmaMultilingualNeural",
    rate: 1.05,
    pitch: 0,
    volume: 1,
  };
  const soniaOptions = {
    voice: "en-GB-SoniaNeural",
    rate: 1.05,
    pitch: 0,
    volume: 1,
  };

  for (const locale of locales) {
    const preview = resolveCrewVoicePreview("science", locale);
    assert.ok(preview);
    assert.equal(preview.text, annaTexts[locale]);

    if (locale === "uk") {
      assert.deepEqual(preview.options, soniaOptions);
      continue;
    }

    assert.deepEqual(preview.options, emmaOptions);
  }
});

test("Anna EN remains intentionally separate and must not be unified back to Emma", () => {
  const annaEnPreview = resolveCrewVoicePreview("science", "uk");
  assert.ok(annaEnPreview);
  assert.equal(annaEnPreview.options.voice, "en-GB-SoniaNeural");
  assert.notEqual(annaEnPreview.options.voice, "en-US-EmmaMultilingualNeural");
});

test("Anna to OGG reference sentence remains locked", () => {
  assert.equal(
    ANNA_TO_OGG_REFERENCE_SENTENCE_DE,
    "Ach OGG … du hast dich wirklich kein bisschen verändert.",
  );
});

test("all five Willi and Anna locales have preview and other roles still have none", () => {
  for (const role of roles) {
    for (const locale of locales) {
      const hasPreview = role === "navigation" || role === "science";
      if (hasPreview) {
        assert.ok(resolveCrewVoicePreview(role, locale));
        continue;
      }
      assert.equal(resolveCrewVoicePreview(role, locale), null);
    }
  }
});

test("Susanne and Bastian still have no voice preview in any locale", () => {
  for (const locale of locales) {
    assert.equal(resolveCrewVoicePreview("engineeringSystems", locale), null);
    assert.equal(resolveCrewVoicePreview("weaponsTactics", locale), null);
  }
});

test("preview flow is wired from App to CrewConfigDialog using existing SpeechService", () => {
  const appSource = readFileSync(appPath, "utf8");
  const dialogSource = readFileSync(dialogPath, "utf8");

  assert.match(appSource, /async function testCrewVoicePreview\(role: Parameters<typeof resolveCrewVoicePreview>\[0\], locale: Parameters<typeof resolveCrewVoicePreview>\[1\]\) \{/);
  assert.match(appSource, /const preview = resolveCrewVoicePreview\(role, locale\);/);
  assert.match(appSource, /if \(!preview\) return;/);
  assert.match(appSource, /await speechService\.speak\(preview\.text, \{[\s\S]*\.\.\.preview\.options,[\s\S]*speaker:[\s\S]*locale,[\s\S]*\}\);/);
  assert.match(appSource, /onTestVoicePreview=\{testCrewVoicePreview\}/);

  assert.match(dialogSource, /const canPreviewActiveVoice =\s*resolveCrewVoicePreview\(activeRole, activeMember\.locale\) !== null;/);
  assert.match(dialogSource, /disabled=\{!canPreviewActiveVoice\}/);
  assert.match(dialogSource, /void onTestVoicePreview\(activeRole, activeMember\.locale\);/);
});
