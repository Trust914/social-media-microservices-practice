import { MONGO_INITDB_URI, MONGODB_URI } from "../config/env.config.js";
import mongoose from "mongoose";
import { logger } from "../utils/logger.util.js";

export const connectToDB = async () => {
  try {
    // await mongoose.connect(MONGODB_URI);
    logger.debug(`mongodb connection ${MONGO_INITDB_URI}`)
    await mongoose.connect(MONGO_INITDB_URI)
    logger.warn(`Connection to the database has been established`);
  } catch (error) {
    
    logger.error(`Unable to connect to the database`, {
      name: error.name,
      cause: error.cause,
      stack: error.stack,
    });
    process.exit(1);
  }
};
