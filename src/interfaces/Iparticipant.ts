import type mongoose from "mongoose";
import type { UserRole } from './IUser';

export interface IParticipant {
  user: mongoose.Types.ObjectId;
  role: UserRole;
  lastReadAt?: Date | null;
}