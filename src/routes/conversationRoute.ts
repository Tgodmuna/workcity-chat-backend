import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// list my conversations
router.get('/list-my-convos', authMiddleware, async (req, res) => {
  const userId = req.user!._id;
  const list = await Conversation.find({ 'participants.user': userId })
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .lean();

  const enriched = list.map((c: any) => ({
    _id: c._id,
    title: c.title,
    participants: c.participants,
    lastMessageText: c.lastMessageText,
    lastMessageAt: c.lastMessageAt,
    unread: c.participants?.find((p: any) => String(p.user) === String(userId))
      ?.lastReadAt
      ? 0
      : 0,
  }));
  res.json(enriched);
});

// create conversation
router.post("/create-convo", authMiddleware, async (req, res) => {
  try {
    const me = req.user!;
    const { title, participantIds = [] } = req.body as { title?: string; participantIds?: string[] };

    // Ensure all IDs are valid ObjectIds
    const validIds = [String(me._id), ...participantIds].filter(id => mongoose.isValidObjectId(id));
    if (validIds.length < 2) {
      return res.status(400).json({ message: "Need at least 2 valid participants" });
    }

    // Convert all IDs into ObjectId instances
    const ids = validIds.map(id => new mongoose.Types.ObjectId(id));

    // Build participant list
    const participants = ids.map(id => ({
      user: id,
      role: String(me._id) === String(id) ? me.role : "customer",
      lastReadAt: null,
    }));

    const convo = await Conversation.create({ title, participants });
    res.status(201).json(convo);
  } catch (err: any) {
    console.error("Error creating conversation:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



// get one by id (must participate)
router.get('/convo/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure userId is an ObjectId
    const userId = new mongoose.Types.ObjectId(req.user!._id);

    const convo = await Conversation.findOne({
      _id: id,
      'participants.user': userId,
    }).lean();

    if (!convo) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    res.json(convo);
  } catch (err: any) {
    console.error('Error fetching conversation:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// mark read
router.post('/mark-read/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user!._id;

  await Conversation.updateOne(
    { _id: id, 'participants.user': userId },
    { $set: { 'participants.$.lastReadAt': new Date() } }
  );

  await Message.updateMany(
    { conversation: id, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  res.json({ ok: true });
});

export default router;
