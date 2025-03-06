import winston from "winston";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filePath = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filePath);
const logDir = path.join(__dirname, "../../logs");
const service = "identity-service"

if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    logger.error("Unable the create the log directory" + error.message,{stack: error.stack} )
  }
}

const logLevels = winston.config.npm.levels;
const logColors = winston.config.npm.colors;
const isDevEnvironment = process.env.NODE_ENV === "development";

const baseFormat = winston.format.combine(
  winston.format.colorize(), // adds colors to log levels when logging to the console.
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat() // enable string interpolation using printf-style formatting (%s, %d, %j, etc.)
);

const devFormat = winston.format.combine(
  baseFormat,
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp}(${service}) [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""
    }`;
  })
);

const prodFormat = winston.format.combine(baseFormat, winston.format.json());

// app logger classm
class Logger {
  constructor() {
    // Define transports
    const fileErrorTransport = new winston.transports.File({
      filename: path.join(logDir, `${service}-error.log`),
      level: "error",
      handleExceptions: true,
      format: prodFormat,
    });

    const fileAllLogsTransport = new winston.transports.File({
      filename: path.join(logDir, `${service}-allLogs.log`),
      handleExceptions: true,
      format: prodFormat,
    });

    const consoleTransport = new winston.transports.Console({
      format: devFormat,
    });

    this.logger = winston.createLogger({
      level: isDevEnvironment ? "debug" : "info",
      levels: logLevels,
      // defaultMeta: { service: "identity-service" },
      exitOnError: false, // Prevents crashing on logging failures
      transports: isDevEnvironment
        ? [consoleTransport, fileAllLogsTransport]
        : [fileErrorTransport, fileAllLogsTransport],
    });
    // Add Colors
    winston.addColors(logColors);
  }

  debug(msg, meta) {
    this.logger.debug(msg, meta);
  }

  info(msg, meta) {
    this.logger.info(msg, meta);
  }

  warn(msg, meta) {
    this.logger.warn(msg, meta);
  }

  error(msg, meta) {
    this.logger.error(msg, meta);
  }

  fatal(msg, meta) {
    this.logger.log("fatal", msg, meta);
  }
}

export const logger = new Logger();
