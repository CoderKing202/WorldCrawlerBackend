const { google } = require("googleapis");
const credentials = require("./google-oauth-credentials.json");
const token = require("./google-token.json");
const path =require("path")
const fs = require("fs");

const { client_id, client_secret, redirect_uris } = credentials.installed;

// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ["https://www.googleapis.com/auth/drive"],
// });

const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

auth.setCredentials(token);
// const drive = google.drive({ version: "v3", auth });

const drive = google.drive({ version: "v3", auth });

// drive.files
//   .list({
//     pageSize: 10,
//     fields: "files(id,name)",
//   })
//   .then((result) => {
//     console.log(result.data.files);
//   })
//   .catch((error) => {
//     console.log(error.message);
//   });

// drive.files.create({
//   requestBody:{
//     name:"test.txt",
//     parents:["1u_YQ-W2JLx0XkjhLQjL10J7sPQIaQfgJ"],
//     mimeType:"text/plain"
//   }.
// })

const uploadFile = async (filePath, fileName, mimeType, folderId) => {
  const parsed = path.parse(fileName)
  fileName = `${parsed.name}-${Date.now()}${parsed.ext}`
  const result = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    },
    fields: "id",
  });
  return result.data.id;
};

module.exports = {uploadFile,drive};

