const mongoose = require("mongoose");
const FollowSchema = mongoose.Schema(
  {
    follower: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required:true
    },
    following: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required:true
    },
  },
  { timestamps: true },
);
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
const FollowModel = mongoose.model("Follow", FollowSchema);
module.exports = FollowModel;
