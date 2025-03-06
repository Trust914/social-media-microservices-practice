import { HTTPCODES, isDevEnv } from "../utils/constants.util.js";
import { logger } from "../utils/logger.util.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  const statusCode = err.httpCode || HTTPCODES.INTERNAL_SERVER_ERROR;
  const message = err.description || "An unexpected error occurred";

  const logData = {
    name: err.name || "UnknownError",
    httpCode: statusCode,
    details: err.description,
    mainCause: err.cause,
    ...(isDevEnv && { stack: err.stack }),
  };

  logger.error(`Error: ${message}`, logData);

  return res.status(statusCode).json({
    ok: false,
    status: "Error",
    name: err.name || "UnknownError",
    httpCode: statusCode,
    description: message,
    details: isDevEnv && err.details,
  });
};
