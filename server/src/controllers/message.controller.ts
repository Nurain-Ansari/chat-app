/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { MessageModel } from '../models/Message.model';
import { ChatModal } from '../models/Chat.modal';
import { errorResponse, successResponse } from '../middlewares/response.middleware';

// ✅ GET: All messages in a chat
export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await MessageModel.find({ chat: chatId })
      .populate('senderId', 'name profilePic')
      .sort({ createdAt: 1 });

    successResponse(res, messages, 'All Message retrieve successfully');
  } catch (err: any) {
    errorResponse(res, err.messages, 500);
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

    const message = new MessageModel({
      chat: chatId,
      sender,
      content,
      messageType,
    });

    const savedMessage = await message.save();

    // Update the lastMessage reference in Chat
    await ChatModal.findByIdAndUpdate(chatId, {
      lastMessage: savedMessage._id,
      updatedAt: new Date(),
    });

    successResponse(res, savedMessage, 'Message sent successfully');
  } catch (err: any) {
    errorResponse(res, err.messages, 500);
  }
};
