import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { adaptEliteJournalEvent, CoreStateStore, initialOggCoreState, type EliteJournalFact } from "ogg-core";
import { CoreShadowStateBridge } from "../src/services/CoreShadowStateBridge.ts";

const anonymizedReplay: EliteJournalFact[] = [
  { event: "Commander", Name: "  Explorer One  ", FID: "F123" },
  { event: "Loadout", Ship: "Krait Phantom", ShipID: 42, ShipName: "Surveyor", ShipIdent: "OGG-01", FuelCapacity: { Main: 32 }, CargoCapacity: 64, MaxJumpRange: 68.5 },
  { event: "FSDJump", StarSystem: "HIP 49485", SystemAddress: 123456789, StarPos: [1, 2, 3], JumpDist: 18.5, FuelUsed: 2.4, FuelLevel: 29.6 },
  { event: "Location", StarSystem: "HIP 49485", SystemAddress: 123456789, StarPos: [1, 2, 3], Docked: false },
  { event: "FSSDiscoveryScan", Progress: 1, StarSystem: "HIP 49485", SystemAddress: 123456789, BodyCount: 17, NonBodyCount: 3 },
  { event: "FSSBodySignals", SystemAddress: 123456789, BodyID: 5, BodyName: "HIP 49485 B 5", Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }, { Type: "$SAA_SignalType_Geological;", Count: 1 }] },
  { event: "SAASignalsFound", SystemAddress: 123456789, BodyID: 5, BodyName: "HIP 49485 B 5", Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }, { Type: "$SAA_SignalType_Geological;", Count: 2 }] },
  { event: "SupercruiseExit" },
  { event: "Docked", StationName: "Celsius Reach" },
];

function replayIntoStore(journal: readonly EliteJournalFact[]): CoreStateStore {
  const store = new CoreStateStore();
  for (const fact of journal) for (const event of adaptEliteJournalEvent(fact)) store.dispatch(event);
  return store;
}

test("replays the complete anonymized journal sequence to one deterministic core state", () => {
  const first = replayIntoStore(anonymizedReplay).getState();
  const second = replayIntoStore(anonymizedReplay).getState();

  assert.deepEqual(first, second);
  assert.deepEqual(first, {
    commander: { name: "Explorer One", normalizedName: "explorer one", fid: "F123" },
    ship: { shipType: "Krait Phantom", shipId: 42, shipName: "Surveyor", shipIdent: "OGG-01", fuelCapacity: 32, cargoCapacity: 64, maxJumpRange: 68.5 },
    system: { systemName: "HIP 49485", systemAddress: "123456789", starPosition: [1, 2, 3] },
    flightState: "docked",
    flightContext: { stationName: "Celsius Reach" },
    currentSystemScan: { systemName: "HIP 49485", systemAddress: "123456789", bodyCount: 17, nonBodyCount: 3 },
    bodySignals: [{ systemAddress: "123456789", bodyId: 5, bodyName: "HIP 49485 B 5", signalTypes: [{ type: "$saa_signaltype_biological;", count: 1 }, { type: "$saa_signaltype_geological;", count: 2 }] }],
  });
});

test("store changes state only through dispatched reducer events and subscriptions observe real changes", () => {
  const store = new CoreStateStore();
  const received: string[] = [];
  const unsubscribe = store.subscribe((state, event) => received.push(`${event.type}:${state.commander?.name ?? "none"}`));
  const [commander] = adaptEliteJournalEvent({ event: "Commander", Name: "Explorer One" });
  assert.ok(commander);

  store.dispatch(commander);
  assert.equal(store.getState().commander?.name, "Explorer One");
  store.dispatch(commander);
  assert.deepEqual(received, ["CommanderIdentified:Explorer One"]);
  unsubscribe();
  store.dispatch({ type: "FlightStateChanged", flightState: "normalSpace" });
  assert.deepEqual(received, ["CommanderIdentified:Explorer One"]);
  assert.deepEqual(adaptEliteJournalEvent({ event: "UnknownFutureEvent" }), []);
  assert.notDeepEqual(store.getState(), initialOggCoreState);
});

test("adapter remains fail-soft and optional fields never invent values", () => {
  const [ship] = adaptEliteJournalEvent({ event: "Loadout", Ship: "Adder" });
  assert.deepEqual(ship, { type: "ShipStateChanged", ship: { shipType: "Adder" } });
  assert.deepEqual(adaptEliteJournalEvent({ event: "Location", StarSystem: "HIP 49485" }), [{ type: "SystemEntered", system: { systemName: "HIP 49485" } }]);
  assert.deepEqual(adaptEliteJournalEvent({ event: "Location", Docked: false }), [{ type: "FlightStateChanged", flightState: "normalSpace" }]);
  assert.deepEqual(adaptEliteJournalEvent({ event: "SAASignalsFound", SystemAddress: 123, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }] }), [{ type: "BodySignalsDetected", signals: { systemAddress: "123", signalTypes: [{ type: "$saa_signaltype_biological;", count: 1 }] } }]);
  assert.deepEqual(adaptEliteJournalEvent({ event: "FSSBodySignals", SystemAddress: 123, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }] }), [{ type: "BodySignalsDetected", signals: { systemAddress: "123", signalTypes: [{ type: "$saa_signaltype_biological;", count: 1 }] } }]);
  assert.deepEqual(adaptEliteJournalEvent({ event: "FSSDiscoveryScan", Progress: 0.99 }), []);
  assert.deepEqual(adaptEliteJournalEvent({ event: "UnknownFutureEvent" }), []);
});

test("flight events remove obsolete station and body context", () => {
  const state = replayIntoStore([
    { event: "Docked", StationName: "Celsius Reach" },
    { event: "Touchdown", Body: "HIP 49485 B 5" },
    { event: "SupercruiseExit" },
  ]).getState();
  assert.equal(state.flightState, "normalSpace");
  assert.equal(state.flightContext, null);
});

test("shadow bridge dispatches adapted facts and emits compact mismatch diagnostics only when they change", () => {
  const mismatches: unknown[] = [];
  const bridge = new CoreShadowStateBridge(undefined, (mismatch) => mismatches.push(mismatch));
  bridge.ingest({ event: "FSDJump", StarSystem: "HIP 49485" });
  assert.equal(bridge.getState().system?.systemName, "HIP 49485");
  assert.deepEqual(bridge.compare({ system: "HIP 49485" }, "FSDJump"), []);
  assert.equal(mismatches.length, 0);
  assert.equal(bridge.compare({ system: "Different system" }, "FSDJump").length, 1);
  assert.equal(mismatches.length, 1);
  bridge.compare({ system: "Different system" }, "FSDJump");
  assert.equal(mismatches.length, 1);

  const signalEvents = bridge.ingest({ event: "SAASignalsFound", SystemAddress: 123, BodyID: 5, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }] });
  assert.deepEqual(signalEvents, [{ type: "BodySignalsDetected", signals: { systemAddress: "123", bodyId: 5, signalTypes: [{ type: "$saa_signaltype_biological;", count: 1 }] } }]);
  assert.equal(bridge.getState().bodySignals.length, 1);
});

test("journal commander is available from core state for the sole routing source", () => {
  const bridge = new CoreShadowStateBridge();
  bridge.ingest({ event: "Commander", Name: " \tHELITONY2\r\n" });
  assert.equal(bridge.getState().commander?.name, "HELITONY2");
  assert.equal(bridge.getState().commander?.normalizedName, "helitony2");
});

test("core and shadow boundary stay free of runtime and product side effects", () => {
  const coreSource = ["model.ts", "reducer.ts", "journalAdapter.ts", "store.ts"]
    .map((file) => readFileSync(`packages/ogg-core/src/core/${file}`, "utf8"))
    .join("\n");
  const bridgeSource = readFileSync("src/services/CoreShadowStateBridge.ts", "utf8");
  const appSource = readFileSync("src/App.tsx", "utf8");
  const rustSource = readFileSync("src-tauri/src/lib.rs", "utf8");

  assert.doesNotMatch(coreSource, /react|tauri|invoke\(|fetch\(|speech|voice|crew|window|update/i);
  assert.doesNotMatch(coreSource, /CoreShadowStateBridge|\.\.\/\.\.\/src\//);
  assert.doesNotMatch(bridgeSource, /react|tauri|invoke\(|fetch\(|speech|voice|greeting|dashboard|update/i);
  assert.match(bridgeSource, /from "ogg-core"/);
  assert.match(appSource, /get_live_core_journal_events/);
  assert.match(appSource, /bridge\?\.ingest/);
  assert.match(appSource, /CORE_STATE_MISMATCH/);
  assert.match(appSource, /const activeCommander = coreCommander/);
  assert.doesNotMatch(appSource, /selectCommanderIdentity\(/);
  assert.match(rustSource, /fn get_live_core_journal_events/);
  assert.match(rustSource, /get_live_core_journal_events[\s\S]*SAASignalsFound/);
});
