import { Request } from 'express';
import { UserTypeFromSchema } from '../models/User.model';

export interface AuthenticatedRequest extends Request {
  user?: UserTypeFromSchema & { id: string };
}
