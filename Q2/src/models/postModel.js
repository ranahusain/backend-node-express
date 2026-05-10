const { Schema, model } = require("mongoose");

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "content is required"],
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "author is required"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

postSchema.virtual("comments", {
  ref: "Comment",
  localField: "_id",
  foreignField: "post",
});

module.exports = model("Post", postSchema);
