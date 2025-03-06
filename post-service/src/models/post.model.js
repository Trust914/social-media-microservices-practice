import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    mediaIds: [
      {
        type: Schema.Types.ObjectId,
        required: true,
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

postSchema.index({ content: "text" });

const PostModel = model("Post", postSchema);
export default PostModel;
