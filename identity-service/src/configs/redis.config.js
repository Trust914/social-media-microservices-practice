export const redisConnConfig= {
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
//   username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  keyPrefix: "identity-service",
  db: 0,
};

export const redisRateLimiterOptions = (redisClient) => {
  return {
    storeClient: redisClient,
    points: 5, // Number of requests allowed per duration
    duration: 5, // amount of time in seconds number of requests is allowed
    keyPrefix: "redis-rate-limiter-middleware", // must be unique for limiters with different purpose
    blockDuration: 60,
  };
};
