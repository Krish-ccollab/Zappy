import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['signup', 'password_reset'], default: 'signup' },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

export default mongoose.model('OtpVerification', otpSchema);
