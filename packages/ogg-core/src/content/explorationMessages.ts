import type { Language } from "../types/language.ts";
import type { ExplorationObservationKind } from "../voices/exploration.ts";

export const EXPLORATION_LIST_CONJUNCTION = "und";
export const EXPLORATION_VOUCHER_FALLBACK = "Voucher: {voucher} CR.";

export type VariantSet = Record<Language, string[]>;

export const BIO_SIGNAL_VARIANTS: VariantSet = {
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
export const DSS_VARIANTS: VariantSet = {
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

export const COMPOSITION_VARIANTS: VariantSet = {
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

export const CODEX_VARIANTS: VariantSet = {
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

export const PROBE_VARIANTS: Record<1 | 2 | 3, VariantSet> = {
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

export const ANALYSIS_COMPLETE_VARIANTS: VariantSet = {
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

export const REMAINING_VARIANTS: VariantSet = {
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

export const EXPLORATION_MESSAGES: Record<Language, Record<ExplorationObservationKind, string>> = {
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
