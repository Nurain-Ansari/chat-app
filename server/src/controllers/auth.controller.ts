/* eslint-disable @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import UserModel from '../models/User.model';
import { errorResponse, successResponse } from '../middlewares/response.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    // Find user and return plain object
    const user = await UserModel.findOne({ email }).lean();

    if (!user) {
      return errorResponse(res, 'Account does not exist', 401);
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Email or password is incorrect', 401);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    // Respond with user data (without password)
    return successResponse(res, userWithoutPassword, 'Login successful', 200);
  } catch (err: any) {
    return errorResponse(res, err.message || 'Login failed', 500);
  }
};
