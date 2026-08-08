import type { Language } from "ogg-core";

type CopySet = {
  welcomeGreeting: string;
  welcomeContinueHint: string;
  rulesPrompt: string;
  dialectLine: string[];
  acceptSuccess: string[];
  acceptAlreadyDone: string[];
  acceptDenied: string[];
  onboardingSent: string;
  onboardingFailed: string;
  adminOnly: string;
  guildOnly: string;
  roleMissing: string;
  roleAssignFailed: string;
  genericFailure: string;
};

type WelcomeMessageInput = {
  locale?: string;
  userMention: string;
};

type WelcomeMessage = {
  title: string;
  description: string;
  buttonLabel: string;
};

type RulesReplyKind =
  | "accepted"
  | "alreadyAccepted"
  | "notTargetUser"
  | "roleMissing"
  | "roleAssignFailed"
  | "genericFailure";

type RuntimeReplyKind = "adminOnly" | "guildOnly";

type OnboardingResultLike = {
  ok: boolean;
  channelId?: string;
};

type RulesOnboardingMessageInput = {
  locale?: string;
};

const supportedLanguages: Language[] = ["de", "en", "fr", "it", "es"];

const copy: Record<Language, CopySet> = {
  de: {
    welcomeGreeting: "Willkommen an Bord, {user}.",
    welcomeContinueHint: "Bitte fahre jetzt in #rules mit dem Onboarding fort.",
    rulesPrompt: "Bitte lies die Regeln oben vollständig durch.\nWenn du fertig bist, klicke auf den Button.",
    dialectLine: [
      "Servus. I bin da OGG. Lies da zerscht d'Regeln durch.",
      "Servus. Da OGG is do. Schau da zersdds d'Regeln o.",
    ],
    acceptSuccess: [
      "Zugriff freigeschaltet. Willkommen an Bord.",
      "Freigabe erteilt. Willkommen an Bord.",
    ],
    acceptAlreadyDone: [
      "Die Regeln san scho bestätigt. Du bist bereits freigeschaltet.",
    ],
    acceptDenied: [
      "Des is ned dei Onboarding-Nachricht.",
    ],
    onboardingSent: "Onboarding-Nachricht in <#{channelId}> gesendet.",
    onboardingFailed: "Onboarding konnte nicht gesendet werden. Details stehen im Bot-Log.",
    adminOnly: "Dieser Command ist nur für Administratoren freigeschaltet.",
    guildOnly: "Dieser Command funktioniert nur auf dem Server.",
    roleMissing: "Die Commander-Rolle wurde nicht gefunden. Bitte die Bot-Konfiguration prüfen.",
    roleAssignFailed: "Die Rolle konnte nicht vergeben werden. Bitte Bot-Berechtigungen prüfen.",
    genericFailure: "Des hod ned sauber funktioniert. Versuch's no amoi.",
  },
  en: {
    welcomeGreeting: "Welcome aboard, {user}.",
    welcomeContinueHint: "Bitte fahre jetzt in #rules mit dem Onboarding fort.",
    rulesPrompt: "Please read the rules above in full.\nWhen you're done, click the button.",
    dialectLine: [
      "Servus. I bin da OGG. Lies da zerscht d'Regeln durch.",
      "Servus. Da OGG is do. Schau da zersdds d'Regeln o.",
    ],
    acceptSuccess: [
      "Access granted. Welcome aboard.",
      "Access confirmed. Welcome aboard.",
    ],
    acceptAlreadyDone: [
      "Rules already accepted. Access is already active.",
    ],
    acceptDenied: [
      "This onboarding prompt is assigned to another commander.",
    ],
    onboardingSent: "Onboarding message sent to <#{channelId}>.",
    onboardingFailed: "Onboarding could not be sent. Check the bot logs for details.",
    adminOnly: "This command is limited to administrators.",
    guildOnly: "This command only works inside the server.",
    roleMissing: "The commander role was not found. Check the bot configuration.",
    roleAssignFailed: "I could not assign the role. Check the bot permissions.",
    genericFailure: "That did not go through cleanly. Try again.",
  },
  fr: {
    welcomeGreeting: "Bienvenue à bord, {user}.",
    welcomeContinueHint: "Bitte fahre jetzt in #rules mit dem Onboarding fort.",
    rulesPrompt: "Merci de lire entièrement le règlement ci-dessus.\nQuand tu as fini, clique sur le bouton.",
    dialectLine: [
      "Servus. I bin da OGG. Lies da zerscht d'Regeln durch.",
      "Servus. Da OGG is do. Schau da zersdds d'Regeln o.",
    ],
    acceptSuccess: [
      "Accès accordé. Bienvenue à bord.",
      "Accès confirmé. Bienvenue à bord.",
    ],
    acceptAlreadyDone: [
      "Le règlement est déjà accepté. L'accès est déjà ouvert.",
    ],
    acceptDenied: [
      "Ce message d'accueil est attribué à un autre commandant.",
    ],
    onboardingSent: "Message d'accueil envoyé dans <#{channelId}>.",
    onboardingFailed: "L'accueil n'a pas pu être envoyé. Vérifie les logs du bot.",
    adminOnly: "Cette commande est réservée aux administrateurs.",
    guildOnly: "Cette commande fonctionne uniquement sur le serveur.",
    roleMissing: "Le rôle Commander est introuvable. Vérifie la configuration du bot.",
    roleAssignFailed: "Je n'ai pas pu attribuer le rôle. Vérifie les permissions du bot.",
    genericFailure: "Le passage ne s'est pas fait proprement. Réessaie.",
  },
  it: {
    welcomeGreeting: "Benvenuto a bordo, {user}.",
    welcomeContinueHint: "Bitte fahre jetzt in #rules mit dem Onboarding fort.",
    rulesPrompt: "Leggi per intero le regole qui sopra.\nQuando hai finito, premi il pulsante.",
    dialectLine: [
      "Servus. I bin da OGG. Lies da zerscht d'Regeln durch.",
      "Servus. Da OGG is do. Schau da zersdds d'Regeln o.",
    ],
    acceptSuccess: [
      "Accesso concesso. Benvenuto a bordo.",
      "Accesso confermato. Benvenuto a bordo.",
    ],
    acceptAlreadyDone: [
      "Regole già accettate. L'accesso è già attivo.",
    ],
    acceptDenied: [
      "Questo messaggio di onboarding è destinato a un altro comandante.",
    ],
    onboardingSent: "Messaggio di onboarding inviato in <#{channelId}>.",
    onboardingFailed: "Impossibile inviare l'onboarding. Controlla i log del bot.",
    adminOnly: "Questo comando è riservato agli amministratori.",
    guildOnly: "Questo comando funziona solo nel server.",
    roleMissing: "Il ruolo Commander non è stato trovato. Controlla la configurazione del bot.",
    roleAssignFailed: "Non sono riuscito ad assegnare il ruolo. Controlla i permessi del bot.",
    genericFailure: "Non è passato liscio. Riprova.",
  },
  es: {
    welcomeGreeting: "Bienvenido a bordo, {user}.",
    welcomeContinueHint: "Bitte fahre jetzt in #rules mit dem Onboarding fort.",
    rulesPrompt: "Lee por completo las normas de arriba.\nCuando termines, pulsa el botón.",
    dialectLine: [
      "Servus. I bin da OGG. Lies da zerscht d'Regeln durch.",
      "Servus. Da OGG is do. Schau da zersdds d'Regeln o.",
    ],
    acceptSuccess: [
      "Acceso concedido. Bienvenido a bordo.",
      "Acceso confirmado. Bienvenido a bordo.",
    ],
    acceptAlreadyDone: [
      "Las normas ya están aceptadas. El acceso ya está activo.",
    ],
    acceptDenied: [
      "Este mensaje de onboarding pertenece a otro comandante.",
    ],
    onboardingSent: "Mensaje de onboarding enviado a <#{channelId}>.",
    onboardingFailed: "No se pudo enviar el onboarding. Revisa los logs del bot.",
    adminOnly: "Este comando está limitado a administradores.",
    guildOnly: "Este comando solo funciona dentro del servidor.",
    roleMissing: "No se encontró el rol Commander. Revisa la configuración del bot.",
    roleAssignFailed: "No pude asignar el rol. Revisa los permisos del bot.",
    genericFailure: "Eso no salió limpio. Inténtalo otra vez.",
  },
};

function normalizeLanguage(locale?: string): Language {
  const baseLocale = locale?.toLocaleLowerCase("en-US").split("-")[0];

  if (baseLocale && supportedLanguages.includes(baseLocale as Language)) {
    return baseLocale as Language;
  }

  return "en";
}

function chooseVariant(variants: string[]): string {
  return variants[Math.floor(Math.random() * variants.length)] ?? variants[0] ?? "";
}

function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}

export function resolveOnboardingLanguage(locale?: string): Language {
  return normalizeLanguage(locale);
}

export function createWelcomeMessage(input: WelcomeMessageInput): WelcomeMessage {
  const language = normalizeLanguage(input.locale);
  const languageCopy = copy[language];

  return {
    title: interpolate(languageCopy.welcomeGreeting, {
      user: input.userMention,
    }),
    description: languageCopy.welcomeContinueHint,
    buttonLabel: "Accept Rules",
  };
}

export function createRulesOnboardingMessage(
  input: RulesOnboardingMessageInput,
): string {
  const language = normalizeLanguage(input.locale);
  const languageCopy = copy[language];

  return languageCopy.rulesPrompt;
}

export function createRulesReply(
  kind: RulesReplyKind,
  locale?: string,
): string {
  const languageCopy = copy[normalizeLanguage(locale)];

  switch (kind) {
    case "accepted":
      return `${chooseVariant(languageCopy.acceptSuccess)}\n${chooseVariant(languageCopy.dialectLine)}`;
    case "alreadyAccepted":
      return `${chooseVariant(languageCopy.acceptAlreadyDone)}\n${chooseVariant(languageCopy.dialectLine)}`;
    case "notTargetUser":
      return `${chooseVariant(languageCopy.acceptDenied)}\n${chooseVariant(languageCopy.dialectLine)}`;
    case "roleMissing":
      return languageCopy.roleMissing;
    case "roleAssignFailed":
      return languageCopy.roleAssignFailed;
    case "genericFailure":
      return languageCopy.genericFailure;
  }
}

export function createOnboardingTestReply(
  result: OnboardingResultLike,
  locale?: string,
): string {
  const languageCopy = copy[normalizeLanguage(locale)];

  if (!result.ok || !result.channelId) {
    return languageCopy.onboardingFailed;
  }

  return languageCopy.onboardingSent.replace("{channelId}", result.channelId);
}

export function createRuntimeReply(kind: RuntimeReplyKind, locale?: string): string {
  const languageCopy = copy[normalizeLanguage(locale)];

  switch (kind) {
    case "adminOnly":
      return languageCopy.adminOnly;
    case "guildOnly":
      return languageCopy.guildOnly;
  }
}