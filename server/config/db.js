import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if already connected
        if (mongoose.connections[0].readyState) {
            console.log('MongoDB already connected');
            return;
        }

        // Validate MONGO_URI
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI environment variable is not defined');
        }

        // Connect with proper options for serverless
        await mongoose.connect(process.env.MONGO_URI, {
            bufferCommands: false,
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        console.log('MongoDB Connected successfully');
    } catch (error) {
        console.error("MongoDB Connection Error:", error.message);
        throw error; // Don't exit process in serverless environment
    }
};

export default connectDB;