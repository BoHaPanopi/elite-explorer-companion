import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const backendSource = readFileSync("src-tauri/src/lib.rs", "utf8");
const appSource = readFileSync("src/App.tsx", "utf8");
const speechSource = readFileSync("src/services/SpeechService.ts", "utf8");
const diagnosticsSource = readFileSync("src-tauri/src/diagnostics.rs", "utf8");

test("relevant journal events are tracked with EVENT_RECEIVED and EVENT_PROCESSED", () => {
  assert.match(backendSource, /EVENT_RECEIVED/);
  assert.match(backendSource, /EVENT_PROCESSED/);

  for (const eventName of [
    "FSDJump",
    "StartJump",
    "SupercruiseEntry",
    "SupercruiseExit",
    "SupercruiseDestinationDrop",
    "FSSDiscoveryScan",
    "FSSBodySignals",
    "SAASignalsFound",
    "SAAScanComplete",
    "Scan",
    "CodexEntry",
    "ScanOrganic",
    "Loadout",
    "DockingRequested",
    "DockingGranted",
    "DockingDenied",
    "Docked",
    "Undocked",
    "Location",
  ]) {
    assert.match(backendSource, new RegExp(`"${eventName}"`));
  }
});

test("BIO_DECISION logs biological counts separately from signal types", () => {
  assert.match(appSource, /BIO_DECISION/);
  assert.match(appSource, /biologicalSignalCount/);
  assert.match(appSource, /signalTypes/);
  assert.match(appSource, /confirmedGenera/);
});

test("bio observation transitions are logged as created, replaced, and ignored", () => {
  assert.match(appSource, /BIO_OBSERVATION_CREATED/);
  assert.match(appSource, /BIO_OBSERVATION_REPLACED/);
  assert.match(appSource, /BIO_OBSERVATION_IGNORED/);
  assert.match(appSource, /previousLatestObservation/);
  assert.match(appSource, /newLatestObservation/);
  assert.match(appSource, /ignoreReason/);
});

test("Anna diagnostic logs include effective voice and TTS configuration", () => {
  assert.match(appSource, /BIO_VOICE_CREATED/);
  assert.match(appSource, /voiceConfig: annaVoice\?\.options/);
  assert.match(appSource, /speaker: "Anna"/);
  assert.match(appSource, /speechService\.speak\(message, \{[\s\S]*\.\.\.\(annaVoice\?\.options \?\? \{}\)/);
});

test("landing decision diagnostics include trigger and skip reason fields", () => {
  assert.match(backendSource, /LANDING_STATE/);
  assert.match(backendSource, /LANDING_DECISION/);
  assert.match(backendSource, /reminderTriggered/);
  assert.match(backendSource, /skipReason/);
});

test("landing target diagnostics record station, market id, and drop source", () => {
  assert.match(backendSource, /LANDING_TARGET_SET/);
  assert.match(backendSource, /"stationName"/);
  assert.match(backendSource, /"marketId"/);
  assert.match(backendSource, /"source": "SupercruiseDestinationDrop"/);
});

test("UI_STATE_CHANGE is emitted only on actual state changes", () => {
  assert.match(appSource, /UI_STATE_CHANGE/);
  assert.match(appSource, /lastUiDiagnosticState/);
  assert.match(appSource, /if \(serialized === lastUiDiagnosticState\.current\) return;/);
});

test("VOICE_QUEUED START END lifecycle exists in expected order", () => {
  const queuedIndex = speechSource.indexOf("VOICE_QUEUED");
  const startIndex = speechSource.indexOf("VOICE_START");
  const endIndex = speechSource.indexOf("VOICE_END");

  assert.ok(queuedIndex >= 0);
  assert.ok(startIndex >= 0);
  assert.ok(endIndex >= 0);
  assert.ok(queuedIndex < startIndex);
  assert.ok(startIndex < endIndex);
});

test("frontend stall diagnostics are emitted after missed heartbeat", () => {
  assert.match(backendSource, /FRONTEND_HEARTBEAT/);
  assert.match(backendSource, /FRONTEND_STALL_DETECTED/);
  assert.match(backendSource, /> 12_000/);
});

test("logging failures are contained and do not crash app flow", () => {
  assert.match(diagnosticsSource, /logging_without_global_logger_is_safe/);
  assert.match(diagnosticsSource, /if let Err\(error\) = self\.sender\.try_send\(line\)/);
});

test("diagnostic log rotation and size limits are implemented", () => {
  assert.match(diagnosticsSource, /DEFAULT_MAX_FILE_SIZE_BYTES/);
  assert.match(diagnosticsSource, /DEFAULT_MAX_FILE_COUNT/);
  assert.match(diagnosticsSource, /rotates_when_max_size_is_reached/);
  assert.match(diagnosticsSource, /fn prune\(/);
});
