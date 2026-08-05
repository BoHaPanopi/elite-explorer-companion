import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the embedded boot surface cannot remain an unexplained black screen", () => {
  const html = readFileSync("index.html", "utf8");

  assert.match(html, /id="ogg-boot"/);
  assert.match(html, /OGG konnte nicht vollständig gestartet werden/);
  assert.match(html, /OGG could not be started completely/);
  assert.match(html, /repair_runtime/);
  assert.match(html, /open_log_directory/);
  assert.match(html, /show_boot_surface/);
});

test("the React recovery surface exposes all required actions", () => {
  const dialog = readFileSync("src/components/StartupRecoveryDialog.tsx", "utf8");

  for (const action of ["relaunch", "repair_runtime", "open_log_directory", "exit(1)"]) {
    assert.match(dialog, new RegExp(action.replace(/[()]/g, "\\$&")));
  }
});

test("release logging and process launches are configured for persistent hidden diagnostics", () => {
  const backend = readFileSync("src-tauri/src/lib.rs", "utf8");
  const health = readFileSync("src-tauri/src/runtime_health.rs", "utf8");

  assert.match(backend, /TargetKind::LogDir/);
  assert.match(backend, /file_name: Some\("ogg-startup"/);
  assert.match(health, /CREATE_NO_WINDOW/);
  assert.doesNotMatch(health, /hidden_output\("tasklist"/);
  assert.doesNotMatch(health, /hidden_output\("taskkill"/);
  assert.match(health, /share_mode\(0\)/);
  assert.match(backend, /frontend_watchdog/);
  assert.match(backend, /heartbeat_timeout/);
});

test("the startup greeting is completed only after audible playback succeeds", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const speech = readFileSync("src/services/SpeechService.ts", "utf8");

  assert.match(app, /"idle" \| "scheduled" \| "playing" \| "completed"/);
  assert.match(app, /await speechService\.waitUntilReady\(30_000\)/);
  assert.match(app, /const greetingCompleted = await speakGreeting\(\);[\s\S]*if \(!greetingCompleted\) throw[\s\S]*startupGreetingState\.current = "completed"/);
  assert.doesNotMatch(app, /greetingPlayed\.current = true/);
  assert.doesNotMatch(app, /startup_greeting_scheduled[\s\S]{0,800}setTimeout\(\(\) => \{[\s\S]{0,800}waitUntilReady/);
  assert.match(speech, /async waitUntilReady\(timeoutMs = 30_000\)/);
});

test("the complete startup greeting lifecycle and suppression reasons are logged", () => {
  const app = readFileSync("src/App.tsx", "utf8");

  for (const event of [
    "startup_app_started",
    "startup_voice_server_ready",
    "language_mode_at_startup",
    "language_mode_after_commander_detection",
    "startup_greeting_scheduled",
    "startup_greeting_started",
    "startup_greeting_finished",
    "startup_greeting_suppressed",
  ]) {
    assert.match(app, new RegExp(event));
  }
});
