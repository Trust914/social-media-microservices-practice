import cors from "cors";
import { BaseError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";

export function corsConfig() {
  return cors({
    origin: (origin, callback) => {
      const port = process.env.PORT || 3001;
      const allowedURLs = [`http:localhost:${port}/`];
      if (!origin || allowedURLs.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        const error = new BaseError(
          "InvalidOriginError",
          HTTPCODES.FORBIDDEN,
          `The origin ${origin} is not allowed by CORS`,
          true
        );
        callback(error);
      }
    },
    methods: ["GET", "PUT", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept-Version"], // Defines which headers the client is allowed to send in requests.
    exposedHeaders: ["Content-Range", "X-Content-Range"], //Specifies which response headers the client can access.
    credentials: true, //Enables support for cookies, authorization headers, or tokens in cross-origin requests.
    maxAge: 600, //  Defines how long (in seconds) the browser caches the CORS preflight request; so 600 = 600seconds/60s = 10 mins
    preflightContinue: false, //AKA : forward OPTIONS Request - Controls whether the Express server should process preflight OPTIONS requests
    optionsSuccessStatus: 204, // Sets the HTTP status code for successful preflight requests.
  });
}
