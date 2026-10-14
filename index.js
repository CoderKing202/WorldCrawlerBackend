require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db.js");
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes.js");
const session = require("express-session");
const { drive } = require("./config/googleDrive.js");
const utilityRoutes = require("./routes/utilityRoutes.js");
const http = require("http");
const server = http.createServer(app);
const SocketIO = require("socket.io");
const sessionMiddleWare = session({
  name: "worldcrawler.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
});
const io = new SocketIO.Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

const connectedUsers = new Map();
app.set("io", io);
app.set("connectedUsers", connectedUsers);
// io.use((socket, next) => {
//   sessionMiddleWare(socket.request, socket.request.res, next);
// }); //failed attempt
io.engine.use(sessionMiddleWare);

io.on("connection", (socket) => {
  ;
  const userId = socket.request.session.userId;
  if (userId) {
    console.log("Client connected")
    connectedUsers.set(userId.toString(), socket.id);
    console.log(connectedUsers);
    socket.on("disconnect", () => {
      connectedUsers.delete(userId.toString());
      console.log("Client disconnected:", userId);
      console.log(connectedUsers);
    });
  }
});
app.use(express.json());

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(sessionMiddleWare);
app.use(utilityRoutes);
app.use("/user", authRoutes);

async function startServer() {
  await connectDB(); // connection made
  server.listen(process.env.PORT, () => {
    // server is listening for request
    console.log("Server Started at port " + process.env.PORT);
  });
}

// const getFileId = async (folderId) => {
//   const result = await drive.files.list({
//     q: `'${folderId}' in parents and trashed = false`,
//     fields: "files(id,name,mimeType)",
//     pageSize: 10,
//   });
//   console.log(result.data);
//   // return result.data.files[0]?.id;
// };

app.get("/media/:contentType/:fileId", async (req, res) => {
  const { fileId, contentType } = req.params;
  try {
    // getFileId("1oaI3uaRuk-e2j860JtotnupW394RzdZb");

    console.log(contentType);
    const response = await drive.files.get(
      {
        fileId: fileId,
        alt: "media",
      },
      {
        responseType: "stream",
      },
    );

    if (contentType === "video" || contentType === "reel") {
      res.setHeader(
        "Content-Type",
        response.headers.get("content-type") || "video/mp4",
      );
    } else if (contentType === "image") {
      res.setHeader(
        "Content-Type",
        response.headers.get("content-type") || "image/png",
      );
    }
    response.data.pipe(res);
  } catch (e) {
    console.error(e);
    switch (contentType) {
      case "video":
        res.status(500).send("Video could not be loaded");
        break;
      case "image":
        res.status(500).send("Image could not be loaded");
        break;
      case "reel":
        res.status(500).send("Reel could not be loaded");
        break;
    }
  }
});

startServer();
