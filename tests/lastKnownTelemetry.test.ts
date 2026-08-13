import assert from "node:assert/strict";
import test from "node:test";

import { hasCurrentTelemetry, persistLastKnownTelemetry, readLastKnownTelemetry, sameLastKnownTelemetry, updateLastKnownTelemetry, type TelemetrySnapshot } from "../src/features/lastKnownTelemetry.ts";

const docked: TelemetrySnapshot = {
  eliteConnected: true, system: "Shinrarta Dezhra", docked: true, shipState: "docked",
  stationName: "Jameson Memorial", planetName: null,
};

test("connected snapshot with a system is current telemetry", () => {
  assert.equal(hasCurrentTelemetry(docked), true);
  assert.equal(hasCurrentTelemetry({ ...docked, system: null }), false);
  assert.equal(hasCurrentTelemetry({ ...docked, eliteConnected: false }), false);
});

test("last confirmed system and docked station survive a disconnect", () => {
  const confirmed = updateLastKnownTelemetry(null, docked);
  const disconnected = updateLastKnownTelemetry(confirmed, { ...docked, eliteConnected: false });
  assert.deepEqual(disconnected, confirmed);
  assert.equal(disconnected?.system, "Shinrarta Dezhra");
  assert.equal(disconnected?.stationName, "Jameson Memorial");
});

test("touchdown and liftoff update the last confirmed ship state", () => {
  const landed = updateLastKnownTelemetry(null, { ...docked, docked: false, shipState: "landed", stationName: null, planetName: "Achenar 3" });
  assert.equal(landed?.shipState, "landed");
  assert.equal(landed?.planetName, "Achenar 3");
  const airborne = updateLastKnownTelemetry(landed, { ...docked, docked: false, shipState: "normal_space", stationName: null, planetName: null });
  assert.equal(airborne?.shipState, "normal_space");
  assert.equal(airborne?.planetName, null);
});

test("last confirmed telemetry is locally persisted and invalid data is ignored", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  const confirmed = updateLastKnownTelemetry(null, docked)!;
  persistLastKnownTelemetry(storage, confirmed);
  assert.deepEqual(readLastKnownTelemetry(storage), confirmed);
  values.set("eec.lastKnownTelemetry", "not json");
  assert.equal(readLastKnownTelemetry(storage), null);
});

test("a later connected snapshot replaces the locally remembered position for reconnection", () => {
  const first = updateLastKnownTelemetry(null, docked)!;
  const reconnected = updateLastKnownTelemetry(first, { ...docked, system: "Sol", docked: false, shipState: "supercruise", stationName: null });
  assert.equal(reconnected?.system, "Sol");
  assert.equal(reconnected?.shipState, "supercruise");
  assert.equal(sameLastKnownTelemetry(reconnected, first), false);
  assert.equal(sameLastKnownTelemetry(reconnected, reconnected), true);
});
