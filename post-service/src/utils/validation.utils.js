import Joi from "joi";

export const validatePostCreation = (data) => {
  const schema = Joi.object({
    content: Joi.string().min(5).max(50).required(),
    mediaIds: Joi.array().optional(),
  });
  return schema.validate(data)
};
