import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    console.error("Copy packages/discord-bot/.env.example to packages/discord-bot/.env and fill in all values.");
    process.exit(1);
  }
  return value;
}

export const DISCORD_TOKEN = requireEnv("DISCORD_TOKEN");
export const DISCORD_CLIENT_ID = requireEnv("DISCORD_CLIENT_ID");
export const DISCORD_GUILD_ID = requireEnv("DISCORD_GUILD_ID");
