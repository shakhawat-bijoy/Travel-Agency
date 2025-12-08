// Database connection check middleware
export const checkDbConnection = (req, res, next) => {
  const mongoose = require('mongoose');
  
  if (mongoose.connection.readyState !== 1) {
    console.warn('⚠️ Database not connected, operation may fail');
    // Don't block the request, just warn
  }
  next();
};

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// MongoDB error handler
export const handleMongoError = (error, req, res, next) => {
  if (error.name === 'MongooseError' || error.name === 'MongoError') {
    console.error('MongoDB Error:', error.message);
    return res.status(503).json({
      success: false,
      error: 'Database service temporarily unavailable',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
  next(error);
};
