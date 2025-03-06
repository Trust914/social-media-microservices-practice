import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_USERNAME,
} from "./service.config.js";

export const redisConfig = {
  port: REDIS_PORT,
  host: REDIS_HOST,
  // username: REDIS_USERNAME,
  password: REDIS_PASSWORD,
  db: 0,
  keyprefix: "post-service",
};

export const rateLimiterOptionsRedis = (redisClient) => {
  return {
    storeClient: redisClient,
    points: 5, 
    duration: 5, 
    keyPrefix: "redis-rate-limiter-middleware",
    blockDuration: 60,
  };
};
