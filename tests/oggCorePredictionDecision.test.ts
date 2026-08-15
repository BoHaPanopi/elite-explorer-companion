import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  adaptEliteJournalEvent,
  annaBacteriumKnowledgePhase2B,
  CoreStateStore,
  evaluatePrediction,
  type CorePredictionBodyFacts,
  type EliteJournalFact,
} from "ogg-core";

function replay(journal: readonly EliteJournalFact[]) {
  const store = new CoreStateStore();
  for (const fact of journal) for (const event of adaptEliteJournalEvent(fact)) store.dispatch(event);
  return store.getState();
}

const completeBody: CorePredictionBodyFacts = {
  systemAddress: "100",
  bodyId: 5,
  bodyName: "System One 5",
  planetClass: "Icy body",
  atmosphere: "thin neon atmosphere",
  surfaceTemperatureKelvin: 56.09,
  gravityG: 0.455,
  surfacePressurePascals: 12,
  volcanism: "minor nitrogen magma volcanism",
  biologicalSignalCount: 1,
};

test("replays prediction facts with later Scan enrichment and signal replacement", () => {
  const state = replay([
    { event: "Scan", SystemAddress: 100, BodyID: 5, BodyName: "System One 5", PlanetClass: "Icy body", AtmosphereType: "thin neon atmosphere", SurfaceTemperature: 56.09, SurfaceGravity: 0.455 * 9.80665 },
    { event: "FSSBodySignals", SystemAddress: 100, BodyID: 5, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 2 }, { Type: "$SAA_SignalType_Geological;", Count: 9 }] },
    { event: "Scan", SystemAddress: 100, BodyID: 5, SurfacePressure: 12, Volcanism: "minor nitrogen magma volcanism" },
    { event: "SAASignalsFound", SystemAddress: 100, BodyID: 5, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 4 }] },
    { event: "Scan", SystemAddress: 100, BodyID: 6, PlanetClass: "Rocky body" },
    { event: "FSSBodySignals", SystemAddress: 100, BodyID: 6, Signals: [{ Type: "$SAA_SignalType_Biological;" }] },
    { event: "FSDJump", StarSystem: "System Two", SystemAddress: 200 },
    { event: "FSSBodySignals", SystemAddress: 200, BodyID: 5, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }] },
  ]);

  assert.equal(state.predictionBodies.length, 3);
  const firstBody = state.predictionBodies.find((body) => body.systemAddress === "100" && body.bodyId === 5);
  assert.deepEqual({ ...firstBody, gravityG: undefined }, { ...completeBody, gravityG: undefined, biologicalSignalCount: 4 });
  assert.ok(Math.abs((firstBody?.gravityG ?? 0) - 0.455) < 1e-12);
  assert.equal(state.predictionBodies.find((body) => body.systemAddress === "100" && body.bodyId === 6)?.biologicalSignalCount, 1);
  assert.equal(state.predictionBodies.find((body) => body.systemAddress === "200" && body.bodyId === 5)?.biologicalSignalCount, 1);
});

test("prediction decisions preserve the productive rules without requiring ScanOrganic evidence", () => {
  const decision = evaluatePrediction(completeBody, annaBacteriumKnowledgePhase2B);
  assert.equal(decision?.kind, "predictionUpdated");
  assert.deepEqual(decision?.kind === "predictionUpdated" ? decision.candidates.map((candidate) => candidate.displayName) : [], [
    "Bacterium Acies",
    "Bacterium Omentum",
    "Bacterium Tela",
  ]);
  assert.deepEqual(decision?.knowledgeBase, {
    schemaVersion: annaBacteriumKnowledgePhase2B.schemaVersion,
    revision: annaBacteriumKnowledgePhase2B.revision,
  });
  assert.equal(decision?.kind === "predictionUpdated" ? decision.candidates[0]?.evidenceStatus : undefined, "confirmed-rule");
  assert.equal(decision?.kind === "predictionUpdated" ? decision.candidates[0]?.supportingPlanetCount : undefined, 9);
  assert.equal(evaluatePrediction({ ...completeBody, biologicalSignalCount: undefined }, annaBacteriumKnowledgePhase2B), null);
  assert.equal(evaluatePrediction({ systemAddress: "100", bodyId: 8, biologicalSignalCount: 0 }, annaBacteriumKnowledgePhase2B)?.kind, "noCandidate");
  assert.equal(evaluatePrediction({ systemAddress: "100", bodyId: 9, planetClass: "Icy body", biologicalSignalCount: 2 }, annaBacteriumKnowledgePhase2B)?.kind, "noCandidate");
});

test("the prediction domain has no Anna, presentation, or other decision-layer dependency", () => {
  const source = readFileSync("packages/ogg-core/src/prediction/decision.ts", "utf8");
  assert.doesNotMatch(source, /react|tauri|SpeechService|Anna|voice|create.*(?:Text|Message)|invoke\(|ExobioDecision|ExplorationDecision/i);
});
