import assert from "node:assert/strict";
import test from "node:test";

import { classifyScoopability } from "ogg-core";

test("all seven fuel-star classes are scoopable", () => {
  for (const starClass of ["K", "G", "B", "F", "O", "A", "M"]) {
    assert.equal(classifyScoopability(starClass), "scoopable");
  }
});

test("a known non-fuel star is not scoopable", () => {
  assert.equal(classifyScoopability("T"), "notScoopable");
});

test("a missing star class remains neutral", () => {
  assert.equal(classifyScoopability(null), "unknown");
  assert.equal(classifyScoopability("  "), "unknown");
});
