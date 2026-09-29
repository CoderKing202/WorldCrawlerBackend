const drive = require("./config/googleDrive.js")
drive.files.list({
    pageSize: 10,
    fields:"files(id,name)"
}).then(result=>{
    console.log(result.data.files)
}).catch(error=>{
    console.log(error)
})