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
