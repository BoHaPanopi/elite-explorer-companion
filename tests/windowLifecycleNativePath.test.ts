import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

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

test("dashboard, browser, bundle, installer, and taskbar icon bindings remain protected", () => {
  const config = JSON.parse(readFileSync("src-tauri/tauri.conf.json", "utf8")) as { bundle: { icon: string[]; windows: { nsis: { installerIcon: string; uninstallerIcon: string } } } };
  const brand = readFileSync("src/components/OggBrand.tsx", "utf8");
  const html = readFileSync("index.html", "utf8");
  const fingerprint = (file: string) => createHash("sha256").update(readFileSync(file)).digest("hex").toUpperCase();

  assert.deepEqual(config.bundle.icon, ["icons/32x32.png", "icons/128x128.png", "icons/128x128@2x.png", "icons/icon.icns", "icons/icon.ico"]);
  assert.equal(config.bundle.windows.nsis.installerIcon, "icons/icon.ico");
  assert.equal(config.bundle.windows.nsis.uninstallerIcon, "icons/icon.ico");
  assert.match(html, /href="\/favicon\.svg"/);
  assert.match(brand, /command-brand__logo[\s\S]*command-brand__track[\s\S]*<span>OGG<\/span>/);
  assert.deepEqual({
    png32: fingerprint("src-tauri/icons/32x32.png"),
    png128: fingerprint("src-tauri/icons/128x128.png"),
    png256: fingerprint("src-tauri/icons/128x128@2x.png"),
    ico: fingerprint("src-tauri/icons/icon.ico"),
    icns: fingerprint("src-tauri/icons/icon.icns"),
    favicon: fingerprint("public/favicon.svg"),
  }, {
    png32: "55AA4F41B935C6183DD985344CD318BA5212CC2679FB73A1EBF2D9FB83924654",
    png128: "AFC0E2B42B1F1AF5FD7371E4CD1272D372CC285BC58B1D06CEF09EBFEE5DAB8A",
    png256: "1E96E177DCE53B947F5A72F57C4DC1E7488A1282F254526DD36AB6578274388D",
    ico: "9F7B8BF8DD6A2F10C6F0AEC043309AD17793C8BE9A5DEEA0F04280680FAC7555",
    icns: "8B817515FB0BD294945D5D7C30E29BCF686B40E7D21F1D2F48181A9417501B09",
    favicon: "61BC9A161DE58248288E6905425D7180F0624C2865007B97D763FDAC12043A66",
  });
});
