import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const transport = isDev
  ? { target: "pino/file", options: { destination: 1 } }
  : undefined;

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  transport,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ["req.headers.authorization", "req.headers.cookie"],
    remove: true,
  },
});
