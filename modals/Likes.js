const mongoose = require("mongoose");
const LikeSchema = mongoose.Schema(
  {
    post: {
      type: mongoose.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);
LikeSchema.index({ post: 1, user: 1 }, { unique: true })
const Like = mongoose.model("Like", LikeSchema);
module.exports = Like;
