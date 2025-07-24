import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
  

const PORT =process.env.PORT ||4000;
const app=express();
await connectDB();
app.use('/api/user',userRouter);

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));

app.use(express.json());
app.get('/',(req,res)=>res.send("Api is running..."))

app.listen(PORT,()=>{
     console.log("server running on port "+PORT);
})
