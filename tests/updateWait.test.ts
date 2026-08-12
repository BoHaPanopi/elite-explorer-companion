import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { downloadUpdateInBackground, installDownloadedUpdateOnExit } from "../src/services/DeferredUpdateService.ts";

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
  const translations = readFileSync(new URL("../src/i18n.tsx", import.meta.url), "utf8");

  assert.match(appSource, /downloadUpdate\(update\)/);
  assert.match(appSource, /onCloseRequested/);
  assert.match(appSource, /cause: "application_exit"/);
  assert.match(appSource, /if \(!update\) \{\s*await exit\(0\);\s*return;\s*\}/);
  assert.match(appSource, /updatePhaseRef\.current === "installing"[\s\S]*event\.preventDefault\(\)/);
  assert.match(appSource, /\(\) => void invoke\("log_update_phase", \{ phase: "install_started", cause: "application_exit", technical: null \}\)/);
  assert.doesNotMatch(backendSource, /close_app\.exit\(0\)/);
  assert.doesNotMatch(appSource, /waitForEliteProcessExit/);
  assert.match(translations, /Update bereit\. Es wird beim Beenden von OGG installiert\./);
});

test("the normal close path exits explicitly when no update is pending", () => {
  const appSource = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /void getCurrentWindow\(\)\.onCloseRequested\(async \(event\) => \{/);
  assert.match(appSource, /const update = pendingUpdate\.current;/);
  assert.match(appSource, /if \(!update\) \{\s*await exit\(0\);\s*return;\s*\}/);
  assert.match(appSource, /if \(updatePhaseRef\.current === "installing"\) \{/);
  assert.doesNotMatch(appSource, /if \(!update\) return;/);
});
