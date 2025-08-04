import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';

const router = express.Router();

// ✅ Get messages by chatId
router.get('/:chatId', getMessages);

// ✅ Send a message (must include chatId in body)
router.post('/', sendMessage);

export default router;
