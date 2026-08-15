import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  adaptEliteJournalEvent,
  CoreStateStore,
  evaluateExobio,
  type EliteJournalFact,
  type ExobioDecision,
} from "ogg-core";

function replay(journal: readonly EliteJournalFact[]): ExobioDecision[] {
  const store = new CoreStateStore();
  const decisions: ExobioDecision[] = [];
  for (const fact of journal) {
    for (const event of adaptEliteJournalEvent(fact)) {
      const previous = store.getState();
      const state = store.dispatch(event);
      decisions.push(...evaluateExobio(event, previous, state));
    }
  }
  return decisions;
}

const historicalReplay: EliteJournalFact[] = [
  { event: "SAASignalsFound", SystemAddress: 100, BodyID: 1, BodyName: "System One 1", Genuses: [{ Genus: "$Codex_Ent_Tussock_Name;" }] },
  { event: "SAASignalsFound", SystemAddress: 100, BodyID: 2, BodyName: "System One 2", Genuses: [{ Genus: "$Codex_Ent_Bacterium_Name;" }, { Genus: "$Codex_Ent_Stratum_Name;" }] },
  { event: "ScanOrganic", SystemAddress: 100, Body: 2, Genus: "$Codex_Ent_Bacterium_Name;", Species: "$Species_Bacterium_Informem_Name;", Variant: "$Variant_Gold_Name;", ScanType: "Log" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 2, Genus: "$Codex_Ent_Bacterium_Name;", Species: "$Species_Bacterium_Informem_Name;", Variant: "$Variant_Gold_Name;", ScanType: "Sample" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 2, Genus: "$Codex_Ent_Bacterium_Name;", Species: "$Species_Bacterium_Informem_Name;", Variant: "$Variant_Gold_Name;", ScanType: "Sample" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 2, Genus: "$Codex_Ent_Bacterium_Name;", Species: "$Species_Bacterium_Informem_Name;", Variant: "$Variant_Gold_Name;", ScanType: "Analyse" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 2, Genus: "$Codex_Ent_Stratum_Name;", Species: "$Species_Stratum_Tectonicas_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Log" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 3, Genus: "$Codex_Ent_Concha_Name;", Species: "$Species_Concha_Labiata_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Log" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 3, Genus: "$Codex_Ent_Concha_Name;", Species: "$Species_Concha_Labiata_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Log" },
  { event: "ScanOrganic", SystemAddress: 100, Body: 3, Genus: "$Codex_Ent_Concha_Name;", Species: "$Species_Concha_Labiata_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Sample" },
  { event: "FSDJump", StarSystem: "System Two", SystemAddress: 200 },
  { event: "ScanOrganic", SystemAddress: 200, Body: 3, Genus: "$Codex_Ent_Concha_Name;", Species: "$Species_Concha_Labiata_Name;", Variant: "$Variant_Standard_Name;", ScanType: "Log" },
];

test("replays confirmed Exobio facts without fixed sample counts or cross-body continuation", () => {
  const first = replay(historicalReplay);
  assert.deepEqual(first, replay(historicalReplay));

  assert.deepEqual(first.filter((decision) => decision.kind === "genusConfirmed"), [
    { kind: "genusConfirmed", body: { systemAddress: "100", bodyId: 1, bodyName: "System One 1" }, genus: "$Codex_Ent_Tussock_Name;" },
    { kind: "genusConfirmed", body: { systemAddress: "100", bodyId: 2, bodyName: "System One 2" }, genus: "$Codex_Ent_Bacterium_Name;" },
    { kind: "genusConfirmed", body: { systemAddress: "100", bodyId: 2, bodyName: "System One 2" }, genus: "$Codex_Ent_Stratum_Name;" },
  ]);

  const completed = first.find((decision) => decision.kind === "organismCompleted");
  assert.deepEqual(completed, {
    kind: "organismCompleted",
    body: { systemAddress: "100", bodyId: 2 },
    organism: { genus: "$Codex_Ent_Bacterium_Name;", species: "$Species_Bacterium_Informem_Name;", variant: "$Variant_Gold_Name;" },
    observedScanTypes: ["Log", "Sample", "Sample", "Analyse"],
  });

  const open = first.filter((decision) => decision.kind === "sampleInProgress");
  assert.equal(open.some((decision) => decision.body.systemAddress === "100" && decision.body.bodyId === 3 && decision.observedScanTypes.join(",") === "Log,Log,Sample"), true);
  assert.equal(open.some((decision) => decision.body.systemAddress === "200" && decision.body.bodyId === 3 && decision.observedScanTypes.join(",") === "Log"), true);
  assert.equal(first.some((decision) => decision.kind === "organismCompleted" && decision.body.bodyId === 3), false);
});

test("the Exobio decision layer stays pure and has no Anna, prediction, or presentation dependency", () => {
  const source = readFileSync("packages/ogg-core/src/exobiology/decision.ts", "utf8");
  assert.doesNotMatch(source, /EliteJournalFact|react|tauri|SpeechService|AnnaEvidenceService|prediction|create.*(?:Text|Voice|Message)|invoke\(/i);
});
