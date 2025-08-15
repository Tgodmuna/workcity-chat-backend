import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import IUser from '../interfaces/IUser';

class AuthService {
  async register(data: Partial<IUser>) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) throw new Error('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password!, 10);
    const user = await User.create({ ...data, password: hashedPassword });

    return this.generateToken(user);
  }

  async login(email: string, password: string) {
    const user = await User.findOne({ email });
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    return this.generateToken(user);
  }

  private generateToken(user: IUser) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || '',
      { expiresIn: '1d' }
    );
  }
}

export default new AuthService();
