const { Schema, model } = require("mongoose");

const commentSchema = new Schema({
  text: {
    type: String,
    required: [true, "text is required"],
    trim: true,
  },
  post: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: [true, "post is required"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("Comment", commentSchema);
