import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';

const router = express.Router();
router.get('/:senderId/:receiverId', getMessages);
router.post('/', sendMessage);

export default router;
