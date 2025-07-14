// server/routes/messages.js
import express from 'express';
import Message from '../models/Message.model';

const router = express.Router();

// Get all messages between two users
router.get('/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err: unknown) {
    res.status(500).json({ error: `Failed to fetch messages ${err}` });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err: unknown) {
    res.status(400).json({ error: `Failed to send message ${err}` });
  }
});

export default router;
