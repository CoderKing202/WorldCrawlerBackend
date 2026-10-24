const express = require("express");
const router = express.Router();
const User = require("../modals/Users.js");
const Conversation = require("../modals/Conversations.js");
const Messages = require("../modals/Messages.js");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const bcrypt = require("bcrypt");
const { deleteFile } = require("../config/googleDrive.js");
const { uploadFile } = require("../config/googleDrive.js");
const fs = require("fs");


router.get("/suggestion/:letters", async (req, res) => {
  //console.log(req.params.letters);
  const letters = req.params.letters;
  const users = await User.find({
    username: { $regex: `^${letters}`, $options: "i" },
  });
  let userList = [];
  for (let user of users) {
    let { username } = user;
    userList.push(username);
  }

  //console.log(users);
  res.json({
    success: true,
    userList,
  });
});

router.get("/messages/:username", async (req, res) => {
  const senderId = req.session.userId;
  // //console.log(senderId);
  const { username } = req.params;
  const receiver = await User.findOne({
    username,
  });
  const receiverId = receiver._id;
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });
  if (!conversation) {
    return res.status(200).json({
      messages: [],
    });
  }
  const conversationId = conversation._id;
  const messages = await Messages.find({
    conversation: conversationId,
  })
    .sort({
      createdAt: 1,
    })
    .lean();

  for (let message of messages) {
    message.isMine = req.session.userId === message.senderId.toString();
  }
  // //console.log(messages);
  res.status(200).json({
    messages,
  });
});

router.post("/message", async (req, res) => {
  const senderId = req.session.userId;
  //console.log(senderId);
  //console.log(req.body.username);
  const { username, message } = req.body;
  //console.log(message);
  const receiver = await User.findOne({
    username,
  });
  const receiverId = receiver._id;

  //console.log(receiverId);
  let conversation = await Conversation.findOne({
    participants: {
      $all: [senderId, receiverId],
    },
  });
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }
  let conversationId = conversation._id;
  const newMessage = await Messages.create({
    conversation: conversationId,
    senderId,
    content: message,
  });
  const io = req.app.get("io");
  const connectedUsers = req.app.get("connectedUsers");
  const receiverSocketId = connectedUsers.get(receiverId.toString());
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", {
      ...newMessage.toObject(),
      isMine: false,
    });
  }
  res.status(201).json({
    message: newMessage,
  });
});

router.get("/conversations", async (req, res) => {
  const userId = req.session.userId;
  let receiversIds;
  let receivers;
  const conversations = await Conversation.find({
    participants: userId,
  });
  if (conversations.length === 0) {
    return res.json({ success: false });
  } else {
    receiversIds = conversations.map((conversation) => {
      return conversation.participants.find((id) => {
        return id.toString() !== userId.toString();
      });
    });
    //console.log(receiversIds);
    receivers = await User.find({
      _id: receiversIds,
    });
    //console.log(receivers);
  }
  if (receivers.length === 0) {
    return res.json({ success: false });
  }
  res.json({
    success: true,
    receivers,
  });
});

router.post(
  "/updateProfile",
  upload.single("updatedProfileImageFile"),
  async (req, res) => {
    let userId = req.session.userId;
    console.log(userId);
    let { email, password, username, profileImage, bio } = req.body;
    const fields = ["email", "password", "username", "profileImage", "bio"];
    console.log(email);
    let updateFields = [];
    const updatedData = {};
    try {
      const error = { type: "none", key: "none" };
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      for (const key of fields) {
        if (req.body[key] === null || req.body[key] === undefined) {
          continue;
        } else {
          updateFields.push(key);
        }

        if (typeof req.body[key] === "string" && req.body[key].trim() === "") {
          error.type = "empty";
          error.key = key;
          break;
        }

        if (
          (typeof req.body[key] !== "string" ||
            !emailRegex.test(req.body[key])) &&
          key === "email"
        ) {
          error.type = "noemail";
          error.key = "email";
          break;
        }
      }
      console.log(updateFields);
      if (updateFields.length === 0) {
        error.type = "noUpdateField";
      }
      if (error.type !== "none") {
        res.status(401).json({
          success: false,
          error: error,
        });
        return;
      }
      if (updateFields.includes("password")) {
        const passwordHash = await bcrypt.hash(
          password,
          10,
        ); /* hashing the password for security */
        updateFields = updateFields.filter((field) => {
          return field != "password";
        });
        updatedData["passwordHash"] = passwordHash;
      }
      // FYI passwordHash may not be present in the updateField so beware
      if (updateFields.includes("profileImage")) {
        let fileId
        if (
          profileImage ===
          "http://localhost:5173/World-Crawler/defaultUserImage.jpg"
        ) {
          
          console.log(req.file.path)
           fileId = await uploadFile(
            req.file.path,
            req.file.originalname,
            req.file.mimetype,
            "1oaI3uaRuk-e2j860JtotnupW394RzdZb",
          );
          console.log(fileId)
        } else {

          let imageNamesSplitArray = profileImage.split("/");
          let imageId = imageNamesSplitArray[imageNamesSplitArray.length - 1];
          await deleteFile(imageId);
          fileId = await uploadFile(
            req.file.path,
            req.file.originalname,
            req.file.mimetype,
            "1oaI3uaRuk-e2j860JtotnupW394RzdZb",
          );
        
        }
        profileImage = `http://localhost:5000/media/image/${fileId}`;
        fs.unlinkSync(req.file.path);
        updateFields = updateFields.filter((field) => {
          return field != "profileImage";
        });
        console.log(profileImage)
        updatedData["profileImage"] = profileImage;
      }
      //console.log(profileImage);
      for (let key of updateFields) {
        updatedData[key] = req.body[key];
      }
      console.log("email", updatedData);
      await User.findByIdAndUpdate(userId, {
        ...updatedData,
      });
    } catch (e) {
      console.log(e);
      return res.json({ success: false, error: e });
    }
    // const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      info: "Updated Successfully",
    });
  },
);



module.exports = router;
