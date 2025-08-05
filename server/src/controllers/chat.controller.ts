import { Response } from 'express';
import { ChatModal } from '../models/Chat.modal';
import { errorResponse, successResponse } from '../middlewares/response.middleware';
import { AuthenticatedRequest } from '../types/interface';

export default async function getUserChats(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req?.user?.id;

    const data = await ChatModal.find({ members: { $in: [userId] } })
      .populate({
        path: 'members',
        select: 'name email profilePic',
        match: { _id: { $ne: userId } },
      })
      .lean();

    // const cleanedChats = data.map((chat) => ({
    //   ...chat,
    //   members: (chat.members || []).filter((member) => member?._id?.toString() !== userId),
    // }));

    successResponse(res, data, 'Retrieve all messages successfully');
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorResponse(res, error.message, 500);
    } else {
      errorResponse(res, 'Something went wrong', 500);
    }
  }
}
