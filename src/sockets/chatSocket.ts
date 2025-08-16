import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import type { UserRole } from '../interfaces/IUser';
import Message from '../models/Message';
import User from '../models/User';
import conversation from '../models/Conversation';
import { Types } from 'mongoose';

type JwtPayload = { id: string; role: UserRole };

const onlineUsers = new Map<string, string>();
const userRooms = new Map<string, Set<string>>();

const isValidId = (id: string) =>
  !!id && id !== 'new' && Types.ObjectId.isValid(id);

export function setupSocket(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error('Unauthorized'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const user = await User.findById(decoded.id);

      if (!user) return next(new Error('Unauthorized'));

      (socket as any).user = { id: String(user._id), role: user.role };
      next();
    } catch (e) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const { id: userId } = (socket as any).user as {
      id: string;
      role: UserRole;
    };

    // Track presence
    onlineUsers.set(socket.id, userId);
    if (!userRooms.has(userId)) userRooms.set(userId, new Set());
    userRooms.get(userId)!.add(socket.id);
    await User.updateOne({ _id: userId }, { $set: { online: true } });

    socket.on('join_conversation', async (conversationId: string) => {
      if (!isValidId(conversationId)) return;

      const inConvo = await conversation.exists({
        _id: conversationId,
        'participants.user': userId,
      });
      if (!inConvo) return;
      socket.join(conversationId);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      if (!isValidId(conversationId)) return;
      socket.leave(conversationId);
    });

    socket.on('typing', (conversationId: string) => {
      if (!isValidId(conversationId)) return;
      socket.to(conversationId).emit('typing', { userId });
    });

    socket.on('stop_typing', (conversationId: string) => {
      if (!isValidId(conversationId)) return;
      socket.to(conversationId).emit('stop_typing', { userId });
    });

    socket.on(
      'message_send',
      async ({
        conversationId,
        content,
      }: {
        conversationId: string;
        content: string;
      }) => {
        if (!isValidId(conversationId)) return; // <-- Guard added

        // validate membership
        const convo = await conversation.findOne({
          _id: conversationId,
          'participants.user': userId,
        });
        if (!convo) return;

        const msg = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          readBy: [userId],
        });

        await conversation.updateOne(
          { _id: conversationId },
          { $set: { lastMessageText: content, lastMessageAt: msg.createdAt } }
        );

        const shaped = {
          _id: msg._id,
          conversation: conversationId,
          sender: { id: userId },
          content,
          createdAt: msg.createdAt,
        };

        io.to(conversationId).emit('message_new', shaped);
      }
    );

    socket.on('disconnect', async () => {
      const uSet = userRooms.get(userId);
      if (uSet) {
        uSet.delete(socket.id);
        if (uSet.size === 0) {
          userRooms.delete(userId);
          await User.updateOne({ _id: userId }, { $set: { online: false } });
        }
      }
      onlineUsers.delete(socket.id);
    });
  });
}
