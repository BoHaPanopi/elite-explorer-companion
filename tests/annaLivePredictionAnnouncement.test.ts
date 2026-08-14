import assert from "node:assert/strict";
import test from "node:test";
import { AnnaLivePredictionAnnouncer } from "../src/services/AnnaLivePredictionAnnouncer.ts";
import { applyAnnaLiveJournalEvents, createAnnaJournalEvidenceState, getAnnaLivePredictions } from "ogg-core";
import { hip49485B5 } from "./fixtures/hip49485B5.ts";

const commander = () => "local-test";
const scan = { event: "Scan", systemAddress: "2387970023425", bodyId: 5, bodyName: hip49485B5.bodyName, planetClass: hip49485B5.bodyType, atmosphere: hip49485B5.atmosphere, surfaceTemperature: hip49485B5.surfaceTemperatureKelvin, surfaceGravity: hip49485B5.gravityG * 9.80665, surfacePressure: hip49485B5.surfacePressurePascals, volcanism: hip49485B5.volcanism } as const;
const signals = { event: "FSSBodySignals", systemAddress: "2387970023425", bodyId: 5, bodyName: hip49485B5.bodyName, biologicalSignalCount: 1 } as const;

test("FSS Scan and signals trigger one local Anna announcement before DSS or ScanOrganic", async () => {
  const state = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [{ event: "Commander", name: "Commander" }, { event: "Location", systemAddress: "2387970023425" }, scan, signals], commander);
  const predictions = getAnnaLivePredictions(state);
  const spoken: string[] = [];
  const announcer = new AnnaLivePredictionAnnouncer();
  await announcer.announce(predictions, "de", { speak: async (text) => { spoken.push(text); } });
  assert.equal(predictions.length, 1);
  assert.match(spoken[0] ?? "", /Bacterium Acies.*Bacterium Omentum.*Bacterium Tela/);
  await announcer.announce(predictions, "de", { speak: async (text) => { spoken.push(text); } });
  assert.equal(spoken.length, 1);
});

test("a later changed prediction revision may be announced again", async () => {
  const first = applyAnnaLiveJournalEvents(createAnnaJournalEvidenceState(), [{ event: "Commander", name: "Commander" }, { event: "Location", systemAddress: "2387970023425" }, scan, signals], commander);
  const changed = applyAnnaLiveJournalEvents(first, [{ ...scan, atmosphere: "Thin Neon" }], commander);
  const spoken: string[] = [];
  const announcer = new AnnaLivePredictionAnnouncer();
  await announcer.announce(getAnnaLivePredictions(first), "en", { speak: async (text) => { spoken.push(text); } });
  await announcer.announce(getAnnaLivePredictions(changed), "en", { speak: async (text) => { spoken.push(text); } });
  assert.equal(spoken.length, 2);
});
