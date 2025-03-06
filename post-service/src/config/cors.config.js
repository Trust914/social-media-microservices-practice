import { HTTPCODES } from "../utils/constants.util.js";
import { PostServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";
import { PORT } from "./service.config.js";

const allowedUrls = [`http://localhost:${PORT}`];

export const corsConfig = {
  origin: (origin, callback) => {
    if (!origin || allowedUrls.indexOf(origin) !== -1) {
      return callback(null, true);
    } else {
      const originError = new PostServiceError(
        "InvalidOriginError",
        HTTPCODES.FORBIDDEN,
        `The origin ${origin} is not allowed by CORS`,
        true
      );
      return callback(originError);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 600, //(600/60)=10 mins
  preflightContinue: false, //AKA : forward OPTIONS Request - Controls whether the Express server should process preflight OPTIONS requests
  optionsSuccessStatus: 204, // Sets the HTTP status code for successful preflight requests.
};
