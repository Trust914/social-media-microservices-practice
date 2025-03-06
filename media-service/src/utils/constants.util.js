import { NODE_ENV } from "../config/env.config.js";

export const HTTPCODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204, // The request was successful, but there is no response body (e.g., after a DELETE request).
  BAD_REQUEST: 400,
  UNAUTHORISED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405, //The HTTP method is not supported for this endpoint.
  CONFLICT: 409, //The request conflicts with the current state of the resource (e.g., trying to create a duplicate record)
  UNPROCESSABLE_ENTITY: 422, // The request was understood but contains invalid data.
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503, //The server is down or overloaded.
  GATEWAY_TIMEOUT: 504, // The server is taking too long to respond.
};

export const requestContext = (req) => {
  return {
    method: req.method,
    url: req.originalUrl,
    user: req.user?.userId || "anonymous",
    ip: req.ip,
    params: req.params || null,
    query: req.query || null,
    ...(Object.keys(req.body).length && { body: req.body }),
  };
};

export const sendClientSuccess = (res, httpCode, message, data) => {
  res.status(httpCode).json({
    ok: true,
    status: "Success",
    httpCode,
    message,
    details: data || [],
  });
};

export const isDevEnv = NODE_ENV === "development";
