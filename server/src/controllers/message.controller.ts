/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Message } from '../models/Message.model';
import { Chat } from '../models/chat.modal';

// ✅ GET: All messages in a chat
export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate('sender', 'name profilePic') // Optional: populate sender info
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch messages: ${err.message}` });
  }
};

// ✅ POST: Send a new message in a chat
export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, sender, content, messageType = 'text' } = req.body;

  try {
    if (!chatId || !sender || !content) {
      res.status(400).json({ error: 'chatId, sender, and content are required.' });
      return;
    }

    const message = new Message({
      chat: chatId,
      sender,
      content,
      messageType,
    });

    const savedMessage = await message.save();

    // Update the lastMessage reference in Chat
    await Chat.findByIdAndUpdate(chatId, { lastMessage: savedMessage._id, updatedAt: new Date() });

    res.status(201).json(savedMessage);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to send message: ${err.message}` });
  }
};
