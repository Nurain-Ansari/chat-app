/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.model';

// Get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find().select('-password');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: `Failed to fetch users: ${err.message}` });
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
