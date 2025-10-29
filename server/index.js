import express from 'express';
import cors from 'cors';

const app = express();

// Basic middleware
app.use(cors({
  origin: '*', // Allow all origins for testing
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Ultra-simple health check
app.get('/api/health', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Test failed',
      error: error.message
    });
  }
});

// Environment check endpoint
app.get('/api/env-check', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Environment check',
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasMongoUri: !!process.env.MONGO_URI,
        hasJwtSecret: !!process.env.JWT_SECRET,
        platform: process.platform,
        nodeVersion: process.version
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Environment check failed',
      error: error.message
    });
  }
});

// Minimal auth endpoint for testing
app.post('/api/auth/test', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Auth endpoint accessible',
      body: req.body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Auth test failed',
      error: error.message
    });
  }
});

// Minimal flights endpoint for testing
app.get('/api/flights/test', (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Flights endpoint accessible',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Flights test failed',
      error: error.message
    });
  }
});

// Catch-all for other API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      '/api/health',
      '/api/test',
      '/api/env-check',
      '/api/auth/test',
      '/api/flights/test'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Export for Vercel
export default app;