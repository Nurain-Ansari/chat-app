import { Schema, model, Types } from 'mongoose';

interface IFriendEntry {
  user: Types.ObjectId;
  since?: Date;
}

interface IBlockedUser {
  user: Types.ObjectId;
  blockedAt?: Date;
  reason?: string;
}

interface IIgnoredUser {
  user: Types.ObjectId;
  ignoredAt?: Date;
  reason?: string;
}

interface IFriendList {
  user: Types.ObjectId;
  friendsList: IFriendEntry[];
  blockedUsers: IBlockedUser[];
  ignoredUsers: IIgnoredUser[];
  createdAt?: Date;
  updatedAt?: Date;
}

const friendListSchema = new Schema<IFriendList>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendsList: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        since: { type: Date, default: Date.now },
      },
    ],
    blockedUsers: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        blockedAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
    ignoredUsers: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        ignoredAt: { type: Date, default: Date.now },
        reason: String,
      },
    ],
  },
  { timestamps: true },
);

friendListSchema.index({ user: 1 });

friendListSchema.index({ 'friendsList.user': 1 });
friendListSchema.index({ 'blockedUsers.user': 1 });
friendListSchema.index({ 'ignoredUsers.user': 1 });

export const FriendList = model<IFriendList>('FriendList', friendListSchema);
