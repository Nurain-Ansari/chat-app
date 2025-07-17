import { Request, Response } from 'express';
import UserModel from '../models/User.model';

// for login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and Password is required' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findUserByEmail = (await UserModel.findOne({ email }))?.toObject() as Record<string, any>;

    if (!findUserByEmail) {
      res.status(401).json({ error: 'Account does not exist' });
      return;
    }

    if (password !== findUserByEmail.password) {
      res.status(401).json({ error: 'Email Or Password is incorrect' });
      return;
    }

    delete findUserByEmail.password;

    res.status(200).json(findUserByEmail);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
