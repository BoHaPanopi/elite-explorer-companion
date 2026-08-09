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
  const boundary = readFileSync("src/components/AppErrorBoundary.tsx", "utf8");

  for (const action of ["relaunch", "repair_runtime", "open_log_directory", "exit(1)"]) {
    assert.match(dialog, new RegExp(action.replace(/[()]/g, "\\$&")));
  }
  assert.match(boundary, /getVersion/);
  assert.doesNotMatch(boundary, /0\.14\.1/);
  assert.match(dialog, /health\.version &&/);
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
  assert.match(health, /VOICE_BUNDLE_BINARY/);
  assert.match(backend, /bundled_sidecar_path/);
  assert.match(backend, /runtime_sidecar_restored_from_bundle/);
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

test("an update notice stays dismissed for the current session", () => {
  const app = readFileSync("src/App.tsx", "utf8");

  assert.match(app, /let updateNoticeDismissedForSession = false/);
  assert.match(app, /updateNoticeDismissedForSession = true/);
  assert.match(app, /if \(!updateNoticeDismissedForSession\) setAvailableUpdate\(update\)/);
  assert.match(app, /phase: "notice_dismissed"[\s\S]*scope=current_session/);
});

test("the production capability allows exit and normal window close only", () => {
  const capability = JSON.parse(readFileSync("src-tauri/capabilities/default.json", "utf8")) as {
    permissions: string[];
    identifier: string;
  };

  assert.equal(capability.identifier, "default");
  assert.deepEqual(capability.permissions, [
    "core:default",
    "updater:default",
    "process:allow-exit",
    "core:window:allow-close",
    "process:allow-restart",
  ]);
});

test("local test builds skip only their own updater check", () => {
  const app = readFileSync("src/App.tsx", "utf8");
  const backend = readFileSync("src-tauri/src/lib.rs", "utf8");
  const packageJson = readFileSync("package.json", "utf8");
  const tauriConfig = readFileSync("src-tauri/tauri.conf.json", "utf8");
  const tauriDevConfig = readFileSync("src-tauri/tauri.dev.conf.json", "utf8");
  const tauriRunner = readFileSync("scripts/run-tauri.mjs", "utf8");
  const workflow = readFileSync(".github/workflows/release.yml", "utf8");

  assert.match(backend, /option_env!\("OGG_LOCAL_TEST_BUILD"\)/);
  assert.match(packageJson, /set \\"OGG_LOCAL_TEST_BUILD=1\\"&& tauri build/);
  assert.match(packageJson, /node scripts\/run-tauri\.mjs/);
  assert.match(tauriConfig, /"identifier": "de\.panopi\.eliteexplorercompanion"/);
  assert.match(tauriDevConfig, /"identifier": "de\.panopi\.eliteexplorercompanion\.dev"/);
  assert.match(tauriRunner, /argv\[0\] === "dev"/);
  assert.match(tauriRunner, /tauri\.dev\.conf\.json/);
  assert.match(app, /distribution === "local-test"/);
  assert.match(app, /scope=this_installation_only/);
  assert.match(app, /let updateCheckStartedForSession = false/);
  assert.match(app, /if \(updateCheckStartedForSession\)/);
  assert.match(app, /updateCheckStartedForSession = true/);
  assert.doesNotMatch(workflow, /OGG_LOCAL_TEST_BUILD/);
});

test("initial setup explains the temporary computer-name limitation in every supported language", () => {
  const messages = readFileSync("src/i18n.tsx", "utf8");
  const panel = readFileSync("src/components/AssistantPanel.tsx", "utf8");
  const app = readFileSync("src/App.tsx", "utf8");

  assert.match(messages, /Der Bordcomputer-Name kann derzeit nach der Ersteinrichtung noch nicht geändert werden\. Diese Funktion folgt mit Version 0\.15\./);
  assert.match(messages, /The onboard computer name cannot currently be changed after initial setup\. This feature will follow with version 0\.15\./);
  assert.match(app, /if \(savedName\) \{\s*setBordcomputerName\(savedName\);\s*\}/);
  assert.doesNotMatch(app, /else \{\s*setShowSetup\(true\);\s*\}/);
  assert.match(app, /onCancel=\{\(\) => setShowSetup\(false\)\}/);
  for (const translatedSetup of ["Configuration initiale", "Configurazione iniziale", "Configuración inicial"]) {
    assert.match(messages, new RegExp(translatedSetup));
  }
  for (const key of ["computerQuestion", "renameLater", "computerName", "enterName", "characters", "cancel", "saveName"]) {
    assert.equal((messages.match(new RegExp(`${key}:`, "g")) ?? []).length, 5);
  }
  assert.match(panel, /onConfigureCrew/);
  assert.match(panel, /onRename/);
  assert.doesNotMatch(panel, /onTestGreeting/);
  assert.match(panel, /t\("configureCrew"\)/);
  assert.match(panel, /<button type="button" onClick=\{onRename\}>/);
  assert.doesNotMatch(panel, /onClick=\{onRename\} disabled=\{!name\}/);
  for (const key of ["renameComputer", "configureCrew"]) {
    assert.equal((messages.match(new RegExp(`${key}:`, "g")) ?? []).length, 5);
  }
});

test("every selectable language defines every interface message without an English fallback", () => {
  const source = readFileSync("src/i18n.tsx", "utf8");
  const messageDefinitions = source.slice(source.indexOf("const baseMessages"), source.indexOf("type MessageKey"));
  const germanBlock = source.slice(source.indexOf("  de: {") + "  de: {".length, source.indexOf("  en: {"));
  const keys = [...germanBlock.matchAll(/\b([a-z][A-Za-z0-9]*):/g)].map((match) => match[1]);

  assert.equal(new Set(keys).size, keys.length);
  assert.doesNotMatch(messageDefinitions, /\.\.\.baseMessages\.en/);
  for (const key of keys) {
    assert.equal((messageDefinitions.match(new RegExp(`\\b${key}:`, "g")) ?? []).length, 5, `${key} must exist in all five languages`);
  }
});
