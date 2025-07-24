import { Request, Response } from 'express';
import mongoose from 'mongoose';
import FriendListModel from '../models/FriendList.model';
import UserModel from '../models/User.model';

interface FriendListUpdatePayload {
  friendsList?: string[];
  waitingList?: string[];
  ignoreList?: string[];
}
// post call
export const createFriendList = async (req: Request, res: Response) => {
  try {
    const { userId, friendId } = req.body;

    // 1. Validate input
    if (!userId || !friendId) {
      res.status(400).json({ error: 'userId and friendId are required.' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(friendId)) {
      res.status(400).json({ error: 'Invalid userId or friendId format.' });
    }

    // 2. Check if user and friend exist (optional but recommended)
    const [userExists, friendExists] = await Promise.all([
      UserModel.exists({ _id: userId }),
      UserModel.exists({ _id: friendId }),
    ]);

    if (!userExists || !friendExists) {
      res.status(404).json({ error: 'User or friend not found.' });
      return;
    }

    // 3. Find or create the friend list
    const friendList = await FriendListModel.findOneAndUpdate(
      { user: userId }, // Filter: Find by userId
      {
        $addToSet: { friendsList: friendId }, // Add friendId to array (no duplicates)
      },
      {
        new: true, // Return the updated document
        upsert: true, // Create if it doesn't exist
        setDefaultsOnInsert: true, // Apply schema defaults on creation
      },
    );

    // 4. Success response
    res.status(201).json({
      success: true,
      data: friendList,
      message:
        friendList.friendsList.length === 1
          ? 'New friend list created.'
          : 'Friend added to existing list.',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      error: `Friend list update failed: ${err.message}`,
    });
  }
};

// read call
export const getFriendListsByUser = async (req: Request, res: Response) => {
  try {
    const friendList = await FriendListModel.find({ user: req.params.userId });
    if (!friendList) {
      res.status(404).json({ error: 'Friend list not found.' });
      return;
    }
    res.status(200).json({ success: true, data: friendList });
  } catch (error) {
    const err = error as Error; // safe cast
    res.status(500).json({ error: `Friend list retrieval failed: ${err.message}` });
  }
};

// delete call
export const deleteFriendListByUser = async (req: Request, res: Response) => {
  try {
    const { userId, friendId } = req.params;

    if (!userId || !friendId) {
      res.status(400).json({ error: 'userId and friendId are required.' });
      return;
    }

    const updatedFriendList = await FriendListModel.findOneAndUpdate(
      { user: userId },
      { $pull: { friendsList: friendId } },
      { new: true }, // returns the updated document
    );

    if (!updatedFriendList) {
      res.status(404).json({ error: 'Friend list not found for given user.' });
      return;
    }

    res.status(200).json({ success: true, data: updatedFriendList });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `Failed to remove friend: ${err.message}` });
  }
};

//update friendlist
export const updateFriendList = async (req: Request, res: Response) => {
  try {
    const friendId = req.params.friendId;
    const { friendsList, waitingList, ignoreList } = req.body;

    if (!friendId) {
      res.status(400).json({ error: 'friendId is required.' });
      return;
    }

    const updateFields: FriendListUpdatePayload = {};
    if (friendsList) updateFields.friendsList = friendsList;
    if (waitingList) updateFields.waitingList = waitingList;
    if (ignoreList) updateFields.ignoreList = ignoreList;

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ error: 'No valid fields to update.' });
      return;
    }

    const updatedFriendList = await FriendListModel.findOneAndUpdate(
      { _id: friendId },
      { $set: updateFields },
      { new: true },
    );

    if (!updatedFriendList) {
      res.status(404).json({ error: 'Friend list not found.' });
      return;
    }

    res.status(200).json({ success: true, data: updatedFriendList });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: `friendId update failed: ${err.message}` });
  }
};
