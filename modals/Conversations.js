const mongoose = require("mongoose");

const ConversationSchema = mongoose.Schema(
  {
    participants: { type: [mongoose.Types.ObjectId], ref: "User"},
  },
  { timestamps: true },
);

const ConversationModel = mongoose.model("Conversation",ConversationSchema)
module.exports=ConversationModel
