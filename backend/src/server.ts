import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.routes';
import incidentRoutes from './routes/incident.routes';
import outletRoutes from './routes/outlet.routes';
import complaintRoutes from './routes/complaint.routes';
import letterRoutes from './routes/letter.routes';
import statsRoutes from './routes/stats.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Railway deployment (required for rate limiting)
app.set('trust proxy', 1);

// Middleware
// Allow multiple frontend origins (development and production)
const allowedOrigins: string[] = [
  'http://localhost:3000',
  'http://localhost:5173', // Vite default dev port
  process.env.FRONTEND_URL,
].filter((origin): origin is string => typeof origin === 'string' && origin.length > 0);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    // Check if origin is allowed
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limit for letter generation
const letterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 letter generations per hour
  message: 'Too many letter generation requests, please try again later.'
});
app.use('/api/generate-letter', letterLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/outlets', outletRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/generate-letter', letterRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
