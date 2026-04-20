import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

// Import routes
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import fdRoutes from './routes/fd.js';
import bookingRoutes from './routes/booking.js';
import kycRoutes from './routes/kyc.js';
import jargonRoutes from './routes/jargon.js';

const app = express();
const PORT = process.env.PORT || 3003;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3002';

// Middleware
app.use(cors({
  // Dynamically reflect the origin to allow any frontend Vercel preview URL, while keeping credentials support
  origin: true,
  credentials: true
}));
app.use(express.json());

// Rate limiting for chat endpoint
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { error: 'Too many requests, please try again later' }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRateLimiter, chatRoutes);
app.use('/api/fd', fdRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/jargon', jargonRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`FD Mitra Backend running on port ${PORT}`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
});

export default app;
