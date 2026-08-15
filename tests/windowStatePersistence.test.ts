import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const backend = readFileSync(join(process.cwd(), "src-tauri", "src", "lib.rs"), "utf8");
const capability = readFileSync(join(process.cwd(), "src-tauri", "capabilities", "desktop.json"), "utf8");

test("window state uses the existing plugin for size, position, and maximization", () => {
  assert.match(backend, /fn persisted_window_state_flags\(\) -> StateFlags/);
  assert.match(backend, /StateFlags::SIZE \| StateFlags::POSITION \| StateFlags::MAXIMIZED/);
  assert.match(backend, /with_state_flags\(persisted_window_state_flags\(\)\)/);
});

test("window-state persistence remains permitted for the main desktop window", () => {
  assert.match(capability, /"main"/);
  assert.match(capability, /"window-state:default"/);
});

test("the plugin-backed restore path keeps monitor-safe fallback behavior", () => {
  assert.match(backend, /tauri_plugin_window_state::Builder::new\(\)/);
  assert.doesNotMatch(backend, /skip_initial_state\("main"\)/);
  assert.match(backend, /if !window_state_path\.exists\(\) \{[\s\S]*window\.current_monitor\(\)\?[\s\S]*window\.set_size\([\s\S]*window\.center\(\)/);
});

test("the persisted restore contract keeps save, restore, and fallback inseparable", () => {
  const setup = backend.slice(backend.indexOf("tauri_plugin_window_state::Builder::new"), backend.indexOf("if let Some(window) = app.get_webview_window(\"main\")"));

  assert.match(backend, /fn persisted_window_state_flags\(\) -> StateFlags \{\s*StateFlags::SIZE \| StateFlags::POSITION \| StateFlags::MAXIMIZED/);
  assert.match(setup, /with_state_flags\(persisted_window_state_flags\(\)\)/);
  assert.match(backend, /window_state_path[\s\S]*DEFAULT_FILENAME[\s\S]*if !window_state_path\.exists\(\)/);
});
