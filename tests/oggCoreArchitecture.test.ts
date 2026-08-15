import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { adaptEliteJournalEvent, initialOggCoreState, reduceCoreState, type EliteJournalFact } from "ogg-core";

test("replays an anonymized journal sequence into the confirmed core state", () => {
  const journal: EliteJournalFact[] = [
    { event: "Commander", Name: "  Explorer One  ", FID: "F123" },
    { event: "Loadout", Ship: "Krait Phantom", ShipID: 42, ShipName: "Surveyor", ShipIdent: "OGG-01", FuelCapacity: { Main: 32 }, CargoCapacity: 64, MaxJumpRange: 68.5 },
    { event: "FSDJump", StarSystem: "HIP 49485", SystemAddress: 123456789, StarPos: [1, 2, 3], JumpDist: 18.5, FuelUsed: 2.4, FuelLevel: 29.6 },
    { event: "FSSDiscoveryScan", Progress: 1, StarSystem: "HIP 49485", SystemAddress: 123456789, BodyCount: 17, NonBodyCount: 3 },
    { event: "FSSBodySignals", SystemAddress: 123456789, BodyID: 5, BodyName: "HIP 49485 B 5", Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }, { Type: "$SAA_SignalType_Geological;", Count: 1 }] },
  ];
  const events = journal.flatMap(adaptEliteJournalEvent);
  const state = events.reduce(reduceCoreState, initialOggCoreState);

  assert.deepEqual(events.map((event) => event.type), ["CommanderIdentified", "ShipStateChanged", "SystemEntered", "SystemScanCompleted", "BodySignalsDetected"]);
  assert.deepEqual(state, {
    commander: { name: "Explorer One", normalizedName: "explorer one", fid: "F123" },
    ship: { shipType: "Krait Phantom", shipId: 42, shipName: "Surveyor", shipIdent: "OGG-01", fuelCapacity: 32, cargoCapacity: 64, maxJumpRange: 68.5 },
    system: { systemName: "HIP 49485", systemAddress: "123456789", starPosition: [1, 2, 3], jumpDistance: 18.5, fuelUsed: 2.4, fuelLevel: 29.6 },
    flightState: "unknown",
    flightContext: null,
    currentSystemScan: { systemName: "HIP 49485", systemAddress: "123456789", bodyCount: 17, nonBodyCount: 3 },
    bodySignals: [{ systemAddress: "123456789", bodyId: 5, bodyName: "HIP 49485 B 5", signalTypes: [{ type: "$saa_signaltype_biological;", count: 2 }, { type: "$saa_signaltype_geological;", count: 1 }] }],
  });
});

test("flight facts clear obsolete station and body contexts", () => {
  const state = [
    { event: "Docked", StationName: "Celsius Reach" },
    { event: "Touchdown", Body: "HIP 49485 B 5" },
    { event: "Liftoff" },
  ].flatMap(adaptEliteJournalEvent).reduce(reduceCoreState, initialOggCoreState);
  assert.equal(state.flightState, "airborne");
  assert.equal(state.flightContext, null);
});

test("adapter is fail-soft and never invents optional values", () => {
  assert.deepEqual(adaptEliteJournalEvent({ event: "UnknownFutureEvent" }), []);
  const [ship] = adaptEliteJournalEvent({ event: "Loadout", Ship: "Adder" });
  assert.deepEqual(ship, { type: "ShipStateChanged", ship: { shipType: "Adder" } });
  assert.deepEqual(adaptEliteJournalEvent({ event: "FSSDiscoveryScan", Progress: 0.99 }), []);
});

test("core remains a pure domain boundary", () => {
  const source = ["model.ts", "reducer.ts", "journalAdapter.ts"]
    .map((file) => readFileSync(`packages/ogg-core/src/core/${file}`, "utf8"))
    .join("\n");
  assert.doesNotMatch(source, /react|tauri|invoke\(|fetch\(|speech|voice|crew/i);
  assert.doesNotMatch(readFileSync("packages/ogg-core/src/core/journalAdapter.ts", "utf8"), /dashboard|greeting|profile/i);
});
