import mongoose, { Schema } from 'mongoose';
import IUser from '../interfaces/IUser';

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'agent', 'customer', 'designer', 'merchant'],
      default: 'customer',
    },
    online:{type:Boolean,default:false}
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
