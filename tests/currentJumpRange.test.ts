import assert from "node:assert/strict";
import test from "node:test";

import {
  formatCurrentJumpRange,
  selectDisplayedCurrentJumpRange,
} from "../src/features/currentJumpRange.ts";

test("current jump range prefers the explicit current value", () => {
  assert.equal(
    selectDisplayedCurrentJumpRange({
      currentJumpRange: 68.31,
      maxJumpRange: 72.8,
    }),
    68.31,
  );
});

test("max jump range is not mistaken for the current value", () => {
  assert.equal(
    selectDisplayedCurrentJumpRange({
      currentJumpRange: null,
      maxJumpRange: 72.8,
    }),
    null,
  );
});

test("german formatting uses decimal comma and Lj", () => {
  assert.equal(formatCurrentJumpRange(68.31, "de"), "akt: 68,31 Lj");
});

test("missing jump range data does not produce an invented label", () => {
  assert.equal(formatCurrentJumpRange(null, "de"), null);
});