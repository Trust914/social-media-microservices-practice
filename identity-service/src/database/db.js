import mongoose from "mongoose";
import { logger } from "../utils/logger.util.js";

export async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    logger.info("Database Connection Successful" );
  } catch (error) {
    logger.error("Database Connection Error", {
      name: error.name,
      description: error.message,
      // stack: error.stack,
    });
    process.exit(1);
  }
}
