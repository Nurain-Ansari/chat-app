import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  getAllOpenUsers,
} from '../controllers/user.controller';

const router = express.Router();

router.get('/open/:id', getAllOpenUsers);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.post('/', createUser);

export default router;
