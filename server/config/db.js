import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Support both MONGO_URI and MONGODB_URI for flexibility in hosting envs
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            console.warn('⚠️ MONGO_URI/MONGODB_URI not defined. Running without database connection.');
            return null;
        }

        // Set mongoose options for better error handling
        mongoose.set('strictQuery', false);
        mongoose.set('bufferCommands', false); // Disable buffering
        
        console.log('🔄 Attempting MongoDB connection...');
        console.log('🔗 Connection string:', mongoUri.replace(/:[^:@]+@/, ':****@'));
        
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 30000, // Increase to 30s
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 2,
            maxIdleTimeMS: 60000, // Close idle connections after 60s
            retryWrites: true,
            retryReads: true,
            heartbeatFrequencyMS: 10000, // Check connection health every 10s
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`✅ Database: ${conn.connection.name}`);
        return conn;
    } catch (error) {
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

// Keep-alive ping to prevent connection timeout
if (process.env.NODE_ENV === 'production') {
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