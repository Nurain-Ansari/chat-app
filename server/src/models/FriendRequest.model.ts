import { Schema, model, Types } from 'mongoose';
import { FriendRequestStatus } from '../types/enums';

interface IFriendRequest {
  from: Types.ObjectId;
  to: Types.ObjectId;
  status: FriendRequestStatus;
  actedBy?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const friendRequestSchema = new Schema<IFriendRequest>(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(FriendRequestStatus),
      default: FriendRequestStatus.PENDING,
    },
    actedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

friendRequestSchema.index({ from: 1, to: 1 }, { unique: false });

friendRequestSchema.index({
  to: 1,
  status: 1,
});

friendRequestSchema.index({
  from: 1,
  status: 1,
});

friendRequestSchema.index({ status: 1 });

export const FriendRequest = model<IFriendRequest>('FriendRequest', friendRequestSchema);
