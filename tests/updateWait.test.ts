import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { completeUpdateExit, downloadUpdateInBackground, installDownloadedUpdateOnExit } from "../src/services/DeferredUpdateService.ts";

test("downloads an update completely without installing it", async () => {
  let installed = false;
  const progress: number[] = [];
  const update = {
    async download(onEvent: (event: any) => void) {
      onEvent({ event: "Started", data: { contentLength: 10 } });
      onEvent({ event: "Progress", data: { chunkLength: 4 } });
      onEvent({ event: "Progress", data: { chunkLength: 6 } });
      onEvent({ event: "Finished" });
    },
    async install() { installed = true; },
  };

  await downloadUpdateInBackground(update, (value) => progress.push(value));

  assert.equal(installed, false);
  assert.deepEqual(progress, [0, 0.4, 1, 1]);
});

test("installs the downloaded update only when the exit workflow runs", async () => {
  let installed = false;
  let prepareCalls = 0;
  const blockers: Array<string | null> = [];
  const sequence: string[] = [];

  await installDownloadedUpdateOnExit(
    {
      async install() {
        sequence.push("install");
        installed = true;
      },
    },
    async () => {
      prepareCalls += 1;
      return prepareCalls === 1
        ? { ready: false, blocker: "installer_running" }
        : { ready: true, blocker: null };
    },
    async () => undefined,
    (blocker) => blockers.push(blocker),
    () => sequence.push("install_started"),
  );

  assert.equal(installed, true);
  assert.equal(prepareCalls, 2);
  assert.deepEqual(blockers, ["installer_running"]);
  assert.deepEqual(sequence, ["install_started", "install"]);
});

test("the app downloads automatically and never waits for Elite before installation", () => {
  const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const backendSource = readFileSync(new URL("../src-tauri/src/lib.rs", import.meta.url), "utf8");
  const translations = readFileSync(new URL("../src/content/uiMessages.ts", import.meta.url), "utf8");
  const workflow = readFileSync(new URL("../.github/workflows/release.yml", import.meta.url), "utf8");

  assert.match(appSource, /downloadUpdate\(update\)/);
  assert.match(appSource, /onCloseRequested/);
  assert.match(appSource, /cause: "application_exit"/);
  assert.match(appSource, /completeUpdateExit\(\{/);
  assert.match(appSource, /phase: updatePhaseRef\.current/);
  assert.match(appSource, /preventClose: \(\) => event\.preventDefault\(\)/);
  assert.match(appSource, /\(\) => void invoke\("log_update_phase", \{ phase: "install_started", cause: "application_exit", technical: null \}\)/);
  assert.doesNotMatch(backendSource, /close_app\.exit\(0\)/);
  assert.doesNotMatch(appSource, /waitForEliteProcessExit/);
  assert.match(translations, /Update bereit\. Es wird beim Beenden von OGG installiert\./);
  assert.match(workflow, /npm run test:release-guards/);
  assert.doesNotMatch(workflow, /continue-on-error:\s*true/);
});

test("the normal close path exits explicitly when no update is pending", () => {
  const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /void getCurrentWindow\(\)\.onCloseRequested\(async \(event\) => \{/);
  assert.match(appSource, /const update = pendingUpdate\.current;/);
  assert.match(appSource, /completeUpdateExit\(\{/);
  assert.match(appSource, /exitApp: \(\) => exit\(0\)/);
  assert.doesNotMatch(appSource, /if \(!update\) return;/);
});

test("a successfully installed update exits without automatically relaunching the app", () => {
  const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const deferredUpdateSource = readFileSync(new URL("../src/services/DeferredUpdateService.ts", import.meta.url), "utf8");

  assert.match(appSource, /installDownloadedUpdateOnExit\([\s\S]*pendingUpdate\.current = null;/);
  assert.doesNotMatch(appSource, /\brelaunch\s*\(/);
  assert.doesNotMatch(deferredUpdateSource, /\brelaunch\s*\(/);
});

test("the real close state machine installs once, exits, and never relaunches", async () => {
  const sequence: string[] = [];
  const update = { async install() { sequence.push("update.install"); } };
  const result = await completeUpdateExit({
    update,
    phase: "ready",
    preventClose: () => sequence.push("preventClose"),
    install: async () => sequence.push("install"),
    exitApp: async () => sequence.push("exit"),
  });

  assert.equal(result, "exited");
  assert.deepEqual(sequence, ["preventClose", "install", "exit"]);
});

test("the real close state machine exits normally without an update and blocks duplicate close while installing", async () => {
  const normal: string[] = [];
  assert.equal(await completeUpdateExit({
    update: null,
    phase: "downloading",
    preventClose: () => normal.push("preventClose"),
    install: async () => normal.push("install"),
    exitApp: async () => normal.push("exit"),
  }), "exited");
  assert.deepEqual(normal, ["exit"]);

  const installing: string[] = [];
  assert.equal(await completeUpdateExit({
    update: { async install() {} },
    phase: "installing",
    preventClose: () => installing.push("preventClose"),
    install: async () => installing.push("install"),
    exitApp: async () => installing.push("exit"),
  }), "installing");
  assert.deepEqual(installing, ["preventClose"]);
});
