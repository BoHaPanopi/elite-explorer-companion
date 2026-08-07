# discord-bot

Old Guy of Grumpy (OGG) — the official AI-powered onboard companion for the Elite Explorer Companion project.

The OGG Discord companion bot — bringing OGG into your server.

## What it does

- Connects to Discord and logs in with a verified bot account
- Registers and handles guild slash commands
- Responds to `/ogg`, `/quote`, `/about`, and `/help`
- Sources all OGG personality and sayings from `ogg-core` — nothing is duplicated in the bot

## Setup

Copy `.env.example` to `.env` and fill in the three values:

```
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=
```

In production (for example Railway), do not use a local `.env` file. Set these same variables in the service environment.

## Commands

```bash
# Build
npm run --workspace packages/discord-bot build

# Register slash commands with the configured guild (run once per guild)
node --env-file=packages/discord-bot/.env packages/discord-bot/dist/register.js

# Start the bot
node --env-file=packages/discord-bot/.env --enable-source-maps packages/discord-bot/dist/index.js
```

## Railway (Monorepo)

Use the repository root as the Railway service root so workspace dependencies (including `ogg-core`) resolve correctly.

Recommended Railway commands:

```bash
# Build command
npm run --workspace packages/discord-bot build

# Start command
npm run --workspace packages/discord-bot start
```

Required Railway environment variables:

- `DISCORD_TOKEN`
- `DISCORD_CLIENT_ID`
- `DISCORD_GUILD_ID`
