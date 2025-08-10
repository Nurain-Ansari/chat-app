/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { MessageModel } from '../models/Message.model';
import { ChatModal } from '../models/Chat.modal';
import { errorResponse, successResponse } from '../middlewares/response.middleware';
import { AuthenticatedRequest } from '../types/interface';

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
export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
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

    // ✅ Convert to plain object before spreading
    const messageObj = savedMessage.toObject();

    const finalData = {
      ...messageObj,
      senderId: {
        name: req.user?.name,
        profilePic: req.user?.profilePic,
        _id: req.user?.id,
      },
    };

    successResponse(res, finalData, 'Message sent successfully');
  } catch (err: unknown) {
    errorResponse(req, res, err);
  }
};
