import dotenv from 'dotenv';
import path from 'path';
import express from 'express';
import connectDB from './db/db';
import { setRoutes } from './routes/index';
// import '../types/express'; 
// Load environment variables with absolute path
// const envPath = path.resolve(__dirname, `../config/env/${process.env.NODE_ENV || 'development'}.env`);
// dotenv.config({ path: envPath });

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' ? 'prod.env' : 'dev.env';
const envPath = path.resolve(__dirname, `../config/env/${envFile}`);
console.log('Loading env from:', envPath);
dotenv.config({ path: envPath });
const app = express();
const PORT = process.env.PORT || 3000;

// Debug: Check if env variables are loaded
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ Loaded' : '✗ Not loaded');
console.log('PORT:', process.env.PORT);

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