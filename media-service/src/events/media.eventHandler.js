import MediaModel from "../models/media.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { deleteFromCloudinaryHelper } from "../utils/cloudinary.util.js";
import { HTTPCODES } from "../utils/constants.util.js";
import { MediaServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";

export const handlePostDeleted = async (event) => {
  logger.info(`Handling the event: `, event);

  const { postId, mediaIds } = event;
  try {
    const mediasToDelete = await MediaModel.find({ _id: { $in: mediaIds } });

    for (const media of mediasToDelete) {
      await deleteFromCloudinaryHelper(media.publicId);
      await MediaModel.findByIdAndDelete(media._id);

      logger.info(
        `Deleted the media mediaId: ${media._id}, publicId: ${media.publicId} associated wit h the deleted post ${postId}`
      );
    }
    logger.info(
      `Processed deletion of medias ${mediaIds} for the post ${postId}`
    );
  } catch (error) {
    const err = new MediaServiceError(
      `MediaDeletionError-${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      `Unable to delete media, ${error.message}`,
      { media, cause: error.cause }
    );
    throw err;
  }
};
