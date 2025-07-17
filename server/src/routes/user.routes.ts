import express from 'express';
import { getAllUsers, getUserById, createUser } from '../controllers/user.controller';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);

export default router;
