import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    verifiedAt: { type: Date, default: null },
    attempts: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model('OtpVerification', otpSchema);
