/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import UserModel from '../models/User.model';
import { FriendList } from '../models/FriendList.model';
import { successResponse, errorResponse } from '../middlewares/response.middleware';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password');
    successResponse(res, users);
    return;
  } catch (err: any) {
    errorResponse(res, `Failed to fetch users: ${err.message}`, 500);
  }
};

// Get all open users (users not in any of the friend lists)
export const getAllOpenUsers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      errorResponse(res, 'Valid user ID is required', 400);
      return;
    }

    const userId = new Types.ObjectId(id);

    const friendList = await FriendList.findOne({ user: userId })
      .select('friendsList blockedUsers ignoredUsers')
      .lean();

    const excludedUsers = friendList
      ? [
          ...friendList.friendsList.map((f) => f.user),
          ...friendList.blockedUsers.map((b) => b.user),
          ...friendList.ignoredUsers.map((i) => i.user),
        ]
      : [];

    const users = await UserModel.find({
      _id: {
        $ne: userId,
        $nin: excludedUsers,
      },
    })
      .select('-password -__v')
      .lean();

    successResponse(res, users);
  } catch (err: any) {
    console.error('Failed to fetch open users:', err);
    errorResponse(res, 'Failed to fetch users', 500);
  }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id).select('-password');

    if (!user) {
      errorResponse(res, 'User not found', 404);
      return;
    }

    successResponse(res, user);
  } catch (err: any) {
    errorResponse(res, `Failed to fetch user: ${err.message}`, 500);
  }
};

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, profilePic } = req.body;

    if (!name || !email || !password) {
      errorResponse(res, 'Name, email, and password are required.', 400);
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      errorResponse(res, 'Email already exists.', 400);
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
    delete userWithoutPassword.password;

    successResponse(res, userWithoutPassword, 'User created successfully', 201);
  } catch (err: any) {
    errorResponse(res, `User creation failed: ${err.message}`, 400);
  }
};
