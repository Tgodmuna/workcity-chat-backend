import { Router } from "express";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";

const router = Router();
// list messages for a conversation (must participate)
router.get("/:conversationId", authMiddleware, async (req, res) => {
  const { conversationId } = req.params;
  const inConvo = await Conversation.exists({
    _id: conversationId,
    "participants.user": req.user!._id,
  });
  if (!inConvo) return res.status(403).json({ message: "Forbidden" });

  const msgs = await Message.find({ conversation: conversationId })
    .sort({ createdAt: 1 })
    .populate("sender", "name email")
    .lean();

  const shaped = msgs.map((m: any) => ({
    _id: m._id,
    conversation: m.conversation,
    sender: m.sender ? { id: m.sender._id, name: m.sender.name, email: m.sender.email } : m.sender,
    content: m.content,
    createdAt: m.createdAt,
  }));

  res.json(shaped);
});

// create a message 
router.post("/create-message", authMiddleware, async (req, res) => {
  const { conversationId, content } = req.body as { conversationId: string; content?: string };
  if (!conversationId || (!content && content !== "")) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const inConvo = await Conversation.findOne({
    _id: conversationId,
    "participants.user": req.user!._id,
  });
  if (!inConvo) return res.status(403).json({ message: "Forbidden" });

  const msg = await Message.create({
    conversation: conversationId,
    sender: req.user!._id,
    content,
    readBy: [ req.user!._id ],
    createdAt:Date.now()
  });

  await Conversation.updateOne(
    { _id: conversationId },
    { $set: { lastMessageText: content, lastMessageAt: msg } }
  );

  res.status(201).json(msg);
});

export default router;
