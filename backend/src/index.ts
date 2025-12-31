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
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import router from './routes';
import sequelize from './db/db';
import serverless from 'serverless-http';
import { swaggerSpec } from './config/swagger';
import { morganFormat } from './utils/logger';
import notificationScheduler from './services/notification/scheduler';
import fcmProvider from './services/notification/providers/fcm.provider';

dotenv.config({ path: `./config/env/${process.env.NODE_ENV || 'development'}.env` });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://192.168.29.107:3000',
    'http://192.168.29.107:8081',
    'https://9l2k8cwj-3000.inc1.devtunnels.ms',
    'https://dev.d3tt7e7nz4d0aw.amplifyapp.com',
    '*'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', cors());

app.use(morgan(morganFormat as any));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Tether API Documentation',
}));

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

const initializeServices = async () => {
  try {
    await initializeDatabase();

    // ──────────────────────── FCM Initialization ────────────────────────
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      // Full JSON string in env (rare, but supported)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      await fcmProvider.initialize({ serviceAccount });
      console.log('FCM initialized from FIREBASE_SERVICE_ACCOUNT env var');
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      // Recommended way — path to JSON file
      await fcmProvider.initialize({
        serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      });
      console.log('FCM initialized from file path');
    } else {
      console.warn(
        'No Firebase credentials provided. Notifications will use default credentials (may not work locally).'
      );
      // Optional: still initialize with default credentials
      await fcmProvider.initialize({});
    }

    // Start notification scheduler (only in non-test env)
    if (process.env.NODE_ENV !== 'test') {
      notificationScheduler.start();
    }
  } catch (error) {
    console.error('Service initialization error:', error);
    // Don't throw — app can still run without notifications
  }
};

initializeServices();

if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Export handler for serverless
export const handler = serverless(app);