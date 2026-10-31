import "dotenv/config";
import { REST, Routes } from "discord.js";
import { statsCommand } from "./commands/stats";
import { logger } from "./utils/logger";

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

if (!token || !clientId) {
    throw new Error(
        "Missing DISCORD_TOKEN or CLIENT_ID in environment variables."
    );
}

const commands = [statsCommand.data.toJSON()];

const rest = new REST().setToken(token);

async function deploy() {
    try {
        logger.info(`Registering ${commands.length} command(s)...`);

        // With GUILD_ID set, commands register to that server instantly (good for testing).
        // Without it, they register globally and can take up to an hour to appear.
        const route = guildId
            ? Routes.applicationGuildCommands(clientId!, guildId)
            : Routes.applicationCommands(clientId!);

        await rest.put(route, { body: commands });

        logger.info(
            guildId
                ? `Registered commands to guild ${guildId}.`
                : "Registered commands globally."
        );
    } catch (error) {
        logger.error("Failed to register commands:", error);
        process.exit(1);
    }
}

void deploy();
