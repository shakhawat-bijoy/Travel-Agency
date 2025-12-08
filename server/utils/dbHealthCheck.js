import mongoose from 'mongoose';

/**
 * Check if database is connected and healthy
 * @returns {Object} Health status
 */
export const checkDatabaseHealth = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  return {
    isConnected: state === 1,
    state: states[state] || 'unknown',
    host: mongoose.connection.host || 'N/A',
    name: mongoose.connection.name || 'N/A'
  };
};

/**
 * Middleware to check database connection before operations
 * Returns 503 if database is required but not connected
 */
export const requireDatabase = (req, res, next) => {
  const health = checkDatabaseHealth();
  
  if (!health.isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Database service unavailable',
      message: 'The database is currently not connected. Please try again later.'
    });
  }
  
  next();
};

/**
 * Optional database middleware - warns but doesn't block
 */
export const optionalDatabase = (req, res, next) => {
  const health = checkDatabaseHealth();
  
  if (!health.isConnected) {
    console.warn('⚠️ Database not connected for request:', req.path);
  }
  
  next();
};
