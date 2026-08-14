import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveLocalVoice, type LocalVoice } from "../src/services/SpeechService.ts";

const enGbVoices: LocalVoice[] = [
  { id: "machine-a-george", displayName: "Microsoft George", locale: "en-GB", gender: "male", api: "Windows OneCore/WinRT", available: true },
  { id: "machine-a-hazel", displayName: "Microsoft Hazel", locale: "en-GB", gender: "female", api: "Windows OneCore/WinRT", available: true },
  { id: "machine-a-susan", displayName: "Microsoft Susan", locale: "en-GB", gender: "female", api: "Windows OneCore/WinRT", available: true },
];

const speech = readFileSync("src/services/SpeechService.ts", "utf8");
const backend = readFileSync("src-tauri/src/local_speech.rs", "utf8");
const app = readFileSync("src/App.tsx", "utf8");
const translations = readFileSync("src/content/uiMessages.ts", "utf8");

test("SpeechService uses only the local Tauri speech commands", () => {
  assert.match(speech, /invoke<LocalVoice\[]>\("list_local_voices"\)/);
  assert.match(speech, /invoke\("speak_local"/);
  assert.match(speech, /invoke\("stop_local_speech"\)/);
  assert.doesNotMatch(speech, /fetch\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/);
});

test("the native backend keeps OneCore voice resolution on its worker and sends WAV PCM to WASAPI", () => {
  assert.match(backend, /SpeechSynthesizer::AllVoices/);
  assert.match(backend, /ogg-winrt-speech/);
  assert.match(backend, /WorkerCommand::Speak/);
  assert.match(backend, /voices\.iter\(\)\.find/);
  assert.match(backend, /SetSpeakingRate/);
  assert.match(backend, /SetAudioPitch/);
  assert.match(backend, /pub fn stop_local_speech/);
  assert.match(backend, /DataReader::CreateDataReader/);
  assert.match(backend, /cpal::default_host/);
  assert.match(backend, /default_output_device/);
  assert.match(backend, /WASAPI_PLAYBACK_STARTED/);
  assert.match(backend, /WASAPI_PLAYBACK_FINISHED/);
  assert.doesNotMatch(backend, /PlaySoundW|MediaPlayer/);
});

test("semantic en-GB profiles resolve the current machine's George token", () => {
  assert.equal(resolveLocalVoice(enGbVoices, { locale: "en-GB", baseVoiceName: "Microsoft George", gender: "male" })?.id, "machine-a-george");
  const otherMachine = enGbVoices.map((voice) => ({ ...voice, id: voice.id.replace("machine-a", "machine-b") }));
  assert.equal(resolveLocalVoice(otherMachine, { locale: "en-GB", baseVoiceName: "Microsoft George", gender: "male" })?.id, "machine-b-george");
  assert.equal(resolveLocalVoice(enGbVoices, { locale: "en-GB", baseVoiceName: "Microsoft Stefan", gender: "male" }), null);
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

test("Tony remains en-GB semantic local speech without old cloud names or fixed technical IDs", () => {
  assert.match(speech, /getCrewVoiceProfile\(locale, "M1"\)/);
  assert.match(speech, /resolveLocalVoice/);
  assert.doesNotMatch(speech, /machine-a-george|machine-b-george|AriaNeural|GuyNeural|JennyNeural/i);
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
