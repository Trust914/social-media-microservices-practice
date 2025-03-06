import jwt from "jsonwebtoken";
import { asyncHandler } from "./asyncHandler.util.js";
import crypto from "crypto";
import { RefreshToken } from "../models/refreshToken.model.js";
import { logger } from "./logger.util.js";
import { BaseError } from "./error.util.js";
import { HTTPCODES } from "./constants.util.js";
import UserModel from "../models/user.model.js";

export const generateTokens = async (user) => {
  // let refToken = undefined
  try {
    // logger.debug(process.env.JWT_SECRET)
    const accessToken = jwt.sign(
      {
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.NODE_ENV === "production" ? "10m" : "60m" }
    );
    // logger.debug(accessToken)
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // refresh token expires in 7 days

    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      expiresAt,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    const tokenError = new BaseError(
      `TokenCreationError - ${error.name}`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      `Failed to generate authentication tokens.${error.message}`,
      true
    );
    // await UserModel.findByIdAndDelete(user._id)
    // refToken && await RefreshToken.findByIdAndDelete(refToken._id)
    throw tokenError;
  }
};
