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
import User from './models/User.js';
const app = express();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/saved-cards', savedCardsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    env_check: {
      client_id: !!process.env.AMADEUS_CLIENT_ID,
      client_secret: !!process.env.AMADEUS_CLIENT_SECRET,
      client_id_value: process.env.AMADEUS_CLIENT_ID ? 'SET' : 'NOT SET',
      client_secret_value: process.env.AMADEUS_CLIENT_SECRET ? 'SET' : 'NOT SET'
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
