import assert from "node:assert/strict";
import test from "node:test";

import { createExplorationMessage } from "ogg-core";

test("Anna bio messages distinguish FSS counts, DSS genera, composition scans, and probe stages", () => {
  const fss = createExplorationMessage(
    {
      kind: "biological_signals",
      details: { biologicalSignalCount: 3 },
    },
    "de",
  );
  assert.match(fss, /3/);
  assert.match(fss, /biologische Signale/);

  const dss = createExplorationMessage(
    {
      kind: "known_biological_finding",
      details: { confirmedGenera: ["Bacterium", "Stratum", "Tussock"] },
    },
    "de",
  );
  assert.match(dss, /Bacterium/);
  assert.match(dss, /Stratum/);
  assert.match(dss, /Tussock/);
  assert.doesNotMatch(dss, /3 biologische Signale/);

  const composition = createExplorationMessage(
    {
      kind: "new_biological_finding",
      details: {
        compositionSpecies: "Bacterium Informem",
        codexEntryName: "Bacterium Informem",
        voucherAmount: 900000,
      },
    },
    "de",
  );
  assert.match(composition, /Bacterium Informem/);
  assert.match(composition, /900000/);
  assert.match(composition, /Voucher|Codex/);

  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    const probeOne = createExplorationMessage(
      { kind: "organic_probe_progress", details: { probeStage: 1 } },
      "de",
    );
    const probeTwo = createExplorationMessage(
      { kind: "organic_probe_progress", details: { probeStage: 2 } },
      "de",
    );
    const probeThree = createExplorationMessage(
      { kind: "organic_probe_progress", details: { probeStage: 3 } },
      "de",
    );

    assert.notEqual(probeOne, probeTwo);
    assert.notEqual(probeTwo, probeThree);
    assert.notEqual(probeOne, probeThree);
    assert.doesNotMatch(probeThree, /Probe 3|Erledigt|Erledigt\./);
  } finally {
    Math.random = originalRandom;
  }

  const complete = createExplorationMessage(
    {
      kind: "organic_analysis_complete",
      details: { remainingBiologicalBodies: 2 },
    },
    "de",
  );
  assert.match(complete, /Analyse abgeschlossen|Probe ist ausgewertet|fertig bearbeitet/);
  assert.match(complete, /2/);
});

test("older exploration messages still resolve by kind string for compatibility", () => {
  const message = createExplorationMessage("first_mapping_by_current_commander", "en");
  assert.match(message, /First mapping confirmed/);
});
