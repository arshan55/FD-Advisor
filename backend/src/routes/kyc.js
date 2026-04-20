import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db/supabase.js';

const router = express.Router();

// Mask sensitive data - only store last 4 digits
function maskAadhaar(aadhaar) {
  if (!aadhaar) return null;
  const clean = aadhaar.replace(/\D/g, '');
  return 'XXXXXXXX' + clean.slice(-4);
}

function maskPAN(pan) {
  if (!pan) return null;
  const clean = pan.toUpperCase().replace(/\D/g, '');
  if (clean.length !== 10) return null;
  return clean.slice(0, 5) + 'XXXX' + clean.slice(-1);
}

// POST /api/kyc/submit - Submit KYC details
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { aadhaar, pan, nominee_name } = req.body;
    const userId = req.user.userId;

    if (!aadhaar || !pan) {
      return res.status(400).json({ error: 'Aadhaar and PAN are required' });
    }

    // Validate formats (basic validation)
    const aadhaarClean = aadhaar.replace(/\D/g, '');
    const panClean = pan.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (aadhaarClean.length !== 12) {
      return res.status(400).json({ error: 'Aadhaar must be 12 digits' });
    }

    if (panClean.length !== 10) {
      return res.status(400).json({ error: 'PAN must be 10 characters' });
    }

    // Mask and store
    const maskedAadhaar = maskAadhaar(aadhaar);
    const maskedPAN = maskPAN(pan);

    // Update user with KYC info
    const updatedUser = await db.updateUser(userId, {
      aadhaar_masked: maskedAadhaar,
      pan_masked: maskedPAN,
      nominee_name: nominee_name || null,
      kyc_verified: true
    });

    res.json({
      success: true,
      message: 'KYC submitted successfully',
      kyc_verified: true,
      masked_aadhaar: maskedAadhaar,
      masked_pan: maskedPAN
    });
  } catch (error) {
    console.error('KYC submit error:', error);
    res.status(500).json({ error: 'Failed to submit KYC' });
  }
});

// GET /api/kyc/status/:userId - Get KYC status
router.get('/status/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own KYC status
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user_id: userId,
      kyc_verified: user.kyc_verified || false,
      aadhaar_masked: user.aadhaar_masked || null,
      pan_masked: user.pan_masked || null,
      nominee_name: user.nominee_name || null
    });
  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ error: 'Failed to get KYC status' });
  }
});

export default router;
