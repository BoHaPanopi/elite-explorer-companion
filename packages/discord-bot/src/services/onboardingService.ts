import type { GuildMember } from "discord.js";
import {
  DISCORD_RULES_CHANNEL_ID,
  DISCORD_WELCOME_CHANNEL_ID,
  createAcceptRulesCustomId,
} from "../config/discord.js";
import { createAcceptButton } from "../ui/acceptButton.js";
import { createWelcomeEmbed } from "../ui/welcomeEmbed.js";
import { createRulesOnboardingMessage, createWelcomeMessage } from "./messageService.js";

export type OnboardingDispatchResult =
  | {
    ok: true;
    channelId: string;
    messageId: string;
  }
  | {
    ok: false;
    reason:
      | "channel_not_found"
      | "channel_not_text"
      | "rules_channel_not_found"
      | "rules_channel_not_text"
      | "send_failed";
  };

type SendOnboardingMessageInput = {
  member: GuildMember;
  localeHint?: string;
};

export async function sendOnboardingMessage(
  input: SendOnboardingMessageInput,
): Promise<OnboardingDispatchResult> {
  const welcomeChannel = await input.member.guild.channels
    .fetch(DISCORD_WELCOME_CHANNEL_ID)
    .catch(() => null);

  if (!welcomeChannel) {
    console.warn(
      `[ONBOARDING] Welcome channel ${DISCORD_WELCOME_CHANNEL_ID} was not found.`,
    );
    return { ok: false, reason: "channel_not_found" };
  }

  if (!welcomeChannel.isTextBased() || welcomeChannel.isDMBased()) {
    console.warn(
      `[ONBOARDING] Channel ${DISCORD_WELCOME_CHANNEL_ID} is not a guild text channel.`,
    );
    return { ok: false, reason: "channel_not_text" };
  }

  const rulesChannel = await input.member.guild.channels
    .fetch(DISCORD_RULES_CHANNEL_ID)
    .catch(() => null);

  if (!rulesChannel) {
    console.warn(
      `[ONBOARDING] Rules channel ${DISCORD_RULES_CHANNEL_ID} was not found.`,
    );
    return { ok: false, reason: "rules_channel_not_found" };
  }

  if (!rulesChannel.isTextBased() || rulesChannel.isDMBased()) {
    console.warn(
      `[ONBOARDING] Channel ${DISCORD_RULES_CHANNEL_ID} is not a guild text channel.`,
    );
    return { ok: false, reason: "rules_channel_not_text" };
  }

  const welcomeMessage = createWelcomeMessage({
    locale: input.localeHint ?? input.member.guild.preferredLocale,
    userMention: `<@${input.member.id}>`,
  });

  try {
    const message = await welcomeChannel.send({
      content: `<@${input.member.id}>`,
      embeds: [createWelcomeEmbed(welcomeMessage)],
    });

    await rulesChannel.send({
      content: createRulesOnboardingMessage({
        locale: input.localeHint ?? input.member.guild.preferredLocale,
      }),
      components: [
        createAcceptButton(
          createAcceptRulesCustomId(input.member.id),
          welcomeMessage.buttonLabel,
        ),
      ],
    });

    console.log(
      `[ONBOARDING] Welcome message sent for ${input.member.user.tag} in #${welcomeChannel.id}; accept button posted in #${rulesChannel.id}.`,
    );

    return {
      ok: true,
      channelId: welcomeChannel.id,
      messageId: message.id,
    };
  } catch (error) {
    console.warn(
      `[ONBOARDING] Failed to send welcome message for ${input.member.user.tag}.`,
      error,
    );
    return { ok: false, reason: "send_failed" };
  }
}