import { HTTPCODES } from "./constants.util.js";

export class BaseError extends Error {
  constructor(name, httpCode, message, isOperational) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.httpCode = httpCode;
    this.description = message;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class IdentityServiceError extends BaseError {
  constructor(
    name,
    httpCode = HTTPCODES.INTERNAL_SERVER_ERROR,
    message = "An error occured in the server while trying to process the request",
    isOperational = true,
    details = {}
  ) {
    super(name, httpCode, message, isOperational, details);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.httpCode = httpCode;
    this.description = message;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this);
  }
}
