import { Server, Socket } from 'socket.io';
import ChatService from '../services/ChatService';

export default function chatSocketHandler(socket: Socket, io: Server) {
  socket.on('joinRoom', (roomId: string) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('sendMessage', async messageData => {
    const message = await ChatService.sendMessage(messageData);
    io.to(messageData.conversationId).emit('newMessage', message);
  });

  socket.on('typing', data => {
    socket.to(data.conversationId).emit('typing', data.userId);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
}
