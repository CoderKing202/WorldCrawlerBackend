const express = require("express");
const router = express.Router();
const User = require("../modals/Users.js");
const Conversation = require("../modals/Conversations.js");
const Messages = require("../modals/Messages.js");

router.get("/suggestion/:letters", async (req, res) => {
  console.log(req.params.letters);
  const letters = req.params.letters;
  const users = await User.find({
    username: { $regex: `^${letters}`, $options: "i" },
  });
  let userList = [];
  for (let user of users) {
    let { username } = user;
    userList.push(username);
  }

  console.log(users);
  res.json({
    success: true,
    userList,
  });
});

router.get("/messages/:username", async (req, res) => {
  const senderId = req.session.userId;
  // console.log(senderId);
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
  // console.log(messages);
  res.status(200).json({
    messages,
  });
});

router.post("/message", async (req, res) => {
  const senderId = req.session.userId;
  console.log(senderId);
  console.log(req.body.username);
  const { username, message } = req.body;
  console.log(message);
  const receiver = await User.findOne({
    username,
  });
  const receiverId = receiver._id;

  console.log(receiverId);
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
    console.log(receiversIds);
    receivers = await User.find({
      _id: receiversIds,
    });
    console.log(receivers);
  }
  if (receivers.length === 0) {
    return res.json({ success: false });
  }
  res.json({
    success: true,
    receivers,
  });
});

module.exports = router;
