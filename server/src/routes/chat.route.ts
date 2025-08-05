import express from 'express';
import { verifyUser } from '../middlewares/auth.middleware';
import getUserChats from '../controllers/chat.controller';

const chatRouter = express.Router();

chatRouter.get('/mine', verifyUser, getUserChats);

export default chatRouter;
