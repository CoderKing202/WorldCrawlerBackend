const connectDB = require("./config/db.js");
const express = require("express");
const app = express();
require("dotenv").config()

async function startServer() {
  await connectDB();
  app.listen(process.env.PORT,()=>{
    console.log("Server Started at port " + process.env.PORT)
  })
}

startServer()