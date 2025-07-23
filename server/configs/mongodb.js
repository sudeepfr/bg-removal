import mongoose from 'mongoose'

const connectDB=async()=>{
    mongoose.connection.on('connected',()=>{
         console.log("Database conencted");
    })
    await mongoose .connect(`${process.env.MONGODB_URI}/bg-remove`)
}
export default connectDB;