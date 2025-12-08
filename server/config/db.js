import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if MONGO_URI is defined
        if (!process.env.MONGO_URI) {
            console.warn('⚠️ MONGO_URI not defined. Running without database connection.');
            return null;
        }

        // Set mongoose options for better error handling
        mongoose.set('strictQuery', false);
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error.message);
        
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
});

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