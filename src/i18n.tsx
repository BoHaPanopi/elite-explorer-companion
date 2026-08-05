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
    openSettings: "Einstellungen öffnen", configureNow: "Jetzt einrichten", setup: "Einrichtung", renameComputer: "Bordcomputer umbenennen", renameAvailableFrom015: "Das Umbenennen des Bordcomputers ist ab Version 0.15 verfügbar.",
    computerQuestion: "Wie möchten Sie Ihren Bordcomputer nennen?", renameLater: "Der Bordcomputer-Name kann derzeit nach der Ersteinrichtung noch nicht geändert werden. Diese Funktion folgt mit Version 0.15.",
    computerName: "Name des Bordcomputers", enterName: "Eigenen Namen eingeben", characters: "Zeichen", cancel: "Abbrechen", saveName: "Namen speichern",
    nextJump: "Nächster Sprung", noRoute: "Keine Route geplant", destination: "Zielsystem", noDestination: "Kein Ziel",
    remainingJumps: "Verbleibende Sprünge", plottedRoute: "Deine gewählte Route", remainingLy: "{value} Lj verbleibend",
    distanceUnavailable: "Entfernung nicht verfügbar", currentPosition: "Aktuelle Position", nextDestination: "Nächstes Ziel",
    jump: "Sprung {value}", scoopable: "Tankbar", notScoopable: "Nicht tankbar", starClassUnknown: "Sternklasse unbekannt",
    routeHint: "Plotte in Elite Dangerous eine Route. Sie erscheint anschließend automatisch hier.",
    footer: "Der Elite-Dangerous-Bordcomputer",
    updateAvailable: "Update verfügbar", updateIntro: "Version {version} ist verfügbar.", releaseNotes: "Versionshinweise",
    noReleaseNotes: "Für diese Version sind keine Versionshinweise verfügbar.",
    later: "Später", updateLater: "Später aktualisieren", updateFailed: "Das Update konnte nicht installiert werden.", checkingUpdate: "Suche nach Updates …",
    startupErrorLabel: "Startdiagnose", startupErrorTitle: "OGG konnte nicht vollständig gestartet werden.", startupErrorBody: "Die Installation oder ein benötigter Hintergrunddienst ist möglicherweise beschädigt.",
    startupErrorVersion: "Version {version}", restart: "Erneut starten", repair: "Reparieren", repairing: "Reparatur läuft …", openLog: "Log öffnen", quit: "Beenden",
    updateDownloading: "Update wird heruntergeladen …", updateInstalling: "Update wird beim Beenden installiert …", updateRestarting: "OGG wird neu gestartet …", updateReady: "Update bereit. Es wird beim Beenden von OGG installiert.", updateReadyVersion: "Version {version} wurde vollständig im Hintergrund heruntergeladen.", dismiss: "Ausblenden",
    systemStatusLabel: "OGG-Systemstatus: {status}", eliteJournal: "Elite-Dangerous-Journal", continue: "Weiter", aboutOgg: "Über OGG", openMessage: "Nachricht öffnen", tonyWelcomeMessage: "Tonys Willkommensnachricht", seasonalReminder: "Saisonale Erinnerung",
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
    openSettings: "Open Settings", configureNow: "Configure Now", setup: "Setup", renameComputer: "Rename onboard computer", renameAvailableFrom015: "Renaming the onboard computer will be available from version 0.15.",
    computerQuestion: "What would you like to call your onboard computer?", renameLater: "The onboard computer name cannot currently be changed after initial setup. This feature will follow with version 0.15.",
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
    systemStatusLabel: "OGG system status: {status}", eliteJournal: "Elite Dangerous Journal", continue: "Continue", aboutOgg: "About OGG", openMessage: "Open Message", tonyWelcomeMessage: "Tony's Welcome Message", seasonalReminder: "Seasonal Reminder",
  },
} as const;

const messages = {
  ...baseMessages,
  fr: {
    commandCenter: "Centre de commandement", navigation: "Navigation", settings: "Paramètres",
    systemControl: "Contrôle du système", onboardComputer: "Ordinateur de bord", notConfigured: "Non configuré",
    testGreeting: "Tester le message d’accueil", module: "Module", moduleSettings: "Paramètres des modules", settingsDescription: "Ordinateur de bord, langue et options de l’application.",
    language: "Langue", german: "Allemand", english: "Anglais", french: "Français", italian: "Italien", spanish: "Espagnol", moduleHint: "Nous y travaillons.", currentSystem: "Système actuel",
    activeProfile: "Profil de mission actif", expedition: "Expédition", shipStatus: "État du vaisseau",
    docked: "Amarré", inFlight: "En vol", eliteDisconnected: "Non connecté à Elite Dangerous", unknown: "État inconnu", loading: "Détection en cours …",
    refreshJournal: "Actualiser le journal", ready: "prêt", initializing: "initialisation", error: "erreur",
    journalSource: "Source du journal", journalConnected: "Journal connecté", journalDisconnected: "Journal déconnecté",
    journalSearch: "L’application recherche le dossier Windows des parties enregistrées.", openJournalFolder: "Ouvrir le dossier du journal",
    unnamed: "Pas encore nommé", assistantDescription: "La sortie vocale, la personnalité et la phrase d’activation sont configurées ici.",
    openSettings: "Ouvrir les paramètres", configureNow: "Configurer maintenant", setup: "Configuration initiale", renameComputer: "Renommer l’ordinateur de bord", renameAvailableFrom015: "Le changement de nom de l’ordinateur de bord sera disponible à partir de la version 0.15.",
    computerQuestion: "Comment souhaitez-vous nommer votre ordinateur de bord ?", renameLater: "Le nom de l’ordinateur de bord ne peut pas encore être modifié après la configuration initiale. Cette fonction sera disponible avec la version 0.15.",
    computerName: "Nom de l’ordinateur de bord", enterName: "Saisir un nom personnalisé", characters: "caractères", cancel: "Annuler", saveName: "Enregistrer le nom",
    nextJump: "Prochain saut", noRoute: "Aucun itinéraire planifié", destination: "Système de destination", noDestination: "Aucune destination",
    remainingJumps: "Sauts restants", plottedRoute: "Votre itinéraire choisi", remainingLy: "{value} al restantes",
    distanceUnavailable: "Distance indisponible", currentPosition: "Position actuelle", nextDestination: "Prochaine destination",
    jump: "Saut {value}", scoopable: "Carburant disponible", notScoopable: "Carburant indisponible", starClassUnknown: "Classe stellaire inconnue",
    routeHint: "Tracez un itinéraire dans Elite Dangerous. Il apparaîtra ensuite automatiquement ici.", footer: "L’ordinateur de bord d’Elite Dangerous",
    updateAvailable: "Mise à jour disponible", updateIntro: "La version {version} est disponible.", releaseNotes: "Notes de version", noReleaseNotes: "Aucune note de version n’est disponible pour cette version.",
    later: "Plus tard", updateLater: "Mettre à jour plus tard", updateFailed: "La mise à jour n’a pas pu être installée.", checkingUpdate: "Recherche de mises à jour …",
    startupErrorLabel: "Diagnostic de démarrage", startupErrorTitle: "OGG n’a pas pu démarrer complètement.", startupErrorBody: "L’installation ou un service d’arrière-plan requis est peut-être endommagé.",
    startupErrorVersion: "Version {version}", restart: "Redémarrer", repair: "Réparer", repairing: "Réparation en cours …", openLog: "Ouvrir le journal", quit: "Quitter",
    updateDownloading: "Téléchargement de la mise à jour …", updateInstalling: "La mise à jour sera installée à la fermeture d’OGG …", updateRestarting: "OGG redémarre …", updateReady: "Mise à jour prête. Elle sera installée à la fermeture d’OGG.", updateReadyVersion: "La version {version} a été entièrement téléchargée en arrière-plan.", dismiss: "Masquer",
    systemStatusLabel: "État du système OGG : {status}", eliteJournal: "Journal d’Elite Dangerous", continue: "Continuer", aboutOgg: "À propos d’OGG", openMessage: "Ouvrir le message", tonyWelcomeMessage: "Message de bienvenue de Tony", seasonalReminder: "Rappel saisonnier",
  },
  it: {
    commandCenter: "Centro di comando", navigation: "Navigazione", settings: "Impostazioni",
    systemControl: "Controllo del sistema", onboardComputer: "Computer di bordo", notConfigured: "Non configurato",
    testGreeting: "Prova il saluto", module: "Modulo", moduleSettings: "Impostazioni dei moduli", settingsDescription: "Computer di bordo, lingua e opzioni dell’applicazione.",
    language: "Lingua", german: "Tedesco", english: "Inglese", french: "Francese", italian: "Italiano", spanish: "Spagnolo", moduleHint: "Ci stiamo lavorando.", currentSystem: "Sistema attuale",
    activeProfile: "Profilo missione attivo", expedition: "Spedizione", shipStatus: "Stato della nave",
    docked: "Attraccato", inFlight: "In volo", eliteDisconnected: "Non connesso a Elite Dangerous", unknown: "Stato sconosciuto", loading: "Rilevamento in corso …",
    refreshJournal: "Aggiorna diario", ready: "pronto", initializing: "inizializzazione", error: "errore",
    journalSource: "Fonte del diario", journalConnected: "Diario connesso", journalDisconnected: "Diario non connesso",
    journalSearch: "L’applicazione cerca nella cartella Windows delle partite salvate.", openJournalFolder: "Apri cartella del diario",
    unnamed: "Non ancora nominato", assistantDescription: "Qui vengono configurati l’uscita vocale, la personalità e la frase di attivazione.",
    openSettings: "Apri impostazioni", configureNow: "Configura ora", setup: "Configurazione iniziale", renameComputer: "Rinomina il computer di bordo", renameAvailableFrom015: "La ridenominazione del computer di bordo sarà disponibile a partire dalla versione 0.15.",
    computerQuestion: "Come vuoi chiamare il tuo computer di bordo?", renameLater: "Al momento il nome del computer di bordo non può essere modificato dopo la configurazione iniziale. Questa funzione sarà disponibile con la versione 0.15.",
    computerName: "Nome del computer di bordo", enterName: "Inserisci un nome personalizzato", characters: "caratteri", cancel: "Annulla", saveName: "Salva nome",
    nextJump: "Prossimo salto", noRoute: "Nessuna rotta pianificata", destination: "Sistema di destinazione", noDestination: "Nessuna destinazione",
    remainingJumps: "Salti rimanenti", plottedRoute: "Rotta scelta", remainingLy: "{value} al rimanenti",
    distanceUnavailable: "Distanza non disponibile", currentPosition: "Posizione attuale", nextDestination: "Prossima destinazione",
    jump: "Salto {value}", scoopable: "Rifornibile", notScoopable: "Non rifornibile", starClassUnknown: "Classe stellare sconosciuta",
    routeHint: "Traccia una rotta in Elite Dangerous. Apparirà automaticamente qui.", footer: "Il computer di bordo di Elite Dangerous",
    updateAvailable: "Aggiornamento disponibile", updateIntro: "È disponibile la versione {version}.", releaseNotes: "Note di versione", noReleaseNotes: "Non sono disponibili note per questa versione.",
    later: "Più tardi", updateLater: "Aggiorna più tardi", updateFailed: "Impossibile installare l’aggiornamento.", checkingUpdate: "Ricerca aggiornamenti …",
    startupErrorLabel: "Diagnostica di avvio", startupErrorTitle: "OGG non è stato avviato completamente.", startupErrorBody: "L’installazione o un servizio in background necessario potrebbe essere danneggiato.",
    startupErrorVersion: "Versione {version}", restart: "Riavvia", repair: "Ripara", repairing: "Riparazione in corso …", openLog: "Apri registro", quit: "Esci",
    updateDownloading: "Download dell’aggiornamento …", updateInstalling: "L’aggiornamento verrà installato alla chiusura di OGG …", updateRestarting: "OGG si sta riavviando …", updateReady: "Aggiornamento pronto. Verrà installato alla chiusura di OGG.", updateReadyVersion: "La versione {version} è stata scaricata completamente in background.", dismiss: "Nascondi",
    systemStatusLabel: "Stato del sistema OGG: {status}", eliteJournal: "Diario di Elite Dangerous", continue: "Continua", aboutOgg: "Informazioni su OGG", openMessage: "Apri messaggio", tonyWelcomeMessage: "Messaggio di benvenuto di Tony", seasonalReminder: "Promemoria stagionale",
  },
  es: {
    commandCenter: "Centro de mando", navigation: "Navegación", settings: "Ajustes",
    systemControl: "Control del sistema", onboardComputer: "Ordenador de a bordo", notConfigured: "Sin configurar",
    testGreeting: "Probar saludo", module: "Módulo", moduleSettings: "Ajustes de módulos", settingsDescription: "Ordenador de a bordo, idioma y opciones de la aplicación.",
    language: "Idioma", german: "Alemán", english: "Inglés", french: "Francés", italian: "Italiano", spanish: "Español", moduleHint: "Estamos trabajando en ello.", currentSystem: "Sistema actual",
    activeProfile: "Perfil de misión activo", expedition: "Expedición", shipStatus: "Estado de la nave",
    docked: "Atracado", inFlight: "En vuelo", eliteDisconnected: "Sin conexión con Elite Dangerous", unknown: "Estado desconocido", loading: "Detectando …",
    refreshJournal: "Actualizar diario", ready: "listo", initializing: "inicialización", error: "error",
    journalSource: "Fuente del diario", journalConnected: "Diario conectado", journalDisconnected: "Diario desconectado",
    journalSearch: "La aplicación busca en la carpeta de partidas guardadas de Windows.", openJournalFolder: "Abrir carpeta del diario",
    unnamed: "Aún sin nombre", assistantDescription: "Aquí se configuran la salida de voz, la personalidad y la frase de activación.",
    openSettings: "Abrir ajustes", configureNow: "Configurar ahora", setup: "Configuración inicial", renameComputer: "Cambiar el nombre del ordenador de a bordo", renameAvailableFrom015: "El cambio de nombre del ordenador de a bordo estará disponible a partir de la versión 0.15.",
    computerQuestion: "¿Cómo quieres llamar a tu ordenador de a bordo?", renameLater: "Actualmente, el nombre del ordenador de a bordo no puede cambiarse después de la configuración inicial. Esta función estará disponible con la versión 0.15.",
    computerName: "Nombre del ordenador de a bordo", enterName: "Introduce un nombre personalizado", characters: "caracteres", cancel: "Cancelar", saveName: "Guardar nombre",
    nextJump: "Próximo salto", noRoute: "No hay ruta trazada", destination: "Sistema de destino", noDestination: "Sin destino",
    remainingJumps: "Saltos restantes", plottedRoute: "Ruta elegida", remainingLy: "Quedan {value} al",
    distanceUnavailable: "Distancia no disponible", currentPosition: "Posición actual", nextDestination: "Próximo destino",
    jump: "Salto {value}", scoopable: "Repostable", notScoopable: "No repostable", starClassUnknown: "Clase estelar desconocida",
    routeHint: "Traza una ruta en Elite Dangerous. Aparecerá aquí automáticamente.", footer: "El ordenador de a bordo de Elite Dangerous",
    updateAvailable: "Actualización disponible", updateIntro: "La versión {version} está disponible.", releaseNotes: "Notas de la versión", noReleaseNotes: "No hay notas disponibles para esta versión.",
    later: "Más tarde", updateLater: "Actualizar más tarde", updateFailed: "No se pudo instalar la actualización.", checkingUpdate: "Buscando actualizaciones …",
    startupErrorLabel: "Diagnóstico de inicio", startupErrorTitle: "OGG no pudo iniciarse por completo.", startupErrorBody: "La instalación o un servicio en segundo plano necesario podría estar dañado.",
    startupErrorVersion: "Versión {version}", restart: "Reiniciar", repair: "Reparar", repairing: "Reparando …", openLog: "Abrir registro", quit: "Salir",
    updateDownloading: "Descargando actualización …", updateInstalling: "La actualización se instalará al cerrar OGG …", updateRestarting: "OGG se está reiniciando …", updateReady: "Actualización lista. Se instalará al cerrar OGG.", updateReadyVersion: "La versión {version} se ha descargado completamente en segundo plano.", dismiss: "Ocultar",
    systemStatusLabel: "Estado del sistema OGG: {status}", eliteJournal: "Diario de Elite Dangerous", continue: "Continuar", aboutOgg: "Acerca de OGG", openMessage: "Abrir mensaje", tonyWelcomeMessage: "Mensaje de bienvenida de Tony", seasonalReminder: "Recordatorio de temporada",
  },
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
