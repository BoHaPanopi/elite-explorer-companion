import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ALPHA_TESTING_NOTICE_VERSION,
} from "../src/features/alphaTestingNotice.ts";

const noticeTsPath = join(process.cwd(), "src", "features", "alphaTestingNotice.ts");
const noticeTsxPath = join(process.cwd(), "src", "components", "AlphaTestingNotice.tsx");
const appPath = join(process.cwd(), "src", "App.tsx");
const noticeSource = readFileSync(noticeTsPath, "utf8");
const noticeTsxSource = readFileSync(noticeTsxPath, "utf8");
const appSource = readFileSync(appPath, "utf8");

test("notice version constant is 0.14.19", () => {
  assert.equal(ALPHA_TESTING_NOTICE_VERSION, "0.14.19");
});

test("storage key is version-scoped to 0.14.19", () => {
  // Key is built from the version constant, not hardcoded – check both parts
  assert.match(noticeSource, /ogg\.alphaTesterNotice/);
  assert.equal(ALPHA_TESTING_NOTICE_VERSION, "0.14.19");
});

test("DE title and body text are present in component", () => {
  assert.match(noticeTsxSource, /Alpha 0\.14\.19 – Testhinweise/);
  assert.match(noticeTsxSource, /englische Sprachprofil für konfigurierte Commander/);
  assert.match(noticeTsxSource, /Microsoft George/);
  assert.match(noticeTsxSource, /Alle Journal- und Telemetriedaten bleiben lokal/);
});

test("EN title and body text are present in component", () => {
  assert.match(noticeTsxSource, /Alpha 0\.14\.19 – Testing Notes/);
  assert.match(noticeTsxSource, /English voice profile for configured commanders/);
  assert.match(noticeTsxSource, /Microsoft George/);
  assert.match(noticeTsxSource, /All journal and telemetry data remains local/);
});

test("DE button label is correct", () => {
  assert.match(noticeTsxSource, /Verstanden – Alpha testen/);
});

test("EN button label is correct", () => {
  assert.match(noticeTsxSource, /Understood – Start Alpha Test/);
});

test("FR/IT/ES use EN as fallback – no French/Italian/Spanish translations invented", () => {
  // Only DE and EN keys exist; everything else falls back to EN
  assert.doesNotMatch(noticeTsxSource, /language === "fr"/);
  assert.doesNotMatch(noticeTsxSource, /language === "it"/);
  assert.doesNotMatch(noticeTsxSource, /language === "es"/);
  // The switch/check is only for DE
  assert.match(noticeTsxSource, /language === "de"/);
});

test("alphaTestingNoticeAlreadySeen returns false when key is absent", () => {
  // Simulate missing localStorage entry using a fresh check
  // (jsdom not available here; we test the logic via source inspection)
  assert.match(noticeSource, /localStorage\.getItem\(storageKey\) === "read"/);
});

test("markAlphaTestingNoticeSeen writes 'read' to version-scoped key", () => {
  assert.match(noticeSource, /localStorage\.setItem\(storageKey, "read"\)/);
});

test("later versions are not suppressed – key is version-specific, not global", () => {
  // The key must contain the version literal so future versions use a different key
  assert.match(noticeSource, /`ogg\.alphaTesterNotice\.\$\{ALPHA_TESTING_NOTICE_VERSION\}`/);
  // No global 'seen' key that would suppress all future alpha notices
  assert.doesNotMatch(noticeSource, /ogg\.alphaTesterNotice(?!\.\$\{)/);
});

test("alpha notice is imported and wired in App.tsx", () => {
  assert.match(appSource, /import AlphaTestingNotice/);
  assert.match(appSource, /alphaTestingNoticeAlreadySeen/);
  assert.match(appSource, /markAlphaTestingNoticeSeen/);
  assert.match(appSource, /showAlphaNotice/);
  assert.match(appSource, /confirmAlphaNotice/);
});

test("alpha notice renders only when showAlphaNotice is true and is conditioned on version-seen check", () => {
  assert.match(appSource, /\{showAlphaNotice && <AlphaTestingNotice/);
  assert.match(appSource, /useState\(\(\) => !alphaTestingNoticeAlreadySeen\(\)\)/);
});

test("crew layout remains intact and voice previews use local Microsoft profiles", () => {
  const crewProfilesSource = readFileSync(
    join(process.cwd(), "src", "features", "crewProfiles.ts"),
    "utf8",
  );
  const voicePreviewSource = readFileSync(
    join(process.cwd(), "src", "features", "crewVoicePreview.ts"),
    "utf8",
  );
  const crewDialogSource = readFileSync(
    join(process.cwd(), "src", "components", "CrewConfigDialog.tsx"),
    "utf8",
  );

  assert.match(voicePreviewSource, /getCrewVoiceProfile/);
  assert.match(voicePreviewSource, /profile\.baseVoiceName/);
  assert.doesNotMatch(voicePreviewSource, /Neural|en-US/);
  // Circle-hook check element must still exist
  assert.match(crewDialogSource, /crew-variant-button__check/);
  // isCrewLocaleActive must still exist
  assert.match(crewProfilesSource, /isCrewLocaleActive/);
});
