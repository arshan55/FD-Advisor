import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db/supabase.js';
import { explainJargon } from '../services/gemini.js';

const router = express.Router();

// GET /api/jargon - Get all jargon terms
router.get('/', authenticateToken, async (req, res) => {
  try {
    const terms = await db.getAllJargon();
    res.json(terms);
  } catch (error) {
    console.error('Get jargon error:', error);
    res.status(500).json({ error: 'Failed to get jargon terms' });
  }
});

// POST /api/jargon/explain - Get explanation for a term (uses Gemini for unknown terms)
router.post('/explain', authenticateToken, async (req, res) => {
  try {
    const { term, language } = req.body;

    if (!term) {
      return res.status(400).json({ error: 'Term is required' });
    }

    // First check if term exists in our database
    const allTerms = await db.getAllJargon();
    const existingTerm = allTerms.find(t =>
      t.term.toLowerCase() === term.toLowerCase()
    );

    if (existingTerm) {
      // Return the pre-stored explanation
      const explanations = {
        'hi': existingTerm.hindi_explanation,
        'bhojpuri': existingTerm.bhojpuri_explanation,
        'marathi': existingTerm.marathi_explanation,
        'tamil': existingTerm.tamil_explanation
      };

      return res.json({
        term: existingTerm.term,
        explanation: explanations[language] || explanations['hi'],
        analogy: existingTerm.analogy,
        numeric_example: existingTerm.numeric_example,
        source: 'database'
      });
    }

    // Term not found in database, use Gemini for explanation
    const explanation = await explainJargon(term, language || 'hi');

    res.json({
      term,
      explanation,
      source: 'ai'
    });
  } catch (error) {
    console.error('Explain jargon error:', error);
    res.status(500).json({ error: 'Failed to explain term' });
  }
});

export default router;
