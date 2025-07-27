import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';
  

const PORT =process.env.PORT ||4000;
const app=express();
await connectDB();
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true 
}));

app.post('/api/user/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks);app.use(express.json());

app.use('/api/user',userRouter);
app.use('/api/image',imageRouter);


app.get('/',(req,res)=>res.send("Api is running..."))

app.listen(PORT,()=>{
     console.log("server running on port "+PORT);
})
