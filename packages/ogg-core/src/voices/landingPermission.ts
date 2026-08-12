import type { Language } from "../types/language.ts";

export type LandingPermissionState = {
  armed: boolean;
  reminded: boolean;
};

export type LandingPermissionInput = {
  stationName?: string | null;
  distanceKm: number;
  hasDockingPermission: boolean;
  hasWakeScanner: boolean;
};

export type LandingPermissionDecision = {
  nextState: LandingPermissionState;
  shouldRemind: boolean;
  text: string | null;
};

const REMINDER_VARIANTS: Record<Language, string[]> = {
  de: [
    "Fuer {station} hamma no koa Landeerlaubnis.",
    "{station} laesst uns grad no ned ran.",
    "No koa Freigabe fuer {station}.",
  ],
  en: [
    "We still do not have landing permission for {station}.",
    "{station} has not cleared us for docking yet.",
    "No landing permission for {station} yet.",
  ],
  fr: [
    "Nous n’avons pas encore l’autorisation d’amarrage pour {station}.",
    "{station} ne nous a pas encore autorises a nous amarrer.",
    "Pas encore d’autorisation d’amarrage pour {station}.",
  ],
  it: [
    "Non abbiamo ancora il permesso di attracco per {station}.",
    "{station} non ci ha ancora autorizzati all’attracco.",
    "Nessun permesso di attracco per {station} per ora.",
  ],
  es: [
    "Aun no tenemos permiso de atraque para {station}.",
    "{station} todavia no nos ha autorizado a atracar.",
    "Todavia no hay permiso de atraque para {station}.",
  ],
};

function chooseVariant(variants: string[]): string {
  if (variants.length === 0) return "";
  const index = Math.floor(Math.random() * variants.length);
  return variants[index] ?? variants[0] ?? "";
}

function normalizeStationName(stationName: string | null | undefined): string {
  const trimmed = stationName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "die Station";
}

export function evaluateLandingPermissionReminder(
  state: LandingPermissionState,
  input: LandingPermissionInput,
  language: Language,
): LandingPermissionDecision {
  if (input.hasWakeScanner) {
    return {
      nextState: { armed: false, reminded: false },
      shouldRemind: false,
      text: null,
    };
  }

  if (input.distanceKm > 7.5) {
    return {
      nextState: { armed: true, reminded: false },
      shouldRemind: false,
      text: null,
    };
  }

  const withinReminderBand = input.distanceKm <= 4.0 && input.distanceKm >= 3.5;
  const canRemind = withinReminderBand && !input.hasDockingPermission && state.armed && !state.reminded;

  if (!canRemind) {
    return {
      nextState: {
        armed: state.armed,
        reminded: state.reminded,
      },
      shouldRemind: false,
      text: null,
    };
  }

  const station = normalizeStationName(input.stationName);
  return {
    nextState: { armed: false, reminded: true },
    shouldRemind: true,
    text: chooseVariant(REMINDER_VARIANTS[language]).replace("{station}", station),
  };
}