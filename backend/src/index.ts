import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes';
import sequelize from './db/db';

// Load environment variables
dotenv.config({ path: `./config/env/${process.env.NODE_ENV || 'development'}.env` });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', router);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Call the DB initializer (./db/db) which may perform authentication/sync internally.
    await sequelize();
    console.log('Database initialized successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();