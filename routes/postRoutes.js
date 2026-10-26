const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { uploadFile } = require("../config/googleDrive.js");
const Post = require("../modals/Posts.js");
const fs = require("fs");
const { json } = require("stream/consumers");
const Like = require("../modals/Likes.js");

router.post(
  "/uploadContent",
  upload.single("uploadContent"),
  async (req, res) => {
    const userId = req.session.userId;
    const { caption, mediaType, postType } = req.body;
    if (req.file === undefined) {
      return res.json({
        success: false,
        message: "Please send content to be uploaded",
      });
    }
    if (caption === "" || mediaType === "" || postType === "") {
      fs.unlinkSync(req.file.path);
      return res.json({
        success: false,
        message: "Please fill the parameters properly",
      });
    }
    if (
      caption === undefined ||
      mediaType === undefined ||
      postType === undefined
    ) {
      fs.unlinkSync(req.file.path);
      return res.json({
        success: false,
        message: "Please send the parameters",
      });
    }

    try {
      const fileId = await uploadFile(
        req.file.path,
        req.file.originalname,
        req.file.mimetype,
        "1u_YQ-W2JLx0XkjhLQjL10J7sPQIaQfgJ",
      );
      const post = new Post({
        author: userId,
        caption,
        mediaUrl: `http://localhost:5000/media/${mediaType}/${fileId}`,
        mediaType,
        postType,
      });
      await post.save();
      fs.unlinkSync(req.file.path);
    } catch (e) {
      fs.unlinkSync(req.file.path);
      return res.json({
        success: false,
        error: e,
      });
    }
    res.status(200).json({
      success: true,
      message: "Content Uploaded Successfully",
    });
  },
);
router.get("/getContentsLinks/:postType", async (req, res) => {
  const userId = req.session.userId;
  const { postType } = req.params;
  try {
    if (userId) {
      let contents = await Post.find({
        postType,
      });
      contents = contents.map((content) => {
        return content.mediaUrl;
      });
      res.status(200).json({
        success: true,
        contents,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "please Login first",
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: e.message,
    });
  }
});

router.post("/likeContent", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
    });
  }
  const { src } = req.body;
  try {
    const post = await Post.findOne({
      mediaUrl: src,
    });
    if (!post) {
      return res.status(404).json({
        success: false,
      });
    }
    const newLike = new Like({
      post: post._id,
      user: userId,
    });
    await newLike.save();

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    res.json({
      success: false,
    });
  }
});
router.post("/unLikeContent", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
    });
  }
  const { src } = req.body;
  try {
    const post = await Post.findOne({
      mediaUrl: src,
    });
    if (!post) {
      return res.status(404).json({
        success: false,
      });
    }
    await Like.deleteOne({
      post: post._id,
      user: userId,
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
    });
  }
});

router.get("/likeStatus", async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({
      success: false,
    });
  }
  const { src } = req.query;
  try {
    const post = await Post.findOne({
      mediaUrl: src,
    });
    if (!post) {
      return res.status(404).json({
        success: false,
      });
    }
    const like = await Like.findOne({
      post: post._id,
      user: userId,
    });
    if (like) {
      return res.json({ success: true, liked: true });
    } else {
      return res.json({ success: true, liked: false });
    }
  } catch (e) {
    res.status(500).json({
      success: false,
    });
  }
});

module.exports = router;
