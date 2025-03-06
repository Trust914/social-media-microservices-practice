import { HTTPCODES, requestContext } from "./constants.util.js";
import { PostServiceError } from "./error.util.js";

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const errCause = error.cause
    const errContext = {
      handler: "asyncHandler",
      request: requestContext(req),
    };
    error.details = error.details
      ? { ...error.details, errContext ,errCause}
      : { errContext, errCause };

    if (error instanceof PostServiceError) {
      return next(error);
    }

    const handlerError = new PostServiceError(
      `InternalServerError${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      error.message,
      true,
      {...error.details, errCause},
    );
    return next(handlerError);
  }
};
