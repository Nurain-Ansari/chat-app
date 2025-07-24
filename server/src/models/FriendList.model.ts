import mongoose from 'mongoose';

const friendListSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  friendsList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ignoreList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.model('FriendList', friendListSchema);
