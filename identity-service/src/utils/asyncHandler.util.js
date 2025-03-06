import { HTTPCODES, requestContext } from "./constants.util.js";
import { IdentityServiceError } from "./error.util.js";

export const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    const context = requestContext(req);
    const reqDetails = { context: "asyncHandler", request: context };

    if (error instanceof IdentityServiceError) {
      error.details = { ...error.details, reqDetails };
      // logger.error(`${error.name} - ${error.message}`, error.details);
      return next(error); // pass the existing APPError to the errorhandler middleware
    }

    // Wrap unknown errors in APPError
    const processedError = new IdentityServiceError(
      `InternalError - ${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      error.message || "Internal Server Error",
      true,
      process.env.NODE_ENV === "development" ? reqDetails : undefined
    );

    // logger.error(`${error.name} - ${error.message}`, processedError.details);
    return next(processedError); // pass the existing processedError to the errorhandler middleware
  }
};
