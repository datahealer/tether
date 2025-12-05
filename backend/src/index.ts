import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import sequelize from './db/db';
import serverless from 'serverless-http';

// Load environment variables
dotenv.config({ path: `./config/env/${process.env.NODE_ENV || 'development'}.env` });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize();
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Unable to initialize database:', error);
    throw error;
  }
};

// Initialize database once
initializeDatabase();

// For local development
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export handler for serverless
export const handler = serverless(app);