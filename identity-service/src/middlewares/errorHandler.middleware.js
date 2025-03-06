import { HTTPCODES } from "../utils/constants.util.js";
import { IdentityServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";

export function errorHandlerMiddleware(err, req, res, next) {
  const statusCode = err.httpCode || HTTPCODES.INTERNAL_SERVER_ERROR;
  const message = err.message || "An unexpected error occurred";
  const isAppError = err instanceof IdentityServiceError;

  const logData = {
    name: err.name || "UnknownError",
    httpCode: statusCode,
    details: (isAppError && err.details) || null,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  logger.error(`Error: ${message}`, logData);

  return res.status(statusCode).json({
    ok: false,
    status: "Error",
    name: err.name || "UnknownError",
    httpCode: statusCode,
    description: message,
    details:
      (isAppError && process.env.NODE_ENV === "development" && err.details) ||
      null,
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
