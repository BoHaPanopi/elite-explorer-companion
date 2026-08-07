import { createDiscordClient } from "./services/discordClient.js";
import { DISCORD_TOKEN } from "./config/env.js";

const client = createDiscordClient();

client.once("ready", () => {
  console.log(`Discord bot ready as ${client.user?.tag}`);
});

client.on("error", (error) => {
  console.error("Discord client error:", error);
});

process.on("SIGINT", async () => {
  console.log("Shutting down Discord bot...");
  await client.destroy();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down Discord bot...");
  await client.destroy();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

await client.login(DISCORD_TOKEN);
