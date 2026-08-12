import assert from "node:assert/strict";
import test from "node:test";

import {
  AnnaEvidenceService,
  annaEvidenceStorageKey,
  annaInstallationSaltStorageKey,
} from "../src/services/AnnaEvidenceService.ts";
import type { AnnaLiveJournalEvent } from "ogg-core";

class MemoryStorage {
  readonly values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
}

const commanderA = { event: "Commander", name: "Commander A" } satisfies AnnaLiveJournalEvent;
const commanderB = { event: "Commander", name: "Commander B" } satisfies AnnaLiveJournalEvent;
const loadCommanderA = { event: "LoadGame", commander: "Commander A" } satisfies AnnaLiveJournalEvent;

function organic(systemAddress = "100", body = 5, variant = "variant.yellow"): AnnaLiveJournalEvent {
  return { event: "ScanOrganic", systemAddress, body, species: "species.tela", variant };
}

test("positive evidence survives a full app restart and same-commander login", () => {
  const storage = new MemoryStorage();
  const firstApp = new AnnaEvidenceService(storage);
  firstApp.process([commanderA, organic()]);
  const firstKey = firstApp.currentCommanderKey();
  assert.equal(firstApp.currentSpeciesEvidence()[0]?.observationCount, 1);
  assert.ok(storage.getItem(annaEvidenceStorageKey));

  const restartedApp = new AnnaEvidenceService(storage);
  assert.deepEqual(restartedApp.currentSpeciesEvidence(), []);
  restartedApp.process([loadCommanderA]);

  assert.equal(restartedApp.currentCommanderKey(), firstKey);
  assert.equal(restartedApp.currentSpeciesEvidence()[0]?.observationCount, 1);
  assert.equal(restartedApp.currentSpeciesEvidence()[0]?.variantCounts["variant.yellow"], 1);
});

test("Elite restart while OGG runs preserves evidence and clears only transient state", () => {
  const service = new AnnaEvidenceService(new MemoryStorage());
  service.process([commanderA, organic()]);
  const key = service.currentCommanderKey();
  service.process([loadCommanderA]);

  assert.equal(service.currentCommanderKey(), key);
  assert.equal(service.currentSpeciesEvidence()[0]?.observationCount, 1);
  assert.deepEqual(service.predictions(), []);
});

test("OGG restart before a later Elite login restores the right commander evidence", () => {
  const storage = new MemoryStorage();
  const first = new AnnaEvidenceService(storage);
  first.process([commanderA, organic()]);

  const restarted = new AnnaEvidenceService(storage);
  restarted.process([loadCommanderA]);
  assert.equal(restarted.currentSpeciesEvidence()[0]?.observationCount, 1);
});

test("Commander A to B to A never exposes A evidence as B evidence", () => {
  const service = new AnnaEvidenceService(new MemoryStorage());
  service.process([commanderA, organic()]);
  const keyA = service.currentCommanderKey();
  service.process([commanderB]);
  const keyB = service.currentCommanderKey();

  assert.notEqual(keyB, keyA);
  assert.deepEqual(service.currentSpeciesEvidence(), []);
  assert.deepEqual(service.currentAnonymousAggregate().species, []);

  service.process([commanderA]);
  assert.equal(service.currentCommanderKey(), keyA);
  assert.equal(service.currentSpeciesEvidence()[0]?.observationCount, 1);
});

test("installation salt and local commander key stay stable across restarts", () => {
  const storage = new MemoryStorage();
  const first = new AnnaEvidenceService(storage);
  first.process([commanderA]);
  const salt = storage.getItem(annaInstallationSaltStorageKey);
  const key = first.currentCommanderKey();

  const restarted = new AnnaEvidenceService(storage);
  restarted.process([commanderA]);
  assert.ok(salt);
  assert.equal(storage.getItem(annaInstallationSaltStorageKey), salt);
  assert.equal(restarted.currentCommanderKey(), key);
});

test("restart deduplication keeps old observations once and appends new bodies", () => {
  const storage = new MemoryStorage();
  const first = new AnnaEvidenceService(storage);
  first.process([commanderA, organic()]);

  const restarted = new AnnaEvidenceService(storage);
  restarted.process([commanderA, organic(), organic(), organic("100", 6, "variant.orange")]);
  const aggregate = restarted.currentSpeciesEvidence()[0];
  assert.equal(aggregate?.observationCount, 2);
  assert.equal(aggregate?.variantCounts["variant.yellow"], 1);
  assert.equal(aggregate?.variantCounts["variant.orange"], 1);
});

test("corrupt or structurally invalid persistence fails closed without crashing", () => {
  for (const persisted of ["not-json", "null", "[]", '{"commanders":{"bad":{"observations":{"x":{"speciesId":7}}}}}', '{"commanders":{"bad":{"observations":{"wrong-id":{"body":{"systemAddress":"1","bodyId":1},"speciesId":"s","variantId":null,"bodyType":null,"atmosphere":null,"surfaceTemperatureKelvin":null,"gravityG":null,"surfacePressurePascals":null,"volcanism":null,"biologicalSignalCount":null}}}}}']) {
    const storage = new MemoryStorage();
    storage.setItem(annaEvidenceStorageKey, persisted);
    const service = new AnnaEvidenceService(storage);
    assert.doesNotThrow(() => service.process([commanderA]));
    assert.deepEqual(service.currentSpeciesEvidence(), []);
  }
});

test("anonymous aggregate remains free of local identities after persistence reload", () => {
  const storage = new MemoryStorage();
  const first = new AnnaEvidenceService(storage);
  first.process([commanderA, organic("private-system", 42)]);
  const restarted = new AnnaEvidenceService(storage);
  restarted.process([commanderA]);
  const serialized = JSON.stringify(restarted.currentAnonymousAggregate());

  assert.ok(!serialized.includes("Commander A"));
  assert.ok(!serialized.includes("private-system"));
  assert.ok(!serialized.includes('"bodyId"'));
  assert.ok(!serialized.includes('"systemAddress"'));
  assert.ok(!serialized.includes('"commander"'));
});
