import mongoose, { Schema } from 'mongoose';
import IMessage from '../interfaces/IMessage';

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: { type: String, required: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
