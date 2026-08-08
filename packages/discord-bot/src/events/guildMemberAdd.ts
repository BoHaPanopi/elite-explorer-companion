import { GuildMember } from "discord.js";
import { sendOnboardingMessage } from "../services/onboardingService.js";

export async function handleGuildMemberAdd(
  member: GuildMember,
): Promise<void> {
  await sendOnboardingMessage({ member });
}