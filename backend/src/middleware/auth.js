import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      ...user.user_metadata
    };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        req.user = {
          userId: user.id,
          email: user.email,
          ...user.user_metadata
        };
      }
    } catch (error) {
      // Invalid token, but continue without user
    }
  }
  next();
}
