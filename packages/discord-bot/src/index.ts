import { ApplicationFlagsBitField, Events } from "discord.js";
import { createDiscordClient } from "./services/discordClient.js";
import { DISCORD_TOKEN, DISCORD_GUILD_ID } from "./config/env.js";
import { commandRegistry } from "./commands/index.js";
import { handleGuildMemberAdd } from "./events/guildMemberAdd.js";
import { handleInteractionCreate } from "./events/interactionCreate.js";
import { handleMessageCreate } from "./events/messageCreate.js";

const client = createDiscordClient();

console.log("Registered commands:", [...commandRegistry.keys()]);

client.once(Events.ClientReady, async () => {
  const user = client.user!;
  console.log(`Bot username : ${user.username}`);
  console.log(`Bot ID       : ${user.id}`);

  const app = await client.application?.fetch().catch(() => null);
  const appFlags = app?.flags ?? new ApplicationFlagsBitField(0);
  console.log(
    `Application Flags: GatewayMessageContent=${appFlags.has(ApplicationFlagsBitField.Flags.GatewayMessageContent)} GatewayMessageContentLimited=${appFlags.has(ApplicationFlagsBitField.Flags.GatewayMessageContentLimited)}`,
  );

  try {
    const guild = await client.guilds.fetch(DISCORD_GUILD_ID);
    console.log(`Guild name   : ${guild.name}`);
    console.log(`Guild ID     : ${guild.id}`);
  } catch {
    console.warn(
      `Could not fetch guild ${DISCORD_GUILD_ID} — the bot may not be a member yet.`
    );
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

client.on(Events.GuildMemberAdd, async (member) => {
  try {
    await handleGuildMemberAdd(member);
  } catch (error) {
    console.error("Guild member add handler failed:", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await handleMessageCreate(message);
  } catch (error) {
    console.error("Message handler failed:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    try {
      await handleInteractionCreate(interaction);
    } catch (error) {
      console.error("Interaction handler failed:", error);
    }

    return;
  }

  if (!interaction.isChatInputCommand()) return;

  console.log("Incoming command:", interaction.commandName);
  console.log("Registry at runtime:", [...commandRegistry.keys()]);

  const command = commandRegistry.get(interaction.commandName);

  if (!command) {
    console.warn(`Unregistered slash command: ${interaction.commandName}`);

    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Command ${interaction.commandName} failed:`, error);

    const msg = {
      content: "Something went wrong.",
      ephemeral: true,
    };

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