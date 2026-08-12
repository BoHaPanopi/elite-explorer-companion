import { getTonyTacticalComment } from "./features/tonyEdition.ts";
import { createExplorationMessage, type ExplorationObservationKind } from "./voices/exploration.ts";

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
  "organic_probe_progress",
  "organic_analysis_complete",
];

const quotes: readonly string[] = [
  getTonyTacticalComment("green"),
  getTonyTacticalComment("yellow"),
  getTonyTacticalComment("orange"),
  getTonyTacticalComment("red"),
  ...explorationKinds.map((k) => createExplorationMessage(k, "en")),
];

let lastIndex = -1;

export function getOggQuote(): string {
  let index: number;
  do {
    index = Math.floor(Math.random() * quotes.length);
  } while (index === lastIndex && quotes.length > 1);
  lastIndex = index;
  return quotes[index];
}
