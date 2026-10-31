import "dotenv/config";
import {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
} from "discord.js";
import { statsCommand } from "./commands/stats";
import { logger } from "./utils/logger";

const token = process.env.DISCORD_TOKEN;

if (!token) {
    throw new Error("Missing DISCORD_TOKEN in environment variables.");
}

const client = new Client({
    intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, (readyClient) => {
    logger.info(`Logged in as ${readyClient.user.tag}`);
    logger.info("Shard is online.");
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        switch (interaction.commandName) {
            case "stats":
                await statsCommand.execute(interaction);
                break;

            default:
                await interaction.reply({
                    content: "Unknown command.",
                    flags: MessageFlags.Ephemeral,
                });
        }
    } catch (error) {
        logger.error("Command execution failed:", error);

        const response = {
            content: "An error occurred while executing this command.",
            flags: MessageFlags.Ephemeral,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(response).catch(() => null);
        } else {
            await interaction.reply(response).catch(() => null);
        }
    }
});

process.on("unhandledRejection", (error) => {
    logger.error("Unhandled promise rejection:", error);
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    process.exit(1);
});

async function start() {
    try {
        await client.login(token);
    } catch (error) {
        logger.error("Failed to start Shard:", error);
        process.exit(1);
    }
}

async function shutdown() {
    logger.info("Shutting down Shard...");
    client.destroy();
    process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

void start();
