import Message from '../models/Message';
import IMessage from '../interfaces/IMessage';

class ChatService {
  async sendMessage(data: Partial<IMessage>) {
    return await Message.create(data);
  }

  async getConversation(conversationId: string) {
    return await Message.find({ conversationId }).sort({ createdAt: 1 });
  }

  async markAsRead(conversationId: string, userId: string) {
    return await Message.updateMany(
      { conversationId, receiver: userId, read: false },
      { read: true }
    );
  }
}

export default new ChatService();
