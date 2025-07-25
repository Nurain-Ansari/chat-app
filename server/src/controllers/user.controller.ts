/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import UserModel from '../models/User.model';
import { FriendList } from '../models/FriendList.model';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch users: ${err.message}` });
  }
};

// Get all open users (users not in any of the friend lists)
export const getAllOpenUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !Types.ObjectId.isValid(id)) {
      res.status(400).json({
        message: 'Valid user ID is required',
        success: false,
      });
      return;
    }

    const userId = new Types.ObjectId(id);

    // Get friend list in a single query with projections
    const friendList = await FriendList.findOne({ user: userId })
      .select('friendsList blockedUsers ignoredUsers')
      .lean();

    // Prepare exclusion list
    const excludedUsers = friendList
      ? [
          ...friendList.friendsList.map((f) => f.user),
          ...friendList.blockedUsers.map((b) => b.user),
          ...friendList.ignoredUsers.map((i) => i.user),
        ]
      : [];

    // Get open users in a single optimized query
    const users = await UserModel.find({
      _id: {
        $ne: userId,
        $nin: excludedUsers,
      },
    })
      .select('-password -__v')
      .lean();

    res.status(200).json({
      data: users,
      success: true,
    });
  } catch (err: any) {
    console.error('Failed to fetch open users:', err);
    res.status(500).json({
      error: 'Failed to fetch users',
      success: false,
    });
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch user: ${err.message}` });
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, profilePic } = req.body;

    // ✅ Manual required fields check
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    // ✅ Check for duplicate email
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      name,
      email,
      password: hashedPassword,
      profilePic,
    });

    await newUser.save();

    const userWithoutPassword = newUser.toObject() as Record<string, any>;
    delete userWithoutPassword?.password;

    res.status(201).json(userWithoutPassword);
  } catch (err: any) {
    res.status(400).json({ error: `User creation failed: ${err.message}` });
  }
};
