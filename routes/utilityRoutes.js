const express = require("express");
const router = express.Router();
const User = require("../modals/Users.js");

router.get("/suggestion/:letters", async (req, res) => {
  console.log(req.params.letters);
  const letters = req.params.letters
  const users = await User.find({
    username: { $regex: `^${letters}`, $options: "i" },
  });
  let userList = []
  for(let user of users){
      let {username} = user
      userList.push(username)
  }   
  

  console.log(users)
  res.json({
    success: true,
    userList
    })
});

module.exports = router;
