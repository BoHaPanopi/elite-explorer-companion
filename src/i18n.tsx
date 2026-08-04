import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Language = "de" | "en";

const STORAGE_KEY = "ogg.language";

const messages = {
  de: {
    commandCenter: "Kommandozentrale", navigation: "Navigation", settings: "Einstellungen",
    systemControl: "Systemsteuerung", onboardComputer: "Bordcomputer", notConfigured: "Nicht eingerichtet",
    testGreeting: "Begrüßung testen", module: "Modul", settingsDescription: "Bordcomputer, Sprache und Anwendungsoptionen.",
    language: "Sprache", german: "Deutsch", english: "Englisch", currentSystem: "Aktuelles System",
    activeProfile: "Aktives Einsatzprofil", expedition: "Expedition", shipStatus: "Schiffsstatus",
    docked: "Angedockt", inFlight: "Im Flug", eliteDisconnected: "Nicht mit Elite Dangerous verbunden", unknown: "Status unbekannt", loading: "Wird ermittelt …",
    refreshJournal: "Journal aktualisieren", ready: "bereit", initializing: "Initialisierung", error: "Fehler",
    journalSource: "Journalquelle", journalConnected: "Journal verbunden", journalDisconnected: "Journal nicht verbunden",
    journalSearch: "Die Anwendung sucht im Windows-Ordner für gespeicherte Spiele.",
    unnamed: "Noch nicht benannt", assistantDescription: "Sprachausgabe, Persönlichkeit und Aktivierungswort werden hier eingerichtet.",
    openSettings: "Einstellungen öffnen", configureNow: "Jetzt einrichten", setup: "Einrichtung",
    computerQuestion: "Wie möchten Sie Ihren Bordcomputer nennen?", renameLater: "Der Name kann später jederzeit geändert werden.",
    computerName: "Name des Bordcomputers", enterName: "Eigenen Namen eingeben", characters: "Zeichen", cancel: "Abbrechen", saveName: "Namen speichern",
    nextJump: "Nächster Sprung", noRoute: "Keine Route geplant", destination: "Zielsystem", noDestination: "Kein Ziel",
    remainingJumps: "Verbleibende Sprünge", plottedRoute: "Geplottete Galaxieroute", remainingLy: "{value} Lj verbleibend",
    distanceUnavailable: "Entfernung nicht verfügbar", currentPosition: "Aktuelle Position", nextDestination: "Nächstes Ziel",
    jump: "Sprung {value}", scoopable: "Tankbar", notScoopable: "Nicht tankbar",
    routeHint: "Plotte in Elite Dangerous eine Route. Sie erscheint anschließend automatisch hier.",
    footer: "Elite exploration companion · Navigation and expedition center for Elite Dangerous",
    updateAvailable: "Update verfügbar", updateIntro: "Version {version} ist verfügbar.", releaseNotes: "Versionshinweise",
    noReleaseNotes: "Für diese Version sind keine Versionshinweise verfügbar.", installRestart: "Installieren und neu starten",
    later: "Später", updateFailed: "Das Update konnte nicht installiert werden: {error}", checkingUpdate: "Suche nach Updates …",
    updateDownloading: "Update wird heruntergeladen …", updateInstalling: "Update wird installiert …", updateRestarting: "OGG wird neu gestartet …",
  },
  en: {
    commandCenter: "Command Center", navigation: "Navigation", settings: "Settings",
    systemControl: "System Control", onboardComputer: "Onboard Computer", notConfigured: "Not configured",
    testGreeting: "Test greeting", module: "Module", settingsDescription: "Onboard computer, language, and application options.",
    language: "Language", german: "German", english: "English", currentSystem: "Current System",
    activeProfile: "Active Mission Profile", expedition: "Expedition", shipStatus: "Ship Status",
    docked: "Docked", inFlight: "In Flight", eliteDisconnected: "Not connected to Elite Dangerous", unknown: "Status unknown", loading: "Detecting …",
    refreshJournal: "Refresh Journal", ready: "ready", initializing: "initializing", error: "error",
    journalSource: "Journal Source", journalConnected: "Journal Connected", journalDisconnected: "Journal Not Connected",
    journalSearch: "The application is searching the Windows Saved Games folder.",
    unnamed: "Not named yet", assistantDescription: "Voice output, personality, and activation phrase are configured here.",
    openSettings: "Open Settings", configureNow: "Configure Now", setup: "Setup",
    computerQuestion: "What would you like to call your onboard computer?", renameLater: "You can change the name at any time.",
    computerName: "Onboard Computer Name", enterName: "Enter a custom name", characters: "characters", cancel: "Cancel", saveName: "Save Name",
    nextJump: "Next Jump", noRoute: "No Route Plotted", destination: "Destination System", noDestination: "No Destination",
    remainingJumps: "Remaining Jumps", plottedRoute: "Plotted Galactic Route", remainingLy: "{value} ly remaining",
    distanceUnavailable: "Distance unavailable", currentPosition: "Current Position", nextDestination: "Next Destination",
    jump: "Jump {value}", scoopable: "Scoopable", notScoopable: "Not Scoopable",
    routeHint: "Plot a route in Elite Dangerous. It will appear here automatically.",
    footer: "Elite exploration companion · Navigation and expedition center for Elite Dangerous",
    updateAvailable: "Update Available", updateIntro: "Version {version} is available.", releaseNotes: "Release Notes",
    noReleaseNotes: "No release notes are available for this version.", installRestart: "Install and Restart",
    later: "Later", updateFailed: "The update could not be installed: {error}", checkingUpdate: "Checking for updates …",
    updateDownloading: "Update is downloading …", updateInstalling: "Update is being installed …", updateRestarting: "OGG is restarting …",
  },
} as const;

type MessageKey = keyof typeof messages.de;
type I18nValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey, values?: Record<string, string | number>) => string };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "de");
  const value = useMemo<I18nValue>(() => ({
    language,
    setLanguage(next) { localStorage.setItem(STORAGE_KEY, next); document.documentElement.lang = next; setLanguageState(next); },
    t(key, values = {}) { let result: string = messages[language][key]; for (const [name, replacement] of Object.entries(values)) result = result.replace(`{${name}}`, String(replacement)); return result; },
  }), [language]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
