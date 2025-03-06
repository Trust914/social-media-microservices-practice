import PostModel from "../models/post.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { HTTPCODES, sendClientSuccess } from "../utils/constants.util.js";
import { deleteCachedData } from "../utils/deleteCachedData.util.js";
import { PostServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";
import { getPaginationDetails } from "../utils/pagination.util.js";
import { publichEvent } from "../utils/rabbitmq.util.js";
import { validatePostCreation } from "../utils/validation.utils.js";

export const createPost = asyncHandler(async (req, res) => {
  // logger.debug(req.body.content)
  const { error: validationError } = validatePostCreation(req.body);
  if (validationError) {
    throw new PostServiceError(
      "ValidationError",
      HTTPCODES.BAD_REQUEST,
      validationError.details,
      true
    );
  }
  const { content, mediaIds } = req.body;
  const userId = req.user.userId;

  const newPost = await PostModel.create({
    user: userId,
    mediaIds: mediaIds || [],
    content,
  });
  if (!newPost) {
    throw new PostServiceError(
      "PostCreationError",
      HTTPCODES.INTERNAL_SERVER_ERROR,
      "Unable to create the user",
      true,
      { newPost }
    );
  }
  // publish event to rabbitmq
  await publichEvent("post.created",{
    postId: newPost._id,
    userId: newPost.user,
    content: newPost.content,
    createdAt: newPost.createdAt
  })
  // refresh (i.e delete keys from) redis cache
  await deleteCachedData(req, newPost._id.toString());

  logger.info("Post created Successfully", newPost);
  sendClientSuccess(
    res,
    HTTPCODES.CREATED,
    "Successfully created the post",
    newPost
  );
});

export const getAllPosts = asyncHandler(async (req, res) => {
  const { currentPage, limit, skip } = req.pagination; // pagination details passed from the pagination middleware
  const sortBy = req.sort; // sort details passed from the pagination - sort middleware

  // caching with redis
  const cacheKey = `posts:${currentPage}:${limit}`;
  const cachedPosts = await req.redisClient.get(cacheKey);

  if (cachedPosts) {
    logger.info(
      "Successfully retrieved the data from redis Cache",
      JSON.parse(cachedPosts)
    );
    return sendClientSuccess(
      res,
      HTTPCODES.OK,
      "Successfully retrieved the data from redis Cache",
      JSON.parse(cachedPosts)
    );
  }
  const data = await PostModel.find({}).sort(sortBy).skip(skip).limit(limit);
  const total = await PostModel.countDocuments();

  if (!data) {
    throw new PostServiceError(
      "DataRetrievalError",
      HTTPCODES.NOT_FOUND,
      "Failed to retrieve the data",
      true,
      { data }
    );
  }
  const dataDetails = getPaginationDetails(total, currentPage, limit);
  const resDetails = { data, meta: dataDetails };

  // set data in redis cache
  await req.redisClient.setex(
    cacheKey,
    30,
    JSON.stringify({ resDetails, fromCache: true })
  ); // set the data with expiry of 1 hour (3600s)

  logger.info("Successfully retrieved the data from the database", resDetails);
  return sendClientSuccess(
    res,
    HTTPCODES.OK,
    "Successfully retrieved the data from the database",
    resDetails
  );
});

export const getSinglePost = asyncHandler(async (req, res) => {
  const reqPostId = req.params.postId;
  const cacheKey = `post:${reqPostId}`;
  const cachedPost = await req.redisClient.get(cacheKey); // check if the data is cached

  if (cachedPost) {
    logger.info(
      "Successfully retrieved the data from redis Cache",
      JSON.parse(cachedPost)
    );
    return sendClientSuccess(
      res,
      HTTPCODES.OK,
      "Successfully retrieved the data from redis Cache",
      JSON.parse(cachedPost)
    );
  }
  const postData = await PostModel.findById(reqPostId);
  if (!postData) {
    throw new PostServiceError(
      "DataRetrievalError",
      HTTPCODES.NOT_FOUND,
      "Post does not exist in the database",
      true,
      { postData }
    );
  }
  await req.redisClient.setex(
    cacheKey,
    300,
    JSON.stringify({ postData, fromCache: true })
  ); // cache the data
  logger.info("Successfully retrieved the data from the database", postData);
  return sendClientSuccess(
    res,
    HTTPCODES.OK,
    "Successfully retrieved the data from the database",
    postData
  );
});

export const deleteSinglePost = asyncHandler(async (req, res) => {
  const reqPostId = req.params.postId;

  const post = await PostModel.findOne({
    _id: reqPostId,
    user: req.user.userId,
  });
  if (!post) {
    throw new PostServiceError(
      "DataRetrievalError",
      HTTPCODES.NOT_FOUND,
      "The post does not exist in the databse",
      true,
      { post }
    );
  }
  // publish post delete method
  await publichEvent("post.deleted", {
    postId: post._id,
    userId: req.user.userId,
    mediaIds: post.mediaIds,
  });

  await deleteCachedData(req, post._id);
  const deletePost = await post.deleteOne();
  if (!deletePost) {
    throw new PostServiceError(
      "DeletePostError",
      HTTPCODES.INTERNAL_SERVER_ERROR,
      "Server encountered an error while trying to delete the post",
      true,
      { deletePost }
    );
  }
  logger.warn(`Post has been deleted`, deletePost);
  return sendClientSuccess(
    res,
    HTTPCODES.OK,
    "Post deleted successfully",
    true,
    deletePost
  );
});

export const deleteAllPost = asyncHandler(async (req, res) => {
  const user = req.user.userId;
  const deletedPosts = await PostModel.deleteMany({ user });
  if (!deletedPosts) {
    throw new PostServiceError(
      "DeletePostError",
      HTTPCODES.INTERNAL_SERVER_ERROR,
      "Server encountered an error while trying to delete the post",
      true,
      { deletedPosts }
    );
  }
  await deleteCachedData(req, user._id);
  logger.warn(`Posts has been deleted`, deletedPosts);
  return sendClientSuccess(
    res,
    HTTPCODES.OK,
    "Posts deleted successfully",
    true,
    deletedPosts
  );
});
