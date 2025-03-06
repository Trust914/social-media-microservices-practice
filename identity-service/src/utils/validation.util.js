import joi from "joi";

export const validateRegistration = (data) => {
  const schema = joi.object({
    firstName: joi.string().min(3).max(50).required(),
    lastName: joi.string().min(3).max(50).required(),
    username: joi.string().alphanum().min(3).max(30).required(),
    password: joi.string().min(6).required(),
    email: joi.string().email().required(),
  });
  return schema.validate(data);
};

export const validateLogin = (data) => {
  const schema = joi.object({
    usernameOrEmail: joi.alternatives().try(joi.string().email(),joi.string().alphanum().min(3).max(30)).required(),
    password: joi.string().min(6).required(),
  });
  // .xor("username", "email");
  return schema.validate(data);
};

export const validateUpdate = (data) => {
  const schema = joi.object({
    firstName: joi.string().min(3).max(50).optional(),
    lastName: joi.string().min(3).max(50).optional(),
    username: joi.string().alphanum().min(3).max(30).optional(),
    oldPassword: joi.string().min(6).optional(),
    newPassword: joi.string().min(6).optional(),
    email: joi.string().email().optional(),
  });
  return schema.validate(data);
};