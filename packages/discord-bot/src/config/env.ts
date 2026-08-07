import dotenv from "dotenv";

dotenv.config();

const IS_PRODUCTION_RUNTIME =
  process.env.NODE_ENV === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT_NAME);

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);

    if (IS_PRODUCTION_RUNTIME) {
      console.error("Set this variable in your Railway service environment.");
      process.exit(1);
    }

    console.error("For local development, copy packages/discord-bot/.env.example to packages/discord-bot/.env.");
    console.error("Bot startup was skipped because credentials are missing.");
    process.exit(0);
  }
  return value;
}

export const DISCORD_TOKEN = requireEnv("DISCORD_TOKEN");
export const DISCORD_CLIENT_ID = requireEnv("DISCORD_CLIENT_ID");
export const DISCORD_GUILD_ID = requireEnv("DISCORD_GUILD_ID");
