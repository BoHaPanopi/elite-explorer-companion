import assert from "node:assert/strict";
import test from "node:test";

import { createAnnaPlanetKey, type AnnaLivePrediction, type EliteJournalFact } from "ogg-core";
import { CoreShadowStateBridge } from "../src/services/CoreShadowStateBridge.ts";

const scan: EliteJournalFact = {
  event: "Scan",
  SystemAddress: 100,
  BodyID: 5,
  BodyName: "Anonymized 5",
  PlanetClass: "Icy body",
  Atmosphere: "thin neon atmosphere",
  Volcanism: "minor nitrogen magma volcanism",
};
const signals: EliteJournalFact = {
  event: "FSSBodySignals",
  SystemAddress: 100,
  BodyID: 5,
  Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }],
};

function legacyPrediction(): AnnaLivePrediction {
  return {
    planetKey: createAnnaPlanetKey("100", 5),
    revision: 1,
    input: { bodyName: "Anonymized 5", bodyType: "Icy body", atmosphere: "thin neon atmosphere", surfaceTemperatureKelvin: null, gravityG: null, surfacePressurePascals: null, volcanism: "minor nitrogen magma volcanism", biologicalSignalCount: 1 },
    result: {
      bodyName: "Anonymized 5",
      knowledgeBaseSchemaVersion: 1,
      knowledgeBaseRevision: "anna-bacterium-phase-2b.1",
      candidates: [
        { id: "bacterium.acies", displayName: "Bacterium Acies", evidenceStatus: "confirmed-rule", supportingPlanetCount: 9 },
        { id: "bacterium.omentum", displayName: "Bacterium Omentum", evidenceStatus: "positive-observation", supportingPlanetCount: 3 },
        { id: "bacterium.tela", displayName: "Bacterium Tela", evidenceStatus: "positive-observation", supportingPlanetCount: 2 },
      ],
    },
  };
}

test("runtime shadow compares a relevant core decision without product effects", () => {
  const bridge = new CoreShadowStateBridge();
  bridge.ingestRuntimeDecisions(scan, []);
  const result = bridge.ingestRuntimeDecisions(signals, [legacyPrediction()]);

  assert.deepEqual(result.predictionMismatches, []);
});

test("runtime shadow reports one sanitized mismatch and deduplicates it", () => {
  const bridge = new CoreShadowStateBridge();
  bridge.ingestRuntimeDecisions(scan, []);
  const incorrect = { ...legacyPrediction(), result: { ...legacyPrediction().result, candidates: [] } };
  const first = bridge.ingestRuntimeDecisions(signals, [incorrect]);
  const second = bridge.ingestRuntimeDecisions(signals, [incorrect]);

  assert.equal(first.predictionMismatches.length, 1);
  assert.equal(second.predictionMismatches.length, 0);
  assert.deepEqual(first.predictionMismatches[0]?.inputFacts, {
    systemAddress: "100",
    bodyId: 5,
    planetClass: "Icy body",
    atmosphere: "thin neon atmosphere",
    volcanism: "minor nitrogen magma volcanism",
    biologicalSignalCount: 1,
  });
  assert.equal("bodyName" in (first.predictionMismatches[0]?.inputFacts ?? {}), false);
});
