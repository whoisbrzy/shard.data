type LogLevel = "error" | "warn" | "info" | "debug" | "trace";

const levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4,
};

const configuredLevel = (
    process.env.LOG_LEVEL?.toLowerCase() || "info"
) as LogLevel;

const currentLevel: number =
    configuredLevel in levels ? levels[configuredLevel] : levels.info;

function log(
    level: LogLevel,
    message: string,
    ...args: unknown[]
): void {
    if (levels[level] > currentLevel) return;

    const timestamp = new Date().toISOString();

    const output = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...(args.length > 0 && { details: args }),
    };

    const formatted = JSON.stringify(output);

    if (level === "error") {
        console.error(formatted);
    } else if (level === "warn") {
        console.warn(formatted);
    } else {
        console.log(formatted);
    }
}

export const logger = {
    error: (message: string, ...args: unknown[]) =>
        log("error", message, ...args),

    warn: (message: string, ...args: unknown[]) =>
        log("warn", message, ...args),

    info: (message: string, ...args: unknown[]) =>
        log("info", message, ...args),

    debug: (message: string, ...args: unknown[]) =>
        log("debug", message, ...args),

    trace: (message: string, ...args: unknown[]) =>
        log("trace", message, ...args),
};
