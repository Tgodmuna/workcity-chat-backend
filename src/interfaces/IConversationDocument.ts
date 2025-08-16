import type { Document } from "mongoose";
import type { IParticipant } from "./Iparticipant";

export interface ConversationDocument extends Document {
  title?: string;
  participants: IParticipant[];
  lastMessageText?: string;
  lastMessageAt?: Date;
}