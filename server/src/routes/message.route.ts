import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';
import { verifyUser } from '../middlewares/auth.middleware';

const messageRouter = express.Router();

// ✅ Get messages by chatId
messageRouter.get('/:chatId', verifyUser, getMessages);

// ✅ Send a message (must include chatId in body)
messageRouter.post('/', verifyUser, sendMessage);

export default messageRouter;
