import { REST, Routes } from "discord.js";
import { commandRegistry } from "./commands/index.js";
import "dotenv/config";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId || !guildId) {
  console.error("DISCORD_TOKEN, DISCORD_CLIENT_ID, and DISCORD_GUILD_ID must all be set.");
  process.exit(1);
}

const commandData = [...commandRegistry.values()].map((c) => c.data.toJSON());

const rest = new REST().setToken(token);

try {
  console.log(`Registering ${commandData.length} guild command(s)...`);
  const result = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commandData,
  });
  console.log(`Registered ${(result as unknown[]).length} command(s) in guild ${guildId}.`);
} catch (error) {
  console.error("Command registration failed:", error);
  process.exit(1);
}
