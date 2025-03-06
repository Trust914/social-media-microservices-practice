// import { Redis } from "ioredis";
// import { redisConnConfig } from "../configs/redis.config.js";
// import { logger } from "../utils/logger.util.js";
import { IdentityServiceError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";

// const redisClient = new Redis(redisOptions);

// redisClient.on("error", (err) => {
//   logger.error(`RedisError - ${err.name}`, {
//     message: err.message,
//     cause: err.cause,
//     stack: err.stack,
//   });
// });

export const redisRateLimiterMiddleware = (rateLimiter) => {
  return async (req, res, next) => {
    try {
      await rateLimiter.consume(req.ip);
      next();
    } catch (error) {
      const err = new IdentityServiceError(
        `${error.name}`,
        HTTPCODES.TOO_MANY_REQUESTS,
        `Rate limit exceeded for IP: ${req.ip}`,
        true,
        { details: error.message }
      );

      next(err);
    }
  };
};
