import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { adaptEliteJournalEvent, CoreStateStore, evaluateExploration, type EliteJournalFact, type ExplorationDecision } from "ogg-core";

function replay(journal: readonly EliteJournalFact[]): ExplorationDecision[] {
  const store = new CoreStateStore();
  const decisions: ExplorationDecision[] = [];
  for (const fact of journal) {
    for (const event of adaptEliteJournalEvent(fact)) {
      const previous = store.getState();
      const state = store.dispatch(event);
      const decision = evaluateExploration(event, previous, state);
      if (decision) decisions.push(decision);
    }
  }
  return decisions;
}

const historicalReplay: EliteJournalFact[] = [
  { event: "FSDJump", StarSystem: "System One", SystemAddress: 100 },
  { event: "FSSDiscoveryScan", Progress: 1, SystemName: "System One", SystemAddress: 100, BodyCount: 7, NonBodyCount: 3 },
  { event: "FSSBodySignals", SystemAddress: 100, BodyID: 4, BodyName: "System One 4", Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }, { Type: "$SAA_SignalType_Geological;", Count: 1 }] },
  { event: "SAASignalsFound", SystemAddress: 100, BodyID: 4, BodyName: "System One 4", Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }, { Type: "$SAA_SignalType_Human;", Count: 4 }] },
  { event: "FSDJump", StarSystem: "System Two", SystemAddress: 200 },
  { event: "FSSDiscoveryScan", Progress: 0.5, SystemName: "System Two", SystemAddress: 200, BodyCount: 2, NonBodyCount: 1 },
  { event: "FSSDiscoveryScan", Progress: 1, SystemName: "System Two", SystemAddress: 200, BodyCount: 2, NonBodyCount: 1 },
  { event: "FSSBodySignals", SystemAddress: 200, BodyID: 7, BodyName: "System Two 7", Signals: [{ Type: "$SAA_SignalType_Geological;", Count: 3 }] },
  { event: "Scan", ScanType: "Detailed", SystemAddress: 200, BodyID: 7, BodyName: "System Two 7", WasDiscovered: true, WasMapped: false, WasFootfalled: false },
];

test("replays the historical FSS and body-signal sequence deterministically without premature no-biology decisions", () => {
  const first = replay(historicalReplay);
  const second = replay(historicalReplay);

  assert.deepEqual(first, second);
  assert.deepEqual(first.map((decision) => decision.kind), [
    "scanIncomplete",
    "scanCompleted",
    "biologicalTargetWorthConsidering",
    "biologicalTargetWorthConsidering",
    "scanIncomplete",
    "scanCompleted",
    "bodySignalsDetected",
    "bodyExplorationUpdated",
  ]);
  assert.deepEqual(first[1], { kind: "scanCompleted", systemName: "System One", systemAddress: "100", bodyCount: 7, nonBodyCount: 3, observedSignalBodies: 0 });
  assert.deepEqual(first[2], {
    kind: "biologicalTargetWorthConsidering",
    systemAddress: "100",
    bodyId: 4,
    bodyName: "System One 4",
    biologicalSignalCount: 2,
    signalTypes: [{ type: "$saa_signaltype_biological;", count: 2 }, { type: "$saa_signaltype_geological;", count: 1 }],
  });
  assert.deepEqual(first[5], { kind: "scanCompleted", systemName: "System Two", systemAddress: "200", bodyCount: 2, nonBodyCount: 1, observedSignalBodies: 0 });
});

test("Scan facts retain confirmed discovery, mapping, and footfall data as later scans add detail", () => {
  const decisions = replay([
    { event: "FSDJump", StarSystem: "System One", SystemAddress: 100 },
    { event: "Scan", ScanType: "AutoScan", SystemAddress: 100, BodyID: 4, BodyName: "System One 4", WasDiscovered: false },
    { event: "Scan", ScanType: "Detailed", SystemAddress: 100, BodyID: 4, WasMapped: true, WasFootfalled: true },
  ]);

  assert.deepEqual(decisions.at(-1), {
    kind: "bodyExplorationUpdated",
    body: {
      systemAddress: "100",
      bodyId: 4,
      bodyName: "System One 4",
      wasDiscovered: false,
      wasMapped: true,
      wasFootfalled: true,
      scanType: "Detailed",
    },
  });
});

test("duplicate confirmed core facts do not emit a second decision", () => {
  const journal: EliteJournalFact[] = [
    { event: "FSDJump", StarSystem: "System One", SystemAddress: 100 },
    { event: "FSSDiscoveryScan", Progress: 1, SystemName: "System One", SystemAddress: 100 },
    { event: "FSSDiscoveryScan", Progress: 1, SystemName: "System One", SystemAddress: 100 },
    { event: "FSSBodySignals", SystemAddress: 100, BodyID: 4, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }] },
    { event: "FSSBodySignals", SystemAddress: 100, BodyID: 4, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }] },
  ];

  assert.deepEqual(replay(journal).map((decision) => decision.kind), ["scanIncomplete", "scanCompleted", "biologicalTargetWorthConsidering"]);
});

test("the exploration decision layer only accepts typed core events and state", () => {
  const source = readFileSync("packages/ogg-core/src/exploration/decision.ts", "utf8");
  assert.doesNotMatch(source, /EliteJournalFact|react|tauri|speech|voice|createExplorationMessage|invoke\(/i);
});
