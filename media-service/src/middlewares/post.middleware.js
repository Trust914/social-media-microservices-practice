import { HTTPCODES } from "../utils/constants.util";
import { MediaServiceError } from "../utils/error.util";

export const postMiddleware = (req, res, next) => {
  const postId = req.headers["x-post-id"];

  if (!postId) {
    const error = new MediaServiceError(
      "PostIdError",
      HTTPCODES.BAD_REQUEST,
      "No valid post ID received",
      true,
      { postId }
    );
    next(error);
  }
  req.post = { postId };
  next();
};
