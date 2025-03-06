import express from "express";
import { connectToDB } from "./database/db.js";
import { logger } from "./utils/logger.util.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { corsConfig } from "./configs/cors.config.js";
import helmet from "helmet";
import { requestLogger } from "./middlewares/requestsHandler.middleware.js";
import { redisRateLimiterMiddleware } from "./middlewares/redisRateLimiter.middleware.js";
import { Redis } from "ioredis";
import {
  redisConnConfig,
  redisRateLimiterOptions,
} from "./configs/redis.config.js";
import UserRoutes from "./routes/user.routes.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { endpointRateLimiter } from "./configs/endpointsRateLimiter.config.js";

const app = express();
const PORT = process.env.PORT || 3001;

// initialise the Redis Client
const redisClient = new Redis(redisConnConfig);
redisClient.on("error", (err) => {
  logger.error(`RedisError - ${err.name}`, {
    message: err.message,
    cause: err.cause,
    stack: err.stack,
  });
});

// configure Rate-Limiter for Redis
const optionsRedisRateLimiter = redisRateLimiterOptions(redisClient);
const redisRateLimiter = new RateLimiterRedis(optionsRedisRateLimiter);

// server  middleware
app.use(helmet());
app.use(corsConfig());
app.use(express.json());

app.use(requestLogger);
//DDoS and brute force attack protection with Redis storage for points(requests)
app.use(redisRateLimiterMiddleware(redisRateLimiter));

// use additional express rate limiter for sensitive endpoints
app.use("/api/auth/register", endpointRateLimiter(redisClient));
app.use("/api/auth/login", endpointRateLimiter(redisClient));

// Routes
app.use("/api/auth", UserRoutes);

// use central error handler middleware
app.use(errorHandlerMiddleware);

app.listen(PORT, async () => {
  logger.info(`Identity service has started on port ${PORT}`);
  await connectToDB();
});

// handle unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection `, { promise, reason });
});

// handle uncaught exception
process.on("uncaughtException", (error) => {
  logger.error(`Uncaugh exception `, { error });
});
