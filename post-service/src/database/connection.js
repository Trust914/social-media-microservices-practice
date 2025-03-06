import { MONGODB_URI } from "../config/service.config.js";
import mongoose from "mongoose";
import { PostServiceError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";
import { logger } from "../utils/logger.util.js";

export const connectToDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.warn(`Connection to the database has be established`);
  } catch (error) {
    // throw new PostServiceError(
    //   `DBConnectionError-${error.name}`,
    //   HTTPCODES.INTERNAL_SERVER_ERROR,
    //   `Unable to connect to the database`,
    //   true,
    //   { info: error.message, cause: error.cause }
    // );
    logger.error(`Unable to connect to the database`, {
      name: error.name,
      cause: error.cause,
      stack: error.stack,
    });
    process.exit(1);
  }
};
