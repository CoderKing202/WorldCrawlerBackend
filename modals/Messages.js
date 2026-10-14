const mongoose = require("mongoose");
const MessagesSchema = mongoose.Schema(
  {
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: String,
  },
  
  { timestamps: true },
);

const MessagesModel = mongoose.model("Message", MessagesSchema);
module.exports = MessagesModel;