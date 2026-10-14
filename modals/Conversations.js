const mongoose = require("mongoose");

const ConversationSchema = mongoose.Schema(
  {
    participants: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const ConversationModel = mongoose.model("Conversation", ConversationSchema);
module.exports = ConversationModel;