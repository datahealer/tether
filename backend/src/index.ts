import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import connectDB from './db/db';
import { setRoutes } from './routes/index';

// Load environment variables with absolute path
const envPath = path.resolve(__dirname, `../config/env/${process.env.NODE_ENV || 'development'}.env`);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Set up routes
setRoutes(app);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});