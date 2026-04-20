import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import db from '../db/supabase.js';

const router = express.Router();

// POST /api/booking/create - Create a new booking
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { bank_id, principal_amount, tenor_months, interest_rate, fd_type, nominee_name } = req.body;
    const userId = req.user.userId;

    if (!bank_id || !principal_amount || !tenor_months || !interest_rate) {
      return res.status(400).json({ error: 'Missing required booking details' });
    }

    // Get bank details
    const bank = await db.getRateByBankId(bank_id);
    if (!bank) {
      return res.status(404).json({ error: 'Bank not found' });
    }

    // Calculate maturity
    const maturityAmount = principal_amount + (principal_amount * interest_rate * tenor_months) / (100 * 12);
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + tenor_months);

    const booking = await db.createBooking({
      user_id: userId,
      bank_id,
      bank_name: bank.bank_name,
      principal_amount,
      tenor_months,
      interest_rate,
      fd_type: fd_type || 'cumulative',
      maturity_amount: Math.round(maturityAmount),
      maturity_date: maturityDate.toISOString(),
      nominee_name: nominee_name || null
    });

    res.json(booking);
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// GET /api/booking/:userId - Get all bookings for a user
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Ensure user can only access their own bookings
    if (req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const bookings = await db.getBookingsByUserId(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// PATCH /api/booking/:bookingId/status - Update booking status
router.patch('/:bookingId/status', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['pending', 'confirmed', 'rejected', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await db.updateBookingStatus(bookingId, status);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// GET /api/booking/:bookingId/receipt - Get receipt data
router.get('/:bookingId/receipt', authenticateToken, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await db.getBookingById(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Ensure user can only access their own receipts
    if (req.user.userId !== booking.user_id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Generate receipt data
    const receipt = {
      receipt_number: `FD-${Date.now()}`,
      booking_id: booking.id,
      bank_name: booking.bank_name,
      principal_amount: booking.principal_amount,
      tenor_months: booking.tenor_months,
      interest_rate: booking.interest_rate,
      fd_type: booking.fd_type,
      maturity_amount: booking.maturity_amount,
      maturity_date: booking.maturity_date,
      nominee_name: booking.nominee_name,
      status: booking.status,
      booking_date: booking.created_at
    };

    res.json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: 'Failed to get receipt' });
  }
});

export default router;
