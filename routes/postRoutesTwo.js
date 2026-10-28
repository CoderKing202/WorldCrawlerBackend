const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile } = require("../config/googleDrive.js");
const Post = require("../modals/Posts.js");
const fs = require("fs");
const { json } = require("stream/consumers");
const Like = require("../modals/Likes.js");
const Comment = require("../modals/Comments.js");

router.get("/getHomePosts", async (req, res) => {

  const page = Math.max(1, req.query.page || 1);

  const limit = 5;

  try {
    // console.log(await Post.countDocuments());

    const posts = await Post.find()
    .populate("author","username profileImage")
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


    res.json({
      success: true,
      posts,
      hasMore: posts.length === limit,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
    });
  }
});

router.get("/getSearchPagePosts", async (req, res) => {

  const page = Math.max(1, req.query.page || 1);

  const limit = 10;

  try {
    // console.log(await Post.countDocuments());

    const posts = await Post.find()
    .populate("author","username profileImage")
      .sort({ _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


    res.json({
      success: true,
      posts,
      hasMore: posts.length === limit,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;
