import { Request, Response, NextFunction } from 'express';
import User from '../models/User.model';
import { AuthenticatedRequest } from '../types/interface';

export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      return;
    }

    const id = authHeader.split(' ')[1];

    // ✅ Find user by ID
    const user = await User.findById(id);

    if (!user || user.type !== 'admin') {
      res.status(403).json({ success: false, message: 'Forbidden: Admins only' });
      return;
    }

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export const verifyUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
      return;
    }

    const id = authHeader.split(' ')[1];

    // ✅ Find user by ID
    const user = await User.findById(id).lean();

    if (!user) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    req.user = { ...user, id };

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};
