import { Request, Response } from 'express';

export const checkAdminAccess = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [email, password] = credentials.split(':');

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    res.status(200).json({
      success: true,
      message: 'Admin verified successfully',
    });
    return;
  }

  res.status(403).json({ success: false, message: 'Forbidden' });
};
