import mongoose, { Document, Schema } from "mongoose";
import type { IParticipant } from "../interfaces/Iparticipant";
import type { ConversationDocument } from "../interfaces/IConversationDocument";

const ParticipantSchema = new Schema<IParticipant>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["admin", "agent", "customer", "designer", "merchant"], required: true },
    lastReadAt: { type: Date, default: null }
  },
  { _id: false }
);

const ConversationSchema = new Schema<ConversationDocument>(
  {
    title: { type: String, trim: true },
    participants: { type: [ParticipantSchema], validate: (v: IParticipant[]) => v.length >= 2 },
    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model<ConversationDocument>("Conversation", ConversationSchema);
