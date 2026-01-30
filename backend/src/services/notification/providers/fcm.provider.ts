// import admin from 'firebase-admin';
// import { Platform } from '../../../types/enums';

// interface FCMConfig {
//   serviceAccountPath?: string;
//   serviceAccount?: any;
// }

// class FCMProvider {
//   private initialized = false;

//   async initialize(config: FCMConfig): Promise<void> {
//     if (this.initialized) return;

//     try {
//       if (config.serviceAccount) {
//         admin.initializeApp({
//           credential: admin.credential.cert(config.serviceAccount),
//         });
//       } else if (config.serviceAccountPath) {
//         const serviceAccount = require(config.serviceAccountPath);
//         admin.initializeApp({
//           credential: admin.credential.cert(serviceAccount),
//         });
//       } else {
//         admin.initializeApp();
//       }
//       this.initialized = true;
//     } catch (error) {
//       console.error('FCM initialization error:', error);
//       throw error;
//     }
//   }

//   async sendNotification(
//     deviceToken: string,
//     title: string,
//     body: string,
//     data?: Record<string, any>
//   ): Promise<{ success: boolean; messageId?: string; error?: string }> {
//     if (!this.initialized) {
//       throw new Error('FCM not initialized');
//     }

//     try {
//       const message: admin.messaging.Message = {
//         token: deviceToken,
//         notification: {
//           title,
//           body,
//         },
//         data: data
//           ? Object.entries(data).reduce((acc, [key, value]) => {
//               acc[key] = String(value);
//               return acc;
//             }, {} as Record<string, string>)
//           : undefined,
//         android: {
//           priority: 'high',
//           notification: {
//             sound: 'default',
//             channelId: 'tether_notifications',
//           },
//         },
//         apns: {
//           payload: {
//             aps: {
//               sound: 'default',
//               badge: 1,
//             },
//           },
//         },
//       };

//       const response = await admin.messaging().send(message);
//       return { success: true, messageId: response };
//     } catch (error: any) {
//       if (error.code === 'messaging/invalid-registration-token' || 
//           error.code === 'messaging/registration-token-not-registered') {
//         return { success: false, error: 'INVALID_TOKEN' };
//       }
//       return { success: false, error: error.message || 'Unknown error' };
//     }
//   }

//   async sendMulticast(
//     deviceTokens: string[],
//     title: string,
//     body: string,
//     data?: Record<string, any>
//   ): Promise<{ successCount: number; failureCount: number; responses: any[] }> {
//     if (!this.initialized) {
//       throw new Error('FCM not initialized');
//     }

//     try {
//       const message: admin.messaging.MulticastMessage = {
//         tokens: deviceTokens,
//         notification: {
//           title,
//           body,
//         },
//         data: data
//           ? Object.entries(data).reduce((acc, [key, value]) => {
//               acc[key] = String(value);
//               return acc;
//             }, {} as Record<string, string>)
//           : undefined,
//         android: {
//           priority: 'high',
//           notification: {
//             sound: 'default',
//             channelId: 'tether_notifications',
//           },
//         },
//         apns: {
//           payload: {
//             aps: {
//               sound: 'default',
//               badge: 1,
//             },
//           },
//         },
//       };

//       const response = await admin.messaging().sendEachForMulticast(message);
//       return {
//         successCount: response.successCount,
//         failureCount: response.failureCount,
//         responses: response.responses,
//       };
//     } catch (error: any) {
//       console.error('FCM multicast error:', error);
//       return {
//         successCount: 0,
//         failureCount: deviceTokens.length,
//         responses: [],
//       };
//     }
//   }
// }

// export default new FCMProvider();

// src/services/notification/providers/fcm.provider.ts

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

interface FCMConfig {
  serviceAccountPath?: string;
  serviceAccount?: any;
}

class FCMProvider {
  private initialized = false;

  async initialize(config: FCMConfig): Promise<void> {
    if (this.initialized) return;

    try {
      let serviceAccount: any;

      if (config.serviceAccount) {
        // Direct object passed (e.g., from parsed JSON env var)
        serviceAccount = config.serviceAccount;
      } else if (config.serviceAccountPath) {
        // Load from file path
        const resolvedPath = path.resolve(process.cwd(), config.serviceAccountPath.trim());

        console.log('Loading Firebase service account from:', resolvedPath);

        if (!fs.existsSync(resolvedPath)) {
          throw new Error(
            `Firebase service account file not found at: ${resolvedPath}\n` +
              'Check that the file exists and FIREBASE_SERVICE_ACCOUNT_PATH is correct.'
          );
        }

        const fileContent = fs.readFileSync(resolvedPath, 'utf8');
        serviceAccount = JSON.parse(fileContent);
      } else {
        // No credentials provided — fall back to default (ADC or Firebase hosting)
        console.warn('No Firebase credentials provided. Using default credentials (may fail in local dev).');
        admin.initializeApp(); // Uses Application Default Credentials
        this.initialized = true;
        return;
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log('Firebase Admin SDK initialized successfully');
      console.log('Project ID:', serviceAccount.project_id);
      this.initialized = true;
    } catch (error: any) {
      console.error('FCM initialization failed:', error.message || error);
      throw error; // Let the caller handle it
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Send single notification
  // ────────────────────────────────────────────────────────────────
  async sendNotification(
    deviceToken: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.initialized) {
      throw new Error('FCM not initialized');
    }

    try {
      const message: admin.messaging.Message = {
        token: deviceToken,
        notification: { title, body },
        data: data
          ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
          : undefined,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'tether_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error: any) {
      if (
        error.code === 'messaging/invalid-registration-token' ||
        error.code === 'messaging/registration-token-not-registered'
      ) {
        return { success: false, error: 'INVALID_TOKEN' };
      }
      return { success: false, error: error.message || 'Unknown error' };
    }
  }

  // ────────────────────────────────────────────────────────────────
  // Send multicast (multiple tokens)
  // ────────────────────────────────────────────────────────────────
  async sendMulticast(
    deviceTokens: string[],
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<{
    successCount: number;
    failureCount: number;
    responses: any[];
  }> {
    if (!this.initialized) {
      throw new Error('FCM not initialized');
    }

    if (deviceTokens.length === 0) {
      return { successCount: 0, failureCount: 0, responses: [] };
    }

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens: deviceTokens,
        notification: { title, body },
        data: data
          ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
          : undefined,
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            channelId: 'tether_notifications',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
      };
    } catch (error: any) {
      console.error('FCM multicast error:', error);
      return {
        successCount: 0,
        failureCount: deviceTokens.length,
        responses: [],
      };
    }
  }
}

export default new FCMProvider();