import type { Language } from "ogg-core";

export const COMMAND_CENTER_COPY: Record<Language, {
  commander: string; explorationRank: string; progress: string; currentShip: string; shipType: string;
  shipName: string; shipIdent: string; lastJourney: string; navigationOfficer: string; start: string;
  destination: string; startedAt: string; duration: string; unavailable: string; unknown: string;
}> = {
  de: { commander: "CMDR", explorationRank: "Exploration-Rang", progress: "Fortschritt", currentShip: "Aktuelles Schiff", shipType: "Schiffstyp", shipName: "Schiffsname", shipIdent: "Kennung", lastJourney: "Letzte Reise", navigationOfficer: "Willi · Navigation", start: "Start", destination: "Ziel", startedAt: "Startzeit", duration: "Dauer", unavailable: "Keine Reisedaten vorhanden", unknown: "Unbekannt" },
  en: { commander: "CMDR", explorationRank: "Exploration Rank", progress: "Progress", currentShip: "Current Ship", shipType: "Ship Type", shipName: "Ship Name", shipIdent: "Ship Ident", lastJourney: "Last Journey", navigationOfficer: "Willi · Navigation", start: "Start", destination: "Destination", startedAt: "Started", duration: "Duration", unavailable: "No reliably reconstructable journey available", unknown: "Unknown" },
  fr: { commander: "CMDR", explorationRank: "Rang d’exploration", progress: "Progression", currentShip: "Vaisseau actuel", shipType: "Type de vaisseau", shipName: "Nom du vaisseau", shipIdent: "Identifiant", lastJourney: "Dernier voyage", navigationOfficer: "Willi · Navigation", start: "Départ", destination: "Destination", startedAt: "Heure de départ", duration: "Durée", unavailable: "Aucun voyage ne peut être reconstitué de manière fiable", unknown: "Inconnu" },
  it: { commander: "CMDR", explorationRank: "Grado esplorazione", progress: "Progresso", currentShip: "Nave attuale", shipType: "Tipo di nave", shipName: "Nome nave", shipIdent: "Identificativo", lastJourney: "Ultimo viaggio", navigationOfficer: "Willi · Navigazione", start: "Partenza", destination: "Destinazione", startedAt: "Ora di partenza", duration: "Durata", unavailable: "Nessun viaggio ricostruibile in modo affidabile", unknown: "Sconosciuto" },
  es: { commander: "CMDR", explorationRank: "Rango de exploración", progress: "Progreso", currentShip: "Nave actual", shipType: "Tipo de nave", shipName: "Nombre de nave", shipIdent: "Identificador", lastJourney: "Último viaje", navigationOfficer: "Willi · Navegación", start: "Inicio", destination: "Destino", startedAt: "Hora de inicio", duration: "Duración", unavailable: "No hay ningún viaje reconstruible de forma fiable", unknown: "Desconocido" },
};

export const RANK_CATEGORY_LABELS: Record<Language, Record<"explore" | "exobiologist" | "trade" | "combat", string>> = {
  de: { explore: "Erkundung", exobiologist: "Exobiologie", trade: "Handel", combat: "Kampf" },
  en: { explore: "Exploration", exobiologist: "Exobiology", trade: "Trade", combat: "Combat" },
  fr: { explore: "Exploration", exobiologist: "Exobiologie", trade: "Commerce", combat: "Combat" },
  it: { explore: "Esplorazione", exobiologist: "Esobiologia", trade: "Commercio", combat: "Combattimento" },
  es: { explore: "Exploración", exobiologist: "Exobiología", trade: "Comercio", combat: "Combate" },
};

export const MISSION_PROFILE_LABELS: Record<Language, Record<"exploration" | "trade" | "combat", string>> = {
  de: { exploration: "Erkunden", trade: "Handel", combat: "Kampf" },
  en: { exploration: "Explore", trade: "Trade", combat: "Combat" },
  fr: { exploration: "Explorer", trade: "Commerce", combat: "Combat" },
  it: { exploration: "Esplorare", trade: "Commercio", combat: "Combattimento" },
  es: { exploration: "Explorar", trade: "Comercio", combat: "Combate" },
};

export const DATA_FLOW_COPY: Record<Language, {
  localSummary: string; externalSummary: string; title: string; principle: string; internal: string;
  journalActive: string; journalInactive: string; crewScope: string; anna: string; willi: string; susanne: string;
  sebastian: string; external: string; noApproval: string; noTransmission: string; approval: string;
  transmission: string; close: string;
}> = {
  de: { localSummary: "Alles bleibt lokal · Keine Datenübertragung", externalSummary: "Externe Datenwege freigegeben", title: "Datenfluss", principle: "OGG sendet keine Daten selbstständig nach außen. Der CMDR entscheidet, was seinen PC verlässt.", internal: "Bordcomputer und Crew · intern", journalActive: "Lokaler Journalzugriff aktiv", journalInactive: "Kein lokaler Journalzugriff", crewScope: "Aufgabenbezogene lokale Verarbeitung", anna: "Anna · Exobiologie, Analyse und Vorhersagen", willi: "Willi · Navigation und Reisehistorie", susanne: "Susanne · Schiffszustand", sebastian: "Sebastian · Waffen und Ausrüstung", external: "Externe Freigaben", noApproval: "Keine externe Freigabe", noTransmission: "Keine tatsächliche Übertragung", approval: "Freigabe", transmission: "Übertragung", close: "Schließen" },
  en: { localSummary: "Everything stays local · No data transmission", externalSummary: "External data paths approved", title: "Data Flow", principle: "OGG does not send data outside on its own. The CMDR decides what leaves their PC.", internal: "Onboard computer and crew · internal", journalActive: "Local journal access active", journalInactive: "No local journal access", crewScope: "Task-specific local processing", anna: "Anna · Exobiology, analysis and predictions", willi: "Willi · Navigation and journey history", susanne: "Susanne · Ship condition", sebastian: "Sebastian · Weapons and equipment", external: "External approvals", noApproval: "No external approval", noTransmission: "No actual transmission", approval: "Approval", transmission: "Transmission", close: "Close" },
  fr: { localSummary: "Tout reste local · Aucun transfert de données", externalSummary: "Flux externes autorisés", title: "Flux de données", principle: "OGG n’envoie aucune donnée de lui-même. Le CMDR décide ce qui quitte son PC.", internal: "Ordinateur de bord et équipage · interne", journalActive: "Accès local au journal actif", journalInactive: "Aucun accès local au journal", crewScope: "Traitement local selon les tâches", anna: "Anna · Exobiologie, analyse et prévisions", willi: "Willi · Navigation et historique des voyages", susanne: "Susanne · État du vaisseau", sebastian: "Sebastian · Armes et équipement", external: "Autorisations externes", noApproval: "Aucune autorisation externe", noTransmission: "Aucun transfert effectif", approval: "Autorisation", transmission: "Transfert", close: "Fermer" },
  it: { localSummary: "Tutto resta locale · Nessuna trasmissione dati", externalSummary: "Flussi esterni autorizzati", title: "Flusso dati", principle: "OGG non invia dati all’esterno autonomamente. Il CMDR decide cosa lascia il suo PC.", internal: "Computer di bordo ed equipaggio · interno", journalActive: "Accesso locale al diario attivo", journalInactive: "Nessun accesso locale al diario", crewScope: "Elaborazione locale per mansione", anna: "Anna · Esobiologia, analisi e previsioni", willi: "Willi · Navigazione e cronologia viaggi", susanne: "Susanne · Stato della nave", sebastian: "Sebastian · Armi ed equipaggiamento", external: "Autorizzazioni esterne", noApproval: "Nessuna autorizzazione esterna", noTransmission: "Nessuna trasmissione effettiva", approval: "Autorizzazione", transmission: "Trasmissione", close: "Chiudi" },
  es: { localSummary: "Todo permanece local · Sin transmisión de datos", externalSummary: "Flujos externos autorizados", title: "Flujo de datos", principle: "OGG no envía datos al exterior por sí mismo. El CMDR decide qué sale de su PC.", internal: "Ordenador de a bordo y tripulación · interno", journalActive: "Acceso local al diario activo", journalInactive: "Sin acceso local al diario", crewScope: "Procesamiento local según la tarea", anna: "Anna · Exobiología, análisis y predicciones", willi: "Willi · Navegación e historial de viajes", susanne: "Susanne · Estado de la nave", sebastian: "Sebastian · Armas y equipamiento", external: "Permisos externos", noApproval: "Sin permiso externo", noTransmission: "Sin transmisión efectiva", approval: "Permiso", transmission: "Transmisión", close: "Cerrar" },
};
