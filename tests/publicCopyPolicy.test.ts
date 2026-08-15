import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import test from "node:test";

const publicRoots = ["src", "public", "docs", ".github"];
const publicRootDocuments = [
  "README.md",
  "SECURITY.md",
  "OGG_AI_CONTEXT.md",
  "OGG_LORE.md",
  "OGG_Project_Log.md",
  "OGG_ROADMAP.md",
];
const publicTextExtensions = new Set([
  ".css", ".html", ".js", ".json", ".md", ".svg", ".ts", ".tsx", ".yaml", ".yml",
]);

function collectPublicTextFiles(path: string): string[] {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(path, entry.name);
    if (entry.isDirectory()) return collectPublicTextFiles(entryPath);
    return publicTextExtensions.has(extname(entry.name).toLowerCase()) ? [entryPath] : [];
  });
}

test("public and user-visible copy excludes the retired profile label", () => {
  const forbiddenLabel = ["Tony", "Edition"].join(" ");
  const files = [
    ...publicRootDocuments,
    ...publicRoots.flatMap(collectPublicTextFiles),
  ];
  const violations = files.filter((file) => readFileSync(file, "utf8").includes(forbiddenLabel));

  assert.deepEqual(violations, [], `Forbidden public label found in: ${violations.join(", ")}`);
});

test("internal commander profile identifiers remain available", () => {
  const routingSource = readFileSync(join("packages", "ogg-core", "src", "features", "tonyEdition.ts"), "utf8");

  assert.match(routingSource, /helitony/);
  assert.match(routingSource, /helitony2/);
});
