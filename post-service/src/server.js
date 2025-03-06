import express from "express";
import cors from "cors";
import { corsConfig } from "./config/cors.config.js";
import { Redis } from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { PORT } from "./config/service.config.js";
import { connectToDB } from "./database/connection.js";
import { logger } from "./utils/logger.util.js";
import { redisConfig, rateLimiterOptionsRedis } from "./config/redis.config.js";
import { PostServiceError } from "./utils/error.util.js";
import { HTTPCODES } from "./utils/constants.util.js";
import { redisRateLimiterMiddleware } from "./middlewares/redisRateLimiter.middleware.js";
import helmet from "helmet";
import { requestLoggerMiddelware } from "./middlewares/requestLogger.middleware.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import PostRoutes from "./routes/posts.routes.js";
import { endpointRateLimiter } from "./config/endpointRateLimiter.config.js";
import { rateLimit } from "express-rate-limit";
import { connectToRabbitMQ } from "./utils/rabbitmq.util.js";

const redisClient = new Redis(redisConfig);
redisClient.on("error", (error) => {
  logger.error(`Error in Redis client.${error.message}`, {
    cause: error.cause,
    info: error.message,
  });
});
const redisRateLimiterOpts = rateLimiterOptionsRedis(redisClient);
const redisRateLimiter = new RateLimiterRedis(redisRateLimiterOpts);

const endpointRateLimiterOpts = endpointRateLimiter(redisClient);
const app = express();

//middelwares
app.use(express.json());
app.use(helmet());
app.use(cors(corsConfig));
app.use(redisRateLimiterMiddleware(redisRateLimiter));
// app.use(rateLimit(endpointRateLimiterOpts))
app.use(requestLoggerMiddelware);

app.use("/api/posts", rateLimit(endpointRateLimiterOpts));

// routes: need redisClient
app.use(
  "/api/posts",
  async (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  PostRoutes
);

// central error handler
app.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    logger.warn("connecting to db");
    await connectToDB();

    logger.warn("connecting to RabbitMWQ");

    await connectToRabbitMQ();

    app.listen(PORT, (error) => {
      if (error) {
        logger.fatal(`Error while starting the application server`, {
          name: error.name,
          details: error.message,
        });
        return;
      }
      logger.info(`Post service has started on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`ServerStartError-${error.name}`, {
      info: error.message,
      cause: error.cause,
    });
    process.exit(1);
  }
};

startServer();
// handle unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at`, promise, "reason:", reason);
});

// handle uncaught exception
process.on("uncaughtException", (error) => {
  logger.error(`Uncaugh exception `, { error });
});
