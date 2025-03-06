import mongoose from "mongoose";

const { Schema, model } = mongoose;

const searchPostSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

searchPostSchema.index({ content: "text" });
searchPostSchema.index({ createdAt: -1 });

const SearchModel = model("Search", searchPostSchema);
export default SearchModel;
