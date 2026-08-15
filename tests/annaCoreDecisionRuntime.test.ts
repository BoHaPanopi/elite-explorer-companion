import assert from "node:assert/strict";
import test from "node:test";

import { type EliteJournalFact } from "ogg-core";
import { AnnaEvidenceService } from "../src/services/AnnaEvidenceService.ts";
import { consumeAnnaCoreDecisions } from "../src/services/AnnaCoreDecisionRuntime.ts";
import { CoreShadowStateBridge } from "../src/services/CoreShadowStateBridge.ts";

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

function ingest(bridge: CoreShadowStateBridge, anna: AnnaEvidenceService, event: EliteJournalFact) {
  return consumeAnnaCoreDecisions(event, { bridge, evidence: anna });
}

test("routes Core PredictionDecision once to Anna without a legacy recomputation", () => {
  const bridge = new CoreShadowStateBridge();
  const anna = new AnnaEvidenceService(new MemoryStorage());
  ingest(bridge, anna, { event: "Commander", Name: "Commander" });
  ingest(bridge, anna, { event: "Scan", SystemAddress: 100, BodyID: 5, BodyName: "Anonymized 5", PlanetClass: "Rocky body", Atmosphere: "thin neon atmosphere" });
  const result = ingest(bridge, anna, { event: "FSSBodySignals", SystemAddress: 100, BodyID: 5, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }] });

  assert.equal(result.predictionDecisions[0]?.kind, "predictionUpdated");
  assert.deepEqual(anna.predictions()[0]?.result.candidates.map((candidate) => candidate.id), ["bacterium.acies"]);
  assert.deepEqual(anna.predictions()[0]?.result.knowledgeBaseRevision, "anna-bacterium-phase-2b.1");
  ingest(bridge, anna, { event: "FSSBodySignals", SystemAddress: 100, BodyID: 5, Signals: [{ Type: "$SAA_SignalType_Biological;", Count: 1 }] });
  assert.equal(anna.predictions().length, 1);
});

test("routes all Core Exobio decision stages to Anna and persists only observed organisms", () => {
  const bridge = new CoreShadowStateBridge();
  const anna = new AnnaEvidenceService(new MemoryStorage());
  ingest(bridge, anna, { event: "Commander", Name: "Commander" });
  ingest(bridge, anna, { event: "SAASignalsFound", SystemAddress: 100, BodyID: 5, BodyName: "Anonymized 5", Genuses: [{ Genus: "$Codex_Ent_Bacterium_Name;" }] });
  const first = ingest(bridge, anna, { event: "ScanOrganic", SystemAddress: 100, Body: 5, Genus: "$Codex_Ent_Bacterium_Name;", Species: "$Species_Bacterium_Informem_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Log" });
  const final = ingest(bridge, anna, { event: "ScanOrganic", SystemAddress: 100, Body: 5, Genus: "$Codex_Ent_Bacterium_Name;", Species: "$Species_Bacterium_Informem_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Analyse" });

  assert.deepEqual(first.exobioDecisions.map((decision) => decision.kind), ["organismObserved", "sampleInProgress"]);
  assert.deepEqual(final.exobioDecisions.map((decision) => decision.kind), ["organismObserved", "organismCompleted"]);
  assert.equal(anna.currentSpeciesEvidence().length, 1);
});
