import dotenv from "dotenv";

dotenv.config();

const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error("DISCORD_TOKEN environment variable is required to start the Discord bot.");
}

export const DISCORD_TOKEN = token;
