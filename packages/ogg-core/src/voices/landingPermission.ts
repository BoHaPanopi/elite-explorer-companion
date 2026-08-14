import type { Language } from "../types/language.ts";
import {
  LANDING_PERMISSION_FALLBACK_STATION,
  LANDING_PERMISSION_REMINDER_VARIANTS,
} from "../content/landingPermissionMessages.ts";

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

function chooseVariant(variants: string[]): string {
  if (variants.length === 0) return "";
  const index = Math.floor(Math.random() * variants.length);
  return variants[index] ?? variants[0] ?? "";
}

function normalizeStationName(stationName: string | null | undefined): string {
  const trimmed = stationName?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : LANDING_PERMISSION_FALLBACK_STATION;
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
    text: chooseVariant(LANDING_PERMISSION_REMINDER_VARIANTS[language]).replace("{station}", station),
  };
}
