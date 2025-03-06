import cloudinary from "../config/cloudinary.config.js";
import { HTTPCODES, sendClientSuccess } from "./constants.util.js";
import { MediaServiceError } from "./error.util.js";
import { logger } from "../utils/logger.util.js";
import fs from "fs";

export const uploadToCloudinary = (filePath) => {
  const byteArrayBuffer = fs.readFileSync(filePath);
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) {
          const mediaError = new MediaServiceError(
            `CloudinaryUpload${error.name}`,
            HTTPCODES.INTERNAL_SERVER_ERROR,
            `Unable to upload the media to cloudinary`,
            true,
            { info: error.message, code: error.code, cause: error.cause }
          );
          logger.error(`${error.name} - ${error.message}`, {
            cause: error.cause,
          });
          reject(mediaError);
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(byteArrayBuffer);
  });
};

export const deleteFromCloudinaryHelper = async (publicId) => {
  try {
    const response = await cloudinary.uploader.destroy(publicId);

    return response
  } catch (error) {
    const mediaError = new MediaServiceError(
      `CloudinaryDelete${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      "Unable to delete the media from Cloudinary",
      true,
      { info: error.message }
    );
    throw mediaError;
  }
};
