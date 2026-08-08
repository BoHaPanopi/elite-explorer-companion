import type { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import * as ogg from "./ogg.js";
import * as quote from "./quote.js";
import * as about from "./about.js";
import * as help from "./help.js";
import * as onboardingTest from "./onboardingTest.js";

export type Command = {
  data: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands: Command[] = [ogg, quote, about, help, onboardingTest];

export const commandRegistry = new Map<string, Command>(
  commands.map((c) => [c.data.name, c]),
);
