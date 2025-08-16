import { Document } from 'mongoose';

export type UserRole = 'admin' | 'agent' | 'customer' | 'designer' | 'merchant';

export default interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  online:boolean,
  createdAt: Date;
  updatedAt: Date;
}
