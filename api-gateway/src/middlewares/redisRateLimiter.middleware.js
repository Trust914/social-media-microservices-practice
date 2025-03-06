import { APIGatewayError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";

export const redisRateLimiterMiddleware = (rateLimiter) => {
  return async (req, res, next) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (error) {
      const err = new APIGatewayError(
        `${error.name}`,
        HTTPCODES.TOO_MANY_REQUESTS,
        `[Redis]: Rate limit exceeded for IP: ${req.ip}`,
        true,
        { details: error.message }
      );

      next(err);
    }
  };
};
