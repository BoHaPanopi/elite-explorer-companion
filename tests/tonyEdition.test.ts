import assert from "node:assert/strict";
import test from "node:test";

import {
  createTonyStartupGreeting,
  createTonyTacticalText,
  getTonyTacticalComment,
  getTonyWelcomeMessage,
  isTonySeason,
  resolveOggMode,
  resolveTonyProfile,
  selectCommanderIdentity,
  seasonalMessage,
  tonySeasonalStorageKey,
  tonyWelcomeStorageKey,
} from "../src/features/tonyEdition.ts";
import { createExplorationMessage, type ExplorationObservationKind } from "ogg-core";

test("activates only for the two Tony commander identities", () => {
  assert.equal(resolveTonyProfile("Helitony"), "helitony");
  assert.equal(resolveTonyProfile("helitony"), "helitony");
  assert.equal(resolveTonyProfile("HELITONY"), "helitony");
  assert.equal(resolveTonyProfile("hELiToNy2"), "helitony2");
  assert.equal(resolveTonyProfile("CMDR Helitony"), null);
  assert.equal(resolveTonyProfile("Helitony2"), "helitony2");
  assert.equal(resolveTonyProfile("Helitony 2"), null);
  assert.equal(resolveTonyProfile("Helitony "), null);
  assert.equal(resolveTonyProfile("xHelitony"), null);
  assert.equal(resolveTonyProfile("Helitony 3"), null);
  assert.equal(resolveTonyProfile("Panopi"), null);
  assert.equal(resolveTonyProfile(null), null);
});

test("uses separate permanent welcome markers for both commanders", () => {
  assert.notEqual(tonyWelcomeStorageKey("helitony"), tonyWelcomeStorageKey("helitony2"));
  assert.match(getTonyWelcomeMessage("helitony"), /Welcome aboard, Tony/);
  assert.match(getTonyWelcomeMessage("helitony2"), /Welcome back, Tony/);
});

test("shows the seasonal reminder only from December 1 through December 26", () => {
  assert.equal(isTonySeason(new Date(2026, 10, 30)), false);
  assert.equal(isTonySeason(new Date(2026, 11, 1)), true);
  assert.equal(isTonySeason(new Date(2026, 11, 26)), true);
  assert.equal(isTonySeason(new Date(2026, 11, 27)), false);
  assert.notEqual(tonySeasonalStorageKey(2026), tonySeasonalStorageKey(2027));
});

test("forces English OGG output only for the exact Tony identities", () => {
  assert.deepEqual(resolveOggMode("Helitony", "de"), { language: "en", mode: "tony", tonyProfile: "helitony" });
  assert.deepEqual(resolveOggMode("helitony2", "de"), { language: "en", mode: "tony", tonyProfile: "helitony2" });
  assert.deepEqual(resolveOggMode("CMDR Helitony", "de"), { language: "de", mode: "standard", tonyProfile: null });
  assert.deepEqual(resolveOggMode("Panopi", "en"), { language: "en", mode: "standard", tonyProfile: null });
});

test("restores the last known Tony identity until the journal reports a commander", () => {
  assert.equal(selectCommanderIdentity(null, "helitony"), "helitony");
  assert.equal(resolveOggMode(selectCommanderIdentity(null, "helitony"), "de").mode, "tony");
  assert.equal(selectCommanderIdentity(undefined, "Helitony2"), "Helitony2");
  assert.equal(resolveOggMode(selectCommanderIdentity(undefined, "Helitony2"), "de").language, "en");
  assert.equal(selectCommanderIdentity("Panopi", "helitony"), "Panopi");
  assert.equal(resolveOggMode(selectCommanderIdentity("Panopi", "helitony"), "de").mode, "standard");
});

test("Tony greetings are English and never repeat the same variant directly", () => {
  const greetings = Array.from({ length: 18 }, () =>
    createTonyStartupGreeting({
      bordcomputerName: "Old Guy of Grumpy",
      commanderName: "Helitony",
      isReturning: true,
    }).join(" "),
  );

  for (const greeting of greetings) {
    assert.match(greeting, /Onboard computer Old Guy of Grumpy/);
    assert.match(greeting, /Commander Helitony/);
  }

  for (let index = 1; index < greetings.length; index += 1) {
    assert.notEqual(greetings[index], greetings[index - 1]);
  }
});

test("no Bavarian OGG line can enter any Tony-specific output", () => {
  const explorationKinds: ExplorationObservationKind[] = [
    "first_discovery_by_current_commander",
    "already_discovered",
    "discovery_ownership_unknown",
    "scanned_not_mapped",
    "first_mapping_by_current_commander",
    "already_mapped",
    "mapping_ownership_unknown",
    "biological_signals",
    "known_biological_finding",
    "new_biological_finding",
  ];
  const outputs = [
    getTonyWelcomeMessage("helitony"),
    getTonyWelcomeMessage("helitony2"),
    seasonalMessage,
    ...(["green", "yellow", "orange", "red"] as const).map(getTonyTacticalComment),
    ...explorationKinds.map((kind) => createExplorationMessage(kind, "en")),
  ];
  const forbidden = [
    /\b(des|ned|scho|do|koana|unsara|gscannt|neia|kartographiert)\b/i,
    /[Ã¤Ã¶Ã¼ÃŸ]/i,
  ];

  for (const output of outputs) {
    for (const pattern of forbidden) assert.doesNotMatch(output, pattern);
  }
});

test("both Tony profiles receive a fully English tactical assessment", () => {
  const target = {
    pilotName: "Dread Pirate Roberts",
    shipName: "Viper",
    combatRank: "Competent",
    legalStatus: "Wanted" as const,
    bounty: 82500,
    missionTarget: true,
    wingSize: 1,
    isPlayer: false,
  };

  for (const commander of ["Helitony", "Helitony2"] as const) {
    assert.ok(resolveTonyProfile(commander));
    const result = createTonyTacticalText(target, "green");
    assert.match(result.title, /^Mission target:/);
    assert.match(result.detail, /^Mission target/);
    assert.match(result.opponentWarning, /You scanned us/);
    assert.doesNotMatch(Object.values(result).join(" "), /\b(Missionsziel|Gesucht|Sie haben|De hom|ned|Jedzd|Do pfeift)\b/i);
  }
});

test("other commanders keep the normal language-dependent OGG output", () => {
  const kind: ExplorationObservationKind = "already_discovered";
  assert.equal(resolveOggMode("Panopi", "de").language, "de");
  assert.equal(
    createExplorationMessage(kind, resolveOggMode("Panopi", "de").language),
    "Do war scho a anderer CMDR.",
  );
  assert.equal(
    createExplorationMessage(kind, resolveOggMode("Panopi", "en").language),
    "Another CMDR has already been here.",
  );
});
