import { Events } from "discord.js";
import { createDiscordClient } from "./services/discordClient.js";
import { DISCORD_TOKEN, DISCORD_GUILD_ID } from "./config/env.js";
import { commandRegistry } from "./commands/index.js";

const client = createDiscordClient();

client.once(Events.ClientReady, async () => {
  const user = client.user!;
  console.log(`Bot username : ${user.username}`);
  console.log(`Bot ID       : ${user.id}`);

  // fetch the configured guild to confirm the bot can see it
  try {
    const guild = await client.guilds.fetch(DISCORD_GUILD_ID);
    console.log(`Guild name   : ${guild.name}`);
    console.log(`Guild ID     : ${guild.id}`);
  } catch {
    console.warn(`Could not fetch guild ${DISCORD_GUILD_ID} — the bot may not be a member yet.`);
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commandRegistry.get(interaction.commandName);
  if (!command) {
    console.warn(`Unknown command: ${interaction.commandName}`);
    await interaction.reply({ content: "Unknown command.", ephemeral: true });
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Command ${interaction.commandName} failed:`, error);
    const msg = { content: "Something went wrong.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
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
