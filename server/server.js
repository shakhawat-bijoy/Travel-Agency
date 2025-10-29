import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import flightRoutes from './routes/flights.js';
import savedCardsRoutes from './routes/savedCards.js';
import User from './models/User.js';

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://travel-agency-one-two.vercel.app']
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database connection
let isConnected = false;

const initializeDB = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }
};

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  try {
    await initializeDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check endpoint (before other routes)
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isConnected ? 'connected' : 'disconnected',
    env_check: {
      mongo_uri: !!process.env.MONGO_URI,
      jwt_secret: !!process.env.JWT_SECRET,
      amadeus_client_id: !!process.env.AMADEUS_CLIENT_ID,
      amadeus_client_secret: !!process.env.AMADEUS_CLIENT_SECRET
    }
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/saved-cards', savedCardsRoutes);

// Test user creation endpoint
app.post('/api/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Catch-all route for undefined endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// For Vercel serverless deployment
export default app;
