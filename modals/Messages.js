const mongoose = require("mongoose");
const MessagesSchema = mongoose.Schema(
  {
    conversation: {
      type: mongoose.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required:true
    },
    content: String,
    media: { type: String},
  },
  { timestamps: true },
);

const MessagesModel = mongoose.model("Message",MessagesSchema)
module.exports = MessagesModel