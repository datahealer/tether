// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import router from './routes';
// import sequelize from './db/db';
// import serverless from 'serverless-http';

// // Load environment variables
// dotenv.config({ path: `./config/env/${process.env.NODE_ENV || 'development'}.env` });

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware - CORS configuration
// app.use(cors({
//   origin: [
//     'http://localhost:5173', 
//     'http://localhost:3000',
//     'http://192.168.29.107:3000',
//     'http://192.168.29.107:8081',
//     'https://9l2k8cwj-3000.inc1.devtunnels.ms',
 
//     'https://dev.d3tt7e7nz4d0aw.amplifyapp.com'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/api', router);

// // Error handling middleware
// app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   console.error(err.stack);
//   res.status(500).json({ error: 'Something went wrong!' });
// });

// // Initialize database
// const initializeDatabase = async () => {
//   try {
//     await sequelize();
//     console.log('Database initialized successfully.');
//   } catch (error) {
//     console.error('Unable to initialize database:', error);
//     throw error;
//   }
// };

// // Initialize database once
// initializeDatabase();

// // For local development
// if (process.env.NODE_ENV !== 'production' && require.main === module) {
//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
//   });
// }

// // Export handler for serverless
// export const handler = serverless(app);
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
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://192.168.29.107:3000',
    'http://192.168.29.107:8081',
    'https://9l2k8cwj-3000.inc1.devtunnels.ms',
    'https://dev.d3tt7e7nz4d0aw.amplifyapp.com',
    // ✅ Allow requests from mobile apps (no origin header)
    '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ✅ Add explicit OPTIONS handler for preflight
app.options('*', cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Add health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
    
    // Initialize scheduled jobs for Question Service Engine
    // Only run in non-serverless environments
    if (process.env.NODE_ENV !== 'production' || !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      try {
        const { initializeScheduledJobs } = await import('./services/scheduledJobs');
        initializeScheduledJobs();
        console.log('✅ Question Service scheduled jobs initialized');
      } catch (error) {
        console.error('⚠️  Warning: Could not initialize scheduled jobs:', error);
        console.log('   Scheduled jobs require node-cron: pnpm add node-cron');
      }
    } else {
      console.log('ℹ️  Serverless mode: Scheduled jobs should be handled by CloudWatch Events');
    }
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