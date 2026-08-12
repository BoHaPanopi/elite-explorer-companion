import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { OGG_VOICE_REFERENCE_PROFILE } from "ogg-core";

const guidelinePath = join(process.cwd(), "docs", "OGG_VOICE_GUIDELINE.md");

test("ogg-core exposes the binding OGG voice reference profile", () => {
  assert.equal(
    OGG_VOICE_REFERENCE_PROFILE.highestQualityRule,
    "OGG must never sound artificial. Naturalness and character fidelity outrank technical convenience.",
  );
  assert.equal(
    OGG_VOICE_REFERENCE_PROFILE.corePrinciple,
    "OGG does not perform a dialect. OGG sounds this way because he simply does not speak any other way.",
  );
  assert.deepEqual(OGG_VOICE_REFERENCE_PROFILE.qualityPriority, [
    "timbre",
    "speech_flow",
    "sentence_melody",
    "dialect_pronunciation",
    "fine_tuning_pitch_and_tempo",
  ]);
  assert.deepEqual(OGG_VOICE_REFERENCE_PROFILE.referenceSentences, [
    "Mid Geduid und Spugge werd des scho.",
    "Schau ma moi, wos uns do erwartet.",
    "Mia werggeln dro.",
  ]);
  assert.match(OGG_VOICE_REFERENCE_PROFILE.fallbackRule, /real human recordings/i);
});

test("central guideline documents the approved OGG voice reference profile", () => {
  const guideline = readFileSync(guidelinePath, "utf8");

  assert.match(guideline, /### OGG Voice Reference Profile/);
  assert.match(guideline, /OGG must never sound artificial\./);
  assert.match(guideline, /OGG does not perform a dialect\./);
  assert.match(guideline, /1\. Timbre/);
  assert.match(guideline, /5\. Fine tuning of pitch and tempo/);
  assert.match(guideline, /Mid Geduid und Spugge werd des scho\./);
  assert.match(guideline, /Schau ma moi, wos uns do erwartet\./);
  assert.match(guideline, /Mia werggeln dro\./);
});