import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
  

const PORT =process.env.PORT ||4000;
const app=express();
await connectDB();
app.use(express.json());
app.use(cors());
app.get('/',(req,res)=>res.send("Api is running..."))

app.listen(PORT,()=>{
     console.log("server running on port "+PORT);
})
