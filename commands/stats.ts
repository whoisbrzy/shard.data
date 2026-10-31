import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    ContainerBuilder,
    TextDisplayBuilder,
    MessageFlags,
} from "discord.js";
import si from "systeminformation";
import os from "node:os";

export const statsCommand = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("View Shard's host system statistics."),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply({
            flags: MessageFlags.IsComponentsV2,
        });

        const [cpu, memory, filesystems, load] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.fsSize(),
            si.currentLoad(),
        ]);

        const totalMemory = memory.total;
        const usedMemory = memory.active || memory.used;

        const memoryPercent = totalMemory > 0
            ? (usedMemory / totalMemory) * 100
            : 0;

        const disk = filesystems.find(
            (fs) => fs.mount === "/" || fs.mount === "C:"
        ) ?? filesystems[0];

        const diskPercent = disk?.use ?? 0;

        const formatBytes = (bytes: number) => {
            const gb = bytes / 1024 ** 3;
            return `${gb.toFixed(2)} GB`;
        };

        const uptime = os.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        "# Shard System Statistics",
                        "",
                        "### Processor",
                        `- **CPU:** ${cpu.brand}`,
                        `- **Usage:** ${load.currentLoad.toFixed(1)}%`,
                        `- **Cores:** ${cpu.cores}`,
                        "",
                        "### Memory",
                        `- **Used:** ${formatBytes(usedMemory)}`,
                        `- **Total:** ${formatBytes(totalMemory)}`,
                        `- **Usage:** ${memoryPercent.toFixed(1)}%`,
                        "",
                        "### Storage",
                        disk
                            ? `- **Mount:** ${disk.mount}\n- **Used:** ${formatBytes(disk.used)}\n- **Total:** ${formatBytes(disk.size)}\n- **Usage:** ${diskPercent.toFixed(1)}%`
                            : "- Disk information unavailable.",
                        "",
                        "### Runtime",
                        `- **Platform:** ${os.platform()}`,
                        `- **Architecture:** ${os.arch()}`,
                        `- **System Uptime:** ${hours}h ${minutes}m`,
                        "",
                        "-# These statistics describe the machine or container hosting Shard, not the ER:LC game server.",
                    ].join("\n")
                )
            );

        await interaction.editReply({
            components: [container],
        });
    },
};
