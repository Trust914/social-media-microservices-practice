import SearchModel from "../models/search.model.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import { HTTPCODES, sendClientSuccess } from "../utils/constants.util.js";
import { logger } from "../utils/logger.util.js";

export const searchPostController = asyncHandler(async (req, res) => {
  logger.warn(`Search post endpoint hit`);

  const { query } = req.query;
  const cacheKey = `search"${query}`;

  const cachedResults = await req.redisClient.get(cacheKey);
  if (cachedResults) {
    logger.info(
      "Successfully retrieved the data from redis Cache",
      JSON.parse(cachedResults)
    );
    return sendClientSuccess(
      res,
      HTTPCODES.OK,
      "Successfully retrieved the data from redis Cache",
      JSON.parse(cachedResults)
    );
  }
  const resultsDB = await SearchModel.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(10);

  await req.redisClient.setex(
    cacheKey,
    120,
    JSON.stringify({ resultsDB, fromCache: true })
  );
  logger.info(
    "Successfully retrieved the results from the database",
    resultsDB
  );

  return sendClientSuccess(
    res,
    HTTPCODES.OK,
    "Found results per the search query",
    resultsDB
  );
});
