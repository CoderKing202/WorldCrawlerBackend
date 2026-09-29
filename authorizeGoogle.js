const { google } = require("googleapis");
const credentials = require("./config/google-oauth-credentials.json");
const readline = require("readline")

const { client_secret, client_id, redirect_uris } = credentials.installed;

const auth = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
)

const authUrl = auth.generateAuthUrl(
{
    access_type:"offline",
    scope:["https://www.googleapis.com/auth/drive"]
}
)

console.log(authUrl)
//4/0AXlqoi75K8q4-_nZb7OzxMmIoY1mHn18_F5omozz7XqiUQWHKr-ipnCOY7jllerPDbfOgQ

const r1 = readline.createInterface({
 input:process.stdin,
 output:process.stdout,  
})

r1.question("Enter authorization code: ", async (code)=>{
    const {tokens} = await auth.getToken(code)
    console.log(tokens)
    r1.close()
})
