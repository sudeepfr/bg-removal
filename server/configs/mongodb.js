// import mongoose from 'mongoose'

// const connectDB=async()=>{
//     await mongoose .connect(`${process.env.MONGODB_URI}/bg-remove`)
// }
//     mongoose.connection.on('connected',()=>{
//          console.log("Database conencted");
//     })
// export default connectDB;
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(`${process.env.MONGODB_URI}/bg-remove`);
    console.log(" MongoDB connected:", conn.connection.host);
  } catch (error) {
    console.error(" MongoDB connection error:", error.message);
    process.exit(1); // optional: exit if DB connection fails
  }
};

export default connectDB;
