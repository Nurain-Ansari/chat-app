/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { MessageModel } from '../models/Message.model';
import { ChatModal } from '../models/Chat.modal';
import { errorResponse, successResponse } from '../middlewares/response.middleware';

// ✅ GET: All messages in a chat
export const getMessages = async (req: Request, res: Response) => {
  const { chatId } = req.params;

  try {
    const messages = await MessageModel.find({ chatId })
      .populate('senderId', 'name profilePic')
      .sort({ createdAt: 1 });

    successResponse(res, messages, 'All Message retrieve successfully');
  } catch (err: unknown) {
    errorResponse(req, res, err);
  }
};

// ✅ POST: Send a new message in a chat
export const sendMessage = async (req: Request, res: Response) => {
  const { chatId, senderId, content, messageType = 'text' } = req.body;

  try {
    const message = new MessageModel({
      chatId,
      senderId,
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
  } catch (err: unknown) {
    errorResponse(req, res, err);
  }
};
