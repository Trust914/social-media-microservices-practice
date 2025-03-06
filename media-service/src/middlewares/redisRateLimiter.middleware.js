import { HTTPCODES } from "../utils/constants.util.js";
import { MediaServiceError } from "../utils/error.util.js";

export const redisRateLimiterMiddleware = (redisRateLimiter) => async (req, res, next) => {
    try {
      await redisRateLimiter.consume(req.ip);
      next();
    } catch (error) {
      const err = new MediaServiceError(
        err.name,
        HTTPCODES.TOO_MANY_REQUESTS,
        `To many requests received from IP: ${req.ip}. Please try again later`,
        true,
        { cause: error.cause }
      );
      next(err);
    }
  };
