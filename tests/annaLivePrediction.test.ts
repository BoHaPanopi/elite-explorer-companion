import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateAnnaSpeciesEvidence,
  applyAnnaLiveJournalEvent,
  applyAnnaLiveJournalEvents,
  createAnnaJournalEvidenceState,
  getAnnaLivePredictions,
  type AnnaLiveJournalEvent,
} from "ogg-core";

const commanderKey = (name: string) => `key:${name.toLowerCase()}`;
const hipScan: AnnaLiveJournalEvent = {
  event: "Scan",
  systemAddress: "2387970023425",
  bodyId: 12,
  bodyName: "HIP 49485 B 5",
  planetClass: "Icy body",
  atmosphere: "thin neon atmosphere",
  surfaceTemperature: 56.09,
  surfaceGravity: 0.455 * 9.80665,
  surfacePressure: null,
  volcanism: "minor nitrogen magma volcanism",
};
const hipSignals: AnnaLiveJournalEvent = {
  event: "FSSBodySignals",
  systemAddress: "2387970023425",
  bodyId: 12,
  bodyName: "HIP 49485 B 5",
  biologicalSignalCount: 1,
};

function baseState() {
  return applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [
    { event: "Commander", name: "Explorer" },
    { event: "Location", systemAddress: "2387970023425" },
  ], commanderKey);
}

test("Scan plus FSSBodySignals predicts before DSS or ScanOrganic", () => {
  const state = applyAnnaLiveJournalEvents(baseState(), [hipScan, hipSignals], commanderKey);
  const prediction = getAnnaLivePredictions(state)[0];

  assert.deepEqual(prediction?.result.candidates.map((candidate) => candidate.displayName), [
    "Bacterium Acies",
    "Bacterium Omentum",
    "Bacterium Tela",
  ]);
  assert.equal(prediction?.result.candidates[0]?.evidenceStatus, "confirmed-rule");
  assert.equal(prediction?.result.candidates[0]?.supportingPlanetCount, 9);
  assert.deepEqual(state.evidence.commanders, {});
});

test("SAAScanComplete and ScanOrganic are not required for prediction", () => {
  const events = [hipScan, hipSignals];
  assert.ok(events.every((event) => event.event !== "SAAScanComplete" && event.event !== "ScanOrganic"));
  assert.equal(getAnnaLivePredictions(applyAnnaLiveJournalEvents(baseState(), events, commanderKey)).length, 1);
});

test("zero biological signals produce no candidates", () => {
  const state = applyAnnaLiveJournalEvents(baseState(), [hipScan, { ...hipSignals, biologicalSignalCount: 0 }], commanderKey);
  assert.deepEqual(getAnnaLivePredictions(state)[0]?.result.candidates, []);
});

test("incomplete planet data remains null and is never invented", () => {
  const state = applyAnnaLiveJournalEvent(baseState(), {
    event: "FSSBodySignals", bodyId: 12, biologicalSignalCount: 1,
  }, commanderKey);
  const input = getAnnaLivePredictions(state)[0]?.input;
  assert.equal(input?.bodyType, null);
  assert.equal(input?.atmosphere, null);
  assert.equal(input?.surfaceTemperatureKelvin, null);
  assert.equal(input?.gravityG, null);
  assert.equal(input?.surfacePressurePascals, null);
  assert.equal(input?.volcanism, null);
});

test("identical events do not create a duplicate prediction revision", () => {
  const predicted = applyAnnaLiveJournalEvents(baseState(), [hipScan, hipSignals], commanderKey);
  const repeated = applyAnnaLiveJournalEvents(predicted, [hipScan, hipSignals], commanderKey);
  assert.equal(repeated.predictionRevision, predicted.predictionRevision);
  assert.equal(getAnnaLivePredictions(repeated)[0]?.revision, getAnnaLivePredictions(predicted)[0]?.revision);
});

test("new planet data recalculates the prediction", () => {
  const partial = applyAnnaLiveJournalEvent(baseState(), hipSignals, commanderKey);
  const completed = applyAnnaLiveJournalEvent(partial, hipScan, commanderKey);
  assert.ok(completed.predictionRevision > partial.predictionRevision);
  assert.deepEqual(getAnnaLivePredictions(completed)[0]?.result.candidates.map((candidate) => candidate.displayName), [
    "Bacterium Acies", "Bacterium Omentum", "Bacterium Tela",
  ]);
});

test("prediction never creates evidence, while later ScanOrganic creates exactly one", () => {
  const predicted = applyAnnaLiveJournalEvents(baseState(), [hipScan, hipSignals], commanderKey);
  assert.deepEqual(predicted.evidence.commanders, {});
  const organic = { event: "ScanOrganic", systemAddress: "2387970023425", body: 12, species: "species.tela", variant: "variant.yellow" };
  const found = applyAnnaLiveJournalEvents(predicted, [organic, organic, organic], commanderKey);
  assert.equal(aggregateAnnaSpeciesEvidence(found.evidence, "key:explorer")[0]?.observationCount, 1);
});

test("commander and system changes clear current predictions without mixing evidence", () => {
  const predicted = applyAnnaLiveJournalEvents(baseState(), [hipScan, hipSignals], commanderKey);
  const jumped = applyAnnaLiveJournalEvent(predicted, { event: "FSDJump", systemAddress: "999" }, commanderKey);
  assert.deepEqual(getAnnaLivePredictions(jumped), []);
  const switched = applyAnnaLiveJournalEvent(jumped, { event: "Commander", name: "Second" }, commanderKey);
  assert.equal(switched.commanderKey, "key:second");
  assert.deepEqual(getAnnaLivePredictions(switched), []);
});
