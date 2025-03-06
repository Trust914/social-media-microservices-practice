import UserModel from "../models/user.model.js";
import { IdentityServiceError } from "../utils/error.util.js";
import { logger } from "../utils/logger.util.js";
import { asyncHandler } from "../utils/asyncHandler.util.js";
import {
  validateRegistration,
  validateLogin,
  validateUpdate,
} from "../utils/validation.util.js";
import {
  HTTPCODES,
  isDevEnv,
  requestContext,
  sendClientSuccess,
} from "../utils/constants.util.js";
import { generateTokens } from "../utils/generateTokens.utils.js";
import { RefreshToken } from "../models/refreshToken.model.js";

// register a new user
export const registerUser = asyncHandler(async (req, res) => {
  const request = requestContext(req);
  // logger.warn("Registration endpoint hit", { request });

  // Validate user input
  const { error } = validateRegistration(req.body);
  logger.debug(error);
  if (error) {
    throw new IdentityServiceError(
      "ValidationError",
      HTTPCODES.BAD_REQUEST,
      "User registration validation failed",
      true,
      { validation: error.details }
    );
  }
  const { firstName, lastName, username, email, password } = req.body;
  const existingUser = await UserModel.findOne({
    $or: [{ username }, { email }],
  });
  if (existingUser) {
    // logger.error("A user attempted to create an account with already existing credentials", { reqDetails: request, existingUser })
    throw new IdentityServiceError(
      "DuplicateUserError",
      HTTPCODES.CONFLICT,
      "A user with the username or email already exists",
      true,
      {
        existUser: {
          username: existingUser.username,
          email: existingUser.email,
        },
      }
    );
  }
  const newUser = await UserModel.create({
    firstName,
    lastName,
    username,
    email,
    password,
  });
  if (!newUser) {
    // logger.warn("Unable to create new user", { reqDetails: request, errContext })
    throw new IdentityServiceError(
      "NewUserRegistrationError",
      HTTPCODES.INTERNAL_SERVER_ERROR,
      "Unable to register the new use in the database",
      true
    );
  }
  logger.warn("New user saved in the database", newUser);
  const { accessToken, refreshToken } = await generateTokens(newUser);

  // if (!accessToken || !refreshToken) {
  //   logger.debug(`tokens ${accessToken} ${refreshToken}`);
  //   await UserModel.findByIdAndDelete(newUser._id);
  //   await RefreshToken.findOneAndDelete({ userId: newUser._id });
  //   throw new APPError(
  //     `UnableToCreateTokenError`,
  //     HTTPCODES.INTERNAL_SERVER_ERROR,
  //     `The server was unable to create the tokens`,
  //     true,
  //     { tokens: { accessToken, refreshToken } }
  //   );
  // }
  // logger.warn(
  //   `new tokens created for the user ${newUser.username}.${accessToken} ${refreshToken}`
  // );
  sendClientSuccess(res, HTTPCODES.CREATED, "User registered successfully", {
    accessToken,
    refreshToken,
    user: isDevEnv && { username, firstName, lastName, email },
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    throw new IdentityServiceError(
      `ValidationError`,
      HTTPCODES.BAD_REQUEST,
      "User login validation failed",
      true,
      { validation: error.details }
    );
  }

  const { usernameOrEmail, password } = req.body;
  const user = await UserModel.findOne({
    $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
  });

  if (!user) {
    throw new IdentityServiceError(
      `UserNotFoundError`,
      HTTPCODES.NOT_FOUND,
      "No user with the email or username found",
      true,
      {}
    );
  }
  //  logger.debug(user)
  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new IdentityServiceError(
      `InvalidPasswordError`,
      HTTPCODES.NOT_FOUND,
      "Incorrect password, please try again",
      true,
      {}
    );
  }

  const { accessToken, refreshToken } = await generateTokens(user);

  sendClientSuccess(res, HTTPCODES.OK, `User successfully logged in`, {
    accessToken,
    refreshToken,
    userId: user._id,
  });
});

export const refreshTokenUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  // check if refreshtoken exists in the request
  if (!refreshToken) {
    throw new IdentityServiceError(
      `RefreshTokenError`,
      HTTPCODES.BAD_REQUEST,
      "Invalid refresh token received",
      true,
      { refreshToken }
    );
  }
  const todayDate = new Date();
  const oldRefreshToken = await RefreshToken.findOne({ token: refreshToken }); // find the actual refresh token in the db
  if (!oldRefreshToken || oldRefreshToken.expiresAt < todayDate) {
    // check if the token exists and is not expired
    throw new IdentityServiceError(
      `RefreshTokenError`,
      HTTPCODES.UNAUTHORISED,
      "Refresh token is expired, user must login again",
      true,
      { refreshTokenExpiry: oldRefreshToken.expiresAt.toISOString() }
    );
  }
  // check if the user really exists in the db
  const user = await UserModel.findOne({ _id: oldRefreshToken.userId });
  if (!user) {
    throw new IdentityServiceError(
      `UserNotFoundError`,
      HTTPCODES.NOT_FOUND,
      "No user with the credentials found",
      true,
      { userId: oldRefreshToken.userId }
    );
  }
  const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
    await generateTokens(user); // generate new tokens for the user

  await RefreshToken.findByIdAndDelete(oldRefreshToken._id); // delete the old refreshtoken
  sendClientSuccess(res, HTTPCODES.OK, "Access updated for the user", {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

export const logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  // check if refreshtoken exists in the request
  if (!refreshToken) {
    throw new IdentityServiceError(
      `RefreshTokenError`,
      HTTPCODES.BAD_REQUEST,
      "Invalid refresh token received",
      true,
      { refreshToken }
    );
  }

  const deletedRefreshToken = await RefreshToken.deleteOne({
    token: refreshToken,
  }); // find the actual refresh token in the db
  if (!deletedRefreshToken) {
    throw new IdentityServiceError(
      `UserLogOutError`,
      HTTPCODES.INTERNAL_SERVER_ERROR,
      "Token not deleted successfully",
      true,
      { deletedRefreshToken }
    );
  }
  sendClientSuccess(res, HTTPCODES.OK, "User logged out successfully");
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  const { userId } = req.userInfo;
  const { error } = validateUpdate(req.body);
  if (error) {
    throw new IdentityServiceError(
      "ValidationError",
      HTTPCODES.BAD_REQUEST,
      "User update validation failed",
      true,
      { validation: error.details }
    );
  }

  const {
    firstName: newFistName,
    lastName: newLastName,
    username: newUsername,
    email: newEmail,
    oldPassword,
    newPassword,
  } = req.body;
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new IdentityServiceError(
      `UserNotFoundError`,
      HTTPCODES.NOT_FOUND,
      "No user with the credentials found",
      true,
      {}
    );
  }

  // const userOldDetails = {
  //   firstName: user.firstName,
  //   lastName: user.lastName,
  //   username: user.lastName,
  //   email: user.email,
  //   password: user.password,
  // };
  const willChangePassword = oldPassword && newPassword;

  user.firstName = newFistName || user.firstName;
  user.lastName = newLastName || user.lastName;
  user.email = newEmail || user.email;
  user.username = newUsername || user.username;
  if (willChangePassword) {
    const verifyOldPassword = await user.comparePassword(oldPassword);
    logger.debug(verifyOldPassword);
    if (!verifyOldPassword) {
      throw new IdentityServiceError(
        `InvalidPasswordError`,
        HTTPCODES.NOT_FOUND,
        "Incorrect old password, please try again",
        true,
        {}
      );
    }
    user.password = newPassword || user.password;
  }

  await user.save();

  sendClientSuccess(
    res,
    HTTPCODES.OK,
    `Successfully updated the user details`,
    {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
    }
  );
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.userInfo;
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new IdentityServiceError(
      `UserNotFoundError`,
      HTTPCODES.NOT_FOUND,
      "No user with the credentials found",
      true,
      {}
    );
  }

  const deletedRefreshToken = await RefreshToken.deleteOne({ userId });
  const deleteUser = await user.deleteOne();

  sendClientSuccess(res, HTTPCODES.OK, "User deleted successfully", {
    deletedRefreshToken,
    deleteUser,
  });
});
