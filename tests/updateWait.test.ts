import assert from "node:assert/strict";
import test from "node:test";

import { waitForEliteProcessExit } from "../src/services/UpdateWaitService.ts";

test("waits in the background until Elite Dangerous has exited", async () => {
  const processStates = [true, true, false];
  let checks = 0;
  let pauses = 0;

  await waitForEliteProcessExit(
    async () => {
      checks += 1;
      return processStates.shift() ?? false;
    },
    async () => {
      pauses += 1;
    },
  );

  assert.equal(checks, 3);
  assert.equal(pauses, 2);
});

test("continues immediately when Elite Dangerous is already closed", async () => {
  let pauses = 0;
  await waitForEliteProcessExit(async () => false, async () => { pauses += 1; });
  assert.equal(pauses, 0);
});
