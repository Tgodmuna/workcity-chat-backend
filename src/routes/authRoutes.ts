import { Router } from 'express';
import AuthService from '../services/AuthService';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const token = await AuthService.register(req.body);
    res.json({ token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const token = await AuthService.login(req.body.email, req.body.password);
    res.json({ token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
