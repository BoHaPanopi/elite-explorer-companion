import type { Language } from "../types/language.ts";
import type { ExplorationDecision } from "../exploration/decision.ts";
import {
  ANALYSIS_COMPLETE_VARIANTS,
  BIO_SIGNAL_VARIANTS,
  CODEX_VARIANTS,
  COMPOSITION_VARIANTS,
  DSS_VARIANTS,
  EXPLORATION_MESSAGES,
  EXPLORATION_LIST_CONJUNCTION,
  EXPLORATION_VOUCHER_FALLBACK,
  PROBE_VARIANTS,
  REMAINING_VARIANTS,
} from "../content/explorationMessages.ts";

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
  | "new_biological_finding"
  | "organic_probe_progress"
  | "organic_analysis_complete";

export type ExplorationObservationDetails = {
  biologicalSignalCount?: number | null;
  confirmedGenera?: string[];
  compositionSpecies?: string | null;
  codexEntryName?: string | null;
  voucherAmount?: number | null;
  remainingBiologicalBodies?: number | null;
  probeStage?: 1 | 2 | 3 | null;
};

export type ExplorationObservationInput =
  | ExplorationObservationKind
  | {
      kind: ExplorationObservationKind;
      bodyName?: string | null;
      details?: ExplorationObservationDetails;
    };

type MessageContext = {
  bodyName?: string | null;
  details?: ExplorationObservationDetails;
};

let lastVariantIndex = -1;

function chooseVariant(variants: string[]): string {
  if (variants.length === 0) return "";
  const offset = 1 + Math.floor(Math.random() * (variants.length - 1));
  const index = lastVariantIndex < 0
    ? Math.floor(Math.random() * variants.length)
    : (lastVariantIndex + offset) % variants.length;
  lastVariantIndex = index;
  return variants[index];
}

function formatList(values: string[]): string {
  const cleaned = values.map((value) => value.trim()).filter(Boolean);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1) return cleaned[0];
  if (cleaned.length === 2) return `${cleaned[0]} ${EXPLORATION_LIST_CONJUNCTION} ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, ${EXPLORATION_LIST_CONJUNCTION} ${cleaned.at(-1)}`;
}

function formatProbeStage(language: Language, stage: 1 | 2 | 3): string {
  return chooseVariant(PROBE_VARIANTS[stage][language]);
}

function resolveContext(input: ExplorationObservationInput): { kind: ExplorationObservationKind; context: MessageContext } {
  if (typeof input === "string") {
    return { kind: input, context: {} };
  }
  return { kind: input.kind, context: { bodyName: input.bodyName ?? null, details: input.details } };
}

function resolveBioSignalMessage(language: Language, context: MessageContext): string {
  const count = context.details?.biologicalSignalCount;
  if (typeof count === "number" && Number.isFinite(count)) {
    const variant = chooseVariant(BIO_SIGNAL_VARIANTS[language]);
    return variant.replace("{count}", String(count));
  }

  return chooseVariant(BIO_SIGNAL_VARIANTS[language]).replace("{count}", "?");
}

function resolveDssMessage(language: Language, context: MessageContext): string {
  const genera = formatList(context.details?.confirmedGenera ?? []);
  if (genera) {
    return chooseVariant(DSS_VARIANTS[language]).replace("{genera}", genera);
  }

  return EXPLORATION_MESSAGES[language].known_biological_finding;
}

function resolveCompositionMessage(language: Language, context: MessageContext): string {
  const species = context.details?.compositionSpecies?.trim() || context.bodyName?.trim() || "";
  if (!species) {
    return EXPLORATION_MESSAGES[language].new_biological_finding;
  }

  const text = chooseVariant(COMPOSITION_VARIANTS[language]).replace("{species}", species);
  const voucher = context.details?.voucherAmount;
  const codexEntry = context.details?.codexEntryName?.trim();
  if (codexEntry && typeof voucher === "number" && Number.isFinite(voucher)) {
    return `${text} ${chooseVariant(CODEX_VARIANTS[language]).replace("{entry}", codexEntry).replace("{voucher}", String(voucher))}`;
  }
  if (typeof voucher === "number" && Number.isFinite(voucher)) {
    return `${text} ${EXPLORATION_VOUCHER_FALLBACK.replace("{voucher}", String(voucher))}`;
  }
  return text;
}

function resolveOrganicProbeMessage(language: Language, context: MessageContext): string {
  const stage = context.details?.probeStage;
  if (stage === 1 || stage === 2 || stage === 3) {
    return formatProbeStage(language, stage);
  }
  return chooseVariant(ANALYSIS_COMPLETE_VARIANTS[language]);
}

function resolveOrganicAnalysisMessage(language: Language, context: MessageContext): string {
  const base = chooseVariant(ANALYSIS_COMPLETE_VARIANTS[language]);
  const remaining = context.details?.remainingBiologicalBodies;
  if (typeof remaining === "number" && remaining > 0) {
    return `${base} ${chooseVariant(REMAINING_VARIANTS[language]).replace("{remaining}", String(remaining))}`;
  }
  return base;
}

export function createExplorationMessage(input: ExplorationObservationInput, language: Language): string {
  const { kind, context } = resolveContext(input);

  switch (kind) {
    case "biological_signals":
      return resolveBioSignalMessage(language, context);
    case "known_biological_finding":
      return resolveDssMessage(language, context);
    case "new_biological_finding":
      return resolveCompositionMessage(language, context);
    case "organic_probe_progress":
      return resolveOrganicProbeMessage(language, context);
    case "organic_analysis_complete":
      return resolveOrganicAnalysisMessage(language, context);
    default:
      return EXPLORATION_MESSAGES[language][kind];
  }
}

export function createExplorationDecisionMessage(decision: ExplorationDecision, language: Language): string | null {
  switch (decision.kind) {
    case "biologicalTargetWorthConsidering":
      return createExplorationMessage({
        kind: "biological_signals",
        bodyName: decision.bodyName,
        details: { biologicalSignalCount: decision.biologicalSignalCount },
      }, language);
    case "bodyExplorationUpdated": {
      const kindByAnnouncement: Record<typeof decision.announcement, ExplorationObservationKind | null> = {
        firstDiscoveryConfirmed: "first_discovery_by_current_commander",
        discoveryOwnershipUnknown: "discovery_ownership_unknown",
        scannedNotMapped: "scanned_not_mapped",
        mappingOwnershipUnknown: "mapping_ownership_unknown",
        none: null,
      };
      const kind = kindByAnnouncement[decision.announcement];
      return kind ? createExplorationMessage({ kind, bodyName: decision.body.bodyName }, language) : null;
    }
    // Completed FSS scans and non-biological signals are facts, not evidence
    // for a spoken exploration conclusion.
    case "scanIncomplete":
    case "scanCompleted":
    case "bodySignalsDetected":
      return null;
  }
}
