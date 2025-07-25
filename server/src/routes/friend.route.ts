import express from 'express';
import {
  sendFriendRequest,
  acceptFriendRequest,
  blockUser,
  unblockUser,
  ignoreUser,
  getFriendList,
  getAuditLogs,
} from '../controllers/friend.controller';
import { verifyUser } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/request', verifyUser, sendFriendRequest);
router.post('/accept', verifyUser, acceptFriendRequest);
router.post('/block', verifyUser, blockUser);
router.post('/unblock', verifyUser, unblockUser);
router.post('/ignore', verifyUser, ignoreUser);

router.get('/friends', verifyUser, getFriendList);
router.get('/audit-logs', verifyUser, getAuditLogs);

export default router;
