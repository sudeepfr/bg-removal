import express from 'express';
import bodyParser from 'body-parser';

import { clerkWebhooks } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.post('/webhooks',
  bodyParser.raw({ type: "application/json" }),clerkWebhooks);

export default userRouter;