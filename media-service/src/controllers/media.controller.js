import { deleteFromCloudinaryHelper, uploadToCloudinary } from "../utils/cloudinary.util.js"
import MediaModel from "../models/media.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { HTTPCODES, sendClientSuccess } from "../utils/constants.util.js";
import { MediaServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";
import fs from "fs"
import { publichEvent } from "../utils/rabbitmq.util.js";

export const uploadMedia = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.user;
  const mediaFiles = req.files;
  logger.debug("files", mediaFiles)

  if(!mediaFiles || !mediaFiles.length){
    throw new MediaServiceError(
      "InvalidMediaFileError",
      HTTPCODES.BAD_REQUEST,
      "No media file(s) selected",
      true,
      { mediaFiles }
    );
  }
  const uploadedMedia = []
 if ( mediaFiles.length>1) logger.warn(`Starting multiple files upload ....`)
  for (const file of mediaFiles) {
    const {originalname, mimetype, buffer,path} = file
    // logger.warn(`Uploading file to cloudinary`,{user:userId, post:postId,fileName:originalname, mimeType: mimetype})
    const {secure_url:url,public_id:publicId}  = await uploadToCloudinary(path);
    const mediaDB = await MediaModel.create({
      user: userId,
      post: postId,
      url,
      publicId,
      originalName: originalname,
      mimeType: mimetype
    });

    if (!mediaDB || !url || !publicId) {
        await deleteFromCloudinaryHelper(publicId)
        mediaDB && await mediaDB.deleteOne()
      throw new MediaServiceError(
        "MediaCreationError",
        HTTPCODES.INTERNAL_SERVER_ERROR,
        "Unable to add media to mongodb",
        true,
        { mediaDB }
      );
    }
    logger.warn(`Successfully uploaed the file to cloudinary`,{user:userId, post:postId,fileName:originalname, mimeType: mimetype})
    uploadedMedia.push({secure_url:url,public_id:publicId,mimeType: mimetype, meidaId:mediaDB._id} )
    
    fs.unlinkSync(path)

  }
  if (uploadedMedia.length > 0){
    return sendClientSuccess(res,HTTPCODES.CREATED,"successfully uploaded the media files", {uploadedMedia})
  }
});

export const getAllMedia = asyncHandler(async (req, res) => {
  const userId = req.user.userId
  logger.debug(req.user)
  const allMedia = await MediaModel.find({user:userId})

  if (!allMedia){
    throw new MediaServiceError(`MediaRetrievalError`,HTTPCODES.INTERNAL_SERVER_ERROR,`Error retreiving all media for the user`,true,{allMedia})
  }
  logger.info(`Successfully retrieved all media for the user`,{allMedia})
  return sendClientSuccess(res,HTTPCODES.OK,`Successfully retrieved all media for the user`,allMedia)
})