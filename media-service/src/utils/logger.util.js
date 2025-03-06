import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { MediaServiceError } from "./error.util.js";
import { HTTPCODES } from "./constants.util.js";
import { isDevEnv } from "./constants.util.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const service = "media-service";
const logDir = path.join(__dirname, "../../logs");

if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (error) {
    const err = new MediaServiceError(
      `LogFileCreation-${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      `Unable to create the log directory/ file`,
      true,
      { details: err.message }
    );
    throw err;
  }
}


const consoleFormat = winston.format.combine(
  // winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),  winston.format.splat(), // enable string interpolation using printf-style formatting (%s, %d, %j, etc.)
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    return `${timestamp} (${service}) [${level}]: ${message} \n${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ""}`;
  })
);
const fileFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)
class Logger {
  constructor() {
    const errorLogsFile = new winston.transports.File({
      filename: path.join(logDir, `${service}-error.log`),
      level: "error",
      handleExceptions: true,
      format: fileFormat,
    });

    const allLogsFile = new winston.transports.File({
      filename: path.join(logDir, `${service}-allLogs.log`),
      handleExceptions: true,
      format: fileFormat,
    });

    const consoleTransport = new winston.transports.Console({
      format: consoleFormat,
    });

    this.logger = winston.createLogger({
      level: isDevEnv ? "debug" : "info",
      levels: winston.config.npm.levels,
      defaultMeta: { service },
      exitOnError: false, // Prevents crashing on logging failures
      transports: isDevEnv
        ? [consoleTransport, allLogsFile]
        : [errorLogsFile, allLogsFile],
    });
    // Add Colors
    winston.addColors(winston.config.npm.colors);
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
