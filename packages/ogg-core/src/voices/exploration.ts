import type { Language } from "../types/language.ts";

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

type VariantSet = Record<Language, string[]>;

const BIO_SIGNAL_VARIANTS: VariantSet = {
  de: [
    "{count} biologische Signale.",
    "Auf dem Himmelskoerper liegen {count} biologische Signale vor.",
    "Ich sehe {count} biologische Signale.",
  ],
  en: [
    "{count} biological signals.",
    "{count} biological signals are present on this body.",
    "I can confirm {count} biological signals.",
  ],
  fr: [
    "{count} signaux biologiques.",
    "Ce corps affiche {count} signaux biologiques.",
    "Je confirme {count} signaux biologiques.",
  ],
  it: [
    "{count} segnali biologici.",
    "Questo corpo mostra {count} segnali biologici.",
    "Confermo {count} segnali biologici.",
  ],
  es: [
    "{count} señales biológicas.",
    "Este cuerpo muestra {count} señales biológicas.",
    "Confirmo {count} señales biológicas.",
  ],
};

const DSS_VARIANTS: VariantSet = {
  de: [
    "DSS bestaetigt: {genera}.",
    "Die Gattungen sind jetzt bekannt: {genera}.",
    "DSS liefert die Gattungen: {genera}.",
  ],
  en: [
    "DSS confirms: {genera}.",
    "The confirmed genera are {genera}.",
    "DSS has identified the genera: {genera}.",
  ],
  fr: [
    "Le DSS confirme : {genera}.",
    "Les genres confirmes sont {genera}.",
    "Le DSS a identifie les genres : {genera}.",
  ],
  it: [
    "Il DSS conferma: {genera}.",
    "I generi confermati sono {genera}.",
    "Il DSS ha identificato i generi: {genera}.",
  ],
  es: [
    "El DSS confirma: {genera}.",
    "Los generos confirmados son {genera}.",
    "El DSS ha identificado los generos: {genera}.",
  ],
};

const COMPOSITION_VARIANTS: VariantSet = {
  de: [
    "Composition Scanner: {species}.",
    "Die konkrete Art ist {species}.",
    "Jetzt haben wir {species} festgenagelt.",
  ],
  en: [
    "Composition Scanner: {species}.",
    "The specific form is {species}.",
    "We have pinned this down to {species}.",
  ],
  fr: [
    "Scanner de composition : {species}.",
    "La forme precise est {species}.",
    "Nous avons identifie {species}.",
  ],
  it: [
    "Scanner di composizione: {species}.",
    "La forma precisa e {species}.",
    "Abbiamo identificato {species}.",
  ],
  es: [
    "Escaner de composicion: {species}.",
    "La forma concreta es {species}.",
    "Hemos concretado {species}.",
  ],
};

const CODEX_VARIANTS: VariantSet = {
  de: [
    "Codex bestaetigt {entry} mit {voucher} CR Voucher.",
    "Codex-Eintrag {entry}. Voucher-Wert: {voucher} CR.",
  ],
  en: [
    "Codex confirms {entry} with a {voucher} CR voucher.",
    "Codex entry {entry}. Voucher value: {voucher} CR.",
  ],
  fr: [
    "Le codex confirme {entry} avec un bon de {voucher} CR.",
    "Entree de codex {entry}. Valeur du bon : {voucher} CR.",
  ],
  it: [
    "Il codex conferma {entry} con un voucher da {voucher} CR.",
    "Voce di codex {entry}. Valore voucher: {voucher} CR.",
  ],
  es: [
    "El codex confirma {entry} con un vale de {voucher} CR.",
    "Entrada de codex {entry}. Valor del vale: {voucher} CR.",
  ],
};

const PROBE_VARIANTS: Record<1 | 2 | 3, VariantSet> = {
  1: {
    de: [
      "Das war der erste Streich.",
      "Die erste haetten wir.",
      "Nummer eins ist im Kasten.",
    ],
    en: [
      "That is the first one.",
      "We have the first sample.",
      "Sample one is in the bag.",
    ],
    fr: [
      "Voila la premiere.",
      "Nous avons la premiere.",
      "Echantillon un est dans la poche.",
    ],
    it: [
      "Ecco la prima.",
      "La prima e nostra.",
      "Il campione uno e in tasca.",
    ],
    es: [
      "Aqui va la primera.",
      "Ya tenemos la primera.",
      "La muestra uno ya esta hecha.",
    ],
  },
  2: {
    de: [
      "Und die zweite.",
      "Zwei haetten wir.",
      "Noch eine, dann hab ich genug.",
    ],
    en: [
      "And the second one.",
      "Two are done.",
      "One more and I have enough.",
    ],
    fr: [
      "Et la deuxieme.",
      "Deux de faites.",
      "Encore une, et j’aurai tout ce qu’il faut.",
    ],
    it: [
      "E la seconda.",
      "Due fatte.",
      "Ancora una e ho abbastanza.",
    ],
    es: [
      "Y la segunda.",
      "Ya tenemos dos.",
      "Una mas y me basta.",
    ],
  },
  3: {
    de: [
      "Jawoll. Jetzt beginnt die Arbeit fuer mich.",
      "Das reicht mir. Den Rest uebernehm ich.",
      "Fertig. Jetzt schau ich mir die Daten an.",
    ],
    en: [
      "Right. Now the real work begins.",
      "That is enough for me. I will take it from here.",
      "Done. Now I am looking at the data.",
    ],
    fr: [
      "Parfait. Maintenant, le vrai travail commence.",
      "Ca suffit pour moi. Je prends la suite.",
      "C’est fait. Je vais examiner les donnees.",
    ],
    it: [
      "Bene. Adesso inizia il lavoro vero.",
      "Mi basta cosi. Il resto lo prendo in mano io.",
      "Fatto. Ora guardo i dati.",
    ],
    es: [
      "Perfecto. Ahora empieza el trabajo de verdad.",
      "Con esto ya me basta. Yo sigo.",
      "Hecho. Ahora miro los datos.",
    ],
  },
};

const ANALYSIS_COMPLETE_VARIANTS: VariantSet = {
  de: [
    "Analyse abgeschlossen.",
    "Die Probe ist ausgewertet.",
    "Damit ist das Bio fertig bearbeitet.",
  ],
  en: [
    "Analysis complete.",
    "The sample has been analyzed.",
    "That bio is fully processed now.",
  ],
  fr: [
    "Analyse terminee.",
    "L’echantillon est analyse.",
    "Ce bio est maintenant traite.",
  ],
  it: [
    "Analisi completata.",
    "Il campione e stato analizzato.",
    "Questo bio e ora lavorato del tutto.",
  ],
  es: [
    "Analisis completado.",
    "La muestra ya esta analizada.",
    "Ese bio ya esta totalmente procesado.",
  ],
};

const REMAINING_VARIANTS: VariantSet = {
  de: [
    "Es warten noch {remaining} weitere Bios.",
    "Auf diesem Planeten sind noch {remaining} ungescannte Bios offen.",
    "Noch {remaining} Bio(s) stehen aus.",
  ],
  en: [
    "There are still {remaining} more bios waiting.",
    "{remaining} unscanned bios are still open on this planet.",
    "{remaining} bio(s) are still left.",
  ],
  fr: [
    "Il reste encore {remaining} bios.",
    "{remaining} bios non scannes restent sur cette planete.",
    "Il reste {remaining} bio(s).",
  ],
  it: [
    "Restano ancora {remaining} bios.",
    "Su questo pianeta restano {remaining} bios non scansionati.",
    "Rimangono {remaining} bio.",
  ],
  es: [
    "Aun quedan {remaining} bios.",
    "Todavia quedan {remaining} bios sin escanear en este planeta.",
    "Quedan {remaining} bio(s).",
  ],
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
  if (cleaned.length === 2) return `${cleaned[0]} und ${cleaned[1]}`;
  return `${cleaned.slice(0, -1).join(", ")}, und ${cleaned.at(-1)}`;
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
    known_biological_finding: "DSS bestaetigt die Gattung.",
    new_biological_finding: "Der Composition-Scan hat den Fund konkretisiert.",
    organic_probe_progress: "Die Probe ist unterwegs.",
    organic_analysis_complete: "Analyse abgeschlossen.",
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
    known_biological_finding: "DSS confirms the genus.",
    new_biological_finding: "The composition scan has narrowed this down.",
    organic_probe_progress: "The sample is on its way.",
    organic_analysis_complete: "Analysis complete.",
  },
  fr: {
    first_discovery_by_current_commander: "No one has been here before. This one is ours now.",
    already_discovered: "Another CMDR has already been here.",
    discovery_ownership_unknown: "Already discovered. The original CMDR is unknown.",
    scanned_not_mapped: "Scanned, but not mapped yet.",
    first_mapping_by_current_commander: "First mapping confirmed. This one is ours.",
    already_mapped: "Mapping data already exists.",
    mapping_ownership_unknown: "Mapped. The original CMDR is unknown.",
    biological_signals: "Biological signals detected.",
    known_biological_finding: "Le DSS confirme le genre.",
    new_biological_finding: "Le scanner de composition a precise ce resultat.",
    organic_probe_progress: "L’echantillon est en route.",
    organic_analysis_complete: "Analyse terminee.",
  },
  it: {
    first_discovery_by_current_commander: "No one has been here before. This one is ours now.",
    already_discovered: "Another CMDR has already been here.",
    discovery_ownership_unknown: "Already discovered. The original CMDR is unknown.",
    scanned_not_mapped: "Scanned, but not mapped yet.",
    first_mapping_by_current_commander: "First mapping confirmed. This one is ours.",
    already_mapped: "Mapping data already exists.",
    mapping_ownership_unknown: "Mapped. The original CMDR is unknown.",
    biological_signals: "Biological signals detected.",
    known_biological_finding: "Il DSS conferma il genere.",
    new_biological_finding: "Lo scanner di composizione ha ristretto il risultato.",
    organic_probe_progress: "Il campione e in viaggio.",
    organic_analysis_complete: "Analisi completata.",
  },
  es: {
    first_discovery_by_current_commander: "No one has been here before. This one is ours now.",
    already_discovered: "Another CMDR has already been here.",
    discovery_ownership_unknown: "Already discovered. The original CMDR is unknown.",
    scanned_not_mapped: "Scanned, but not mapped yet.",
    first_mapping_by_current_commander: "First mapping confirmed. This one is ours.",
    already_mapped: "Mapping data already exists.",
    mapping_ownership_unknown: "Mapped. The original CMDR is unknown.",
    biological_signals: "Biological signals detected.",
    known_biological_finding: "El DSS confirma el genero.",
    new_biological_finding: "El escaner de composicion ha concretado esto.",
    organic_probe_progress: "La muestra va en camino.",
    organic_analysis_complete: "Analisis completado.",
  },
};

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

  return messages[language].known_biological_finding;
}

function resolveCompositionMessage(language: Language, context: MessageContext): string {
  const species = context.details?.compositionSpecies?.trim() || context.bodyName?.trim() || "";
  if (!species) {
    return messages[language].new_biological_finding;
  }

  const text = chooseVariant(COMPOSITION_VARIANTS[language]).replace("{species}", species);
  const voucher = context.details?.voucherAmount;
  const codexEntry = context.details?.codexEntryName?.trim();
  if (codexEntry && typeof voucher === "number" && Number.isFinite(voucher)) {
    return `${text} ${chooseVariant(CODEX_VARIANTS[language]).replace("{entry}", codexEntry).replace("{voucher}", String(voucher))}`;
  }
  if (typeof voucher === "number" && Number.isFinite(voucher)) {
    return `${text} Voucher: ${voucher} CR.`;
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
      return messages[language][kind];
  }
}
