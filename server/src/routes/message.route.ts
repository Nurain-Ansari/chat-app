import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';

const messageRouter = express.Router();

// ✅ Get messages by chatId
messageRouter.get('/:chatId', getMessages);

// ✅ Send a message (must include chatId in body)
messageRouter.post('/', sendMessage);

export default messageRouter;
