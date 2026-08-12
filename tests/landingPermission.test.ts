import assert from "node:assert/strict";
import test from "node:test";

import { evaluateLandingPermissionReminder, type LandingPermissionState } from "ogg-core";

const initialState: LandingPermissionState = { armed: true, reminded: false };

test("Willi stays silent outside the 7.5 km zone and on entry alone", () => {
  const farAway = evaluateLandingPermissionReminder(initialState, {
    stationName: "Panopi City",
    distanceKm: 8.1,
    hasDockingPermission: false,
    hasWakeScanner: false,
  }, "de");

  assert.equal(farAway.shouldRemind, false);
  assert.deepEqual(farAway.nextState, { armed: true, reminded: false });

  const entryOnly = evaluateLandingPermissionReminder(farAway.nextState, {
    stationName: "Panopi City",
    distanceKm: 6.9,
    hasDockingPermission: false,
    hasWakeScanner: false,
  }, "de");

  assert.equal(entryOnly.shouldRemind, false);
  assert.deepEqual(entryOnly.nextState, { armed: true, reminded: false });
});

test("Willi warns exactly once in the reminder band until the ship leaves the zone", () => {
  const firstWarning = evaluateLandingPermissionReminder(initialState, {
    stationName: "Panopi City",
    distanceKm: 3.8,
    hasDockingPermission: false,
    hasWakeScanner: false,
  }, "de");

  assert.equal(firstWarning.shouldRemind, true);
  assert.match(firstWarning.text ?? "", /Panopi City/);
  assert.deepEqual(firstWarning.nextState, { armed: false, reminded: true });

  const repeatInsideZone = evaluateLandingPermissionReminder(firstWarning.nextState, {
    stationName: "Panopi City",
    distanceKm: 3.6,
    hasDockingPermission: false,
    hasWakeScanner: false,
  }, "de");

  assert.equal(repeatInsideZone.shouldRemind, false);
  assert.deepEqual(repeatInsideZone.nextState, { armed: false, reminded: true });

  const rearmedAfterLeaving = evaluateLandingPermissionReminder(repeatInsideZone.nextState, {
    stationName: "Panopi City",
    distanceKm: 8.4,
    hasDockingPermission: false,
    hasWakeScanner: false,
  }, "de");

  assert.equal(rearmedAfterLeaving.shouldRemind, false);
  assert.deepEqual(rearmedAfterLeaving.nextState, { armed: true, reminded: false });

  const secondApproach = evaluateLandingPermissionReminder(rearmedAfterLeaving.nextState, {
    stationName: "Panopi City",
    distanceKm: 3.7,
    hasDockingPermission: false,
    hasWakeScanner: false,
  }, "de");

  assert.equal(secondApproach.shouldRemind, true);
});

test("existing docking permission or a wake scanner suppresses the reminder", () => {
  const granted = evaluateLandingPermissionReminder(initialState, {
    stationName: "Panopi City",
    distanceKm: 3.8,
    hasDockingPermission: true,
    hasWakeScanner: false,
  }, "de");

  assert.equal(granted.shouldRemind, false);

  const wakeScanner = evaluateLandingPermissionReminder(initialState, {
    stationName: "Panopi City",
    distanceKm: 3.8,
    hasDockingPermission: false,
    hasWakeScanner: true,
  }, "de");

  assert.equal(wakeScanner.shouldRemind, false);
  assert.deepEqual(wakeScanner.nextState, { armed: false, reminded: false });
});
