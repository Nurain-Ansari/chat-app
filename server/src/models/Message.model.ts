import { model, Schema, Types } from 'mongoose';

interface IMessage {
  chatId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  messageType?: 'text' | 'image' | 'video' | 'file';
  status: 'sent' | 'delivered' | 'read';
  reactions?: {
    user: Types.ObjectId;
    emoji: string;
  }[];
  seenBy?: Types.ObjectId[];
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'file'],
      default: 'text',
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
      },
    ],
    seenBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

messageSchema.index({ chat: 1 });
messageSchema.index({ sender: 1 });

export const MessageModel = model<IMessage>('Message', messageSchema);
