import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import paymentRoutes from './routes/payment.js';
import flightRoutes from './routes/flights.js';
import User from './models/User.js';

dotenv.config();
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
})
// Simple function to greet a user
// function greetUser(name) {
//     return `Hello, ${name}! Welcome to our application.`;
// }

// // Example usage
// const userName = "John";
// console.log(greetUser(userName));

// // Basic array operations
// const numbers = [1, 2, 3, 4, 5];
// const doubled = numbers.map(num => num * 2);
// const sum = numbers.reduce((acc, num) => acc + num, 0);

// console.log("Original numbers:", numbers);
// console.log("Doubled numbers:", doubled);
// console.log("Sum:", sum);
