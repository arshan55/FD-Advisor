import express from 'express';
import db from '../db/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import 'dotenv/config';

const router = express.Router();

// GET /api/auth/me - Get current user profile from Supabase ID
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.getUserById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      phone: user.phone,
      name: user.name,
      age: user.age,
      language: user.language_preference,
      kyc_verified: user.kyc_verified
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

export default router;
