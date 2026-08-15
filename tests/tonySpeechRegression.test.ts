import assert from "node:assert/strict";
import test from "node:test";

import { resolveOggMode } from "ogg-core";
import {
  SpeechService,
  type InvokeCommand,
  type LocalVoice,
} from "../src/services/SpeechService.ts";

const george: LocalVoice = {
  id: "onecore-george-token",
  displayName: "Microsoft George",
  locale: "en-GB",
  gender: "male",
  api: "Windows OneCore/WinRT",
  available: true,
};

function createTonySpeechService(calls: Array<{ command: string; args?: Record<string, unknown> }>): SpeechService {
  const invoke: InvokeCommand = async <T>(command: string, args?: Record<string, unknown>) => {
    calls.push({ command, args });
    if (command === "list_local_voices") return [george] as T;
    return undefined as T;
  };
  return new SpeechService(invoke);
}

for (const commander of [" helitony ", "\tHELITONY2\r\n"] as const) {
  test(`${commander} reaches speak_local with Microsoft George`, async () => {
    const mode = resolveOggMode(commander, "de");
    assert.equal(mode.mode, "tony");
    assert.equal(mode.language, "en");

    const calls: Array<{ command: string; args?: Record<string, unknown> }> = [];
    const speech = createTonySpeechService(calls);
    const ready = await speech.waitUntilReady({ speaker: "OGG", locale: mode.language });
    assert.deepEqual(ready, { locale: "en-GB", available: true, voice: george, reason: "available" });

    await speech.speak("Tony speech regression test.", {
      speaker: "OGG",
      locale: mode.language,
      preRollMs: 0,
    });

    const speak = calls.find((call) => call.command === "speak_local");
    assert.deepEqual(speak, {
      command: "speak_local",
      args: {
        request: {
          voiceId: "onecore-george-token",
          text: "Tony speech regression test.",
          rate: 3,
          pitch: -16,
          volume: 1,
        },
      },
    });
  });
}

test("Tony readiness does not accept Stefan as a substitute for George", async () => {
  const calls: Array<{ command: string; args?: Record<string, unknown> }> = [];
  const invoke: InvokeCommand = async <T>(command: string, args?: Record<string, unknown>) => {
    calls.push({ command, args });
    if (command === "list_local_voices") {
      return [{ ...george, displayName: "Microsoft Stefan", id: "onecore-stefan-token" }] as T;
    }
    return undefined as T;
  };
  const ready = await new SpeechService(invoke).waitUntilReady({ speaker: "OGG", locale: "en" });
  assert.equal(ready.available, false);
  assert.equal(ready.reason, "voice_missing");
  assert.equal(calls.some((call) => call.command === "speak_local"), false);
});
