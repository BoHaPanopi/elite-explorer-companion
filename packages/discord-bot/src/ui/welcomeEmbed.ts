import { EmbedBuilder } from "discord.js";
import { OGG_COLOR } from "../config/discord.js";

type WelcomeEmbedInput = {
  title: string;
  description: string;
  dialectLine?: string;
};

export function createWelcomeEmbed(
  input: WelcomeEmbedInput,
): EmbedBuilder {
  const description = input.dialectLine
    ? `${input.description}\n\n*${input.dialectLine}*`
    : input.description;

  return new EmbedBuilder()
    .setColor(OGG_COLOR)
    .setTitle(input.title)
    .setDescription(description);
}