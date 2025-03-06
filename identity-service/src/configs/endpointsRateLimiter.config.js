import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis"; // backend Redis store for storing the request counts in Redis
import { BaseError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";

export const endpointRateLimiter = (redisClient) => {
  // express-rate-limit (with Redis as store for sensitive API routes)
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: true,
    handler: (req, res, next) => {
      const err = new BaseError(
        `RateLimitError`,
        HTTPCODES.TOO_MANY_REQUESTS,
        `Sensitive endpoint rate limit exceeded for IP: ${req.ip}`,
        true
      );
      next(err);
    },
    store: new RedisStore({
      // Store the request counts in Redis
      sendCommand: (...args) => redisClient.call(...args),
    }),
  });
};
