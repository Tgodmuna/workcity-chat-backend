import { Document, Types } from 'mongoose';

export default interface IMessage extends Document {
  conversationId: string;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
