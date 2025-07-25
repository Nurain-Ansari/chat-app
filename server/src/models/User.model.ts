import mongoose from 'mongoose';
import { UserType } from '../types/enums';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profilePic: { type: String },
    type: {
      type: String,
      enum: UserType,
      default: UserType.USER,
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model('User', userSchema);
