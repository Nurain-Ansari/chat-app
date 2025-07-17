/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import Message from '../models/Message.model';

// GET: All messages between two users
export const getMessages = async (req: Request, res: Response) => {
  const { senderId, receiverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    }).sort({ createdAt: 1 }); // Using timestamps
    res.status(200).json(messages);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch messages: ${err.message}` });
  }
};

// POST: Send a new message
export const sendMessage = async (req: Request, res: Response) => {
  const { sender, receiver, content } = req.body;
  try {
    if (!sender || !receiver || !content) {
      res.status(400).json({ error: 'Sender, receiver, and content are required.' });
      return;
    }

    const newMessage = new Message({ sender, receiver, content });
    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (err: any) {
    res.status(400).json({ error: `Failed to send message: ${err.message}` });
  }
};
