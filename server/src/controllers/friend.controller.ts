/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { FriendAuditLog } from '../models/FriendAuditLog.model';
import { FriendList } from '../models/FriendList.model';
import { FriendRequest } from '../models/FriendRequest.model';
import { FriendRequestStatus, FriendAction } from '../types/enums';
import { AuthenticatedRequest } from '../types/interface';
import { errorResponse, successResponse } from '../middlewares/response.middleware';
import { ChatModal } from '../models/Chat.modal';

const updateFriendLists = async (userId1: string, userId2: string) => {
  const [result1, result2] = await Promise.all([
    FriendList.findOneAndUpdate(
      { user: userId1 },
      { $addToSet: { friendsList: { user: userId2 } } },
      { upsert: true },
    ),
    FriendList.updateOne(
      { user: userId2 },
      { $addToSet: { friendsList: { user: userId1 } } },
      { upsert: true },
    ),
  ]);
  return { result1, result2 };
};

export const sendFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fromUser = req.user?.id;
    const { toUserId } = req.body;

    if (!fromUser || !toUserId) {
      errorResponse(res, 'Missing required fields');
      return;
    }

    if (fromUser === toUserId) {
      errorResponse(res, "You can't send a request to yourself");
      return;
    }

    const existingRequest = await FriendRequest.findOne({
      from: fromUser,
      to: toUserId,
    })
      .where('status')
      .in([FriendRequestStatus.PENDING, FriendRequestStatus.ACCEPTED])
      .lean();

    if (existingRequest) {
      errorResponse(res, 'Friend request already sent');
      return;
    }

    const newRequest = await FriendRequest.create({
      from: fromUser,
      to: toUserId,
    });

    await FriendAuditLog.create({
      actor: fromUser,
      target: toUserId,
      action: FriendAction.SEND_REQUEST,
    });

    successResponse(res, newRequest, 'Friend request sent', 201);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const getFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fromUser = req.user?.id;

    const friendRequests = await FriendRequest.find({ to: fromUser }).lean();

    const groupedRequests = {
      pending: friendRequests.filter((req) => req.status === FriendRequestStatus.PENDING),
      accepted: friendRequests.filter((req) => req.status === FriendRequestStatus.ACCEPTED),
      rejected: friendRequests.filter((req) => req.status === FriendRequestStatus.REJECTED),
      cancelled: friendRequests.filter((req) => req.status === FriendRequestStatus.CANCELLED),
    };

    successResponse(res, groupedRequests);
  } catch (err: any) {
    return errorResponse(res, err.message, 500);
  }
};

export const acceptFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const toUser = req.user?.id;
    const { fromUserId } = req.body;

    if (!toUser || !fromUserId) {
      errorResponse(res, 'Missing required fields');
      return;
    }

    const request = await FriendRequest.findOneAndUpdate(
      {
        from: fromUserId,
        to: toUser,
        status: FriendRequestStatus.PENDING,
      },
      {
        status: FriendRequestStatus.ACCEPTED,
        actedBy: toUser,
      },
      {
        new: true,
        projection: { _id: 1, from: 1, to: 1 },
      },
    ).lean();

    if (!request) {
      return errorResponse(res, 'No pending request found', 404);
    }

    await updateFriendLists(toUser, fromUserId);

    // ✅ Check if a chat already exists between them
    let existingChat = await ChatModal.findOne({
      isGroup: false,
      members: { $all: [toUser, fromUserId], $size: 2 },
    }).lean();

    if (!existingChat) {
      await ChatModal.create({
        isGroup: false,
        members: [toUser, fromUserId],
        createdBy: toUser, // or fromUserId
      });
    }

    successResponse(res, {}, 'Friend request accepted');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blocker = req.user?.id;
    const { targetId, reason } = req.body;

    if (!blocker || !targetId) {
      errorResponse(res, 'Missing required fields');
      return;
    }

    await FriendList.updateOne(
      { user: blocker },
      {
        $addToSet: { blockedUsers: { user: targetId, reason } },
        $pull: { friendsList: { user: targetId } },
      },
      { upsert: true },
    );

    await FriendAuditLog.create({
      actor: blocker,
      target: targetId,
      action: FriendAction.BLOCK,
      reason,
    });

    successResponse(res, {}, 'User blocked');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const unblockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const unblocker = req.user?.id;
    const { targetId } = req.body;

    if (!unblocker || !targetId) {
      errorResponse(res, 'Missing required fields');
      return;
    }

    await FriendList.updateOne(
      { user: unblocker },
      { $pull: { blockedUsers: { user: targetId } } },
    );

    await FriendAuditLog.create({
      actor: unblocker,
      target: targetId,
      action: FriendAction.UNBLOCK,
    });

    successResponse(res, {}, 'User unblocked');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const ignoreUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ignorer = req.user?.id;
    const { targetId, reason } = req.body;

    if (!ignorer || !targetId) {
      errorResponse(res, 'Missing required fields');
      return;
    }

    await FriendList.updateOne(
      { user: ignorer },
      { $addToSet: { ignoredUsers: { user: targetId, reason } } },
      { upsert: true },
    );

    await FriendAuditLog.create({
      actor: ignorer,
      target: targetId,
      action: FriendAction.IGNORE,
      reason,
    });

    successResponse(res, {}, 'User ignored');
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const getFriendList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      errorResponse(res, 'User ID is required');
      return;
    }

    const friendList = await FriendList.findOne({ user: userId })
      .select('friendsList')
      .populate('friendsList.user', 'name profilePic')
      .hint('user_1')
      .lean();

    const friends = friendList?.friendsList || [];

    successResponse(res, friends);
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      errorResponse(res, 'User ID is required');
      return;
    }

    const logs = await FriendAuditLog.find({
      $or: [{ actor: userId }, { target: userId }],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor target', 'name profilePic')
      .lean();

    successResponse(res, { logs });
  } catch (err: any) {
    errorResponse(res, err.message, 500);
  }
};
