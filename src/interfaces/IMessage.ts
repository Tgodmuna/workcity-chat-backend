import mongoose, { Document } from 'mongoose';

export default interface IMessage extends Document {
  conversation: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  read: boolean;
   fileUrl?: string;
  readBy: mongoose.Types.ObjectId[];
  createdAt:Date
}

export  type MessageDocument = Document & IMessage;