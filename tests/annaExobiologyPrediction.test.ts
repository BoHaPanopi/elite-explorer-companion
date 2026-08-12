import assert from "node:assert/strict";
import test from "node:test";

import {
  annaBacteriumKnowledgePhase2B,
  predictAnnaBiology,
  type AnnaBioKnowledgeBase,
} from "ogg-core";

import { hip49485B5 } from "./fixtures/hip49485B5.ts";

const emptyPhaseOneKnowledgeBase: AnnaBioKnowledgeBase = {
  schemaVersion: 1,
  revision: "phase-1-empty",
  rules: [],
};

test("represents every available FSS value for HIP 49485 B 5", () => {
  assert.deepEqual(hip49485B5, {
    bodyName: "HIP 49485 B 5",
    bodyType: "Icy body",
    atmosphere: "Neon atmosphere",
    surfaceTemperatureKelvin: 56.09,
    gravityG: 0.455,
    surfacePressurePascals: null,
    volcanism: "minor nitrogen magma volcanism",
    biologicalSignalCount: 1,
  });
});

test("returns a reproducible empty prediction without phase-one species rules", () => {
  const first = predictAnnaBiology(hip49485B5, emptyPhaseOneKnowledgeBase);
  const second = predictAnnaBiology(hip49485B5, emptyPhaseOneKnowledgeBase);

  assert.deepEqual(first, {
    bodyName: "HIP 49485 B 5",
    knowledgeBaseSchemaVersion: 1,
    knowledgeBaseRevision: "phase-1-empty",
    candidates: [],
  });
  assert.deepEqual(second, first);
});

test("evaluates injected rules without changing the planet or knowledge base", () => {
  const rule: AnnaBioKnowledgeBase["rules"][number] = {
    id: "test.fixture-is-known",
    candidate: { id: "test-candidate", displayName: "Test candidate" },
    evidenceStatus: "insufficient-data",
    conditions: { bodyTypes: ["Icy body"] },
  };
  const knowledgeBase: AnnaBioKnowledgeBase = {
    schemaVersion: 1,
    revision: "test-only",
    rules: [rule],
  };
  const planetBefore = structuredClone(hip49485B5);

  const result = predictAnnaBiology(hip49485B5, knowledgeBase);

  assert.deepEqual(result.candidates, [
    { id: "test-candidate", displayName: "Test candidate", evidenceStatus: "insufficient-data" },
  ]);
  assert.deepEqual(hip49485B5, planetBefore);
  assert.equal(knowledgeBase.rules[0], rule);
  assert.notEqual(result.candidates[0], rule.candidate);
});

test("rejects a synthetic candidate when a declarative condition does not match", () => {
  const knowledgeBase: AnnaBioKnowledgeBase = {
    schemaVersion: 1,
    revision: "test-only",
    rules: [{
      id: "test.other-body-type",
      candidate: { id: "other-test-candidate", displayName: "Other test candidate" },
      evidenceStatus: "confirmed-rule",
      conditions: { bodyTypes: ["Test body type"] },
    }],
  };

  assert.deepEqual(predictAnnaBiology(hip49485B5, knowledgeBase).candidates, []);
});

test("returns a candidate only once when multiple test rules match it", () => {
  const candidate = { id: "test-candidate", displayName: "Test candidate" };
  const knowledgeBase: AnnaBioKnowledgeBase = {
    schemaVersion: 1,
    revision: "test-only",
    rules: [
      { id: "test.first-path", candidate, evidenceStatus: "confirmed-rule", conditions: { bodyTypes: ["Icy body"] } },
      { id: "test.second-path", candidate, evidenceStatus: "confirmed-rule", conditions: { atmospheres: ["Neon atmosphere"] } },
    ],
  };

  assert.deepEqual(predictAnnaBiology(hip49485B5, knowledgeBase).candidates, [{
    ...candidate,
    evidenceStatus: "confirmed-rule",
  }]);
});

function withFixture(overrides: Partial<typeof hip49485B5>) {
  return { ...hip49485B5, ...overrides };
}

function candidateNames(overrides: Partial<typeof hip49485B5> = {}) {
  return predictAnnaBiology(
    withFixture(overrides),
    annaBacteriumKnowledgePhase2B,
  ).candidates.map((candidate) => candidate.displayName);
}

test("Neon atmosphere allows Bacterium Acies", () => {
  assert.ok(candidateNames().includes("Bacterium Acies"));
});

test("a non-Neon atmosphere rejects Bacterium Acies", () => {
  assert.ok(!candidateNames({ atmosphere: "Argon atmosphere", bodyName: "Synthetic body" }).includes("Bacterium Acies"));
});

test("Neon with nitrogen volcanism allows Bacterium Omentum", () => {
  assert.ok(candidateNames({ volcanism: "minor nitrogen magma volcanism" }).includes("Bacterium Omentum"));
});

test("Neon with ammonia volcanism allows Bacterium Omentum", () => {
  assert.ok(candidateNames({ volcanism: "major ammonia magma volcanism" }).includes("Bacterium Omentum"));
});

test("Helium with nitrogen volcanism keeps Omentum as an empirical candidate", () => {
  assert.ok(candidateNames({
    atmosphere: "thin helium atmosphere",
    volcanism: "minor nitrogen magma volcanism",
    bodyName: "Synthetic body",
  }).includes("Bacterium Omentum"));
});

test("Methane with nitrogen volcanism keeps Omentum as an empirical candidate", () => {
  assert.ok(candidateNames({
    atmosphere: "thin methane atmosphere",
    volcanism: "minor nitrogen magma volcanism",
    bodyName: "Synthetic body",
  }).includes("Bacterium Omentum"));
});

test("Neon without matching volcanism rejects Bacterium Omentum", () => {
  assert.ok(!candidateNames({ volcanism: "water magma volcanism", bodyName: "Synthetic body" }).includes("Bacterium Omentum"));
});

test("HIP 49485 B 5 yields exactly Acies, Omentum, and Tela", () => {
  assert.deepEqual(candidateNames(), [
    "Bacterium Acies",
    "Bacterium Omentum",
    "Bacterium Tela",
  ]);
});

test("candidate evidence distinguishes a confirmed rule from positive observations", () => {
  const result = predictAnnaBiology(
    hip49485B5,
    annaBacteriumKnowledgePhase2B,
  );
  const acies = result.candidates.find((candidate) => candidate.id === "bacterium.acies");
  const omentum = result.candidates.find((candidate) => candidate.id === "bacterium.omentum");
  const tela = predictAnnaBiology(
    hip49485B5,
    annaBacteriumKnowledgePhase2B,
  ).candidates.find((candidate) => candidate.id === "bacterium.tela");

  assert.deepEqual(acies, {
    id: "bacterium.acies",
    displayName: "Bacterium Acies",
    evidenceStatus: "confirmed-rule",
    supportingPlanetCount: 9,
  });
  assert.equal(omentum?.evidenceStatus, "positive-observation");
  assert.equal(tela?.evidenceStatus, "positive-observation");
  assert.equal(tela?.supportingPlanetCount, 2);
});
