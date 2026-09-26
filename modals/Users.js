const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    profileImage: { type: String, required: true },
    bio: { type: String, required: true },
  },
  { timestamps: true },
);
const User  = mongoose.model("User",userSchema)
module.exports = User