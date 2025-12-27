import mongoose from 'mongoose';

// Cache the connection promise to reuse in serverless environments
let cachedConnection = null;

const connectDB = async (retries = 3) => {
    try {
        // Support both MONGO_URI and MONGODB_URI for flexibility in hosting envs
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            console.warn('⚠️ MONGO_URI/MONGODB_URI not defined. Running without database connection.');
            return null;
        }

        // Check if already connected (for serverless function reuse)
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Using existing MongoDB connection');
            return mongoose.connection;
        }

        // If connection is in progress, wait for it (for concurrent requests in serverless)
        if (cachedConnection) {
            console.log('🔄 Waiting for existing connection attempt...');
            return await cachedConnection;
        }

        // Set mongoose options for better error handling
        mongoose.set('strictQuery', false);
        mongoose.set('bufferCommands', false); // Disable buffering
        
        console.log('🔄 Attempting MongoDB connection...');
        console.log('🔗 Connection string:', mongoUri.replace(/:[^:@]+@/, ':****@'));
        
        // Create connection promise and cache it
        cachedConnection = mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // Increase to 30s
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 1, // Reduced for serverless
            maxIdleTimeMS: 30000, // Reduced for serverless (30s)
            retryWrites: true,
            retryReads: true,
            heartbeatFrequencyMS: 10000, // Check connection health every 10s
        }).then((conn) => {
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            console.log(`✅ Database: ${conn.connection.name}`);
            cachedConnection = null; // Clear cache on success
            return conn;
        }).catch((error) => {
            cachedConnection = null; // Clear cache on error so we can retry
            throw error;
        });

        const conn = await cachedConnection;
        return conn;
    } catch (error) {
        cachedConnection = null; // Clear cache on error
        
        // Retry logic for transient errors
        if (retries > 0 && (
            error.name === 'MongoServerSelectionError' ||
            error.name === 'MongoNetworkError' ||
            error.message.includes('timeout') ||
            error.message.includes('ECONNREFUSED')
        )) {
            const remainingRetries = retries - 1;
            console.warn(`⚠️ Connection failed, retrying... (${remainingRetries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
            return connectDB(remainingRetries);
        }
        
        console.error("❌ MongoDB Connection Error:", error.message);
        console.error("❌ Error name:", error.name);
        console.error("❌ Full error:", error);
        
        // In production, don't exit - allow app to run without DB
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️ Running in production mode without database connection');
            return null;
        }
        
        // In development, exit on DB error
        process.exit(1);
    }
};

// Handle connection errors after initial connection
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ MongoDB disconnected');
    // Attempt to reconnect
    if (process.env.NODE_ENV === 'production' && (process.env.MONGO_URI || process.env.MONGODB_URI)) {
        console.log('🔄 Attempting to reconnect to MongoDB...');
        setTimeout(() => {
            connectDB().catch(err => console.error('Reconnection failed:', err));
        }, 5000);
    }
});

mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connection established');
});

// Keep-alive ping to prevent connection timeout (disabled for serverless)
// Serverless functions don't need keep-alive as they're short-lived
// Only enable for long-running processes
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    setInterval(async () => {
        if (mongoose.connection.readyState === 1) {
            try {
                await mongoose.connection.db.admin().ping();
                console.log('💓 MongoDB keep-alive ping successful');
            } catch (error) {
                console.error('❌ Keep-alive ping failed:', error.message);
            }
        }
    }, 5 * 60 * 1000); // Ping every 5 minutes
}

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

export default connectDB;