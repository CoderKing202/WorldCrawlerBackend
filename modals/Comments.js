const mongoose = require("mongoose");

const CommentsSchema = mongoose.Schema(
  {
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    text: { type: String, required: true },
  },
  { timestamps: true },
);

const Comment = mongoose.model("Comment",CommentsSchema)
module.exports = Comment