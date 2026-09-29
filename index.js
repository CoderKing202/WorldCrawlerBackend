require("dotenv").config()
const cors= require("cors")
const connectDB = require("./config/db.js");
const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes.js")
const session = require("express-session")
app.use(express.json())
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true
}))
app.use(
  session(
    {
      secret:process.env.SESSION_SECRET,
      resave:false,
      saveUninitialized:false
    }
  )
)
app.use("/users",authRoutes)



async function startServer() {
  await connectDB();// connection made 
  app.listen(process.env.PORT,()=>{// server is listening for request
    console.log("Server Started at port " + process.env.PORT)
  })
}

startServer()

// const express = require("express");
// const cors = require("cors");
// const {drive} = require("./config/googleDrive.js");

// const app = express();

// app.use(cors());
// app.use(express.json());


// const getFileId = async (folderId) => {
//   const result = await drive.files.list({
//     q: `'${folderId}' in parents and trashed = false`,
//     fields: "files(id,name,mimeType)",
//     pageSize: 10,
//   });
// console.log(result.data)
//   // return result.data.files[0]?.id;
// };

// app.get("/video/:fileId", async (req, res) => {
//   try {
//     getFileId("1oaI3uaRuk-e2j860JtotnupW394RzdZb")
//     const fileId = req.params.fileId;

//     const response = await drive.files.get(
//       {
//         fileId: fileId,
//         alt: "media",
//       },
//       {
//         responseType: "stream",
//       }
//     );

//     res.setHeader(
//       "Content-Type",
//       response.headers["content-type"] || "video/mp4"
//     );

//     response.data.pipe(res);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Video could not be loaded");
//   }
// });

// app.listen(5000, () => {
//   console.log("Server started on port 5000");
// });