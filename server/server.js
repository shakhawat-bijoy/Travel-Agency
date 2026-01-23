import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import flightRoutes from './routes/flights.js';
import savedCardsRoutes from './routes/savedCards.js';
import packageRoutes from './routes/packages.js';
import hotelRoutes from './routes/hotels.js';
import reviewRoutes from './routes/reviews.js';
import User from './models/User.js';
const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware - CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL, // Primary frontend URL from env
  'https://nomadic-eta.vercel.app' // Legacy/alternate frontend
].filter(Boolean);

console.log('🔒 CORS allowed origins:', allowedOrigins);
console.log('🔒 NODE_ENV:', process.env.NODE_ENV);

// CORS: allow specific origins when provided, otherwise allow all (fallback)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl) and allowed origins
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    console.warn(`CORS blocked for origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB with error handling
// In serverless (Vercel), we'll connect on-demand per request
// For traditional servers, connect at startup
if (process.env.VERCEL) {
  console.log('🔧 Running in Vercel serverless mode - DB will connect on-demand');
} else {
  connectDB().catch(err => {
    console.error('Failed to connect to MongoDB:', err);
  });
}

// Middleware to ensure DB connection on each request (for serverless)
// Only runs in Vercel serverless environment
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    // Only check connection for API routes that likely need DB
    if (req.path.startsWith('/api') && !req.path.startsWith('/api/health')) {
      const mongoose = await import('mongoose');
      // If not connected and we have a URI, try to connect
      if (mongoose.default.connection.readyState === 0 && (process.env.MONGO_URI || process.env.MONGODB_URI)) {
        try {
          await connectDB();
        } catch (err) {
          console.error('On-demand DB connection failed:', err.message);
          // Continue anyway - some routes might not need DB
        }
      }
    }
    next();
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/saved-cards', savedCardsRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/reviews', reviewRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Dream Holidays API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      flights: '/api/flights/*',
      hotels: '/api/hotels/*',
      payment: '/api/payment/*',
      savedCards: '/api/saved-cards/*',
      packages: '/api/packages/*'
    },
    documentation: 'See API_EXAMPLES.md for usage'
  });
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const mongoose = await import('mongoose');
  const dbState = mongoose.default.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStates[dbState] || 'unknown',
      connected: dbState === 1
    },
    env_check: {
      mongo_uri: !!process.env.MONGO_URI,
      jwt_secret: !!process.env.JWT_SECRET,
      amadeus_configured: !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET)
    }
  });
});

app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

// For Vercel serverless, export the app
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
