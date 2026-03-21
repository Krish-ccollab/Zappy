import mongoose from 'mongoose';

const chatRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
);

// 👇 Unique index hataya — code mein check hota hai, duplicate index strict tha
chatRequestSchema.index({ sender: 1, receiver: 1, status: 1 });

export default mongoose.model('ChatRequest', chatRequestSchema);