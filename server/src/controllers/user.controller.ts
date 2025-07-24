/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.model';
import FriendListModel from '../models/FriendList.model';

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
    const { id } = req.params; // Destructure the id from params
    if (!id) {
      res.status(400).json({
        message: 'User ID is required',
        success: false,
      });
      return;
    }

    // Get all users except current user and without passwords
    let users = await UserModel.find({ _id: { $ne: id } }).select('-password');

    const friendList = await FriendListModel.findOne({ user: id });
    if (friendList) {
      // Filter users who aren't in any of the friend lists
      users = users.filter(
        (user) =>
          !friendList.friendsList.some((friendId) => friendId.equals(user._id)) &&
          !friendList.waitingList.some((waitingId) => waitingId.equals(user._id)) &&
          !friendList.ignoreList.some((ignoreId) => ignoreId.equals(user._id)),
      );
    }

    res.status(200).json({
      data: users,
      success: true,
    });
  } catch (err: any) {
    res.status(500).json({
      error: `Failed to fetch users: ${err.message}`,
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
