import assert from "node:assert/strict";
import test from "node:test";

import {
  getTonyWelcomeMessage,
  isTonySeason,
  resolveActiveTonyProfile,
  resolveTonyProfile,
  tonySeasonalStorageKey,
  tonyWelcomeStorageKey,
} from "../src/features/tonyEdition.ts";

test("activates only for the two Tony commander identities", () => {
  assert.equal(resolveTonyProfile("Helitony"), "helitony");
  assert.equal(resolveTonyProfile("CMDR Helitony"), null);
  assert.equal(resolveTonyProfile("Helitony2"), "helitony2");
  assert.equal(resolveTonyProfile("Helitony 2"), null);
  assert.equal(resolveTonyProfile("helitony"), null);
  assert.equal(resolveTonyProfile("Helitony "), null);
  assert.equal(resolveTonyProfile("xHelitony"), null);
  assert.equal(resolveTonyProfile("Helitony 3"), null);
  assert.equal(resolveTonyProfile("Panopi"), null);
  assert.equal(resolveTonyProfile(null), null);
  assert.equal(resolveActiveTonyProfile("Helitony", false), null);
  assert.equal(resolveActiveTonyProfile("Helitony", true), "helitony");
});

test("uses separate permanent welcome markers for both commanders", () => {
  assert.notEqual(tonyWelcomeStorageKey("helitony"), tonyWelcomeStorageKey("helitony2"));
  assert.match(getTonyWelcomeMessage("helitony"), /Welcome aboard, Tony/);
  assert.match(getTonyWelcomeMessage("helitony2"), /Welcome back, Tony/);
});

test("shows the seasonal reminder only from December 1 through December 26", () => {
  assert.equal(isTonySeason(new Date(2026, 10, 30)), false);
  assert.equal(isTonySeason(new Date(2026, 11, 1)), true);
  assert.equal(isTonySeason(new Date(2026, 11, 26)), true);
  assert.equal(isTonySeason(new Date(2026, 11, 27)), false);
  assert.notEqual(tonySeasonalStorageKey(2026), tonySeasonalStorageKey(2027));
});
