require("dotenv").config(); /* make the environment variables available*/
const bcrypt = require("bcrypt");
const express = require("express");
const router = express.Router();
const User = require("../modals/Users.js");
const multer = require("multer");
const { uploadFile } = require("../config/googleDrive.js");
const fs = require("fs");
const upload = multer({ dest: "uploads/" });
// const jwt = require("jsonwebtoken");
const Follow = require("../modals/Follows.js");
const Posts = require("../modals/Posts.js");

router.post("/signup", upload.single("profileImageFile"), async (req, res) => {
  /* signUp route*/
  let { email, password, userName, profileImage, bio } = req.body;
  const fields = ["email", "password", "userName", "profileImage", "bio"];
  const error = { type: "none", key: "none" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const key of fields) {
    if (req.body[key] === null || req.body[key] === undefined) {
      error.type = "missing";
      error.key = key;
      break;
    } else if (req.body[key].trim() === "") {
      error.type = "empty";
      error.key = key;
      break;
    }
    if (!emailRegex.test(req.body[key]) && key === "email") {
      error.type = "noemail";
      error.key = "email";
      break;
    }
  }

  if (error.type !== "none") {
    res.status(401).json({
      success: false,
      error: error,
    });
    return;
  }
  const passwordHash = await bcrypt.hash(
    password,
    10,
  ); /* hasing the password for security */

  if (req.file) {
    const fileId = await uploadFile(
      req.file.path,
      req.file.originalname,
      req.file.mimetype,
      "1oaI3uaRuk-e2j860JtotnupW394RzdZb",
    );

    profileImage = `http://localhost:5000/media/image/${fileId}`;
    fs.unlinkSync(req.file.path);
  } else {
    profileImage = "http://localhost:5173/World-Crawler/defaultUserImage.jpg";
  }
  console.log(profileImage);
  const UserModel = new User({
    username: userName,
    email,
    passwordHash,
    profileImage,
    bio,
  });
  const user = await UserModel.save();

  // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  req.session.userId = user._id;
  res.status(200).json({
    success: true,
  });
});

router.post("/login", upload.single("profileImageFile"), async (req, res) => {
  let { email, password } = req.body;
  const fields = ["email", "password"];
  const error = { type: "none", key: "none" };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const key of fields) {
    if (req.body[key] === null || req.body[key] === undefined) {
      error.type = "missing";
      error.key = key;
      break;
    } else if (req.body[key].trim() === "") {
      error.type = "empty";
      error.key = key;
      break;
    }
    if (!emailRegex.test(req.body[key]) && key === "email") {
      error.type = "noemail";
      error.key = "email";
      break;
    }
  }
  if (error.type !== "none") {
    res.status(401).json({
      success: false,
      error: error,
    });
    return;
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({
      success: false,
      error: "Invalid email or password",
    });
    return;
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({
      success: false,
      error: "Invalid email or password",
    });
    return;
  }
  console.log("Hello");
  req.session.userId = user._id;
  res.status(200).json({
    success: true,
  });
});

router.post("/isLogin", (req, res) => {
  const userId = req.session.userId;
  let isLogin = false;
  if (userId) {
    isLogin = true;
  } else {
    isLogin = false;
  }
  console.log(isLogin);
  res.status(200).json({
    isLogin,
  });
});

router.post("/logout", async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
      });
    }
    res.clearCookie("worldcrawler.sid");
    res.status(200).json({
      success: true,
    });
  });
});

router.get("/:username", async (req, res) => {
  const userName = req.params.username;
  let user = await User.findOne({
    username: userName,
  });
  // user = user.
  if (user) {
    const { username, email, profileImage, bio, _id } = user;
    const no_of_followers = await Follow.countDocuments({
      following: _id,
    });
    const no_of_following = await Follow.countDocuments({
      follower: _id,
    });
    const no_of_reels = await Posts.countDocuments({
      author: _id,
      postType: "reel",
    });
    const no_of_posts = await Posts.countDocuments({
      author: _id,
      postType: "post",
    });
    console.log(no_of_reels)
    let userDetails = {
      username,
      email,
      profileImage,
      bio,
      no_of_followers,
      no_of_following,
      userId: _id,
      no_of_reels,
      no_of_posts,
    };
    res.json({
      success: true,
      user: userDetails,
    });
  } else {
    res.status(404).json({
      success: false,
    });
  }
});
module.exports = router;
