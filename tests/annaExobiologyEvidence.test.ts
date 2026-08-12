import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateAnnaSpeciesEvidence,
  createAnnaAnonymousEvidenceAggregate,
  createAnnaLocalEvidenceStore,
  hasAnnaObservation,
  recordAnnaPositiveObservation,
  type AnnaPositiveBioObservation,
} from "ogg-core";

import { hip49485B5 } from "./fixtures/hip49485B5.ts";

function observation(overrides: Partial<AnnaPositiveBioObservation> = {}): AnnaPositiveBioObservation {
  return {
    body: { systemAddress: "local-system-1", bodyId: 5 },
    speciesId: "bacterium.tela",
    variantId: "bacterium.tela.yellow",
    bodyType: hip49485B5.bodyType,
    atmosphere: hip49485B5.atmosphere,
    surfaceTemperatureKelvin: hip49485B5.surfaceTemperatureKelvin,
    gravityG: hip49485B5.gravityG,
    surfacePressurePascals: hip49485B5.surfacePressurePascals,
    volcanism: hip49485B5.volcanism,
    biologicalSignalCount: hip49485B5.biologicalSignalCount,
    ...overrides,
  };
}

test("Log, Sample, and Analyse resolve to one positive observation", () => {
  let store = createAnnaLocalEvidenceStore();
  const first = recordAnnaPositiveObservation(store, "commander-a", observation());
  store = first.store;
  const sample = recordAnnaPositiveObservation(store, "commander-a", observation());
  const analyse = recordAnnaPositiveObservation(sample.store, "commander-a", observation());

  assert.equal(first.duplicate, false);
  assert.equal(sample.duplicate, true);
  assert.equal(analyse.duplicate, true);
  assert.equal(aggregateAnnaSpeciesEvidence(analyse.store, "commander-a")[0]?.observationCount, 1);
});

test("the same species on two bodies creates two observations", () => {
  const first = recordAnnaPositiveObservation(createAnnaLocalEvidenceStore(), "commander-a", observation());
  const second = recordAnnaPositiveObservation(first.store, "commander-a", observation({
    body: { systemAddress: "local-system-2", bodyId: 9 },
  }));

  assert.equal(aggregateAnnaSpeciesEvidence(second.store, "commander-a")[0]?.observationCount, 2);
});

test("the same species remains isolated between commanders", () => {
  const first = recordAnnaPositiveObservation(createAnnaLocalEvidenceStore(), "commander-a", observation());
  const second = recordAnnaPositiveObservation(first.store, "commander-b", observation());

  assert.equal(aggregateAnnaSpeciesEvidence(second.store, "commander-a")[0]?.observationCount, 1);
  assert.equal(aggregateAnnaSpeciesEvidence(second.store, "commander-b")[0]?.observationCount, 1);
  assert.notEqual(second.store.commanders["commander-a"], second.store.commanders["commander-b"]);
});

test("different variants of one species are retained separately", () => {
  const first = recordAnnaPositiveObservation(createAnnaLocalEvidenceStore(), "commander-a", observation());
  const second = recordAnnaPositiveObservation(first.store, "commander-a", observation({
    variantId: "bacterium.tela.orange",
  }));
  const aggregate = aggregateAnnaSpeciesEvidence(second.store, "commander-a")[0];

  assert.equal(aggregate?.observationCount, 2);
  assert.deepEqual(aggregate?.variantCounts, {
    "bacterium.tela.yellow": 1,
    "bacterium.tela.orange": 1,
  });
});

test("missing optional environment values remain explicit nulls", () => {
  const recorded = recordAnnaPositiveObservation(createAnnaLocalEvidenceStore(), "commander-a", observation({
    atmosphere: null,
    surfaceTemperatureKelvin: null,
    gravityG: null,
    surfacePressurePascals: null,
    volcanism: null,
    biologicalSignalCount: null,
  }));
  const environment = createAnnaAnonymousEvidenceAggregate(recorded.store, "commander-a").species[0]?.environments[0];

  assert.equal(environment?.atmosphere, null);
  assert.equal(environment?.surfaceTemperatureKelvin, null);
  assert.equal(environment?.gravityG, null);
  assert.equal(environment?.surfacePressurePascals, null);
  assert.equal(environment?.volcanism, null);
  assert.equal(environment?.biologicalSignalCount, null);
});

test("anonymous aggregate contains no commander, system, or body identity", () => {
  const recorded = recordAnnaPositiveObservation(createAnnaLocalEvidenceStore(), "private-commander", observation());
  const aggregate = createAnnaAnonymousEvidenceAggregate(recorded.store, "private-commander");
  const serialized = JSON.stringify(aggregate);

  assert.ok(!serialized.includes("private-commander"));
  assert.ok(!serialized.includes("local-system-1"));
  assert.ok(!serialized.includes('"bodyId"'));
  assert.ok(!serialized.includes('"body"'));
  assert.ok(!serialized.includes('"systemAddress"'));
  assert.ok(!serialized.includes('"timestamp"'));
});

test("absence of ScanOrganic input creates no negative evidence", () => {
  const store = createAnnaLocalEvidenceStore();

  assert.deepEqual(aggregateAnnaSpeciesEvidence(store, "commander-a"), []);
  assert.deepEqual(createAnnaAnonymousEvidenceAggregate(store, "commander-a"), {
    schemaVersion: 1,
    species: [],
  });
  assert.equal(hasAnnaObservation(store, "commander-a", observation()), false);
});
