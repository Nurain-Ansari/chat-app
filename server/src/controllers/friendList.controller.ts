import { Request, Response } from 'express';
import FriendListModel from '../models/FriendList.model';
interface FriendListUpdatePayload {
  friendsList?: string[];
  waitingList?: string[];
  ignoreList?: string[];
}
// post call
export const createFriendList = async (req: Request, res: Response) => {
  try {
    const { userId, friendList } = req.body;

    if (!userId || !friendList) {
      res.status(400).json({ error: 'userId and friendList are required.' });
      return;
    }

    const newFriendList = await FriendListModel.create({
      user: userId,
      friendsList: friendList,
    });

    res.status(201).json({ success: true, data: newFriendList });
  } catch (error) {
    const err = error as Error; // safe cast
    res.status(400).json({ error: `Friend list creation failed: ${err.message}` });
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
