import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db/supabase.js';
import { getGeminiResponse } from '../services/gemini.js';

const router = express.Router();

// POST /api/chat/message - Send message and get AI response
router.post('/message', authenticateToken, async (req, res) => {
  try {
    const { message, language, conversationHistory } = req.body;
    const userId = req.user.userId;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Save user message first
    await db.saveChatMessage({
      user_id: userId,
      role: 'user',
      content: message,
      language: language || 'hi'
    });

    // Get AI response
    const response = await getGeminiResponse(message, language || 'hi', conversationHistory || []);

    // Save AI response
    await db.saveChatMessage({
      user_id: userId,
      role: 'assistant',
      content: response,
      language: language || 'hi'
    });

    res.json({ response });
  } catch (error) {
    console.error('Chat message error:', error);
    res.status(500).json({ error: 'Failed to get response' });
  }
});

// GET /api/chat/history/:userId - Get chat history
router.get('/history/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own history
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const history = await db.getChatHistory(userId);
    res.json(history);
  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

// POST /api/chat/save - Save a chat message
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { role, content, language } = req.body;
    const userId = req.user.userId;

    if (!role || !content) {
      return res.status(400).json({ error: 'Role and content are required' });
    }

    const savedMessage = await db.saveChatMessage({
      user_id: userId,
      role,
      content,
      language: language || 'hi'
    });

    res.json(savedMessage);
  } catch (error) {
    console.error('Save chat error:', error);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

export default router;
