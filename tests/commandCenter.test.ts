import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { createLocalDataFlowStatus, hasActiveTransmission, hasExternalApproval } from "../src/features/dataFlowStatus.ts";
import { careerRankName, explorationRankName } from "../src/features/explorationRank.ts";
import { resolveExploreRankAsset, resolveRankAsset, resolveShipAsset } from "../src/features/frontierAssets.ts";
import { persistMissionProfile, rankCategoriesForProfile, readMissionProfile } from "../src/features/missionProfile.ts";

test("maps exploration rank data without requiring a Frontier badge", () => {
  assert.equal(explorationRankName(7, "de"), "Pionier");
  assert.equal(resolveExploreRankAsset(7), null);
});

test("resolves official ship imagery centrally while keeping unknown types optional", () => {
  assert.match(resolveShipAsset("Krait_MkII")?.src ?? "", /krait-mk-ii\.webp$/);
  assert.match(resolveShipAsset("Explorer_NX")?.src ?? "", /caspian-explorer\.webp$/);
  assert.equal(resolveShipAsset("unknown_future_ship"), null);
  assert.equal(resolveShipAsset(null), null);
});

test("exploration profile displays Explore and Exobiologist as equal rank categories", () => {
  assert.deepEqual(rankCategoriesForProfile("exploration"), ["explore", "exobiologist"]);
  assert.equal(careerRankName("explore", 7, "de"), "Pionier");
  assert.equal(careerRankName("exobiologist", 5, "de"), "Taxonomist");
});

test("trade and combat profiles display only their matching rank", () => {
  assert.deepEqual(rankCategoriesForProfile("trade"), ["trade"]);
  assert.deepEqual(rankCategoriesForProfile("combat"), ["combat"]);
  assert.equal(careerRankName("trade", 4, "de"), "Merchant");
  assert.equal(careerRankName("combat", 3, "de"), "Competent");
});

test("missing rank values and all four missing Frontier categories remain neutral", () => {
  assert.equal(careerRankName("explore", null, "de"), null);
  for (const category of ["explore", "exobiologist", "trade", "combat"] as const) {
    assert.equal(resolveRankAsset(category, 5), null);
  }
});

test("profile changes persist and update the selected rank categories", () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) };
  assert.equal(readMissionProfile(storage), "exploration");
  persistMissionProfile(storage, "trade");
  assert.equal(readMissionProfile(storage), "trade");
  assert.deepEqual(rankCategoriesForProfile(readMissionProfile(storage)), ["trade"]);
  persistMissionProfile(storage, "combat");
  assert.deepEqual(rankCategoriesForProfile(readMissionProfile(storage)), ["combat"]);

  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const dashboard = readFileSync(new URL("../src/components/Dashboard.tsx", import.meta.url), "utf8");
  assert.match(app, /setMissionProfile\(profile\)/);
  assert.match(app, /activeProfile=\{missionProfile\}/);
  assert.match(dashboard, /rankCategoriesForProfile\(props\.activeProfile\)/);
});

test("dual exploration ranks use the intended desktop two-column layout", () => {
  const dashboard = readFileSync(new URL("../src/components/Dashboard.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");
  assert.match(dashboard, /commander-ranks--dual/);
  assert.match(css, /\.commander-ranks--dual\s*\{\s*grid-template-columns:\s*repeat\(2,/);
  assert.match(css, /@media \(max-width: 560px\)[\s\S]*\.commander-ranks--dual\s*\{\s*grid-template-columns:\s*1fr;/);
});

test("the third row keeps commander and journey side by side with vertical rank progress", () => {
  const dashboard = readFileSync(new URL("../src/components/Dashboard.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");
  assert.match(dashboard, /<strong>\{name \?\? copy\.unknown\}<\/strong>/);
  assert.match(dashboard, /<small>\{rank\.progress\} %<\/small>/);
  assert.match(css, /grid-template-areas:\s*\n\s*"commander journey"\s*\n\s*"ship ship"/);
  assert.match(css, /\.command-card--commander\s*\{\s*grid-area:\s*commander/);
  assert.match(css, /\.command-card--journey\s*\{\s*grid-area:\s*journey/);
});

test("local crew journal processing does not imply an external approval or transmission", () => {
  const status = createLocalDataFlowStatus(true);
  assert.equal(status.journalAccess, true);
  assert.equal(status.internalProcessing, true);
  assert.equal(hasExternalApproval(status), false);
  assert.equal(hasActiveTransmission(status), false);
});

test("the Command Center uses ShipIdent and never exposes the numeric ShipID", () => {
  const app = readFileSync(new URL("../src/App.tsx", import.meta.url), "utf8");
  const dashboard = readFileSync(new URL("../src/components/Dashboard.tsx", import.meta.url), "utf8");
  assert.match(app, /shipIdent/);
  assert.match(dashboard, /props\.shipIdent/);
  assert.doesNotMatch(dashboard, /\bShipID\b|\bshipId\b/);
});

test("the current ship card keeps the resolved Frontier asset as a wide ship view", () => {
  const dashboard = readFileSync(new URL("../src/components/Dashboard.tsx", import.meta.url), "utf8");
  const css = readFileSync(new URL("../src/App.css", import.meta.url), "utf8");
  assert.match(dashboard, /command-card--ship/);
  assert.match(dashboard, /resolveShipAsset\(props\.ship\)/);
  assert.match(dashboard, /command-card__ship-asset/);
  assert.match(dashboard, /command-card__ship-details/);
  assert.match(dashboard, /command-card__ship-layout/);
  assert.match(css, /\.command-card__ship-asset\s*\{[\s\S]*object-fit:\s*contain/);
  assert.match(css, /\.command-card__ship-layout\s*\{\s*display:\s*grid;[\s\S]*grid-template-columns:\s*minmax\(0, 1\.35fr\) minmax\(220px, 0\.65fr\)/);
  assert.match(css, /\.command-card__ship-details\s*\{[\s\S]*text-align:\s*center/);
});

test("the data-flow detail keeps internal crew processing separate from external grants", () => {
  const component = readFileSync(new URL("../src/components/DataFlowStatus.tsx", import.meta.url), "utf8");
  const copy = readFileSync(new URL("../src/content/commandCenter.ts", import.meta.url), "utf8");
  assert.match(component, /copy\.internal/);
  assert.match(component, /copy\.external/);
  assert.match(copy, /Willi · Navigation und Reisehistorie/);
  assert.match(copy, /Keine externe Freigabe/);
  assert.match(copy, /Keine tatsächliche Übertragung/);
});
