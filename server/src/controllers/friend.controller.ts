/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';
import { FriendAuditLog } from '../models/FriendAuditLog.model';
import { FriendList } from '../models/FriendList.model';
import { FriendRequest } from '../models/FriendRequest.model';
import { FriendRequestStatus, FriendAction } from '../types/enums';
import { AuthenticatedRequest } from '../types/interface';

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
    // a
    const fromUser = req.user?.id;
    // b
    const { toUserId } = req.body;

    if (!fromUser || !toUserId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (fromUser === toUserId) {
      res.status(400).json({ error: "You can't send a request to yourself" });
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
      res.status(400).json({ error: 'Friend request already sent' });
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

    res.status(201).json({ message: 'Friend request sent', request: newRequest });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fromUser = req.user?.id;

    // Get all friend requests where the current user is the recipient
    const friendRequests = await FriendRequest.find({
      to: fromUser,
    }).lean();

    // Group requests by status for better organization in the response
    const groupedRequests = {
      pending: friendRequests.filter((req) => req.status === FriendRequestStatus.PENDING),
      accepted: friendRequests.filter((req) => req.status === FriendRequestStatus.ACCEPTED),
      rejected: friendRequests.filter((req) => req.status === FriendRequestStatus.REJECTED),
      cancelled: friendRequests.filter((req) => req.status === FriendRequestStatus.CANCELLED),
    };

    res.status(200).json({
      success: true,
      data: groupedRequests,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export const acceptFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // to b
    const toUser = req.user?.id;
    const body = req.body;
    // to a
    const fromUserId = body?.fromUserId;

    if (!toUser || !fromUserId) {
      res.status(400).json({ error: 'Missing required fields' });
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
      res.status(404).json({ error: 'No pending request found' });
      return;
    }

    await updateFriendLists(toUser, fromUserId);

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const blocker = req.user?.id;
    const { targetId, reason } = req.body;

    if (!blocker || !targetId) {
      res.status(400).json({ error: 'Missing required fields' });
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

    res.status(200).json({ message: 'User blocked' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const unblockUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const unblocker = req.user?.id;
    const { targetId } = req.body;

    if (!unblocker || !targetId) {
      res.status(400).json({ error: 'Missing required fields' });
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

    res.status(200).json({ message: 'User unblocked' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const ignoreUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ignorer = req.user?.id;
    const { targetId, reason } = req.body;

    if (!ignorer || !targetId) {
      res.status(400).json({ error: 'Missing required fields' });
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

    res.status(200).json({ message: 'User ignored' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getFriendList = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    console.log('userId: ', userId);
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const friendList = await FriendList.findOne({ user: userId })
      .select('friendsList')
      .populate('friendsList.user', 'name profilePic')
      .hint('user_1')
      .lean();

    if (!friendList) {
      res.status(200).json({ friends: [] });
      return;
    }

    res.status(200).json({ friends: friendList.friendsList });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
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

    res.status(200).json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
