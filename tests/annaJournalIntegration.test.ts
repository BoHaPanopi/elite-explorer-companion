import assert from "node:assert/strict";
import test from "node:test";

import {
  aggregateAnnaSpeciesEvidence,
  applyAnnaLiveJournalEvents,
  createAnnaJournalEvidenceState,
  type AnnaLiveJournalEvent,
} from "ogg-core";
import { AnnaEvidenceService, annaEvidenceStorageKey } from "../src/services/AnnaEvidenceService.ts";

const commanderKey = (name: string) => `key:${name.toLowerCase()}`;
const baseEvents: AnnaLiveJournalEvent[] = [
  { event: "LoadGame", commander: "Explorer" },
  { event: "Location", systemAddress: "100" },
  { event: "Scan", systemAddress: "100", bodyId: 5, planetClass: "Icy body", atmosphere: "thin neon atmosphere", surfaceTemperature: 56.09, surfaceGravity: 4.461, surfacePressure: null, volcanism: "minor nitrogen magma volcanism" },
  { event: "FSSBodySignals", systemAddress: "100", bodyId: 5, biologicalSignalCount: 1 },
];

test("Scan, signals, and ScanOrganic create linked positive evidence", () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [...baseEvents,
    { event: "ScanOrganic", systemAddress: "100", body: 5, species: "species.tela", variant: "variant.yellow" },
  ], commanderKey);
  const observation = Object.values(state.evidence.commanders["key:explorer"]?.observations ?? {})[0];
  assert.equal(observation?.bodyType, "Icy body");
  assert.equal(observation?.biologicalSignalCount, 1);
  assert.equal(observation?.speciesId, "species.tela");
});

test("Log, Sample, and Analyse remain one observation", () => {
  const organic = { event: "ScanOrganic", systemAddress: "100", body: 5, species: "species.tela", variant: "variant.yellow" };
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [...baseEvents, organic, organic, organic], commanderKey);
  assert.equal(aggregateAnnaSpeciesEvidence(state.evidence, "key:explorer")[0]?.observationCount, 1);
});

test("later Scan stages enrich one planet before ScanOrganic", () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [
    { event: "Commander", name: "Explorer" },
    { event: "Location", systemAddress: "100" },
    { event: "Scan", bodyId: 5, planetClass: "Icy body", surfaceTemperature: 56.09 },
    { event: "Scan", bodyId: 5, atmosphere: "thin neon atmosphere", volcanism: "minor nitrogen magma volcanism" },
    { event: "ScanOrganic", body: 5, species: "species.tela", variant: "variant.yellow" },
  ], commanderKey);
  const observation = Object.values(state.evidence.commanders["key:explorer"]?.observations ?? {})[0];

  assert.equal(observation?.bodyType, "Icy body");
  assert.equal(observation?.atmosphere, "thin neon atmosphere");
  assert.equal(observation?.surfaceTemperatureKelvin, 56.09);
  assert.equal(observation?.volcanism, "minor nitrogen magma volcanism");
});

test("persisted evidence survives a service restart", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const originalCrypto = globalThis.crypto;
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues: (array: Uint32Array) => array.fill(7) } });
  try {
    const first = new AnnaEvidenceService(storage);
    first.process([...baseEvents, { event: "ScanOrganic", systemAddress: "100", body: 5, species: "species.tela", variant: "variant.yellow" }]);
    const restarted = new AnnaEvidenceService(storage);
    assert.equal(Object.keys(restarted.evidence().commanders).length, 1);
    assert.ok(values.has(annaEvidenceStorageKey));
  } finally { Object.defineProperty(globalThis, "crypto", { configurable: true, value: originalCrypto }); }
});

test("two commanders remain separated", () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [
    ...baseEvents,
    { event: "ScanOrganic", systemAddress: "100", body: 5, species: "species.tela", variant: "variant.yellow" },
    { event: "Commander", name: "Second" },
    { event: "ScanOrganic", systemAddress: "100", body: 5, species: "species.tela", variant: "variant.yellow" },
  ], commanderKey);
  assert.equal(Object.keys(state.evidence.commanders).length, 2);
});

test("system changes keep equal body IDs distinct", () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [
    { event: "Commander", name: "Explorer" },
    { event: "FSDJump", systemAddress: "100" },
    { event: "ScanOrganic", body: 5, species: "species.tela", variant: "variant.yellow" },
    { event: "FSDJump", systemAddress: "200" },
    { event: "ScanOrganic", body: 5, species: "species.tela", variant: "variant.yellow" },
  ], commanderKey);
  assert.equal(aggregateAnnaSpeciesEvidence(state.evidence, "key:explorer")[0]?.observationCount, 2);
});

test("missing planet data remains null while safe body identity is recorded", () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [
    { event: "Commander", name: "Explorer" }, { event: "Location", systemAddress: "100" },
    { event: "ScanOrganic", body: 5, species: "species.tela", variant: null },
  ], commanderKey);
  const observation = Object.values(state.evidence.commanders["key:explorer"]?.observations ?? {})[0];
  assert.equal(observation?.atmosphere, null);
  assert.equal(observation?.gravityG, null);
});

test("events without ScanOrganic create no evidence", () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), baseEvents, commanderKey);
  assert.deepEqual(state.evidence.commanders, {});
});
