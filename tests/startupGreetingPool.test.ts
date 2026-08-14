import assert from "node:assert/strict";
import test from "node:test";
import {
  createStartupGreeting,
  OGG_START_POOL,
  OGG_START_SUFFIX_POOL,
  PANOPI_START_LINE,
  TONY_START_POOL,
  createTonyStartupGreeting,
} from "ogg-core";

test("normal OGG commanders receive only lines from the expandable OGG start pool", () => {
  const greetings = Array.from({ length: 24 }, () => createStartupGreeting({ bordcomputerName: "OGG", commanderName: "Rika", isReturning: false }).join(" "));
  assert.ok(greetings.every((greeting) => OGG_START_POOL.some((line) => greeting.startsWith(line.replace("{Name}", "Rika")))));
  assert.ok(greetings.every((greeting) => !TONY_START_POOL.includes(greeting as never)));
});

test("Panopi is case-insensitive, personal, and never receives a formal commander prefix", () => {
  for (const name of ["panopi", "PanOPi", "PANOPI"]) {
    const greeting = createStartupGreeting({ bordcomputerName: "OGG", commanderName: name, isReturning: false }).join(" ");
    assert.match(greeting, new RegExp(PANOPI_START_LINE));
    assert.doesNotMatch(greeting, /(?:Commander|CMDR)\s+Panopi/i);
  }
});

test("optional suffixes are separate from the OGG start pool and are not mandatory", () => {
  const noSuffix = createStartupGreeting({ bordcomputerName: "OGG", commanderName: "Rika", isReturning: false, random: () => 0.9 });
  const withSuffix = createStartupGreeting({ bordcomputerName: "OGG", commanderName: "Rika", isReturning: false, random: () => 0 });
  assert.equal(noSuffix.length, 1);
  assert.equal(withSuffix.length, 2);
  assert.ok(OGG_START_SUFFIX_POOL.includes(withSuffix[1] as never));
});

test("Tony start lines are reserved for the exact two Tony identities and avoid formal prefixes", () => {
  for (const name of ["helitony", "HELITONY2"]) {
    const greetings = Array.from({ length: 20 }, () => createTonyStartupGreeting({ bordcomputerName: "OGG", commanderName: name, isReturning: false, random: () => 0 }).join(" "));
    for (const greeting of greetings) assert.doesNotMatch(greeting, /\b(?:Commander|CMDR|Captain)\b/i);
    for (const special of TONY_START_POOL) assert.ok(greetings.some((greeting) => greeting.includes(special)));
  }
});
