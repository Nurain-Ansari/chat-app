import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllOpenUsers,
} from '../controllers/user.controller';
import { verifyUser } from '../middlewares/auth.middleware';

const router = express.Router();

router.get('/open/:id', verifyUser, getAllOpenUsers);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.post('/', createUser);

export default router;
