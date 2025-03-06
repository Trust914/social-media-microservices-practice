import express from "express";
import { corsConfig } from "../../identity-service/src/configs/cors.config.js";
import { Redis } from "ioredis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import {
  redisConnConfig,
  redisRateLimiterOptions,
} from "../../identity-service/src/configs/redis.config.js";
import { endpointRateLimiter } from "./configs/endpointsRateLimiter.config.js";
import { redisRateLimiterMiddleware } from "./middlewares/redisRateLimiter.middleware.js";
import helmet from "helmet";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { logger } from "./utils/logger.util.js";
import { apiVersioningMiddleware } from "./middlewares/apiVersioning.middleware.js";
import proxy from "express-http-proxy";
import { proxyOptions } from "./configs/proxyOptions.config.js";
import { validateToken } from "./middlewares/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Start the redis client
const redisClient = new Redis(redisConnConfig);
redisClient.on("error", (err) => {
  logger.error(`RedisError - ${err.name}`, {
    message: err.message,
    cause: err.cause,
    stack: err.stack,
  });
});

const limiterOptions = redisRateLimiterOptions(redisClient); // options(config) for the RateLimiterRedis
const limiterRedis = new RateLimiterRedis(limiterOptions);

app.use(corsConfig());
app.use(helmet());
app.use(express.json());

app.use(apiVersioningMiddleware("v1"));
app.use(redisRateLimiterMiddleware(limiterRedis));
// app.use(endpointRateLimiter(redisClient))

// proxy for identity service
app.use(
  "/v1/auth/",
  proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from the Identity service : ${proxyRes.statusCode},${proxyRes.statusMessage}`
      );
      return proxyResData;
    },
  })
);

// proxy for post service
app.use(
  "/v1/posts/",validateToken,
  proxy(process.env.POST_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // logger.debug(srcReq.body.content)
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
      // logger.debug(proxyReqOpts.headers["x-user-id"])
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from the Post service : ${proxyRes.statusCode}, ${proxyRes.statusMessage}`
      );
      return proxyResData;
    },
  })
);

// proxy for media service
app.use(
  "/v1/media/",validateToken,
  proxy(process.env.MEDIA_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      
    if(!srcReq.headers["content-type"].startsWith("multipart/form-data")){
      proxyReqOpts.headers["Content-Type"] = "application/json";
    }
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
      logger.debug(srcReq.user.userId,"headers")
      // logger.debug(proxyReqOpts.headers["x-user-id"])
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from the Media service : ${proxyRes.statusCode},${proxyRes.statusMessage}`
      );

      return proxyResData;
    },
    parseReqBody : false
  })
);

// proxy for search service
app.use(
  "/v1/search/",validateToken,
  proxy(process.env.SEARCH_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // logger.debug(srcReq.body.content)
      proxyReqOpts.headers["Content-Type"] = "application/json";
      proxyReqOpts.headers["x-user-id"] = srcReq.user.userId
      // logger.debug(proxyReqOpts.headers["x-user-id"])
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from the Search service : ${proxyRes.statusCode}, ${proxyRes.statusMessage}`
      );
      return proxyResData;
    },
  })
);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  logger.info(`API gateway has started  http://localhost:${PORT}`);
  logger.info(
    `Identity service has started on ${process.env.IDENTITY_SERVICE_URL}`
  );
  logger.info(
    `Post service has started on ${process.env.POST_SERVICE_URL}`
  );
  logger.info(
    `Media service has started on ${process.env.MEDIA_SERVICE_URL}`
  );
  logger.info(
    `Search service has started on ${process.env.SEARCH_SERVICE_URL}`
  );
  logger.info(
    `Redis Url : http://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
  );
  
});
