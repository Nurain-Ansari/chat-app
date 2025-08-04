import { model, Schema, Types } from 'mongoose';

interface IChat {
  isGroup: boolean;
  members: Types.ObjectId[]; // Always at least 2
  groupName?: string; // Only for groups
  createdBy: Types.ObjectId;
  lastMessage?: Types.ObjectId;
  updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
  {
    isGroup: { type: Boolean, default: false },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    groupName: { type: String }, // Optional
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
  },
  { timestamps: true },
);

chatSchema.index({ members: 1 }); // For private chat lookup
chatSchema.index({ isGroup: 1 });

export const Chat = model<IChat>('Chat', chatSchema);
