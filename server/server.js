import 'dotenv/config'
import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';
import { clerkWebhooks } from './controllers/userController.js';
import bodyParser from 'body-parser';
  

const PORT =process.env.PORT ||4000;
const app=express();
await connectDB(); 
app.use(cors({
  origin: ['http://localhost:5173', 'https://bg-removal-front-omega.vercel.app'],
  credentials: true
}));
app.post('/api/user/webhooks', bodyParser.raw({ type: 'application/json' }), clerkWebhooks);

app.use(express.json());
app.get('/',(req,res)=>res.send("Api is running..."))

app.use('/api/user',userRouter);
app.use('/api/image',imageRouter);



app.listen(PORT,()=>{
     console.log("server running on port "+PORT);
})
