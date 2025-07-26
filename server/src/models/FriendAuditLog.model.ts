import { Schema, model, Types } from 'mongoose';
import { FriendAction } from '../types/enums';

interface IFriendAuditLog {
  actor: Types.ObjectId;
  target: Types.ObjectId;
  action: FriendAction;
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const auditLogSchema = new Schema<IFriendAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    target: { type: Schema.Types.ObjectId, ref: 'User' },
    action: {
      type: String,
      enum: Object.values(FriendAction),
    },
    reason: String,
  },
  { timestamps: true },
);

auditLogSchema.index({ actor: 1 });

auditLogSchema.index({ target: 1 });

auditLogSchema.index({ action: 1 });

auditLogSchema.index({ timestamp: -1 });

auditLogSchema.index({
  actor: 1,
  target: 1,
  timestamp: -1,
});

export const FriendAuditLog = model<IFriendAuditLog>('FriendAuditLog', auditLogSchema);
