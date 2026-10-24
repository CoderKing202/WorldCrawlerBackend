const { google } = require("googleapis");
const credentials = require("./config/google-oauth-credentials.json");
const readline = require("readline");
const fs = require("fs");

const { client_secret, client_id, redirect_uris } = credentials.installed;

const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = auth.generateAuthUrl({
  access_type: "offline",
  scope: ["https://www.googleapis.com/auth/drive"],
});

console.log(authUrl);


const r1 = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

r1.question("Enter authorization code: ", async (code) => {
  try {
    const { tokens } = await auth.getToken(code);
    //console.log(tokens)
    if (!tokens.refresh_token) {
      console.log("No refresh token received. Try authorizing again");
      return;
    }
    fs.writeFileSync(
      "./config/google-token.json",
      JSON.stringify(tokens, null, 2),
    );
  } catch (error) {
    console.error("Authorization failed:", error.message);
  } finally {
    r1.close();
  }
});
