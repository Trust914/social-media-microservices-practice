import { HTTPCODES } from "../utils/constants.util.js";
import { APIGatewayError } from "../utils/error.util.js";

export const apiVersioningMiddleware = (version) => (req, res, next) => {
  if (!req.path.startsWith(`/${version}`)) {
    const versionError = new APIGatewayError(
      `VersionError`,
      HTTPCODES.FORBIDDEN,
      `The api version: ${req.path.split("/")[1]} is not supported`,
      true,
      { url: req.path }
    );
    return next(versionError);
  }
  return next();
};
