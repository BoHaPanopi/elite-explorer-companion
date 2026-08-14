import type { Language } from "ogg-core";
import {
  DISCORD_ACCEPT_RULES_BUTTON_LABEL,
  DISCORD_ONBOARDING_COPY,
} from "../content/onboardingCopy.ts";

export type CopySet = {
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
  const languageCopy = DISCORD_ONBOARDING_COPY[language];

  return {
    title: interpolate(languageCopy.welcomeGreeting, {
      user: input.userMention,
    }),
    description: languageCopy.welcomeContinueHint,
    buttonLabel: DISCORD_ACCEPT_RULES_BUTTON_LABEL,
  };
}

export function createRulesOnboardingMessage(
  input: RulesOnboardingMessageInput,
): string {
  const language = normalizeLanguage(input.locale);
  const languageCopy = DISCORD_ONBOARDING_COPY[language];

  return languageCopy.rulesPrompt;
}

export function createRulesReply(
  kind: RulesReplyKind,
  locale?: string,
): string {
  const languageCopy = DISCORD_ONBOARDING_COPY[normalizeLanguage(locale)];

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
  const languageCopy = DISCORD_ONBOARDING_COPY[normalizeLanguage(locale)];

  if (!result.ok || !result.channelId) {
    return languageCopy.onboardingFailed;
  }

  return languageCopy.onboardingSent.replace("{channelId}", result.channelId);
}

export function createRuntimeReply(kind: RuntimeReplyKind, locale?: string): string {
  const languageCopy = DISCORD_ONBOARDING_COPY[normalizeLanguage(locale)];

  switch (kind) {
    case "adminOnly":
      return languageCopy.adminOnly;
    case "guildOnly":
      return languageCopy.guildOnly;
  }
}
