const mongoose = require("mongoose");

const PostsSchema = mongoose.Schema(
  {
    author: { type: mongoose.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    media: { type: String, required: true },
    mediaType: { type: String, required: true, enum: ["image", "video"] },
    postType:{type:String,required:true,enum:["post","reel"]}
  },
  {
    timestamps: true,
  },
);
const Post = mongoose.model("Post", PostsSchema);
module.exports = Post;