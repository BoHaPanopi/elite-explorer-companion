import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const speech = readFileSync("src/services/SpeechService.ts", "utf8");
const backend = readFileSync("src-tauri/src/local_speech.rs", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const translations = readFileSync("src/i18n.tsx", "utf8");

test("SpeechService uses only the local Tauri speech commands", () => {
  assert.match(speech, /invoke<LocalVoice\[]>\("list_local_voices"\)/);
  assert.match(speech, /invoke\("speak_local"/);
  assert.match(speech, /invoke\("stop_local_speech"\)/);
  assert.doesNotMatch(speech, /fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
});

test("the native backend selects an exact installed OneCore voice and supports stop", () => {
  assert.match(backend, /SpeechSynthesizer::AllVoices/);
  assert.match(backend, /voice_id\(voice\).*request\.voice_id/s);
  assert.match(backend, /SetSpeakingRate/);
  assert.match(backend, /SetAudioPitch/);
  assert.match(backend, /pub fn stop_local_speech/);
  assert.match(backend, /player\.Pause\(\)/);
});

test("en-US is never normalized or used as a fallback for en-GB", () => {
  const profiles = readFileSync("src/voices/crewVoiceProfiles.ts", "utf8");
  assert.doesNotMatch(profiles, /en-US/);
  assert.doesNotMatch(speech, /en-US/);
  assert.match(profiles, /case "en-GB"/);
  assert.match(profiles, /return "en-GB"/);
});

test("missing locales and voices produce an explicit availability state without fallback", () => {
  assert.match(speech, /reason: "locale_missing"/);
  assert.match(speech, /reason: "voice_missing"/);
  assert.match(speech, /throw new LocalVoiceUnavailableError/);
  assert.doesNotMatch(speech, /fallback/i);
});

test("Commander and Anna speech remain behind the same local SpeechService boundary", () => {
  assert.match(app, /speechService\.speak\(greetingText/);
  assert.match(app, /speechService\.speak\(message/);
  assert.match(speech, /localProcessing: true/);
});

test("all five UI languages explain local variants and missing Windows voices", () => {
  for (const key of ["localVoiceVariantNotice", "localVoiceMissingTitle", "localVoiceMissingBody"]) {
    assert.equal((translations.match(new RegExp(`${key}:`, "g")) ?? []).length, 5);
  }
});

test("the active product runtime contains no cloud or port-8765 speech path", () => {
  const config = readFileSync("src-tauri/tauri.conf.json", "utf8");
  const cargo = readFileSync("src-tauri/Cargo.toml", "utf8");
  const activeRuntime = [speech, backend, config, cargo].join("\n");
  assert.doesNotMatch(activeRuntime, /edge[-_]?tts|speech\.platform\.bing\.com|127\.0\.0\.1:8765|\b8765\b|flask|ogg.voice.server/i);
});
