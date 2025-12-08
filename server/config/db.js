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
        mongoose.set('bufferCommands', false); // Disable buffering
        
        console.log('🔄 Attempting MongoDB connection...');
        console.log('🔗 Connection string:', process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@'));
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000, // Increase to 30s
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
            maxPoolSize: 10,
            minPoolSize: 2,
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