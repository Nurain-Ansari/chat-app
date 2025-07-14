import mongoose from 'mongoose';

const registerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: String,
  },
  { timestamps: true },
);

export type RegisterType = mongoose.InferSchemaType<typeof registerSchema>;

export default mongoose.model('Register', registerSchema);
