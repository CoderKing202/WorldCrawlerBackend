const mongoose = require("mongoose")

async function connectDB(){
    await mongoose.connect(process.env.MONGODB_URI)    
    console.log("Database Connected")
}// connnection is being made


module.exports=connectDB