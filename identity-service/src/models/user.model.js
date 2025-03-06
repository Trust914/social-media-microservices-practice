import mongoose from "mongoose";
import argon2 from "argon2";
import { IdentityServiceError, BaseError } from "../utils/error.util.js";
import { HTTPCODES } from "../utils/constants.util.js";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: true,
    },
    lastName: {
      type: String,
      trim: true,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      this.password = await argon2.hash(this.password);
    } catch (error) {
      const customError = new IdentityServiceError(
        "PasswordHashingError",
        HTTPCODES.INTERNAL_SERVER_ERROR,
        "Passward hashing failed",
        true,
        {
          originalError: error.message,
          context: "userSchema.pre('save')",
          userId: this._id,
        }
      );
      return next(customError);
    }
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    return await argon2.verify(this.password, password);
  } catch (error) {
    throw new IdentityServiceError(
      "InvalidPasswordError",
      HTTPCODES.UNAUTHORISED,
      "The password entered is not correct, check and try again",
      true,
      {description: error.message}
    );
  }
};

userSchema.index({ username: "text" });
const UserModel = mongoose.model("User", userSchema);
export default UserModel;
