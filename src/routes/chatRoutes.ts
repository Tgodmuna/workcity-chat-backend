import { Router } from 'express';
import ChatService from '../services/ChatService';
import authMiddleware, { AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

router.get(
  '/:conversationId',
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.params?.conversationId)
      return res
        .status(400)
        .send('no conversation ID passed for retrival of conversation');

    const messages = await ChatService.getConversation(
      req.params?.conversationId
    );

    res.json(messages);
  }
);

router.patch(
  '/:conversationId/read',
  authMiddleware,
  async (req: AuthRequest, res) => {
    if (!req.params?.conversationId)
      return res.status(400).send('no conversation ID passed');

    await ChatService.markAsRead(req.params.conversationId, req.user.id);

    res.json({ message: 'Messages marked as read' });
  }
);

export default router;
