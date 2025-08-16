import { Router } from "express";
import User from "../models/User.js";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/checkRoleMiddleware.js";

const router = Router();

// Admin: list all users
router.get("/get-users", authMiddleware, allowRoles("admin"), async (_req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  const shaped = users.map(u => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    online: u.online,
  }));
  res.json(shaped);
});

export default router;
