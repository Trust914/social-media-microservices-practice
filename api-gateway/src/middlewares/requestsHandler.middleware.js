import { requestContext } from "../utils/constants.util.js";
import { logger } from "../utils/logger.util.js";

export function requestLogger(req, res, next) {
  const userAgent = req.get("User-Agent");
  const request = requestContext(req);

  logger.info(
    ` Received ${request.method} request to  ${request.url} from ${userAgent}`,
    request
  );
  next();
}
