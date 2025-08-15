import { Document } from 'mongoose';

export type UserRole = 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';

export default interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}
