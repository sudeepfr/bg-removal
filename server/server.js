import dns from 'dns'
dns.setServers(["1.1.1.1","8.8.8.8"]);

import 'dotenv/config'
import express from 'express';
import connectDB from './configs/mongodb.js';
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';
import { clerkWebhooks } from './controllers/userController.js';
import bodyParser from 'body-parser';
  

const PORT = process.env.PORT || 4000;
const app = express();
await connectDB();

// ✅ Manual CORS — must be first, before everything else
// This ensures OPTIONS preflight is handled immediately without any redirect
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedPattern = /^http:\/\/localhost(:\d+)?$|^https:\/\/.*\.vercel\.app$/;
    if (!origin || allowedPattern.test(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, token, Authorization');
    // Respond immediately to preflight — no redirect possible
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

app.post('/api/user/webhooks', bodyParser.raw({ type: 'application/json' }), clerkWebhooks);

app.use(express.json());
app.get('/', (req, res) => res.send("Api is running..."))

app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);

app.listen(PORT, () => {
    console.log("server running on port " + PORT);
})
