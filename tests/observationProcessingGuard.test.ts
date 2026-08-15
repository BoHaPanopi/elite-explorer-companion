import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  advanceObservationProcessingState,
  type ObservationProcessingDecision,
  type ObservationProcessingState,
} from "../src/features/exploration/observationProcessingGuard.ts";

function runSequence(sequence: Array<string | null>) {
  let state: ObservationProcessingState = {
    baselineReady: false,
    lastProcessedObservationId: null,
    lastAlreadyProcessedLoggedObservationId: null,
  };

  const decisions: ObservationProcessingDecision[] = [];

  for (const observationId of sequence) {
    const transition = advanceObservationProcessingState(state, observationId);
    decisions.push(transition.decision);
    state = transition.nextState;
  }

  return { decisions, state };
}

test("same baseline observation delivered 100x is skipped once and never reprocessed", () => {
  const observationId = "2026-08-11T15:36:36Z:ScanOrganic:6:OrganicProbeProgress:1:Bacterium Informem::";
  const { decisions } = runSequence(new Array(100).fill(observationId));

  const baselineSkips = decisions.filter((decision) => decision === "baseline_initialization_skip").length;
  const alreadyProcessed = decisions.filter((decision) => decision === "observation_already_processed").length;
  const suppressed = decisions.filter((decision) => decision === "already_processed_suppressed").length;
  const processed = decisions.filter((decision) => decision === "process_new_observation").length;

  assert.equal(baselineSkips, 1);
  assert.equal(alreadyProcessed, 1);
  assert.equal(suppressed, 98);
  assert.equal(processed, 0);
});

test("new observation after empty baseline is processed once even if delivered 100x", () => {
  const observationId = "probe:stage:1";
  const { decisions } = runSequence([null, ...new Array(100).fill(observationId)]);

  const baselineSkips = decisions.filter((decision) => decision === "baseline_initialization_skip").length;
  const processed = decisions.filter((decision) => decision === "process_new_observation").length;
  const alreadyProcessed = decisions.filter((decision) => decision === "observation_already_processed").length;
  const suppressed = decisions.filter((decision) => decision === "already_processed_suppressed").length;

  assert.equal(baselineSkips, 1);
  assert.equal(processed, 1);
  assert.equal(alreadyProcessed, 1);
  assert.equal(suppressed, 98);
});

test("duplicate already-processed diagnostics are emitted at most once per unchanged observationId", () => {
  const observationId = "same-id";
  const { decisions } = runSequence([null, observationId, observationId, observationId, observationId]);

  const alreadyProcessed = decisions.filter((decision) => decision === "observation_already_processed").length;
  assert.equal(alreadyProcessed, 1);
});

test("heartbeat or UI rerenders with unchanged id stay suppressed", () => {
  const { decisions } = runSequence([null, "stable", "stable", "stable", "stable", "stable"]);

  assert.deepEqual(decisions, [
    "baseline_initialization_skip",
    "process_new_observation",
    "observation_already_processed",
    "already_processed_suppressed",
    "already_processed_suppressed",
    "already_processed_suppressed",
  ]);
});

test("probe stage 1, 2 and 3 observation ids are each processed exactly once", () => {
  const probe1 = "2026-08-11T15:36:36Z:ScanOrganic:6:OrganicProbeProgress:1:Bacterium Informem::";
  const probe2 = "2026-08-11T15:37:36Z:ScanOrganic:6:OrganicProbeProgress:2:Bacterium Informem::";
  const probe3 = "2026-08-11T15:38:36Z:ScanOrganic:6:OrganicProbeProgress:3:Bacterium Informem::";
  const { decisions } = runSequence([null, probe1, probe1, probe2, probe2, probe3, probe3]);

  const processed = decisions.filter((decision) => decision === "process_new_observation").length;
  assert.equal(processed, 3);
});

test("identical event duplicates are deduplicated while new stage still processes", () => {
  const probe1 = "probe:1";
  const probe2 = "probe:2";
  const { decisions } = runSequence([null, probe1, probe1, probe1, probe2]);

  assert.deepEqual(decisions, [
    "baseline_initialization_skip",
    "process_new_observation",
    "observation_already_processed",
    "already_processed_suppressed",
    "process_new_observation",
  ]);
});

test("baseline initialization skip happens exactly once and next stage is processed", () => {
  const probe1 = "probe:1";
  const probe2 = "probe:2";
  const { decisions } = runSequence([probe1, probe1, probe2]);

  const baselineSkips = decisions.filter((decision) => decision === "baseline_initialization_skip").length;
  assert.equal(baselineSkips, 1);
  assert.deepEqual(decisions, [
    "baseline_initialization_skip",
    "observation_already_processed",
    "process_new_observation",
  ]);
});

test("Anna consumes the separated Exobio observation id instead of the legacy mixed stream", () => {
  const appSource = readFileSync("src/App.tsx", "utf8");

  assert.match(appSource, /snapshot\?\.exploration\.exobio\.latestExobioObservation\?\.id/);
  assert.match(appSource, /latestObservation:\s*\{/);
  assert.doesNotMatch(appSource, /const observation = snapshot\?\.exploration\.latestObservation/);
});
