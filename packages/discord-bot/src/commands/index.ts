import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
} from "discord.js";
import * as ogg from "./ogg.js";
import * as quote from "./quote.js";
import * as about from "./about.js";
import * as help from "./help.js";
import * as onboardingTest from "./onboardingTest.js";
import * as testOggReactions from "./testOggReactions.js";

export type Command = {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

const commands: Command[] = [
  ogg,
  quote,
  about,
  help,
  onboardingTest,
  testOggReactions,
];

export const commandRegistry = new Map<string, Command>(
  commands.map((c) => [c.data.name, c]),
);
