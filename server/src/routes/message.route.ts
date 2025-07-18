import express from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller';

const router = express.Router();
/**
 * @swagger
 * /messages/{senderId}/{receiverId}:
 *   get:
 *     summary: Get all messages exchanged between sender and receiver
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: senderId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the sender (User ID)
 *       - in: path
 *         name: receiverId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the receiver (User ID)
 *     responses:
 *       200:
 *         description: List of messages between users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   senderId:
 *                     type: string
 *                   receiverId:
 *                     type: string
 *                   content:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       400:
 *         description: Invalid sender or receiver ID
 */
router.get('/:senderId/:receiverId', getMessages);
router.post('/', sendMessage);

export default router;
