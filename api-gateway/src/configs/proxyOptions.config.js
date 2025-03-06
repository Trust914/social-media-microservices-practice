import { APIGatewayError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";
import { logger } from "../utils/logger.util.js";

export const proxyOptions = {
  proxyReqPathResolver: (req) => {
    const resolvedPath = req.originalUrl.replace(/^\/v1/, "/api");
    logger.debug(resolvedPath)
    return resolvedPath;
  },
  proxyErrorHandler: (err, res, next) => {
    const proxyError = new APIGatewayError(
      `ProxyError${err.name}`,
      HTTPCODES.FORBIDDEN,
      `${err.message}`,
      true
    );
    next(proxyError);
  },
};
