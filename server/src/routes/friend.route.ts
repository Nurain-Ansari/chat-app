import express from 'express';
import {
  createFriendList,
  deleteFriendListByUser,
  getFriendListsByUser,
  updateFriendList,
} from '../controllers/friendList.controller';

const router = express.Router();

router.post('/', createFriendList);
router.get('/:userId', getFriendListsByUser);
router.delete('/:userId/friends/:friendId', deleteFriendListByUser);
router.patch('/:userId/friends/:friendId', updateFriendList);
// router.patch('/:userId', createFriendList);

export default router;
