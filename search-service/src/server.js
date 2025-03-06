import { RateLimiterRedis } from "rate-limiter-flexible";
import { rateLimit } from "express-rate-limit";
import { Redis } from "ioredis";
import {PORT} from "./config/env.config.js"
import { redisConnOpts, rateLimiterOptionsRedis } from "./config/redis.config.js";
import { logger } from "./utils/logger.util.js";
import express from "express";
import { endpointRateLimiter } from "./config/endpointRateLimiter.config.js";
import { redisRateLimiterMiddleware } from "./middlewares/redisRateLimiter.middleware.js";
import cors from "cors"
import helmet from "helmet"
import { corsConfig } from "./config/cors.config.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { connectToDB } from "./database/connection.js";
import { connectToRabbitMQ, consumeEvent } from "./utils/rabbitmq.util.js";
import SearchRoutes from "./routes/search.routes.js"
import { handlePostCreated, handlePostDeleted } from "./events/search.eventHandler.js";

const RedisClient = new Redis(redisConnOpts);
RedisClient.on("error",(error)=>{
    logger.error(`Redis client error. ${error.message}`,{cause: error.cause})
    logger.warn(`Exiting application`)
    process.exit(1)
})

const redisLimiterOpts = rateLimiterOptionsRedis(RedisClient)
const redisLimiter = new RateLimiterRedis(redisLimiterOpts) 

const sensitiveEndpointLimiter = rateLimit(endpointRateLimiter(RedisClient))

const app = express()

app.use(express.json())
app.use(helmet())
app.use(cors(corsConfig))
//DDoS protection
app.use(redisRateLimiterMiddleware(redisLimiter))

app.use("/api/search",sensitiveEndpointLimiter)
app.use("/api/search", async(req,res, next)=>{
    req.redisClient = RedisClient
    next()
}, SearchRoutes)

// central error handler
app.use(errorHandlerMiddleware)

const startServer = async () => {
  logger.warn("connecting to db");
  await connectToDB();

  logger.warn("connecting to RabbitMWQ");

  await connectToRabbitMQ();

  logger.warn("consuming events.....")
  await consumeEvent("post.created",handlePostCreated)
  await consumeEvent("post.deleted",handlePostDeleted)
  app.listen(PORT, (error) => {
    if (error) {
      logger.fatal(`Error while starting the application server`, {
        name: error.name,
        details: error.message,
      });
      logger.warn("Exiting application ....")
      process.exit(1);
    }
    logger.info(`Search service has started on port http://localhost:${PORT}`);
  });
};

startServer();
// handle unhandled promise rejection
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at`, promise, "reason:",reason );
});

// handle uncaught exception
process.on("uncaughtException", (error) => {
  logger.error(`Uncaugh exception `, { error });
});
