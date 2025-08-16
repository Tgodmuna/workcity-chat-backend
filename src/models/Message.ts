import mongoose, { Schema } from 'mongoose';
import IMessage, { type MessageDocument } from '../interfaces/IMessage';

const MessageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true },
    fileUrl: { type: String },
    readBy: [ { type: Schema.Types.ObjectId, ref: "User" } ],
    createdAt: {
      type: Date,
      default:Date.now()
    }
  },
  { timestamps: true }
);

export default mongoose.model<MessageDocument>("Message", MessageSchema);