import mongoose from "mongoose";
import { logger } from "../utils/logger.util.js";

export async function connectToDB() {
  try {
    const mongodb_uri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${process.env.MONGO_INITDB_HOST}:${process.env.MONGO_INITDB_PORT}/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;
    // await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connect(mongodb_uri);
    logger.info("Database Connection Successful");
  } catch (error) {
    logger.error("Database Connection Error", {
      name: error.name,
      description: error.message,
      // stack: error.stack,
    });
    process.exit(1);
  }
}
