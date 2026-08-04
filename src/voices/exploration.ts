import type { Language } from "../i18n";

export type ExplorationObservationKind =
  | "first_discovery_by_current_commander"
  | "already_discovered"
  | "discovery_ownership_unknown"
  | "scanned_not_mapped"
  | "first_mapping_by_current_commander"
  | "already_mapped"
  | "mapping_ownership_unknown"
  | "biological_signals"
  | "known_biological_finding"
  | "new_biological_finding";

const messages: Record<Language, Record<ExplorationObservationKind, string>> = {
  de: {
    first_discovery_by_current_commander: "Do war no koana. Des is jetz unsara.",
    already_discovered: "Do war scho a anderer CMDR.",
    discovery_ownership_unknown: "Bereits entdeckt. Urheber ned eindeutig.",
    scanned_not_mapped: "Gscannt, aber no ned kartographiert.",
    first_mapping_by_current_commander: "Erstkartographie bestätigt. De is unsara.",
    already_mapped: "Kartographie is scho vorhanden.",
    mapping_ownership_unknown: "Kartographiert. Urheber ned eindeutig.",
    biological_signals: "Biologische Signale vorhanden.",
    known_biological_finding: "Der biologische Fund is scho bekannt.",
    new_biological_finding: "Neia biologischer Fund bestätigt.",
  },
  en: {
    first_discovery_by_current_commander: "No one has been here before. This one is ours now.",
    already_discovered: "Another CMDR has already been here.",
    discovery_ownership_unknown: "Already discovered. The original CMDR is unknown.",
    scanned_not_mapped: "Scanned, but not mapped yet.",
    first_mapping_by_current_commander: "First mapping confirmed. This one is ours.",
    already_mapped: "Mapping data already exists.",
    mapping_ownership_unknown: "Mapped. The original CMDR is unknown.",
    biological_signals: "Biological signals detected.",
    known_biological_finding: "This biological finding is already known.",
    new_biological_finding: "New biological finding confirmed.",
  },
};

export function createExplorationMessage(kind: ExplorationObservationKind, language: Language): string {
  return messages[language][kind];
}
