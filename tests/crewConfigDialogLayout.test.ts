import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dialogPath = join(process.cwd(), "src", "components", "CrewConfigDialog.tsx");
const cssPath = join(process.cwd(), "src", "App.css");
const profilesPath = join(process.cwd(), "src", "features", "crewProfiles.ts");

test("crew detail header contains only the requested voice test action", () => {
  const source = readFileSync(dialogPath, "utf8");

  assert.match(source, /className="crew-config-variants__test-voice"/);
  assert.match(source, />\s*Stimme testen\s*</);
  assert.match(source, /aria-label="Stimme testen"/);
  assert.doesNotMatch(source, /Beispielsatz|H[oö]re dir einen/i);
});

test("selected variant shows the cyan checkmark only for active locale", () => {
  const source = readFileSync(dialogPath, "utf8");

  assert.match(source, /const isActiveVariant = isCrewLocaleActive\(/);
  assert.match(source, /\{isActiveVariant && \(/);
  assert.match(source, /className="crew-variant-button__check"/);
  assert.match(source, /isActiveVariant\s*\?\s*" crew-variant-button--selected"\s*:\s*""/);
  assert.match(source, />\s*✓\s*</);
});

test("variant grid remains two-column in desktop layout", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /\.crew-config-variants__buttons\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
});

test("approved detail-card header structure remains portrait, centered identity, and test-voice action", () => {
  const source = readFileSync(dialogPath, "utf8");
  const headerBlock = source.match(/<header className="crew-config-variants__header">([\s\S]*?)<\/header>/);

  assert.ok(headerBlock, "Missing variants header block.");
  assert.match(headerBlock[1], /className="crew-config-variants__portrait"/);
  assert.match(headerBlock[1], /className="crew-config-variants__identity"/);
  assert.match(headerBlock[1], /className="crew-config-variants__test-voice"/);
  assert.doesNotMatch(headerBlock[1], /Beispielsatz|H[oö]re dir einen/i);
});

test("approved active marker style remains a cyan check inside a thin cyan circle", () => {
  const css = readFileSync(cssPath, "utf8");
  const checkBlock = css.match(/\.crew-variant-button__check\s*\{([\s\S]*?)\}/);

  assert.ok(checkBlock, "Missing crew-variant-button__check style block.");
  assert.match(checkBlock[1], /align-self:\s*center;/);
  assert.match(checkBlock[1], /justify-self:\s*end;/);
  assert.match(checkBlock[1], /width:\s*20px;/);
  assert.match(checkBlock[1], /height:\s*20px;/);
  assert.match(checkBlock[1], /display:\s*inline-flex;/);
  assert.match(checkBlock[1], /border:\s*1px\s+solid\s+rgba\(32,\s*200,\s*255,\s*0\.65\);/);
  assert.match(checkBlock[1], /border-radius:\s*999px;/);
  assert.match(checkBlock[1], /background:\s*rgba\(32,\s*200,\s*255,\s*0\.08\);/);
  assert.match(checkBlock[1], /color:\s*#20c8ff;/);
});

test("approved role and variant layout scaffolding remains locked", () => {
  const css = readFileSync(cssPath, "utf8");

  assert.match(css, /\.crew-config-dialog__grid\s*\{[\s\S]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /\.crew-config-variants__header\s*\{[\s\S]*grid-template-columns:\s*92px\s+minmax\(0, 1fr\)\s+auto;/);
  assert.match(css, /\.crew-config-variants__identity\s*\{[\s\S]*text-align:\s*center;/);
  assert.match(css, /\.crew-config-variants__test-voice\s*\{[\s\S]*min-height:\s*40px;/);
  assert.match(css, /\.crew-config-variants__test-voice\s*\{[\s\S]*padding:\s*0\s+12px;/);
  assert.match(css, /\.crew-variant-button\s*\{[\s\S]*grid-template-columns:\s*56px\s+minmax\(0, 1fr\)\s+auto;/);
});

test("approved role and locale set remains unchanged", () => {
  const profileSource = readFileSync(profilesPath, "utf8");
  const dialogSource = readFileSync(dialogPath, "utf8");

  assert.match(profileSource, /export const crewRoleOrder:[\s\S]*"navigation"[\s\S]*"science"[\s\S]*"engineeringSystems"[\s\S]*"weaponsTactics"/);
  assert.match(dialogSource, /const localeLabels:[\s\S]*de:\s*"DE"[\s\S]*uk:\s*"UK"[\s\S]*fr:\s*"FR"[\s\S]*it:\s*"IT"[\s\S]*es:\s*"ES"/);
});
