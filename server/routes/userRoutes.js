import express from 'express';
import bodyParser from 'body-parser';

import { clerkWebhooks, userCredits } from '../controllers/userController.js';
import authUser from '../middlewares/auth.js';

const userRouter=express.Router();

userRouter.post('/webhooks',
bodyParser.raw({ type: "application/json" }),clerkWebhooks);
userRouter.get('/credits',authUser,userCredits);

export default userRouter;