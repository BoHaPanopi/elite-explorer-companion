import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const backendSource = readFileSync("src-tauri/src/lib.rs", "utf8");
const cargoSource = readFileSync("src-tauri/Cargo.toml", "utf8");

test("native window diagnostics events are present for lifecycle tracing", () => {
  for (const event of [
    "WINDOW_EVENT_RECEIVED",
    "WINDOW_FOCUS_CHANGED",
    "WINDOW_VISIBILITY_CHANGED",
    "WINDOW_SHOW_REQUESTED",
    "WINDOW_SHOW_COMPLETED",
    "WINDOW_FOCUS_REQUESTED",
    "WINDOW_FOCUS_COMPLETED",
    "WINDOW_CLOSE_REQUESTED",
    "WINDOW_CLOSE_COMPLETED",
    "WINDOW_MAIN_THREAD_TASK_START",
    "WINDOW_MAIN_THREAD_TASK_END",
  ]) {
    assert.match(backendSource, new RegExp(event));
  }
});

test("show/focus path is instrumented with duration-aware main-thread markers", () => {
  assert.match(backendSource, /fn show_main_window\(/);
  assert.match(backendSource, /WINDOW_MAIN_THREAD_TASK_START/);
  assert.match(backendSource, /WINDOW_SHOW_REQUESTED/);
  assert.match(backendSource, /WINDOW_SHOW_COMPLETED/);
  assert.match(backendSource, /WINDOW_FOCUS_REQUESTED/);
  assert.match(backendSource, /WINDOW_FOCUS_COMPLETED/);
  assert.match(backendSource, /durationMs/);
});

test("window event hook tracks focus and close without forcing a watchdog restart", () => {
  assert.match(backendSource, /window\.on_window_event/);
  assert.match(backendSource, /WindowEvent::Focused/);
  assert.match(backendSource, /WindowEvent::CloseRequested/);

  const onWindowEventBlock = backendSource.slice(
    backendSource.indexOf("window.on_window_event"),
    backendSource.indexOf("let watchdog_app"),
  );

  assert.doesNotMatch(onWindowEventBlock, /wait_for_voice_servers|terminate_voice_servers|restart\(/);
});

test("process-level AppUserModelID is set explicitly on Windows", () => {
  assert.match(backendSource, /SetCurrentProcessExplicitAppUserModelID/);
  assert.match(backendSource, /set_process_app_user_model_id/);
  assert.match(backendSource, /app\.config\(\)\.identifier/);
  assert.match(cargoSource, /Win32_UI_Shell/);
});
