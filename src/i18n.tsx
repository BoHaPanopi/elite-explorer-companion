import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Language = "de" | "en" | "fr" | "it" | "es";

const STORAGE_KEY = "ogg.language";

const baseMessages = {
  de: {
    commandCenter: "Kommandozentrale", navigation: "Navigation", settings: "Einstellungen",
    systemControl: "Systemsteuerung", onboardComputer: "Bordcomputer", notConfigured: "Nicht eingerichtet",
    testGreeting: "Begrüßung testen", module: "Modul", moduleSettings: "Moduleinstellungen", settingsDescription: "Bordcomputer, Sprache und Anwendungsoptionen.",
    language: "Sprache", german: "Deutsch", english: "Englisch", french: "Französisch", italian: "Italienisch", spanish: "Spanisch", moduleHint: "Mia werggeln dro.", currentSystem: "Aktuelles System",
    activeProfile: "Aktives Einsatzprofil", expedition: "Expedition", shipStatus: "Schiffsstatus",
    docked: "Angedockt", inFlight: "Im Flug", eliteDisconnected: "Nicht mit Elite Dangerous verbunden", unknown: "Status unbekannt", loading: "Wird ermittelt …",
    refreshJournal: "Journal aktualisieren", ready: "bereit", initializing: "Initialisierung", error: "Fehler",
    journalSource: "Journalquelle", journalConnected: "Journal verbunden", journalDisconnected: "Journal nicht verbunden",
    journalSearch: "Die Anwendung sucht im Windows-Ordner für gespeicherte Spiele.", openJournalFolder: "Journalordner öffnen",
    unnamed: "Noch nicht benannt", assistantDescription: "Sprachausgabe, Persönlichkeit und Aktivierungswort werden hier eingerichtet.",
    openSettings: "Einstellungen öffnen", configureNow: "Jetzt einrichten", setup: "Einrichtung",
    computerQuestion: "Wie möchten Sie Ihren Bordcomputer nennen?", renameLater: "Der Name kann später jederzeit geändert werden.",
    computerName: "Name des Bordcomputers", enterName: "Eigenen Namen eingeben", characters: "Zeichen", cancel: "Abbrechen", saveName: "Namen speichern",
    nextJump: "Nächster Sprung", noRoute: "Keine Route geplant", destination: "Zielsystem", noDestination: "Kein Ziel",
    remainingJumps: "Verbleibende Sprünge", plottedRoute: "Deine gewählte Route", remainingLy: "{value} Lj verbleibend",
    distanceUnavailable: "Entfernung nicht verfügbar", currentPosition: "Aktuelle Position", nextDestination: "Nächstes Ziel",
    jump: "Sprung {value}", scoopable: "Tankbar", notScoopable: "Nicht tankbar", starClassUnknown: "Sternklasse unbekannt",
    routeHint: "Plotte in Elite Dangerous eine Route. Sie erscheint anschließend automatisch hier.",
    footer: "The Elite Dangerous Onboard Computer",
    updateAvailable: "Update verfügbar", updateIntro: "Version {version} ist verfügbar.", releaseNotes: "Versionshinweise",
    noReleaseNotes: "Für diese Version sind keine Versionshinweise verfügbar.",
    later: "Später", updateLater: "Später aktualisieren", updateFailed: "Das Update konnte nicht installiert werden.", checkingUpdate: "Suche nach Updates …",
    startupErrorLabel: "Startdiagnose", startupErrorTitle: "OGG konnte nicht vollständig gestartet werden.", startupErrorBody: "Die Installation oder ein benötigter Hintergrunddienst ist möglicherweise beschädigt.",
    startupErrorVersion: "Version {version}", restart: "Erneut starten", repair: "Reparieren", repairing: "Reparatur läuft …", openLog: "Log öffnen", quit: "Beenden",
    updateDownloading: "Update wird heruntergeladen …", updateInstalling: "Update wird beim Beenden installiert …", updateRestarting: "OGG wird neu gestartet …", updateReady: "Update bereit. Es wird beim Beenden von OGG installiert.", updateReadyVersion: "Version {version} wurde vollständig im Hintergrund heruntergeladen.", dismiss: "Ausblenden",
  },
  en: {
    commandCenter: "Command Center", navigation: "Navigation", settings: "Settings",
    systemControl: "System Control", onboardComputer: "Onboard Computer", notConfigured: "Not configured",
    testGreeting: "Test greeting", module: "Module", moduleSettings: "Module Settings", settingsDescription: "Onboard computer, language, and application options.",
    language: "Language", german: "German", english: "English", french: "French", italian: "Italian", spanish: "Spanish", moduleHint: "We're tinkering away.", currentSystem: "Current System",
    activeProfile: "Active Mission Profile", expedition: "Expedition", shipStatus: "Ship Status",
    docked: "Docked", inFlight: "In Flight", eliteDisconnected: "Not connected to Elite Dangerous", unknown: "Status unknown", loading: "Detecting …",
    refreshJournal: "Refresh Journal", ready: "ready", initializing: "initializing", error: "error",
    journalSource: "Journal Source", journalConnected: "Journal Connected", journalDisconnected: "Journal Not Connected",
    journalSearch: "The application is searching the Windows Saved Games folder.", openJournalFolder: "Open Journal Folder",
    unnamed: "Not named yet", assistantDescription: "Voice output, personality, and activation phrase are configured here.",
    openSettings: "Open Settings", configureNow: "Configure Now", setup: "Setup",
    computerQuestion: "What would you like to call your onboard computer?", renameLater: "You can change the name at any time.",
    computerName: "Onboard Computer Name", enterName: "Enter a custom name", characters: "characters", cancel: "Cancel", saveName: "Save Name",
    nextJump: "Next Jump", noRoute: "No Route Plotted", destination: "Destination System", noDestination: "No Destination",
    remainingJumps: "Remaining Jumps", plottedRoute: "Your Chosen Route", remainingLy: "{value} ly remaining",
    distanceUnavailable: "Distance unavailable", currentPosition: "Current Position", nextDestination: "Next Destination",
    jump: "Jump {value}", scoopable: "Scoopable", notScoopable: "Not Scoopable", starClassUnknown: "Star class unknown",
    routeHint: "Plot a route in Elite Dangerous. It will appear here automatically.",
    footer: "The Elite Dangerous Onboard Computer",
    updateAvailable: "Update Available", updateIntro: "Version {version} is available.", releaseNotes: "Release Notes",
    noReleaseNotes: "No release notes are available for this version.",
    later: "Later", updateLater: "Update later", updateFailed: "The update could not be installed.", checkingUpdate: "Checking for updates …",
    startupErrorLabel: "Startup diagnostics", startupErrorTitle: "OGG could not be started completely.", startupErrorBody: "The installation or a required background service may be damaged.",
    startupErrorVersion: "Version {version}", restart: "Restart", repair: "Repair", repairing: "Repairing …", openLog: "Open Log", quit: "Quit",
    updateDownloading: "Update is downloading …", updateInstalling: "The update will be installed when OGG closes …", updateRestarting: "OGG is restarting …", updateReady: "Update ready. It will be installed when OGG closes.", updateReadyVersion: "Version {version} has finished downloading in the background.", dismiss: "Dismiss",
  },
} as const;

const messages = {
  ...baseMessages,
  fr: { ...baseMessages.en, language: "Langue", french: "Français", italian: "Italien", spanish: "Espagnol", moduleHint: "On y travaille." },
  it: { ...baseMessages.en, language: "Lingua", french: "Francese", italian: "Italiano", spanish: "Spagnolo", moduleHint: "Ci stiamo lavorando." },
  es: { ...baseMessages.en, language: "Idioma", french: "Francés", italian: "Italiano", spanish: "Español", moduleHint: "Estamos en ello." },
} as const;

type MessageKey = keyof typeof messages.de;
type I18nValue = { language: Language; setLanguage: (language: Language) => void; t: (key: MessageKey, values?: Record<string, string | number>) => string };

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" || saved === "fr" || saved === "it" || saved === "es" ? saved : "de";
  });
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
