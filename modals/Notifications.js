const mongoose = require("mongoose");
const notificationSchema = mongoose.Schema(
  {
    recipient: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    sender: { type: mongoose.Types.ObjectId, ref: "User", required: true },

    type: {type:String,enum:["like","comment","follow"]},
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
    comment: { type: mongoose.Types.ObjectId, ref: "Comment" },
    isRead: {type:Boolean, default:false}
  },
  { timestamps: true },
);

const notificationModel = mongoose.model("Notification",notificationSchema)
module.exports = notificationModel