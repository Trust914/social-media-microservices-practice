import { HTTPCODES, requestContext } from "./constants.util.js";
import { SearchServiceError } from "./error.util.js";

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const errContext = {
      handler: "asyncHandler",
      request: requestContext(req),
    };
    error.details = error.details
      ? { ...error.details, errContext }
      : { errContext };

    if (error instanceof SearchServiceError) {
      return next(error);
    }

    const handlerError = new SearchServiceError(
      `InternalServerError${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      error.message,
      true,
      error.details
    );
    return next(handlerError);
  }
};
